import { mergeRefs } from "@forge-ui/core";
import type { SelectOption } from "@forge-ui/select";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  LabelHTMLAttributes,
  LiHTMLAttributes,
  ReactNode,
} from "react";
import { createContext, useContext, useLayoutEffect } from "react";
import { usePresence } from "../../hooks/use-presence.js";
import { DialogPortal } from "../dialog/DialogPortal.js";
import { Slot } from "../shared/Slot.js";
import type { UseSelectOptions } from "./use-select.js";
import { useSelect } from "./use-select.js";

type SelectApiReturn = ReturnType<typeof useSelect>;

const SelectCtx = createContext<SelectApiReturn | null>(null);

type SelectPresenceContext = {
  isPresent: boolean;
  presenceRef: (el: HTMLElement | null) => void;
};
const SelectPresenceCtx = createContext<SelectPresenceContext | null>(null);

function useCtx(): SelectApiReturn {
  const ctx = useContext(SelectCtx);
  if (!ctx) throw new Error("Select compound parts must be used inside <Select.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface SelectRootProps extends UseSelectOptions {
  children: ReactNode;
}

function Root({ children, ...opts }: SelectRootProps) {
  const api = useSelect(opts);
  const presence = usePresence(api.isOpen);
  return (
    <SelectCtx.Provider value={api}>
      <SelectPresenceCtx.Provider value={presence}>
        {children}
      </SelectPresenceCtx.Provider>
    </SelectCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

export interface SelectLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  asChild?: boolean;
}

function Label({ asChild, children, ...rest }: SelectLabelProps) {
  const api = useCtx();
  const props = { ...api.getLabelProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <label {...props}>{children}</label>;
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

export interface SelectTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function Trigger({ asChild, children, ...rest }: SelectTriggerProps) {
  const api = useCtx();
  // Strip Vue-specific casing (onKeydown) â€" React uses onKeyDown only.
  const { onKeydown: _kd, ...triggerProps } = api.getTriggerProps();
  const props = { ...triggerProps, ...rest } as ButtonHTMLAttributes<HTMLButtonElement>;
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// Value â€" renders the selected value label inside the trigger
// ---------------------------------------------------------------------------

export interface SelectValueProps {
  placeholder?: string;
  children?: ReactNode;
}

function Value({ placeholder, children }: SelectValueProps) {
  const api = useCtx();
  const label = api.valueLabel;
  const scope = { "data-forge-scope": "select", "data-forge-part": "value" } as const;
  // When a value is selected, always show the label â€" children act as a placeholder slot.
  if (label) return <span {...scope}>{label}</span>;
  if (children !== undefined) return <>{children}</>;
  return <span {...scope}>{placeholder || api.placeholder}</span>;
}

// ---------------------------------------------------------------------------
// Placeholder â€" renders only when no value is selected.
// Use inside Trigger instead of a static string to get data-placeholder styling hooks.
// ---------------------------------------------------------------------------

export interface SelectPlaceholderProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

function Placeholder({ children, ...rest }: SelectPlaceholderProps) {
  const api = useCtx();
  if (api.valueLabel) return null;
  return (
    <span data-forge-scope="select" data-forge-part="placeholder" {...rest}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

export interface SelectPortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
  forceMount?: boolean;
}

function Portal({ children, container, forceMount }: SelectPortalProps) {
  const api = useCtx();
  const presence = useContext(SelectPresenceCtx);
  const isPresent = presence?.isPresent ?? api.isOpen;
  if (!forceMount && !isPresent) return null;
  return <DialogPortal {...(container !== undefined && { container })}>{children}</DialogPortal>;
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export interface SelectContentProps extends HTMLAttributes<HTMLUListElement> {
  asChild?: boolean;
  forceMount?: boolean;
}

function Content({ asChild, forceMount, children, ...rest }: SelectContentProps) {
  const api = useCtx();
  const injectedPresence = useContext(SelectPresenceCtx);
  const ownPresence = usePresence(api.isOpen);
  const { isPresent, presenceRef } = injectedPresence ?? ownPresence;

  if (!forceMount && !isPresent) return null;

  const positionerProps = api.getPositionerProps();
  const contentProps = api.getContentProps();

  const closingProps = !api.isOpen
    ? ({
        "aria-hidden": true,
        style: { pointerEvents: "none" },
      } as const)
    : {};

  const mergedContentProps = {
    ...contentProps,
    ...closingProps,
    ...rest,
    ref: mergeRefs(contentProps.ref as (el: HTMLUListElement | null) => void, presenceRef as (el: HTMLUListElement | null) => void),
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

export interface SelectItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, "value"> {
  value: string;
  disabled?: boolean;
  label?: string;
  asChild?: boolean;
  children: ReactNode;
}

function Item({ value, disabled = false, label, asChild, children, ...rest }: SelectItemProps) {
  const api = useCtx();
  const resolvedLabel = label ?? (typeof children === "string" ? children : value);

  useLayoutEffect(() => {
    const option: SelectOption = { value, label: resolvedLabel, disabled };
    api.send({ type: "REGISTER_OPTION", option });
    return () => api.send({ type: "UNREGISTER_OPTION", value });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, resolvedLabel, disabled]);

  // Strip Vue-specific casing (onMousemove / onMouseleave) â€" React uses camelCase.
  const { onMousemove: _mm, onMouseleave: _ml, ...optionProps } = api.getOptionProps({ value, disabled });
  const props = { ...optionProps, ...rest } as LiHTMLAttributes<HTMLLIElement>;

  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <li {...props}>{children}</li>;
}

// ---------------------------------------------------------------------------
// ItemText â€" renders the option label text (semantic, for SR)
// ---------------------------------------------------------------------------

export interface SelectItemTextProps {
  children: ReactNode;
}

function ItemText({ children }: SelectItemTextProps) {
  return <span data-forge-scope="select" data-forge-part="item-text">{children}</span>;
}

// ---------------------------------------------------------------------------
// ItemIndicator â€" shown only when the item is selected
// ---------------------------------------------------------------------------

export interface SelectItemIndicatorProps {
  children: ReactNode;
}

function ItemIndicator({ children }: SelectItemIndicatorProps) {
  return <span data-forge-scope="select" data-forge-part="item-indicator">{children}</span>;
}

// ---------------------------------------------------------------------------
// Separator
// ---------------------------------------------------------------------------

export interface SelectSeparatorProps extends HTMLAttributes<HTMLLIElement> {}

function Separator({ ...rest }: SelectSeparatorProps) {
  return <li role="separator" data-forge-scope="select" data-forge-part="separator" {...rest} />;
}

// ---------------------------------------------------------------------------
// Group + GroupLabel
// ---------------------------------------------------------------------------

export interface SelectGroupProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
}

function Group({ children, ...rest }: SelectGroupProps) {
  return (
    <ul role="group" data-forge-scope="select" data-forge-part="group" {...rest}>
      {children}
    </ul>
  );
}

export interface SelectGroupLabelProps extends HTMLAttributes<HTMLLIElement> {
  children: ReactNode;
}

function GroupLabel({ children, ...rest }: SelectGroupLabelProps) {
  return (
    <li role="presentation" data-forge-scope="select" data-forge-part="group-label" {...rest}>
      {children}
    </li>
  );
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------
// Indicator â€" visual chevron/arrow inside the trigger; reflects open/closed.
// ---------------------------------------------------------------------------

export interface SelectIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

function Indicator({ children, ...rest }: SelectIndicatorProps) {
  const api = useCtx();
  return <span {...api.getIndicatorProps()} {...rest}>{children}</span>;
}

// ---------------------------------------------------------------------------

export const Select = {
  Root,
  Label,
  Trigger,
  Value,
  Placeholder,
  Portal,
  Content,
  Indicator,
  Item,
  ItemText,
  ItemIndicator,
  Separator,
  Group,
  GroupLabel,
} as const;
