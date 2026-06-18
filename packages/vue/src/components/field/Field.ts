import type { FieldApi } from "@forge-ui/field";
import type { InjectionKey, PropType } from "vue";
import { defineComponent, getCurrentInstance, h, inject, onMounted, onUnmounted, provide } from "vue";
import { Slot } from "../dialog/Slot.js";
import { fieldKey } from "./field-context.js";
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
    // Pass the reactive props object so watchEffect in useField syncs
    // ctx.invalid/required/disabled/readOnly on every prop change.
    const { id, invalid, required, disabled, readOnly } = props;
    const api = useField({
      ...(id !== undefined && { id }),
      ...(invalid !== undefined && { invalid }),
      ...(required !== undefined && { required }),
      ...(disabled !== undefined && { disabled }),
      ...(readOnly !== undefined && { readOnly }),
    });
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
// RequiredIndicator — visual marker (*) hidden from screen readers.
// ---------------------------------------------------------------------------

const FieldRequiredIndicator = defineComponent({
  name: "ForgeFieldRequiredIndicator",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      if (!api.context.required) return null;
      const indicatorProps = { ...api.getRequiredIndicatorProps(), ...attrs };
      if (props.asChild) return h(Slot, indicatorProps, slots.default);
      return h("span", indicatorProps, slots.default?.() ?? ["*"]);
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
// Group — wraps checkboxes / radios with role="group" + aria-labelledby.
// Generates a stable label ID from the component instance UID (SSR-safe).
// ---------------------------------------------------------------------------

interface FieldGroupContext { labelId: string }
const fieldGroupKey: InjectionKey<FieldGroupContext> = Symbol("forge-field-group");

const FieldGroup = defineComponent({
  name: "ForgeFieldGroup",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const uid = getCurrentInstance()!.uid;
    const labelId = `forge-field-group-${uid}-label`;
    provide(fieldGroupKey, { labelId });
    return () => {
      const groupProps = { role: "group" as const, "aria-labelledby": labelId, ...attrs };
      if (props.asChild) return h(Slot, groupProps, slots.default);
      return h("div", groupProps, slots.default?.());
    };
  },
});

const FieldGroupLabel = defineComponent({
  name: "ForgeFieldGroupLabel",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const ctx = inject(fieldGroupKey);
    if (!ctx) throw new globalThis.Error("Field.GroupLabel must be inside <Field.Group>");
    return () => {
      const labelProps = { id: ctx.labelId, ...attrs };
      if (props.asChild) return h(Slot, labelProps, slots.default);
      return h("p", labelProps, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Field = {
  Root: FieldRoot,
  Label: FieldLabel,
  RequiredIndicator: FieldRequiredIndicator,
  Control: FieldControl,
  Description: FieldDescription,
  Error: FieldError,
  Group: FieldGroup,
  GroupLabel: FieldGroupLabel,
} as const;

export {
  FieldControl,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldGroupLabel,
  FieldLabel,
  FieldRequiredIndicator,
  FieldRoot,
};
