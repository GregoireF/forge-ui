import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";
import { createContext, useContext } from "react";
import { Slot } from "../shared/Slot.js";
import type { UseSwitchOptions, UseSwitchReturn } from "./use-switch.js";
import { useSwitch } from "./use-switch.js";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const SwitchCtx = createContext<UseSwitchReturn | null>(null);

function useCtx(): UseSwitchReturn {
  const ctx = useContext(SwitchCtx);
  if (!ctx) throw new Error("Switch compound parts must be used inside <Switch.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface SwitchRootProps extends UseSwitchOptions {
  children: ReactNode;
}

function Root({ children, name, ...opts }: SwitchRootProps) {
  const api = useSwitch({ ...opts, ...(name !== undefined && { name }) });
  const hiddenInputProps = api.getHiddenInputProps();

  return (
    <SwitchCtx.Provider value={api}>
      <div {...api.getRootProps()}>
        {children}
        {/* Hidden checkbox auto-rendered when name is set — native form submission. */}
        {name && <input {...hiddenInputProps} name={name} />}
      </div>
    </SwitchCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Control — <button role="switch">
// ---------------------------------------------------------------------------

export interface SwitchControlProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function Control({ asChild, children, ...rest }: SwitchControlProps) {
  const api = useCtx();
  const props = { ...api.getControlProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// Thumb — decorative sliding dot
// ---------------------------------------------------------------------------

export interface SwitchThumbProps extends HTMLAttributes<HTMLSpanElement> {}

function Thumb({ ...rest }: SwitchThumbProps) {
  const api = useCtx();
  const props = { ...api.getThumbProps(), ...rest };
  return <span {...props} />;
}

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

export interface SwitchLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

function Label({ children, ...rest }: SwitchLabelProps) {
  const api = useCtx();
  const props = { ...api.getLabelProps(), ...rest };
  return <label {...props}>{children}</label>;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

Root.displayName = "Switch.Root";
Control.displayName = "Switch.Control";
Thumb.displayName = "Switch.Thumb";
Label.displayName = "Switch.Label";

export const Switch = {
  Root,
  Control,
  Thumb,
  Label,
} as const;
