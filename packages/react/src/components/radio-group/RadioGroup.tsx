import type { HTMLAttributes, ReactNode } from "react";
import { createContext, useContext } from "react";
import { Slot } from "../shared/Slot.js";
import type { UseRadioGroupOptions } from "./use-radio-group.js";
import { useRadioGroup } from "./use-radio-group.js";

type RadioGroupApi = ReturnType<typeof useRadioGroup>;

// Per-item context: { value, disabled }
interface RadioItemCtx {
  value: string;
  disabled: boolean;
}

const RadioGroupCtx = createContext<RadioGroupApi | null>(null);
const RadioItemCtxCtx = createContext<RadioItemCtx | null>(null);

function useCtx(): RadioGroupApi {
  const ctx = useContext(RadioGroupCtx);
  if (!ctx) throw new Error("RadioGroup compound parts must be inside <RadioGroup.Root>");
  return ctx;
}

function useItemCtx(): RadioItemCtx {
  const ctx = useContext(RadioItemCtxCtx);
  if (!ctx) throw new Error("RadioGroup.Radio/Label must be inside <RadioGroup.Item>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface RadioGroupRootProps extends UseRadioGroupOptions {
  children: ReactNode;
  asChild?: boolean;
}

function Root({ children, asChild, ...opts }: RadioGroupRootProps) {
  const api = useRadioGroup(opts);
  const props = api.getRootProps();
  return (
    <RadioGroupCtx.Provider value={api}>
      {asChild ? <Slot {...props}>{children}</Slot> : <div {...props}>{children}</div>}
    </RadioGroupCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Item â€” provides value context to Radio + Label
// ---------------------------------------------------------------------------

export interface RadioGroupItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
  children: ReactNode;
  asChild?: boolean;
}

function Item({ value, disabled = false, children, asChild, ...rest }: RadioGroupItemProps) {
  const api = useCtx();
  const props = { ...api.getItemProps(value, disabled), ...rest };
  return (
    <RadioItemCtxCtx.Provider value={{ value, disabled }}>
      {asChild ? <Slot {...props}>{children}</Slot> : <div {...props}>{children}</div>}
    </RadioItemCtxCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Radio â€” the actual radio button (role="radio")
// ---------------------------------------------------------------------------

export interface RadioGroupRadioProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function Radio({ asChild, ...rest }: RadioGroupRadioProps) {
  const api = useCtx();
  const { value, disabled } = useItemCtx();
  const { onKeydown: _kd, ...radioProps } = api.getRadioProps(value, disabled);
  const props = { ...radioProps, ...rest } as HTMLAttributes<HTMLButtonElement>;
  if (asChild) return <Slot {...props} />;
  return <button {...props} />;
}

// ---------------------------------------------------------------------------
// Label â€” <label> for the radio
// ---------------------------------------------------------------------------

export interface RadioGroupLabelProps extends HTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  asChild?: boolean;
}

function Label({ children, asChild, ...rest }: RadioGroupLabelProps) {
  const api = useCtx();
  const { value } = useItemCtx();
  // htmlFor from getLabelProps, rest for passthrough
  const { htmlFor, ...labelProps } = api.getLabelProps(value);
  const props = { ...labelProps, htmlFor, ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <label {...props}>{children}</label>;
}

// ---------------------------------------------------------------------------
// HiddenInput â€” for form submission
// ---------------------------------------------------------------------------

function HiddenInput() {
  const api = useCtx();
  const { value, disabled } = useItemCtx();
  if (!api.getHiddenInputProps(value).name) return null;
  return <input {...api.getHiddenInputProps(value, disabled)} onChange={() => {}} />;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const RadioGroup = {
  Root,
  Item,
  Radio,
  Label,
  HiddenInput,
} as const;
