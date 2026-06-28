import type { SliderMark } from "@forge-ui/slider";
import type { HTMLAttributes, ReactNode } from "react";
import { createContext, useContext } from "react";
import { Slot } from "../shared/Slot.js";
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

export interface SliderRootProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "defaultChecked"> {
  children: ReactNode;
  asChild?: boolean;
  value?: number | number[];
  defaultValue?: number | number[];
  min?: number;
  max?: number;
  step?: number;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  marks?: SliderMark[];
  getValueLabel?: (value: number, index: number) => string;
  onValueChange?: (values: number[]) => void;
  onValueCommit?: (values: number[]) => void;
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
  marks,
  getValueLabel,
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
    ...(marks !== undefined && { marks }),
    ...(getValueLabel !== undefined && { getValueLabel }),
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
// Range — the filled portion
// ---------------------------------------------------------------------------

export interface SliderRangeProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

function Range({ asChild, style: userStyle, ...rest }: SliderRangeProps) {
  const api = useCtx();
  const { style: connectStyle, ...rangeAttrs } = api.getRangeProps();
  // connect styles (left/right) must win over user styles to keep positioning correct
  const props = { ...rangeAttrs, ...rest, style: { ...userStyle, ...connectStyle } };
  if (asChild) return <Slot {...props} />;
  return <div {...props} />;
}

// ---------------------------------------------------------------------------
// Thumb — index identifies which value this thumb controls
// ---------------------------------------------------------------------------

export interface SliderThumbProps extends Omit<HTMLAttributes<HTMLDivElement>, "onKeyDown"> {
  asChild?: boolean;
  /** Which value index this thumb controls. @default 0 */
  index?: number;
}

function Thumb({ asChild, index = 0, style: userStyle, ...rest }: SliderThumbProps) {
  const api = useCtx();
  const { onKeydown: _kd, onPointerdown: _pd, onKeyDown, onPointerDown, style: connectStyle, ...thumbAttrs } = api.getThumbProps(index);
  const onKD = onKeyDown as unknown as React.KeyboardEventHandler<HTMLDivElement>;
  const onPD = onPointerDown as unknown as React.PointerEventHandler<HTMLDivElement>;
  // connect styles (position/left/transform) must win over user styles
  const props = { ...thumbAttrs, onKeyDown: onKD, onPointerDown: onPD, ...rest, style: { ...userStyle, ...connectStyle } };
  if (asChild) return <Slot {...props} />;
  return <div {...props} />;
}

// ---------------------------------------------------------------------------
// HiddenInput — for form submission
// ---------------------------------------------------------------------------

export interface SliderHiddenInputProps {
  name?: string;
  /** Which value index to serialize. @default 0 */
  index?: number;
}

function HiddenInput({ name, index = 0 }: SliderHiddenInputProps) {
  const api = useCtx();
  const props = api.getHiddenInputProps(name, index);
  return <input {...props} />;
}

// ---------------------------------------------------------------------------
// MarkerGroup — container for tick marks, positioned relative to the track
// ---------------------------------------------------------------------------

export interface SliderMarkerGroupProps extends HTMLAttributes<HTMLDivElement> {}

function MarkerGroup({ style: userStyle, ...rest }: SliderMarkerGroupProps) {
  const api = useCtx();
  const { style: connectStyle, ...groupAttrs } = api.getMarkerGroupProps();
  return <div {...groupAttrs} {...rest} style={{ ...connectStyle, ...userStyle }} />;
}

// ---------------------------------------------------------------------------
// Marker — single tick mark at a given value
// ---------------------------------------------------------------------------

export interface SliderMarkerProps extends HTMLAttributes<HTMLSpanElement> {
  value: number;
  children?: ReactNode;
}

function Marker({ value: markValue, style: userStyle, children, ...rest }: SliderMarkerProps) {
  const api = useCtx();
  const { style: connectStyle, ...markerAttrs } = api.getMarkerProps(markValue);
  return (
    <span {...markerAttrs} {...rest} style={{ ...connectStyle, ...userStyle }}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

Root.displayName = "Slider.Root";
Track.displayName = "Slider.Track";
Range.displayName = "Slider.Range";
Thumb.displayName = "Slider.Thumb";
HiddenInput.displayName = "Slider.HiddenInput";
MarkerGroup.displayName = "Slider.MarkerGroup";
Marker.displayName = "Slider.Marker";

export const Slider = {
  Root,
  Track,
  Range,
  Thumb,
  HiddenInput,
  MarkerGroup,
  Marker,
} as const;
