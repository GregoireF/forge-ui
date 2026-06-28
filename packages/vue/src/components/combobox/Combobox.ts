import type { ComboboxOption, ComboboxPositioning, ComboboxTranslations } from "@forge-ui/combobox";
import type { ComponentPublicInstance, InjectionKey, PropType, Ref, VNodeRef } from "vue";
import {
  defineComponent,
  h,
  inject,
  onMounted,
  onScopeDispose,
  provide,
} from "vue";
import { usePresence } from "../../hooks/use-presence.js";
import { DialogPortal } from "../dialog/DialogPortal.js";
import { Slot } from "../shared/Slot.js";
import { comboboxKey } from "./combobox-context.js";
import { useCombobox } from "./use-combobox.js";
import type { UseComboboxOptions } from "./use-combobox.js";

// Shared presence injection key so Portal and Content coordinate on the same presence instance.
const comboboxPresenceKey: InjectionKey<{
  isPresent: Ref<boolean>;
  presenceRef: Ref<HTMLElement | null>;
}> = Symbol("comboboxPresence");

type ComboboxApi = ReturnType<typeof useCombobox>;

function useCtx(): ComboboxApi {
  const ctx = inject(comboboxKey);
  if (!ctx) throw new Error("Combobox compound parts must be inside <Combobox.Root>");
  return ctx;
}

// Vue's h() hyphenates camelCase event handler names which breaks DOM event binding.
// Remap multi-word events to all-lowercase-after-on so Vue's hyphenate() resolves
// to the correct native DOM event name.
function patchVueEvents(props: Record<string, unknown>): Record<string, unknown> {
  const { onKeydown, onMousemove, onMouseleave, ...rest } = props;
  return {
    ...rest,
    ...(onKeydown !== undefined && { onKeydown }),
    ...(onMousemove !== undefined && { onMousemove }),
    ...(onMouseleave !== undefined && { onMouseleave }),
  };
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const ComboboxRoot = defineComponent({
  name: "ForgeComboboxRoot",
  props: {
    id: { type: String, default: undefined },
    multiple: { type: Boolean, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    value: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    placeholder: { type: String, default: undefined },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    positioning: { type: Object as PropType<ComboboxPositioning>, default: undefined },
    onInputChange: { type: Function as PropType<(v: string) => void>, default: undefined },
    onValueChange: { type: Function as PropType<(v: string[]) => void>, default: undefined },
    onOpenChange: { type: Function as PropType<(v: boolean) => void>, default: undefined },
    onHighlightChange: { type: Function as PropType<(v: string | null) => void>, default: undefined },
    options: { type: Array as PropType<ComboboxOption[]>, default: undefined },
    onHighlightedScroll: { type: Function as PropType<(value: string, index: number) => void>, default: undefined },
    onCreateOption: { type: Function as PropType<(value: string) => void>, default: undefined },
    translations: { type: Object as PropType<Partial<ComboboxTranslations>>, default: undefined },
  },
  emits: {
    "update:value": (_v: string[]) => true,
    "update:open": (_v: boolean) => true,
  },
  setup(props, { slots, emit }) {
    const opts: UseComboboxOptions = {
      ...(props.id !== undefined && { id: props.id }),
      ...(props.multiple !== undefined && { multiple: props.multiple }),
      ...(props.defaultValue !== undefined && { defaultValue: props.defaultValue }),
      ...(props.value !== undefined && { value: props.value }),
      ...(props.placeholder !== undefined && { placeholder: props.placeholder }),
      ...(props.disabled !== undefined && { disabled: props.disabled }),
      ...(props.readOnly !== undefined && { readOnly: props.readOnly }),
      ...(props.required !== undefined && { required: props.required }),
      ...(props.invalid !== undefined && { invalid: props.invalid }),
      ...(props.positioning !== undefined && { positioning: props.positioning }),
      ...(props.onInputChange !== undefined && { onInputChange: props.onInputChange }),
      onValueChange: (v: string[]) => {
        emit("update:value", v);
        props.onValueChange?.(v);
      },
      onOpenChange: (open: boolean) => {
        emit("update:open", open);
        props.onOpenChange?.(open);
      },
      ...(props.onHighlightChange !== undefined && { onHighlightChange: props.onHighlightChange }),
      ...(props.options !== undefined && { options: props.options }),
      ...(props.onHighlightedScroll !== undefined && { onHighlightedScroll: props.onHighlightedScroll }),
      ...(props.onCreateOption !== undefined && { onCreateOption: props.onCreateOption }),
      ...(props.translations !== undefined && { translations: props.translations }),
    };

    const api = useCombobox(opts);
    provide(comboboxKey, api);

    // Provide shared presence so Portal and Content coordinate on the same presence instance.
    const presence = usePresence(api.isOpen);
    provide(comboboxPresenceKey, presence);

    return () => slots['default']?.();
  },
});

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

const ComboboxLabel = defineComponent({
  name: "ForgeComboboxLabel",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const labelProps = { ...api.getLabelProps(), ...attrs };
      if (props.asChild) return h(Slot, labelProps, slots['default']);
      return h("label", labelProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Input â€" <input role="combobox"> + keyboard navigation
// ---------------------------------------------------------------------------

const ComboboxInput = defineComponent({
  name: "ForgeComboboxInput",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const raw = api.getInputProps();
      // Vue's change event fires on blur. Use onInput for real-time updates.
      // The connect's onInput handler sends INPUT_CHANGE â€" safe to bind directly.
      const { ref: machineRef, ...restProps } = patchVueEvents(raw as Record<string, unknown>);
      const inputProps = {
        ...restProps,
        ...attrs,
        ...(machineRef != null && { ref: machineRef as VNodeRef }),
      };
      if (props.asChild) return h(Slot, inputProps, slots['default']);
      return h("input", inputProps);
    };
  },
});

// ---------------------------------------------------------------------------
// Trigger â€" optional open/close toggle button
// ---------------------------------------------------------------------------

const ComboboxTrigger = defineComponent({
  name: "ForgeComboboxTrigger",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const triggerProps = { ...api.getTriggerProps(), ...attrs };
      if (props.asChild) return h(Slot, triggerProps, slots['default']);
      return h("button", triggerProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// ClearTrigger â€" button to clear selection + input value
// ---------------------------------------------------------------------------

const ComboboxClearTrigger = defineComponent({
  name: "ForgeComboboxClearTrigger",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const val = api.getValue();
      const inputVal = api.getInputValue();
      if (!val.length && !inputVal) return null;
      const clearProps = { ...api.getClearTriggerProps(), ...attrs };
      if (props.asChild) return h(Slot, clearProps, slots['default']);
      return h("button", clearProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

const ComboboxPortal = defineComponent({
  name: "ForgeComboboxPortal",
  props: {
    to: { type: [String, Object] as PropType<string | HTMLElement>, default: "body" },
    disabled: { type: Boolean, default: false },
    forceMount: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const api = useCtx();
    const presence = inject(comboboxPresenceKey, null);
    return () => {
      const isPresent = presence?.isPresent.value ?? api.isOpen.value;
      if (!props.forceMount && !isPresent) return null;
      return h(DialogPortal, { to: props.to, disabled: props.disabled }, slots['default']);
    };
  },
});

// ---------------------------------------------------------------------------
// Content â€" presence-aware. Positioner div wraps listbox ul.
// ---------------------------------------------------------------------------

const ComboboxContent = defineComponent({
  name: "ForgeComboboxContent",
  inheritAttrs: false,
  props: {
    forceMount: { type: Boolean, default: false },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    const sharedPresence = inject(comboboxPresenceKey, null);
    const ownPresence = usePresence(api.isOpen);
    const { isPresent, presenceRef } = sharedPresence ?? ownPresence;

    return () => {
      if (!props.forceMount && !isPresent.value) return null;

      const positionerProps = api.getPositionerProps();
      const contentProps = api.getContentProps();
      const isOpen = api.isOpen.value;
      const closingProps = !isOpen ? { "aria-hidden": true, style: { pointerEvents: "none" } } : {};

      const machineRef = contentProps.ref as (el: HTMLElement | null) => void;
      const { ref: _ref, ...restContentProps } = contentProps;
      const finalContentProps = {
        ...restContentProps,
        ...closingProps,
        ...attrs,
        ref: (el: Element | ComponentPublicInstance | null) => {
          const htmlEl = el instanceof HTMLElement ? el : null;
          machineRef(htmlEl);
          presenceRef.value = htmlEl;
        },
      };

      if (props.asChild) {
        return h("div", positionerProps, h(Slot, finalContentProps, slots['default']));
      }
      return h("div", positionerProps, h("ul", finalContentProps, slots['default']?.()));
    };
  },
});

// ---------------------------------------------------------------------------
// Item (Option)
// ---------------------------------------------------------------------------

const ComboboxItem = defineComponent({
  name: "ForgeComboboxItem",
  props: {
    value: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    label: { type: String, default: undefined },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();

    onMounted(() => {
      const defaultChildren = slots['default']?.();
      const label =
        props.label ??
        (typeof defaultChildren?.[0]?.children === "string"
          ? (defaultChildren[0]?.children as string)
          : props.value);
      api.send({ type: "REGISTER_OPTION", option: { value: props.value, label, disabled: props.disabled } });
    });
    onScopeDispose(() => api.send({ type: "UNREGISTER_OPTION", value: props.value }));

    return () => {
      // Hide when not in filteredOptions (client-side filter mode).
      const filtered = api.getFilteredOptions();
      if (!filtered.some((o: ComboboxOption) => o.value === props.value)) return null;

      const optionProps = {
        ...patchVueEvents(api.getOptionProps({ value: props.value, disabled: props.disabled }) as Record<string, unknown>),
        ...attrs,
      };
      if (props.asChild) return h(Slot, optionProps, slots['default']);
      return h("li", optionProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// ItemText
// ---------------------------------------------------------------------------

const ComboboxItemText = defineComponent({
  name: "ForgeComboboxItemText",
  setup(_props, { slots }) {
    return () => h("span", { "data-forge-scope": "combobox", "data-forge-part": "item-text" }, slots['default']?.());
  },
});

// ---------------------------------------------------------------------------
// ItemIndicator â€" shown only when the item is selected
// ---------------------------------------------------------------------------

const ComboboxItemIndicator = defineComponent({
  name: "ForgeComboboxItemIndicator",
  props: { value: { type: String, required: true } },
  setup(props, { slots }) {
    const api = useCtx();
    return () => {
      if (!api.getValue().includes(props.value)) return null;
      return h("span", { "data-forge-scope": "combobox", "data-forge-part": "item-indicator" }, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Group + GroupLabel
// ---------------------------------------------------------------------------

const ComboboxGroup = defineComponent({
  name: "ForgeComboboxGroup",
  setup(_props, { slots, attrs }) {
    return () => h("ul", { role: "group", "data-forge-scope": "combobox", "data-forge-part": "group", ...attrs }, slots['default']?.());
  },
});

const ComboboxGroupLabel = defineComponent({
  name: "ForgeComboboxGroupLabel",
  setup(_props, { slots, attrs }) {
    return () => h("li", { role: "presentation", "data-forge-scope": "combobox", "data-forge-part": "group-label", ...attrs }, slots['default']?.());
  },
});

// ---------------------------------------------------------------------------
// TagsInput — displays selected values as dismissible tag pills (multi-select)
// ---------------------------------------------------------------------------

const ComboboxTagsInput = defineComponent({
  name: "ForgeComboboxTagsInput",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => {
      if (!api.getValue().length) return null;
      return h("div", {
        "data-forge-scope": "combobox",
        "data-forge-part": "tags-input",
        ...attrs,
      }, slots['default']?.());
    };
  },
});

const ComboboxTag = defineComponent({
  name: "ForgeComboboxTag",
  props: { value: { type: String, required: true as const } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      if (!api.getValue().includes(props.value)) return null;
      const label = api.selectedLabels.value[props.value] ?? props.value;
      return h("span", {
        "data-forge-scope": "combobox",
        "data-forge-part": "tag",
        "data-value": props.value,
        ...attrs,
      }, slots['default']?.() ?? [label]);
    };
  },
});

const ComboboxTagDelete = defineComponent({
  name: "ForgeComboboxTagDelete",
  props: { value: { type: String, required: true as const } },
  setup(props, { attrs }) {
    const api = useCtx();
    return () => {
      const label = api.selectedLabels.value[props.value] ?? props.value;
      return h("button", {
        type: "button",
        "aria-label": `Remove ${label}`,
        "data-forge-scope": "combobox",
        "data-forge-part": "tag-delete",
        "data-value": props.value,
        ...attrs,
        onClick() {
          if (!api.isDisabled.value && !api.isReadOnly.value) {
            api.send({ type: "SELECT_OPTION", value: props.value });
          }
        },
      });
    };
  },
});

// ---------------------------------------------------------------------------
// CreateOption
// ---------------------------------------------------------------------------

const ComboboxCreateOption = defineComponent({
  name: "ForgeComboboxCreateOption",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      if (!api.hasCreateOption.value) return null;
      const label = api.createOptionLabel.value;
      const createProps = { ...api.getCreateOptionProps(), ...attrs };
      if (props.asChild) return h(Slot, createProps, slots['default']);
      const content = slots['default']?.() ?? [`CrÃ©er "${label}"`];
      return h("li", createProps, content);
    };
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Combobox = {
  Root: ComboboxRoot,
  Label: ComboboxLabel,
  Input: ComboboxInput,
  Trigger: ComboboxTrigger,
  ClearTrigger: ComboboxClearTrigger,
  Portal: ComboboxPortal,
  Content: ComboboxContent,
  Item: ComboboxItem,
  ItemText: ComboboxItemText,
  ItemIndicator: ComboboxItemIndicator,
  Group: ComboboxGroup,
  GroupLabel: ComboboxGroupLabel,
  CreateOption: ComboboxCreateOption,
  TagsInput: ComboboxTagsInput,
  Tag: ComboboxTag,
  TagDelete: ComboboxTagDelete,
} as const;

export {
  ComboboxClearTrigger,
  ComboboxContent,
  ComboboxCreateOption,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxItemText,
  ComboboxLabel,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTag,
  ComboboxTagDelete,
  ComboboxTagsInput,
  ComboboxTrigger,
};
