import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
} from "react";
import { createContext, useContext } from "react";
import { Slot } from "../shared/Slot.js";
import type { UseNumberInputOptions } from "./use-number-input.js";
import { useNumberInput } from "./use-number-input.js";

type NumberInputApiReturn = ReturnType<typeof useNumberInput>;

const NumberInputCtx = createContext<NumberInputApiReturn | null>(null);

function useCtx(): NumberInputApiReturn {
  const ctx = useContext(NumberInputCtx);
  if (!ctx) throw new Error("NumberInput compound parts must be used inside <NumberInput.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface NumberInputRootProps extends UseNumberInputOptions {
  children: ReactNode;
}

function Root({ children, ...opts }: NumberInputRootProps) {
  const api = useNumberInput(opts);
  return <NumberInputCtx.Provider value={api}>{children}</NumberInputCtx.Provider>;
}

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

export interface NumberInputLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  asChild?: boolean;
}

function Label({ asChild, children, ...rest }: NumberInputLabelProps) {
  const api = useCtx();
  const props = { ...api.getLabelProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <label {...props}>{children}</label>;
}

// ---------------------------------------------------------------------------
// Control — wrapper around Input + stepper buttons
// ---------------------------------------------------------------------------

export interface NumberInputControlProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

function Control({ asChild, children, ...rest }: NumberInputControlProps) {
  const api = useCtx();
  const props = { ...api.getControlProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <div {...props}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Input — the spinbutton input element
// ---------------------------------------------------------------------------

export interface NumberInputInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "role" | "type" | "value" | "onChange" | "onFocus" | "onBlur" | "onKeyDown"
  > {
  asChild?: boolean;
}

function Input({ asChild, ...rest }: NumberInputInputProps) {
  const api = useCtx();
  // React uses onChange and onKeyDown (camelCase).
  // Connect emits onInput (non-React) and onKeydown (lowercase) — strip those.
  const {
    onInput: _onInput,
    onInput_vue: _onInputVue,
    onKeydown: _kd,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    ...inputAttrs
  } = api.getInputProps() as ReturnType<typeof api.getInputProps> & {
    onInput?: (e: Event) => void;
    onInput_vue?: (e: Event) => void;
    onKeydown?: (e: KeyboardEvent) => void;
  };

  const props = {
    ...inputAttrs,
    onChange: onChange as unknown as React.ChangeEventHandler<HTMLInputElement>,
    onKeyDown: onKeyDown as unknown as React.KeyboardEventHandler<HTMLInputElement>,
    onFocus: onFocus as unknown as React.FocusEventHandler<HTMLInputElement>,
    onBlur: onBlur as unknown as React.FocusEventHandler<HTMLInputElement>,
    ...rest,
  };

  if (asChild) return <Slot {...props} />;
  return <input {...props} />;
}

// ---------------------------------------------------------------------------
// IncrementTrigger
// ---------------------------------------------------------------------------

export interface NumberInputIncrementTriggerProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "onPointerDown" | "onPointerUp" | "onPointerLeave" | "type"
  > {
  asChild?: boolean;
}

function IncrementTrigger({ asChild, children, ...rest }: NumberInputIncrementTriggerProps) {
  const api = useCtx();
  const {
    onPointerdown: _pd,
    onPointerup: _pu,
    onPointerleave: _pl,
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    ...triggerAttrs
  } = api.getIncrementTriggerProps() as ReturnType<typeof api.getIncrementTriggerProps> & {
    onPointerdown?: (e: PointerEvent) => void;
    onPointerup?: () => void;
    onPointerleave?: () => void;
  };

  const props = {
    ...triggerAttrs,
    onPointerDown: onPointerDown as unknown as React.PointerEventHandler<HTMLButtonElement>,
    onPointerUp: onPointerUp as unknown as React.PointerEventHandler<HTMLButtonElement>,
    onPointerLeave: onPointerLeave as unknown as React.PointerEventHandler<HTMLButtonElement>,
    ...rest,
  };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// DecrementTrigger
// ---------------------------------------------------------------------------

export interface NumberInputDecrementTriggerProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "onPointerDown" | "onPointerUp" | "onPointerLeave" | "type"
  > {
  asChild?: boolean;
}

function DecrementTrigger({ asChild, children, ...rest }: NumberInputDecrementTriggerProps) {
  const api = useCtx();
  const {
    onPointerdown: _pd,
    onPointerup: _pu,
    onPointerleave: _pl,
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    ...triggerAttrs
  } = api.getDecrementTriggerProps() as ReturnType<typeof api.getDecrementTriggerProps> & {
    onPointerdown?: (e: PointerEvent) => void;
    onPointerup?: () => void;
    onPointerleave?: () => void;
  };

  const props = {
    ...triggerAttrs,
    onPointerDown: onPointerDown as unknown as React.PointerEventHandler<HTMLButtonElement>,
    onPointerUp: onPointerUp as unknown as React.PointerEventHandler<HTMLButtonElement>,
    onPointerLeave: onPointerLeave as unknown as React.PointerEventHandler<HTMLButtonElement>,
    ...rest,
  };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// HiddenInput — for form submission
// ---------------------------------------------------------------------------

export interface NumberInputHiddenInputProps {
  name?: string;
}

function HiddenInput({ name }: NumberInputHiddenInputProps) {
  const api = useCtx();
  const props = api.getHiddenInputProps(name);
  return <input {...props} />;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

Root.displayName = "NumberInput.Root";
Label.displayName = "NumberInput.Label";
Control.displayName = "NumberInput.Control";
Input.displayName = "NumberInput.Input";
IncrementTrigger.displayName = "NumberInput.IncrementTrigger";
DecrementTrigger.displayName = "NumberInput.DecrementTrigger";
HiddenInput.displayName = "NumberInput.HiddenInput";

export const NumberInput = {
  Root,
  Label,
  Control,
  Input,
  IncrementTrigger,
  DecrementTrigger,
  HiddenInput,
} as const;
