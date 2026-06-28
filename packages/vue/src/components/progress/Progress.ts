import { connectProgress } from "@forge-ui/progress";
import type { ComputedRef, InjectionKey } from "vue";
import { computed, defineComponent, h, inject, provide } from "vue";
import { Slot } from "../shared/Slot.js";

// ---------------------------------------------------------------------------
// Context â€” Root provides a ComputedRef so children stay reactive
// ---------------------------------------------------------------------------

interface ProgressCtx {
  value: number | null;
  max: number;
  min: number;
}

const progressKey: InjectionKey<ComputedRef<ProgressCtx>> = Symbol("forge-progress");

const defaultCtx = computed<ProgressCtx>(() => ({ value: null, max: 100, min: 0 }));

function useProgressCtx(): ComputedRef<ProgressCtx> {
  return inject(progressKey, defaultCtx);
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const ProgressRoot = defineComponent({
  name: "ForgeProgressRoot",
  props: {
    value: { type: Number, default: null },
    max: { type: Number, default: 100 },
    min: { type: Number, default: 0 },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    // provide must be called in setup(), not in the render closure
    const ctx = computed<ProgressCtx>(() => ({
      value: props.value,
      max: props.max,
      min: props.min,
    }));
    provide(progressKey, ctx);

    return () => {
      const api = connectProgress({ value: props.value, max: props.max, min: props.min });
      const merged = { ...api.getRootProps(), ...attrs };
      if (props.asChild) return h(Slot, merged, slots["default"]);
      return h("div", merged, slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Track
// ---------------------------------------------------------------------------

const ProgressTrack = defineComponent({
  name: "ForgeProgressTrack",
  props: {
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const ctx = useProgressCtx();
    return () => {
      const { value, max, min } = ctx.value;
      const api = connectProgress({ value, max, min });
      const merged = { ...api.getTrackProps(), ...attrs };
      if (props.asChild) return h(Slot, merged, slots["default"]);
      return h("div", merged, slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Fill
// ---------------------------------------------------------------------------

const ProgressFill = defineComponent({
  name: "ForgeProgressFill",
  props: {
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const ctx = useProgressCtx();
    return () => {
      const { value, max, min } = ctx.value;
      const api = connectProgress({ value, max, min });
      const merged = { ...api.getFillProps(), ...attrs };
      if (props.asChild) return h(Slot, merged, slots["default"]);
      return h("div", merged);
    };
  },
});

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

const ProgressLabel = defineComponent({
  name: "ForgeProgressLabel",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    return () => {
      const api = connectProgress({ value: null });
      const merged = { ...api.getLabelProps(), ...attrs };
      if (props.asChild) return h(Slot, merged, slots["default"]);
      return h("span", merged, slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// ValueText
// ---------------------------------------------------------------------------

const ProgressValueText = defineComponent({
  name: "ForgeProgressValueText",
  props: {
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const ctx = useProgressCtx();
    return () => {
      const { value, max, min } = ctx.value;
      const api = connectProgress({ value, max, min });
      const text = value !== null ? `${api.percent}%` : "loading";
      const merged = { ...api.getValueTextProps(), ...attrs };
      if (props.asChild) return h(Slot, merged, slots["default"]);
      return h("span", merged, text);
    };
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Progress = {
  Root: ProgressRoot,
  Track: ProgressTrack,
  Fill: ProgressFill,
  Label: ProgressLabel,
  ValueText: ProgressValueText,
} as const;

export { ProgressFill, ProgressLabel, ProgressRoot, ProgressTrack, ProgressValueText };
