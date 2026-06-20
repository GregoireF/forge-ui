import type { InjectionKey, PropType } from "vue";
import { defineComponent, h, inject, provide } from "vue";
import { Slot } from "../dialog/Slot.js";
import type { UseRadioGroupReturn } from "./use-radio-group.js";
import { useRadioGroup } from "./use-radio-group.js";

const radioGroupKey: InjectionKey<UseRadioGroupReturn> = Symbol("forge-radio-group");

interface RadioItemCtx {
  value: string;
  disabled: boolean;
}

const radioItemKey: InjectionKey<RadioItemCtx> = Symbol("forge-radio-group-item");

function useCtx(): UseRadioGroupReturn {
  const ctx = inject(radioGroupKey);
  if (!ctx) throw new Error("RadioGroup parts must be inside <RadioGroup.Root>");
  return ctx;
}

function useItemCtx(): RadioItemCtx {
  const ctx = inject(radioItemKey);
  if (!ctx) throw new Error("RadioGroup.Radio/Label must be inside <RadioGroup.Item>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const RadioGroupRoot = defineComponent({
  name: "ForgeRadioGroupRoot",
  props: {
    id: { type: String, default: undefined },
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    disabled: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    orientation: { type: String as PropType<"horizontal" | "vertical">, default: undefined },
    name: { type: String, default: undefined },
    onValueChange: { type: Function as PropType<(v: string) => void>, default: undefined },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useRadioGroup({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.value !== undefined && { value: props.value }),
      ...(props.defaultValue !== undefined && { defaultValue: props.defaultValue }),
      ...(props.disabled !== undefined && { disabled: props.disabled }),
      ...(props.required !== undefined && { required: props.required }),
      ...(props.orientation !== undefined && { orientation: props.orientation }),
      ...(props.name !== undefined && { name: props.name }),
      ...(props.onValueChange !== undefined && { onValueChange: props.onValueChange }),
    });
    provide(radioGroupKey, api);
    return () => {
      const rootProps = { ...api.getRootProps(), ...attrs };
      if (props.asChild) return h(Slot, rootProps, slots.default);
      return h("div", rootProps, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

const RadioGroupItem = defineComponent({
  name: "ForgeRadioGroupItem",
  props: {
    value: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    provide(radioItemKey, { value: props.value, disabled: props.disabled });
    return () => {
      const itemProps = { ...api.getItemProps(props.value, props.disabled), ...attrs };
      if (props.asChild) return h(Slot, itemProps, slots.default);
      return h("div", itemProps, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Radio
// ---------------------------------------------------------------------------

const RadioGroupRadio = defineComponent({
  name: "ForgeRadioGroupRadio",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const { value, disabled } = useItemCtx();
      const { onKeyDown: _kd, ...radioProps } = api.getRadioProps(value, disabled);
      const merged = { ...radioProps, ...attrs };
      if (props.asChild) return h(Slot, merged, slots.default);
      return h("button", merged, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

const RadioGroupLabel = defineComponent({
  name: "ForgeRadioGroupLabel",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const { value } = useItemCtx();
      const { htmlFor, ...labelProps } = api.getLabelProps(value);
      const merged = { ...labelProps, for: htmlFor, ...attrs };
      if (props.asChild) return h(Slot, merged, slots.default);
      return h("label", merged, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// HiddenInput
// ---------------------------------------------------------------------------

const RadioGroupHiddenInput = defineComponent({
  name: "ForgeRadioGroupHiddenInput",
  setup() {
    const api = useCtx();
    return () => {
      const { value, disabled } = useItemCtx();
      const inputProps = api.getHiddenInputProps(value, disabled);
      if (!inputProps.name) return null;
      return h("input", { ...inputProps, onChange: () => {} });
    };
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const RadioGroup = {
  Root: RadioGroupRoot,
  Item: RadioGroupItem,
  Radio: RadioGroupRadio,
  Label: RadioGroupLabel,
  HiddenInput: RadioGroupHiddenInput,
} as const;

export { RadioGroupHiddenInput, RadioGroupItem, RadioGroupLabel, RadioGroupRadio, RadioGroupRoot };
