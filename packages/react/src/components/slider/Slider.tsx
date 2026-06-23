import type { HTMLAttributes, ReactNode } from "react";
import { createContext, useContext } from "react";
import { Slot } from "../shared/Slot.js";
import type { UseSliderOptions } from "./use-slider.js";
import { useSlider } from "./use-slider.js";

type SliderApi = ReturnType<typeof useSlider>;

const SliderCtx = createContext<SliderApi | null>(null);

function useCtx(): SliderApi {
  const ctx = useContext(SliderCtx);
  if (!ctx) throw new Error("Slider compound parts must be used inside <Slider.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface SliderRootProps extends Omit<HTMLAttributes<HTMLDivElement>, keyof UseSliderOptions | "defaultValue" | "defaultChecked"> {
  children: ReactNode;
  asChild?: boolean;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number) => void;
  id?: string;
}

function Root({
  children,
  asChild,
  value,
  defaultValue,
  min,
  max,
  step,
  orientation,
  disabled,
  onValueChange,
  onValueCommit,
  id,
  ...htmlProps
}: SliderRootProps) {
  const api = useSlider({
    ...(id !== undefined && { id }),
    ...(value !== undefined && { value }),
    ...(defaultValue !== undefined && { defaultValue }),
    ...(min !== undefined && { min }),
    ...(max !== undefined && { max }),
    ...(step !== undefined && { step }),
    ...(orientation !== undefined && { orientation }),
    ...(disabled !== undefined && { disabled }),
    ...(onValueChange !== undefined && { onValueChange }),
    ...(onValueCommit !== undefined && { onValueCommit }),
  });
  const props = { ...api.getRootProps(), ...htmlProps };
  return (
    <SliderCtx.Provider value={api}>
      {asChild ? <Slot {...props}>{children}</Slot> : <div {...props}>{children}</div>}
    </SliderCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Track
// ---------------------------------------------------------------------------

export interface SliderTrackProps extends Omit<HTMLAttributes<HTMLDivElement>, "onPointerDown"> {
  children: ReactNode;
  asChild?: boolean;
}

function Track({ children, asChild, ...rest }: SliderTrackProps) {
  const api = useCtx();
  const { ref, onPointerDown, ...trackAttrs } = api.getTrackProps();
  const onPD = onPointerDown as unknown as React.PointerEventHandler<HTMLDivElement>;
  if (asChild) return <Slot ref={ref as React.Ref<HTMLDivElement>} onPointerDown={onPD} {...trackAttrs} {...rest}>{children}</Slot>;
  return (
    <div ref={ref as React.Ref<HTMLDivElement>} onPointerDown={onPD} {...trackAttrs} {...rest}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Range â€” the filled portion
// ---------------------------------------------------------------------------

export interface SliderRangeProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

function Range({ asChild, ...rest }: SliderRangeProps) {
  const api = useCtx();
  const props = { ...api.getRangeProps(), ...rest };
  if (asChild) return <Slot {...props} />;
  return <div {...props} />;
}

// ---------------------------------------------------------------------------
// Thumb
// ---------------------------------------------------------------------------

export interface SliderThumbProps extends Omit<HTMLAttributes<HTMLDivElement>, "onKeyDown"> {
  asChild?: boolean;
  name?: string;
}

function Thumb({ asChild, name, ...rest }: SliderThumbProps) {
  const api = useCtx();
  const { onKeydown: _kd, onKeyDown, ...thumbAttrs } = api.getThumbProps();
  const onKD = onKeyDown as unknown as React.KeyboardEventHandler<HTMLDivElement>;
  const props = { ...thumbAttrs, onKeyDown: onKD, ...rest };
  if (asChild) return <Slot {...props} />;
  return <div {...props} />;
}

// ---------------------------------------------------------------------------
// HiddenInput â€” for form submission
// ---------------------------------------------------------------------------

export interface SliderHiddenInputProps {
  name?: string;
}

function HiddenInput({ name }: SliderHiddenInputProps) {
  const api = useCtx();
  const props = api.getHiddenInputProps(name);
  return <input {...props} />;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Slider = {
  Root,
  Track,
  Range,
  Thumb,
  HiddenInput,
} as const;
