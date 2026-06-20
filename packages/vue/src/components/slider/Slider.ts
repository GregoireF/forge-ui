import type { InjectionKey, PropType } from "vue";
import { defineComponent, h, inject, provide } from "vue";
import { Slot } from "../dialog/Slot.js";
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
    value: { type: Number, default: undefined },
    defaultValue: { type: Number, default: undefined },
    min: { type: Number, default: undefined },
    max: { type: Number, default: undefined },
    step: { type: Number, default: undefined },
    orientation: { type: String as PropType<"horizontal" | "vertical">, default: undefined },
    disabled: { type: Boolean, default: undefined },
    onValueChange: { type: Function as PropType<(v: number) => void>, default: undefined },
    onValueCommit: { type: Function as PropType<(v: number) => void>, default: undefined },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useSlider({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.value !== undefined && { value: props.value }),
      ...(props.defaultValue !== undefined && { defaultValue: props.defaultValue }),
      ...(props.min !== undefined && { min: props.min }),
      ...(props.max !== undefined && { max: props.max }),
      ...(props.step !== undefined && { step: props.step }),
      ...(props.orientation !== undefined && { orientation: props.orientation }),
      ...(props.disabled !== undefined && { disabled: props.disabled }),
      ...(props.onValueChange !== undefined && { onValueChange: props.onValueChange }),
      ...(props.onValueCommit !== undefined && { onValueCommit: props.onValueCommit }),
    });
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
      const { ref, onPointerDown, ...trackAttrs } = api.getTrackProps();
      const merged = { ...trackAttrs, onPointerdown: onPointerDown, ref, ...attrs };
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
      const merged = { ...api.getRangeProps(), ...attrs };
      if (props.asChild) return h(Slot, merged, slots.default);
      return h("div", merged);
    };
  },
});

// ---------------------------------------------------------------------------
// Thumb
// ---------------------------------------------------------------------------

const SliderThumb = defineComponent({
  name: "ForgeSliderThumb",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      // Strip React-only onKeyDown (Vue uses onKeydown)
      const { onKeyDown: _kd, ...thumbAttrs } = api.getThumbProps();
      const merged = { ...thumbAttrs, ...attrs };
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
  props: { name: { type: String, default: undefined } },
  setup(props) {
    const api = useCtx();
    return () => h("input", api.getHiddenInputProps(props.name));
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
} as const;

export { SliderHiddenInput, SliderRange, SliderRoot, SliderThumb, SliderTrack };
