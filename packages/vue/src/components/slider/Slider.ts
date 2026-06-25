import type { SliderMark } from "@forge-ui/slider";
import type { ComponentPublicInstance, InjectionKey, PropType } from "vue";
import { defineComponent, h, inject, provide, watch } from "vue";
import { Slot } from "../shared/Slot.js";
import type { UseSliderReturn } from "./use-slider.js";
import { useSlider } from "./use-slider.js";

const sliderKey: InjectionKey<UseSliderReturn> = Symbol("forge-slider");

function useCtx(): UseSliderReturn {
  const ctx = inject(sliderKey);
  if (!ctx) throw new Error("Slider compound parts must be inside <Slider.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const SliderRoot = defineComponent({
  name: "ForgeSliderRoot",
  props: {
    id: { type: String, default: undefined },
    value: { type: [Number, Array] as PropType<number | number[]>, default: undefined },
    defaultValue: { type: [Number, Array] as PropType<number | number[]>, default: undefined },
    min: { type: Number, default: undefined },
    max: { type: Number, default: undefined },
    step: { type: Number, default: undefined },
    orientation: { type: String as PropType<"horizontal" | "vertical">, default: undefined },
    disabled: { type: Boolean, default: undefined },
    marks: { type: Array as PropType<SliderMark[]>, default: undefined },
    getValueLabel: { type: Function as PropType<(v: number, i: number) => string>, default: undefined },
    onValueChange: { type: Function as PropType<(v: number[]) => void>, default: undefined },
    onValueCommit: { type: Function as PropType<(v: number[]) => void>, default: undefined },
    asChild: { type: Boolean, default: false },
  },
  emits: ["update:value"],
  setup(props, { slots, attrs, emit }) {
    const api = useSlider({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.value !== undefined && { value: props.value }),
      ...(props.defaultValue !== undefined && { defaultValue: props.defaultValue }),
      ...(props.min !== undefined && { min: props.min }),
      ...(props.max !== undefined && { max: props.max }),
      ...(props.step !== undefined && { step: props.step }),
      ...(props.orientation !== undefined && { orientation: props.orientation }),
      ...(props.disabled !== undefined && { disabled: props.disabled }),
      ...(props.marks !== undefined && { marks: props.marks }),
      ...(props.getValueLabel !== undefined && { getValueLabel: props.getValueLabel }),
      ...(props.onValueChange !== undefined && { onValueChange: props.onValueChange }),
      ...(props.onValueCommit !== undefined && { onValueCommit: props.onValueCommit }),
    });

    // Sync controlled value from props into machine context + notify subscribers.
    watch(
      () => props.value,
      (v) => {
        if (v === undefined) return;
        const vals = Array.isArray(v) ? v : [v];
        api.machine.update({ values: vals });
      },
    );

    watch(api.values, (vals) => emit("update:value", vals));

    provide(sliderKey, api);
    return () => {
      const rootProps = { ...api.getRootProps(), ...attrs };
      if (props.asChild) return h(Slot, rootProps, slots.default);
      return h("div", rootProps, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Track
// ---------------------------------------------------------------------------

const SliderTrack = defineComponent({
  name: "ForgeSliderTrack",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const { ref: trackRef, onPointerDown, ...trackAttrs } = api.getTrackProps();
      const vueRef = (el: Element | ComponentPublicInstance | null) => trackRef(el instanceof Element ? el : null);
      const merged = { ...trackAttrs, onPointerdown: onPointerDown, ref: vueRef, ...attrs };
      if (props.asChild) return h(Slot, merged, slots.default);
      return h("div", merged, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Range
// ---------------------------------------------------------------------------

const SliderRange = defineComponent({
  name: "ForgeSliderRange",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const { style: connectStyle, ...rangeAttrs } = api.getRangeProps();
      const { style: userStyle, ...userAttrs } = attrs as { style?: Record<string, string> };
      // connect styles (left/right) must win over user styles
      const merged = { ...rangeAttrs, ...userAttrs, style: { ...userStyle, ...connectStyle } };
      if (props.asChild) return h(Slot, merged, slots.default);
      return h("div", merged);
    };
  },
});

// ---------------------------------------------------------------------------
// Thumb — index identifies which value this thumb controls
// ---------------------------------------------------------------------------

const SliderThumb = defineComponent({
  name: "ForgeSliderThumb",
  props: {
    asChild: { type: Boolean, default: false },
    /** Which value index this thumb controls. @default 0 */
    index: { type: Number, default: 0 },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      // Strip React-only handlers (Vue uses lowercase variants from connect)
      const { onKeyDown: _kd, onPointerDown: _pd, style: connectStyle, ...thumbAttrs } = api.getThumbProps(props.index);
      const { style: userStyle, ...userAttrs } = attrs as { style?: Record<string, string> };
      // connect styles (position/left/transform) must win over user styles
      const merged = { ...thumbAttrs, ...userAttrs, style: { ...userStyle, ...connectStyle } };
      if (props.asChild) return h(Slot, merged, slots.default);
      return h("div", merged, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// HiddenInput
// ---------------------------------------------------------------------------

const SliderHiddenInput = defineComponent({
  name: "ForgeSliderHiddenInput",
  props: {
    name: { type: String, default: undefined },
    index: { type: Number, default: 0 },
  },
  setup(props) {
    const api = useCtx();
    return () => h("input", api.getHiddenInputProps(props.name, props.index));
  },
});

// ---------------------------------------------------------------------------
// MarkerGroup — container for tick marks, positioned relative to the track
// ---------------------------------------------------------------------------

const SliderMarkerGroup = defineComponent({
  name: "ForgeSliderMarkerGroup",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const { style: connectStyle, ...groupAttrs } = api.getMarkerGroupProps();
      const { style: userStyle, ...userAttrs } = attrs as { style?: Record<string, string> };
      return h("div", { ...groupAttrs, ...userAttrs, style: { ...connectStyle, ...userStyle } }, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Marker — single tick mark at a given value
// ---------------------------------------------------------------------------

const SliderMarker = defineComponent({
  name: "ForgeSliderMarker",
  props: {
    value: { type: Number, required: true as const },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const { style: connectStyle, ...markerAttrs } = api.getMarkerProps(props.value);
      const { style: userStyle, ...userAttrs } = attrs as { style?: Record<string, string> };
      return h("span", { ...markerAttrs, ...userAttrs, style: { ...connectStyle, ...userStyle } }, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Slider = {
  Root: SliderRoot,
  Track: SliderTrack,
  Range: SliderRange,
  Thumb: SliderThumb,
  HiddenInput: SliderHiddenInput,
  MarkerGroup: SliderMarkerGroup,
  Marker: SliderMarker,
} as const;

export { SliderHiddenInput, SliderMarker, SliderMarkerGroup, SliderRange, SliderRoot, SliderThumb, SliderTrack };
