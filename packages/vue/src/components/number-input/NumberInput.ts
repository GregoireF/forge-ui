import type { InjectionKey, PropType } from "vue";
import { defineComponent, h, inject, provide, watch } from "vue";
import { Slot } from "../shared/Slot.js";
import type { UseNumberInputReturn } from "./use-number-input.js";
import { useNumberInput } from "./use-number-input.js";

const numberInputKey: InjectionKey<UseNumberInputReturn> = Symbol("forge-number-input");

function useCtx(): UseNumberInputReturn {
  const ctx = inject(numberInputKey);
  if (!ctx) throw new Error("NumberInput compound parts must be inside <NumberInput.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const NumberInputRoot = defineComponent({
  name: "ForgeNumberInputRoot",
  props: {
    id: { type: String, default: undefined },
    value: { type: Number as PropType<number | null>, default: undefined },
    defaultValue: { type: Number as PropType<number | null>, default: undefined },
    min: { type: Number, default: undefined },
    max: { type: Number, default: undefined },
    step: { type: Number, default: undefined },
    largeStep: { type: Number, default: undefined },
    fractionDigits: { type: Number, default: undefined },
    locale: { type: String, default: undefined },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    allowEmpty: { type: Boolean, default: undefined },
    getValueLabel: { type: Function as PropType<(v: number) => string>, default: undefined },
    onValueChange: { type: Function as PropType<(v: number | null) => void>, default: undefined },
    onValueCommit: { type: Function as PropType<(v: number | null) => void>, default: undefined },
  },
  emits: {
    "update:value": (_v: number | null) => true,
  },
  setup(props, { slots, emit }) {
    const api = useNumberInput({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.value !== undefined && { value: props.value }),
      ...(props.defaultValue !== undefined && { defaultValue: props.defaultValue }),
      ...(props.min !== undefined && { min: props.min }),
      ...(props.max !== undefined && { max: props.max }),
      ...(props.step !== undefined && { step: props.step }),
      ...(props.largeStep !== undefined && { largeStep: props.largeStep }),
      ...(props.fractionDigits !== undefined && { fractionDigits: props.fractionDigits }),
      ...(props.locale !== undefined && { locale: props.locale }),
      ...(props.disabled !== undefined && { disabled: props.disabled }),
      ...(props.readOnly !== undefined && { readOnly: props.readOnly }),
      ...(props.required !== undefined && { required: props.required }),
      ...(props.allowEmpty !== undefined && { allowEmpty: props.allowEmpty }),
      ...(props.getValueLabel !== undefined && { getValueLabel: props.getValueLabel }),
      ...(props.onValueChange !== undefined && { onValueChange: props.onValueChange }),
      ...(props.onValueCommit !== undefined && { onValueCommit: props.onValueCommit }),
    });

    // Sync controlled value into machine when props.value changes.
    watch(
      () => props.value,
      (v) => {
        if (v !== undefined) {
          api.machine.update({ value: v });
        }
      },
    );

    watch(api.value, (v) => emit("update:value", v));

    provide(numberInputKey, api);
    return () => slots['default']?.();
  },
});

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

const NumberInputLabel = defineComponent({
  name: "ForgeNumberInputLabel",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const merged = { ...api.getLabelProps(), ...attrs };
      if (props.asChild) return h(Slot, merged, slots['default']);
      return h("label", merged, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Control â€” wrapper around Input + stepper buttons
// ---------------------------------------------------------------------------

const NumberInputControl = defineComponent({
  name: "ForgeNumberInputControl",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const merged = { ...api.getControlProps(), ...attrs };
      if (props.asChild) return h(Slot, merged, slots['default']);
      return h("div", merged, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Input â€” the spinbutton
// ---------------------------------------------------------------------------

const NumberInputInput = defineComponent({
  name: "ForgeNumberInputInput",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { attrs }) {
    const api = useCtx();
    return () => {
      const {
        onInput: _onInput,
        onChange: _onChange,
        onFocus,
        onBlur,
        onKeydown,
        onInput_vue,
        onKeyDown: _kd,
        ...inputAttrs
      } = api.getInputProps() as ReturnType<typeof api.getInputProps> & {
        onInput?: (e: Event) => void;
        onInput_vue?: (e: Event) => void;
        onKeydown?: (e: KeyboardEvent) => void;
        onKeyDown?: (e: KeyboardEvent) => void;
      };

      const merged = {
        ...inputAttrs,
        // Vue uses lowercase event names on native elements
        onInput: onInput_vue,
        onKeydown,
        onFocus,
        onBlur,
        ...attrs,
      };
      if (props.asChild) return h(Slot, merged);
      return h("input", merged);
    };
  },
});

// ---------------------------------------------------------------------------
// IncrementTrigger
// ---------------------------------------------------------------------------

const NumberInputIncrementTrigger = defineComponent({
  name: "ForgeNumberInputIncrementTrigger",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const {
        onPointerDown: _pd,
        onPointerUp: _pu,
        onPointerLeave: _pl,
        onPointerdown,
        onPointerup,
        onPointerleave,
        ...triggerAttrs
      } = api.getIncrementTriggerProps() as ReturnType<typeof api.getIncrementTriggerProps> & {
        onPointerDown?: (e: PointerEvent) => void;
        onPointerUp?: () => void;
        onPointerLeave?: () => void;
        onPointerdown?: (e: PointerEvent) => void;
        onPointerup?: () => void;
        onPointerleave?: () => void;
      };

      const merged = { ...triggerAttrs, onPointerdown, onPointerup, onPointerleave, ...attrs };
      if (props.asChild) return h(Slot, merged, slots['default']);
      return h("button", merged, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// DecrementTrigger
// ---------------------------------------------------------------------------

const NumberInputDecrementTrigger = defineComponent({
  name: "ForgeNumberInputDecrementTrigger",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const {
        onPointerDown: _pd,
        onPointerUp: _pu,
        onPointerLeave: _pl,
        onPointerdown,
        onPointerup,
        onPointerleave,
        ...triggerAttrs
      } = api.getDecrementTriggerProps() as ReturnType<typeof api.getDecrementTriggerProps> & {
        onPointerDown?: (e: PointerEvent) => void;
        onPointerUp?: () => void;
        onPointerLeave?: () => void;
        onPointerdown?: (e: PointerEvent) => void;
        onPointerup?: () => void;
        onPointerleave?: () => void;
      };

      const merged = { ...triggerAttrs, onPointerdown, onPointerup, onPointerleave, ...attrs };
      if (props.asChild) return h(Slot, merged, slots['default']);
      return h("button", merged, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// HiddenInput â€” for form submission
// ---------------------------------------------------------------------------

const NumberInputHiddenInput = defineComponent({
  name: "ForgeNumberInputHiddenInput",
  props: { name: { type: String, default: undefined } },
  setup(props) {
    const api = useCtx();
    return () => h("input", api.getHiddenInputProps(props.name));
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const NumberInput = {
  Root: NumberInputRoot,
  Label: NumberInputLabel,
  Control: NumberInputControl,
  Input: NumberInputInput,
  IncrementTrigger: NumberInputIncrementTrigger,
  DecrementTrigger: NumberInputDecrementTrigger,
  HiddenInput: NumberInputHiddenInput,
} as const;

export {
  NumberInputControl,
  NumberInputDecrementTrigger,
  NumberInputHiddenInput,
  NumberInputIncrementTrigger,
  NumberInputInput,
  NumberInputLabel,
  NumberInputRoot,
};
