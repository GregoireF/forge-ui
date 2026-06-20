import { connectProgress } from "@forge-ui/progress";
import { defineComponent, h } from "vue";
import { Slot } from "../dialog/Slot.js";

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
    return () => {
      const api = connectProgress({ value: props.value, max: props.max, min: props.min });
      const merged = { ...api.getRootProps(), ...attrs };
      if (props.asChild) return h(Slot, merged, slots.default);
      return h("div", merged, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Track
// ---------------------------------------------------------------------------

const ProgressTrack = defineComponent({
  name: "ForgeProgressTrack",
  props: {
    value: { type: Number, default: null },
    max: { type: Number, default: 100 },
    min: { type: Number, default: 0 },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const api = connectProgress({ value: props.value, max: props.max, min: props.min });
      const merged = { ...api.getTrackProps(), ...attrs };
      if (props.asChild) return h(Slot, merged, slots.default);
      return h("div", merged, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Fill
// ---------------------------------------------------------------------------

const ProgressFill = defineComponent({
  name: "ForgeProgressFill",
  props: {
    value: { type: Number, default: null },
    max: { type: Number, default: 100 },
    min: { type: Number, default: 0 },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const api = connectProgress({ value: props.value, max: props.max, min: props.min });
      const merged = { ...api.getFillProps(), ...attrs };
      if (props.asChild) return h(Slot, merged, slots.default);
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
      if (props.asChild) return h(Slot, merged, slots.default);
      return h("span", merged, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// ValueText
// ---------------------------------------------------------------------------

const ProgressValueText = defineComponent({
  name: "ForgeProgressValueText",
  props: {
    value: { type: Number, default: null },
    max: { type: Number, default: 100 },
    min: { type: Number, default: 0 },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const api = connectProgress({ value: props.value, max: props.max, min: props.min });
      const text = props.value !== null ? `${api.percent}%` : "loading";
      const merged = { ...api.getValueTextProps(), ...attrs };
      if (props.asChild) return h(Slot, merged, slots.default);
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
