import type { HTMLAttributes, LabelHTMLAttributes, MouseEvent, ReactNode } from "react";
import { createContext, useContext, useEffect } from "react";
import type { UseCheckboxGroupOptions, UseCheckboxGroupReturn } from "./use-checkbox-group.js";
import { useCheckboxGroup } from "./use-checkbox-group.js";
import type { UseCheckboxOptions, UseCheckboxReturn } from "./use-checkbox.js";
import { useCheckbox } from "./use-checkbox.js";

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------

const CheckboxCtx = createContext<UseCheckboxReturn | null>(null);
const CheckboxGroupCtx = createContext<UseCheckboxGroupReturn | null>(null);

function useCtx(): UseCheckboxReturn {
  const ctx = useContext(CheckboxCtx);
  if (!ctx) throw new Error("Checkbox compound parts must be used inside <Checkbox.Root>");
  return ctx;
}

function useGroupCtx(): UseCheckboxGroupReturn | null {
  return useContext(CheckboxGroupCtx);
}

// ---------------------------------------------------------------------------
// Group
// ---------------------------------------------------------------------------

export interface CheckboxGroupProps extends UseCheckboxGroupOptions {
  children: ReactNode;
  asChild?: boolean;
}

function Group({ children, asChild: _asChild, ...opts }: CheckboxGroupProps) {
  const group = useCheckboxGroup(opts);
  return (
    <CheckboxGroupCtx.Provider value={group}>
      <div role="group" data-forge-scope="checkbox" data-forge-part="group">
        {children}
      </div>
    </CheckboxGroupCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// GroupAll — select-all control. Must be inside <Checkbox.Group>.
// Checked state is auto-derived: false / indeterminate / true.
// ---------------------------------------------------------------------------

export interface CheckboxGroupAllProps
  extends Omit<UseCheckboxOptions, "checked" | "onCheckedChange" | "name" | "value"> {
  children: ReactNode;
}

function GroupAll({ children, disabled: itemDisabled, ...opts }: CheckboxGroupAllProps) {
  const group = useGroupCtx();
  if (!group) throw new Error("<Checkbox.GroupAll> must be inside <Checkbox.Group>");

  const disabled = itemDisabled ?? group.disabled;
  // No onCheckedChange — calling group.selectAll/deselectAll inside onCheckedChange
  // triggers useLayoutEffect (checked prop changes) → machine sends → onCheckedChange again.
  // Instead we intercept onClick on the control to call group functions directly.
  const api = useCheckbox({ ...opts, checked: group.groupChecked, disabled });

  const modifiedApi: UseCheckboxReturn = {
    ...api,
    getControlProps: () => ({
      ...api.getControlProps(),
      onClick(e: MouseEvent) {
        e.preventDefault();
        if (api.isDisabled) return;
        if (group.groupChecked === true) group.deselectAll();
        else group.selectAll();
      },
    }),
  };

  return (
    <CheckboxCtx.Provider value={modifiedApi}>
      <div {...api.getRootProps()}>{children}</div>
    </CheckboxCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface CheckboxRootProps extends UseCheckboxOptions {
  children: ReactNode;
  /** When inside a <Checkbox.Group>, this value is added/removed from the group array. */
  value?: string;
}

function Root({ children, value: itemValue, name: itemName, ...opts }: CheckboxRootProps) {
  const group = useGroupCtx();
  const isInGroup = group !== null && itemValue !== undefined;

  // For group items, do NOT pass onCheckedChange — calling group.toggle() inside
  // onCheckedChange (triggered by useLayoutEffect when checked prop changes) causes a
  // loop: toggle → checked changes → useLayoutEffect → machine sends → onCheckedChange.
  // onClick override below handles the toggle instead.
  const api = useCheckbox({
    ...opts,
    ...(isInGroup && {
      checked: group.isChecked(itemValue),
      name: group.name ?? itemName,
      disabled: opts.disabled ?? group.disabled,
      required: opts.required ?? group.required,
    }),
    ...(!isInGroup && {
      ...(itemName !== undefined && { name: itemName }),
      ...(opts.onCheckedChange !== undefined && { onCheckedChange: opts.onCheckedChange }),
    }),
  });

  // For group items: intercept onClick to call group.toggle() directly.
  const providedApi: UseCheckboxReturn = isInGroup
    ? {
        ...api,
        getControlProps: () => ({
          ...api.getControlProps(),
          onClick(e: MouseEvent) {
            e.preventDefault();
            if (api.isDisabled) return;
            group!.toggle(itemValue!);
          },
        }),
      }
    : api;

  // Register/unregister value in the group so select-all can compute its state.
  // Use stable function refs (not `group` object) as deps: `group` is a new
  // object reference on every Group re-render, which would cause an infinite
  // loop (registerValue → setAllValues → re-render → new group → re-run).
  const registerValue = group?.registerValue;
  const unregisterValue = group?.unregisterValue;
  useEffect(() => {
    if (!isInGroup || !itemValue || !registerValue || !unregisterValue) return;
    registerValue(itemValue);
    return () => unregisterValue(itemValue);
  }, [isInGroup, itemValue, registerValue, unregisterValue]);

  const hiddenInputProps = api.getHiddenInputProps();
  const effectiveName = isInGroup ? (group.name ?? itemName) : itemName;

  return (
    <CheckboxCtx.Provider value={providedApi}>
      <div {...api.getRootProps()}>
        {children}
        {effectiveName && (
          <input
            {...hiddenInputProps}
            name={effectiveName}
            value={itemValue ?? hiddenInputProps.value}
          />
        )}
      </div>
    </CheckboxCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Control — the visible, focusable button with role="checkbox"
// ---------------------------------------------------------------------------

export interface CheckboxControlProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function Control({ children, ...rest }: CheckboxControlProps) {
  const api = useCtx();
  const props = { ...api.getControlProps(), ...rest };
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// Indicator — renders children only when checked or indeterminate.
// Use forceMount for exit animations.
// ---------------------------------------------------------------------------

export interface CheckboxIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  forceMount?: boolean;
}

function Indicator({ forceMount, children, ...rest }: CheckboxIndicatorProps) {
  const api = useCtx();
  if (!forceMount && !api.isChecked && !api.isIndeterminate) return null;
  const props = { ...api.getIndicatorProps(), ...rest };
  return <span {...props}>{children}</span>;
}

// ---------------------------------------------------------------------------
// Label — <label> associated with the Control via htmlFor
// ---------------------------------------------------------------------------

export interface CheckboxLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  asChild?: boolean;
}

function Label({ children, ...rest }: CheckboxLabelProps) {
  const api = useCtx();
  const props = { ...api.getLabelProps(), ...rest };
  return <label {...props}>{children}</label>;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

Root.displayName = "Checkbox.Root";
Control.displayName = "Checkbox.Control";
Indicator.displayName = "Checkbox.Indicator";
Label.displayName = "Checkbox.Label";
Group.displayName = "Checkbox.Group";
GroupAll.displayName = "Checkbox.GroupAll";

export const Checkbox = {
  Root,
  Control,
  Indicator,
  Label,
  Group,
  GroupAll,
} as const;
