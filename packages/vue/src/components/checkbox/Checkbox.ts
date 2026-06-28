import type { ComputedRef, InjectionKey, PropType } from "vue";
import { computed, defineComponent, h, inject, onUnmounted, provide, ref, watch } from "vue";
import type { CheckboxChecked, UseCheckboxReturn } from "./use-checkbox.js";
import { useCheckbox } from "./use-checkbox.js";

// ---------------------------------------------------------------------------
// Injection keys
// ---------------------------------------------------------------------------

const checkboxKey: InjectionKey<UseCheckboxReturn> = Symbol("forge-checkbox");

interface CheckboxGroupApi {
  isChecked: (v: string) => boolean;
  disabled: boolean;
  required: boolean;
  name: string | undefined;
  groupChecked: ComputedRef<CheckboxChecked>;
  toggle: (v: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  registerValue: (v: string) => void;
  unregisterValue: (v: string) => void;
}

const checkboxGroupKey: InjectionKey<CheckboxGroupApi> = Symbol("forge-checkbox-group");

function useCtx(): UseCheckboxReturn {
  const ctx = inject(checkboxKey);
  if (!ctx) throw new Error("Checkbox compound parts must be inside <Checkbox.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Group
// ---------------------------------------------------------------------------

const CheckboxGroup = defineComponent({
  name: "ForgeCheckboxGroup",
  props: {
    value: { type: Array as PropType<string[]>, default: undefined },
    defaultValue: { type: Array as PropType<string[]>, default: () => [] },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    name: { type: String, default: undefined },
  },
  emits: {
    "update:value": (_v: string[]) => true,
  },
  setup(props, { slots, emit }) {
    const isControlled = computed(() => props.value !== undefined);
    const internal = ref<string[]>(props.defaultValue ?? []);
    const currentValue = computed(() => (isControlled.value ? (props.value ?? []) : internal.value));
    const allValues = ref(new Set<string>());

    const commit = (next: string[]) => {
      if (!isControlled.value) internal.value = next;
      emit("update:value", next);
    };

    const toggle = (v: string) => {
      const next = currentValue.value.includes(v)
        ? currentValue.value.filter((x) => x !== v)
        : [...currentValue.value, v];
      commit(next);
    };

    const groupChecked = computed<CheckboxChecked>(() => {
      const cv = currentValue.value;
      if (cv.length === 0) return false;
      if (cv.length >= allValues.value.size && allValues.value.size > 0) return true;
      return "indeterminate";
    });

    const api: CheckboxGroupApi = {
      disabled: props.disabled,
      required: props.required,
      name: props.name,
      groupChecked,
      isChecked: (v) => currentValue.value.includes(v),
      toggle,
      selectAll: () => commit([...allValues.value]),
      deselectAll: () => commit([]),
      registerValue: (v) => allValues.value.add(v),
      unregisterValue: (v) => allValues.value.delete(v),
    };

    provide(checkboxGroupKey, api);

    return () =>
      h(
        "div",
        { role: "group", "data-forge-scope": "checkbox", "data-forge-part": "group" },
        slots['default']?.(),
      );
  },
});

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const CheckboxRoot = defineComponent({
  name: "ForgeCheckboxRoot",
  props: {
    checked: {
      type: [Boolean, String] as PropType<CheckboxChecked>,
      default: undefined,
    },
    defaultChecked: {
      type: [Boolean, String] as PropType<CheckboxChecked>,
      default: undefined,
    },
    disabled: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    name: { type: String, default: undefined },
    value: { type: String, default: undefined },
    form: { type: String, default: undefined },
    id: { type: String, default: undefined },
    onCheckedChange: {
      type: Function as PropType<(checked: CheckboxChecked) => void>,
      default: undefined,
    },
  },
  emits: {
    "update:checked": (_v: CheckboxChecked) => true,
  },
  setup(props, { slots, emit }) {
    const group = inject(checkboxGroupKey, null);
    const isInGroup = computed(() => group !== null && props.value !== undefined);

    const effectiveChecked = computed<CheckboxChecked | undefined>(() =>
      isInGroup.value ? group!.isChecked(props.value!) : props.checked,
    );
    const effectiveName = computed(() =>
      isInGroup.value ? (group!.name ?? props.name) : props.name,
    );
    const effectiveDisabled = computed(() =>
      isInGroup.value ? (props.disabled ?? group!.disabled) : props.disabled,
    );

    const api = useCheckbox({
      ...(props.id !== undefined && { id: props.id }),
      ...(effectiveChecked.value !== undefined && { checked: effectiveChecked.value }),
      ...(props.defaultChecked !== undefined && { defaultChecked: props.defaultChecked }),
      ...(effectiveDisabled.value !== undefined && { disabled: effectiveDisabled.value }),
      ...(props.required !== undefined && { required: props.required }),
      ...(props.readOnly !== undefined && { readOnly: props.readOnly }),
      ...(props.form !== undefined && { form: props.form }),
      // Group items must NOT use onCheckedChange: calling group.toggle() inside
      // onCheckedChange (triggered by the watch below) creates a reactivity loop.
      // Instead we intercept onClick on the control to call group.toggle() directly.
      ...(!isInGroup.value && {
        onCheckedChange: (c: CheckboxChecked) => {
          emit("update:checked", c);
          props.onCheckedChange?.(c);
        },
      }),
    });

    // For group items: intercept onClick so the user's click calls group.toggle()
    // without going through onCheckedChange (which would cause a reactivity loop).
    const providedApi: UseCheckboxReturn = isInGroup.value
      ? {
          ...api,
          getControlProps: () => ({
            ...api.getControlProps(),
            onClick: (e: { preventDefault?: () => void }) => {
              e.preventDefault?.();
              if (api.isDisabled.value) return;
              group!.toggle(props.value!);
            },
          }),
        }
      : api;

    // One-way sync: group state â†’ machine display state.
    // Only fire when the machine state doesn't already match (prevents no-op sends).
    watch(effectiveChecked, (v) => {
      if (v === undefined) return;
      const target = v === "indeterminate" ? "indeterminate" : v ? "checked" : "unchecked";
      if (api.dataState.value === target) return;
      if (v === "indeterminate") api.send("SET_INDETERMINATE");
      else if (v) api.send("CHECK");
      else api.send("UNCHECK");
    });

    // Register value in group.
    if (isInGroup.value && props.value) {
      group!.registerValue(props.value);
      onUnmounted(() => group!.unregisterValue(props.value!));
    }

    provide(checkboxKey, providedApi);

    return () => {
      const inputProps = api.getHiddenInputProps();
      const name = effectiveName.value;
      return h("div", api.getRootProps(), [
        slots['default']?.(),
        name
          ? h("input", {
              ...inputProps,
              name,
              value: props.value ?? inputProps.value,
            })
          : null,
      ]);
    };
  },
});

// ---------------------------------------------------------------------------
// Control
// ---------------------------------------------------------------------------

const CheckboxControl = defineComponent({
  name: "ForgeCheckboxControl",
  setup(_props, { slots }) {
    const api = useCtx();
    return () => h("button", api.getControlProps(), slots['default']?.());
  },
});

// ---------------------------------------------------------------------------
// Indicator
// ---------------------------------------------------------------------------

const CheckboxIndicator = defineComponent({
  name: "ForgeCheckboxIndicator",
  props: {
    forceMount: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const api = useCtx();
    return () => {
      if (!props.forceMount && !api.isChecked.value && !api.isIndeterminate.value) return null;
      return h("span", api.getIndicatorProps(), slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

const CheckboxLabel = defineComponent({
  name: "ForgeCheckboxLabel",
  setup(_props, { slots }) {
    const api = useCtx();
    return () => h("label", api.getLabelProps(), slots['default']?.());
  },
});

// ---------------------------------------------------------------------------
// GroupAll â€” select-all control
// ---------------------------------------------------------------------------

const CheckboxGroupAll = defineComponent({
  name: "ForgeCheckboxGroupAll",
  props: {
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const group = inject(checkboxGroupKey);
    if (!group) throw new Error("<Checkbox.GroupAll> must be inside <Checkbox.Group>");

    // No onCheckedChange â€” calling group.selectAll/deselectAll inside onCheckedChange
    // causes a reactivity loop: machine fires onCheckedChange â†’ group state changes â†’
    // watch fires â†’ machine sends again â†’ repeat. Instead, we intercept onClick directly.
    const api = useCheckbox({
      checked: group.groupChecked.value,
      ...(props.disabled !== undefined || group.disabled
        ? { disabled: props.disabled ?? group.disabled }
        : {}),
    });

    // One-way sync: group state â†’ machine display state.
    watch(group.groupChecked, (v) => {
      const target = v === "indeterminate" ? "indeterminate" : v ? "checked" : "unchecked";
      if (api.dataState.value !== target) {
        if (v === "indeterminate") api.send("SET_INDETERMINATE");
        else if (v) api.send("CHECK");
        else api.send("UNCHECK");
      }
    });

    // Override getControlProps to handle click directly without going through
    // the machine's onCheckedChange (which would cause a reactivity loop).
    const modifiedApi: UseCheckboxReturn = {
      ...api,
      getControlProps: () => {
        const controlProps = api.getControlProps();
        return {
          ...controlProps,
          onClick: (e: { preventDefault?: () => void }) => {
            e.preventDefault?.();
            if (api.isDisabled.value) return;
            if (group.groupChecked.value === true) group.deselectAll();
            else group.selectAll();
          },
        };
      },
    };

    provide(checkboxKey, modifiedApi);

    return () => h("div", api.getRootProps(), slots['default']?.());
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Checkbox = {
  Root: CheckboxRoot,
  Control: CheckboxControl,
  Indicator: CheckboxIndicator,
  Label: CheckboxLabel,
  Group: CheckboxGroup,
  GroupAll: CheckboxGroupAll,
} as const;

export {
  CheckboxRoot,
  CheckboxControl,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxGroup,
  CheckboxGroupAll,
};
