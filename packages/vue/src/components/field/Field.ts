import type { FieldApi } from "@forge-ui/field";
import type { PropType } from "vue";
import { defineComponent, h, inject, onMounted, onUnmounted, provide } from "vue";
import { Slot } from "../dialog/Slot.js";
import { fieldKey } from "./field-context.js";
import type { CreateFieldOptions } from "./use-field.js";
import { useField } from "./use-field.js";

function useCtx(): FieldApi {
  const ctx = inject(fieldKey);
  if (!ctx) throw new globalThis.Error("Field compound parts must be inside <Field.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const FieldRoot = defineComponent({
  name: "ForgeFieldRoot",
  props: {
    id: { type: String, default: undefined },
    invalid: { type: Boolean as PropType<boolean>, default: undefined },
    required: { type: Boolean as PropType<boolean>, default: undefined },
    disabled: { type: Boolean as PropType<boolean>, default: undefined },
    readOnly: { type: Boolean as PropType<boolean>, default: undefined },
  },
  setup(props, { slots }) {
    const options: CreateFieldOptions = {};
    if (props.id !== undefined) options.id = props.id;
    if (props.invalid !== undefined) options.invalid = props.invalid;
    if (props.required !== undefined) options.required = props.required;
    if (props.disabled !== undefined) options.disabled = props.disabled;
    if (props.readOnly !== undefined) options.readOnly = props.readOnly;

    const api = useField(options);
    provide(fieldKey, api);
    return () => slots.default?.();
  },
});

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

const FieldLabel = defineComponent({
  name: "ForgeFieldLabel",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const labelProps = { ...api.getLabelProps(), ...attrs };
      if (props.asChild) return h(Slot, labelProps, slots.default);
      return h("label", labelProps, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Control — always renderless Slot.
// ---------------------------------------------------------------------------

const FieldControl = defineComponent({
  name: "ForgeFieldControl",
  setup(_props, { slots }) {
    const api = useCtx();
    return () => h(Slot, api.getControlProps(), slots.default);
  },
});

// ---------------------------------------------------------------------------
// Description — auto-registers for aria-describedby.
// ---------------------------------------------------------------------------

const FieldDescription = defineComponent({
  name: "ForgeFieldDescription",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();

    onMounted(() => api.registerDescription());
    onUnmounted(() => api.unregisterDescription());

    return () => {
      const descProps = { ...api.getDescriptionProps(), ...attrs };
      if (props.asChild) return h(Slot, descProps, slots.default);
      return h("p", descProps, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Error — renders only when invalid; auto-registers.
// Named FieldError internally to avoid shadowing globalThis.Error.
// ---------------------------------------------------------------------------

const FieldError = defineComponent({
  name: "ForgeFieldError",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();

    onMounted(() => api.registerError());
    onUnmounted(() => api.unregisterError());

    return () => {
      if (!api.context.invalid) return null;
      const errorProps = { ...api.getErrorProps(), ...attrs };
      if (props.asChild) return h(Slot, errorProps, slots.default);
      return h("p", errorProps, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Field = {
  Root: FieldRoot,
  Label: FieldLabel,
  Control: FieldControl,
  Description: FieldDescription,
  Error: FieldError,
} as const;

export { FieldControl, FieldDescription, FieldError, FieldLabel, FieldRoot };
