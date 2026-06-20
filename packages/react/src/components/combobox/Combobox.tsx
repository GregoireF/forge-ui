import { mergeRefs } from "@forge-ui/core";
import type { CSSProperties, HTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useLayoutEffect } from "react";
import { usePresence } from "../../hooks/use-presence.js";
import { DialogPortal } from "../dialog/DialogPortal.js";
import { Slot } from "../dialog/Slot.js";
import type { UseComboboxOptions } from "./use-combobox.js";
import { useCombobox } from "./use-combobox.js";

type ComboboxApiReturn = ReturnType<typeof useCombobox>;

const ComboboxCtx = createContext<ComboboxApiReturn | null>(null);

function useCtx(): ComboboxApiReturn {
  const ctx = useContext(ComboboxCtx);
  if (!ctx) throw new Error("Combobox compound parts must be used inside <Combobox.Root>");
  return ctx;
}

// Shared presence context so Portal and Content coordinate on the same presence instance.
const ComboboxPresenceCtx = createContext<ReturnType<typeof usePresence> | null>(null);

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface ComboboxRootProps extends UseComboboxOptions {
  children: ReactNode;
}

function Root({ children, ...opts }: ComboboxRootProps) {
  const api = useCombobox(opts);
  const presence = usePresence(api.isOpen);
  return (
    <ComboboxCtx.Provider value={api}>
      <ComboboxPresenceCtx.Provider value={presence}>
        {children}
      </ComboboxPresenceCtx.Provider>
    </ComboboxCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

export interface ComboboxLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  asChild?: boolean;
}

function Label({ asChild, children, ...rest }: ComboboxLabelProps) {
  const api = useCtx();
  const props = { ...api.getLabelProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor wires to the input; sibling compound part
  return <label {...props}>{children}</label>;
}

// ---------------------------------------------------------------------------
// Input — <input role="combobox">
// ---------------------------------------------------------------------------

export interface ComboboxInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "role"> {
  asChild?: boolean;
}

function Input({ asChild, ...rest }: ComboboxInputProps) {
  const api = useCtx();
  // React uses onChange / onKeyDown (camelCase). The connect emits onInput/onKeydown.
  // Strip connect's onInput/onKeydown and wire them up correctly for React.
  const { onInput, onKeydown, ref: machineRef, autocomplete, ...inputProps } = api.getInputProps() as ReturnType<typeof api.getInputProps> & {
    onInput?: (e: Event) => void;
    onKeydown?: (e: KeyboardEvent) => void;
    ref?: (el: HTMLInputElement | null) => void;
    autocomplete?: string;
  };
  const props = {
    ...(autocomplete !== undefined && { autoComplete: autocomplete }),
    ...inputProps,
    ...rest,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      // Combobox INPUT_CHANGE fires on onChange (React's synthetic event for <input>).
      api.send({ type: "INPUT_CHANGE", value: e.target.value });
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeydown?.(e.nativeEvent as KeyboardEvent);
      (rest as InputHTMLAttributes<HTMLInputElement>).onKeyDown?.(e);
    },
    ref: machineRef as React.RefCallback<HTMLInputElement>,
  };
  if (asChild) return <Slot {...props} />;
  return <input {...props} />;
}

// ---------------------------------------------------------------------------
// Trigger — optional toggle button (open/close chevron icon)
// ---------------------------------------------------------------------------

export interface ComboboxTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function Trigger({ asChild, children, ...rest }: ComboboxTriggerProps) {
  const api = useCtx();
  const props = { ...api.getTriggerProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// ClearTrigger — button to clear selection + input
// ---------------------------------------------------------------------------

export interface ComboboxClearTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function ClearTrigger({ asChild, children, ...rest }: ComboboxClearTriggerProps) {
  const api = useCtx();
  const props = { ...api.getClearTriggerProps(), ...rest };
  if (!api.value.length && !api.inputValue) return null;
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

export interface ComboboxPortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
  forceMount?: boolean;
}

function Portal({ children, container, forceMount }: ComboboxPortalProps) {
  const api = useCtx();
  const presence = useContext(ComboboxPresenceCtx);
  const isPresent = presence?.isPresent ?? api.isOpen;
  if (!forceMount && !isPresent) return null;
  return <DialogPortal {...(container !== undefined && { container })}>{children}</DialogPortal>;
}

// ---------------------------------------------------------------------------
// Content — presence-aware. Positioner div wraps listbox.
// ---------------------------------------------------------------------------

export interface ComboboxContentProps extends HTMLAttributes<HTMLUListElement> {
  asChild?: boolean;
  forceMount?: boolean;
}

function Content({ asChild, forceMount, children, ...rest }: ComboboxContentProps) {
  const api = useCtx();
  const sharedPresence = useContext(ComboboxPresenceCtx);
  const ownPresence = usePresence(api.isOpen);
  const { isPresent, presenceRef } = sharedPresence ?? ownPresence;

  if (!forceMount && !isPresent) return null;

  const positionerProps = api.getPositionerProps();
  const contentProps = api.getContentProps();
  const closingProps = !api.isOpen
    ? ({ "aria-hidden": true, style: { pointerEvents: "none" } } as const)
    : {};

  const mergedContentProps = {
    ...contentProps,
    ...closingProps,
    ...rest,
    ref: mergeRefs(
      contentProps.ref as (el: HTMLUListElement | null) => void,
      presenceRef as (el: HTMLUListElement | null) => void,
    ),
  };

  if (asChild) {
    return (
      <div {...positionerProps}>
        <Slot {...mergedContentProps}>{children}</Slot>
      </div>
    );
  }

  return (
    <div {...positionerProps}>
      <ul {...mergedContentProps}>{children}</ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Item (Option)
// ---------------------------------------------------------------------------

export interface ComboboxItemProps extends HTMLAttributes<HTMLLIElement> {
  value: string;
  label?: string;
  disabled?: boolean;
  asChild?: boolean;
  children: ReactNode;
}

function Item({ value, label, disabled = false, asChild, children, ...rest }: ComboboxItemProps) {
  const api = useCtx();
  const resolvedLabel = label ?? (typeof children === "string" ? children : value);

  // Always register — even when filtered out — so keyboard navigation can traverse all options.
  useLayoutEffect(() => {
    api.send({ type: "REGISTER_OPTION", option: { value, label: resolvedLabel, disabled } });
    return () => api.send({ type: "UNREGISTER_OPTION", value });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, resolvedLabel, disabled]);

  // Hide when not in filteredOptions (client-side filtering mode).
  // In async mode filteredOptions === all options, so nothing is hidden automatically.
  if (!api.filteredOptions.some((o) => o.value === value)) return null;

  // Connect emits onMousemove / onMouseleave (Vue lowercase).
  // Remap to React camelCase onMouseMove / onMouseLeave.
  const { onMousemove, onMouseleave, onClick, ...optionProps } = api.getOptionProps({ value, disabled });
  const props = {
    ...optionProps,
    ...rest,
    onMouseMove: onMousemove as React.MouseEventHandler<HTMLLIElement>,
    onMouseLeave: onMouseleave as React.MouseEventHandler<HTMLLIElement>,
    onClick: onClick as React.MouseEventHandler<HTMLLIElement>,
  };

  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <li {...props}>{children}</li>;
}

// ---------------------------------------------------------------------------
// ItemText — semantic label span
// ---------------------------------------------------------------------------

export interface ComboboxItemTextProps { children: ReactNode }

function ItemText({ children }: ComboboxItemTextProps) {
  return <span data-forge-scope="combobox" data-forge-part="item-text">{children}</span>;
}

// ---------------------------------------------------------------------------
// ItemIndicator — shown when item is selected
// ---------------------------------------------------------------------------

export interface ComboboxItemIndicatorProps {
  value: string;
  children: ReactNode;
}

function ItemIndicator({ value, children }: ComboboxItemIndicatorProps) {
  const api = useCtx();
  if (!api.value.includes(value)) return null;
  return <span data-forge-scope="combobox" data-forge-part="item-indicator">{children}</span>;
}

// ---------------------------------------------------------------------------
// Group + GroupLabel
// ---------------------------------------------------------------------------

export interface ComboboxGroupProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
}

function ComboboxGroupComp({ children, ...rest }: ComboboxGroupProps) {
  return (
    <ul role="group" data-forge-scope="combobox" data-forge-part="group" {...rest}>
      {children}
    </ul>
  );
}

export interface ComboboxGroupLabelProps extends HTMLAttributes<HTMLLIElement> {
  children: ReactNode;
}

function ComboboxGroupLabelComp({ children, ...rest }: ComboboxGroupLabelProps) {
  return (
    <li role="presentation" data-forge-scope="combobox" data-forge-part="group-label" {...rest}>
      {children}
    </li>
  );
}

// ---------------------------------------------------------------------------
// CreateOption
// ---------------------------------------------------------------------------

export interface ComboboxCreateOptionProps {
  children?: ReactNode | ((label: string) => ReactNode);
  style?: CSSProperties;
  className?: string;
}

function CreateOption({ children, ...rest }: ComboboxCreateOptionProps) {
  const api = useCtx();
  if (!api.hasCreateOption) return null;
  const label = api.createOptionLabel;
  const content = typeof children === "function" ? children(label) : (children ?? `Créer "${label}"`);
  return (
    <li {...api.getCreateOptionProps()} {...rest}>
      {content}
    </li>
  );
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Combobox = {
  Root,
  Label,
  Input,
  Trigger,
  ClearTrigger,
  Portal,
  Content,
  Item,
  ItemText,
  ItemIndicator,
  Group: ComboboxGroupComp,
  GroupLabel: ComboboxGroupLabelComp,
  CreateOption,
} as const;

export { ComboboxGroupComp as ComboboxGroup, ComboboxGroupLabelComp as ComboboxGroupLabel, CreateOption as ComboboxCreateOption };
