import type { InjectionKey, PropType } from "vue";
import { defineComponent, h, inject, provide } from "vue";
import { Slot } from "../shared/Slot.js";
import type { UseSwitchReturn } from "./use-switch.js";
import { useSwitch } from "./use-switch.js";

const switchKey: InjectionKey<UseSwitchReturn> = Symbol("forge-switch");

function useCtx(): UseSwitchReturn {
  const ctx = inject(switchKey);
  if (!ctx) throw new Error("Switch compound parts must be inside <Switch.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const SwitchRoot = defineComponent({
  name: "ForgeSwitchRoot",
  props: {
    checked: { type: Boolean as PropType<boolean>, default: undefined },
    defaultChecked: { type: Boolean as PropType<boolean>, default: undefined },
    disabled: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    name: { type: String, default: undefined },
    value: { type: String, default: undefined },
    form: { type: String, default: undefined },
    id: { type: String, default: undefined },
    onCheckedChange: {
      type: Function as PropType<(checked: boolean) => void>,
      default: undefined,
    },
  },
  emits: {
    "update:checked": (_v: boolean) => true,
  },
  setup(props, { slots, emit }) {
    const api = useSwitch({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.checked !== undefined && { checked: props.checked }),
      ...(props.defaultChecked !== undefined && { defaultChecked: props.defaultChecked }),
      ...(props.disabled !== undefined && { disabled: props.disabled }),
      ...(props.required !== undefined && { required: props.required }),
      ...(props.readOnly !== undefined && { readOnly: props.readOnly }),
      ...(props.invalid !== undefined && { invalid: props.invalid }),
      ...(props.name !== undefined && { name: props.name }),
      ...(props.value !== undefined && { value: props.value }),
      ...(props.form !== undefined && { form: props.form }),
      onCheckedChange: (c) => {
        emit("update:checked", c);
        props.onCheckedChange?.(c);
      },
    });

    provide(switchKey, api);

    return () => {
      const inputProps = api.getHiddenInputProps();
      return h("div", api.getRootProps(), [
        slots['default']?.(),
        props.name
          ? h("input", { ...inputProps, name: props.name, value: props.value ?? inputProps.value })
          : null,
      ]);
    };
  },
});

// ---------------------------------------------------------------------------
// Control
// ---------------------------------------------------------------------------

const SwitchControl = defineComponent({
  name: "ForgeSwitchControl",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const controlProps = { ...api.getControlProps(), ...attrs };
      if (props.asChild) return h(Slot, controlProps, slots['default']);
      return h("button", controlProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Thumb
// ---------------------------------------------------------------------------

const SwitchThumb = defineComponent({
  name: "ForgeSwitchThumb",
  setup() {
    const api = useCtx();
    return () => h("span", api.getThumbProps());
  },
});

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

const SwitchLabel = defineComponent({
  name: "ForgeSwitchLabel",
  setup(_props, { slots }) {
    const api = useCtx();
    return () => h("label", api.getLabelProps(), slots['default']?.());
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Switch = {
  Root: SwitchRoot,
  Control: SwitchControl,
  Thumb: SwitchThumb,
  Label: SwitchLabel,
} as const;

export { SwitchRoot, SwitchControl, SwitchThumb, SwitchLabel };
