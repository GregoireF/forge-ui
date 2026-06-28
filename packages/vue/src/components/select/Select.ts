import type { SelectPositioning } from "@forge-ui/select";
import type { ComponentPublicInstance, InjectionKey, PropType, Ref } from "vue";
import { defineComponent, h, inject, onMounted, onScopeDispose, provide, watch } from "vue";
import { usePresence } from "../../hooks/use-presence.js";
import { DialogPortal } from "../dialog/DialogPortal.js";
import { Slot } from "../shared/Slot.js";
import { selectKey } from "./select-context.js";
import { useSelect } from "./use-select.js";

type SelectPresenceContext = {
  isPresent: Ref<boolean>;
  presenceRef: Ref<HTMLElement | null>;
};
const selectPresenceKey: InjectionKey<SelectPresenceContext> = Symbol("forge-select-presence");

type SelectApi = ReturnType<typeof useSelect>;

function useCtx(): SelectApi {
  const ctx = inject(selectKey);
  if (!ctx) throw new Error("Select compound parts must be inside <Select.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const SelectRoot = defineComponent({
  name: "ForgeSelectRoot",
  props: {
    id: { type: String, default: undefined },
    multiple: { type: Boolean, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    defaultLabel: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    value: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    placeholder: { type: String, default: undefined },
    disabled: { type: Boolean, default: undefined },
    positioning: { type: Object as PropType<SelectPositioning>, default: undefined },
    onValueChange: { type: Function as PropType<(value: string[]) => void>, default: undefined },
    onOpenChange: { type: Function as PropType<(open: boolean) => void>, default: undefined },
    onHighlightChange: {
      type: Function as PropType<(value: string | null) => void>,
      default: undefined,
    },
  },
  emits: {
    "update:value": (_v: string[]) => true,
    "update:open": (_v: boolean) => true,
  },
  setup(props, { slots, emit }) {
    const api = useSelect({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.multiple !== undefined && { multiple: props.multiple }),
      ...(props.defaultValue !== undefined && { defaultValue: props.defaultValue }),
      ...(props.defaultLabel !== undefined && { defaultLabel: props.defaultLabel }),
      ...(props.value !== undefined && { value: props.value }),
      ...(props.placeholder !== undefined && { placeholder: props.placeholder }),
      ...(props.disabled !== undefined && { disabled: props.disabled }),
      ...(props.positioning !== undefined && { positioning: props.positioning }),
      onValueChange: (v: string[]) => {
        emit("update:value", v);
        props.onValueChange?.(v);
      },
      onOpenChange: (open: boolean) => {
        props.onOpenChange?.(open);
      },
      ...(props.onHighlightChange !== undefined && {
        onHighlightChange: props.onHighlightChange,
      }),
    });

    provide(selectKey, api);

    const presence = usePresence(api.isOpen);
    provide(selectPresenceKey, presence);

    watch(api.isOpen, (open) => emit("update:open", open));

    return () => slots["default"]?.();
  },
});

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

const SelectLabel = defineComponent({
  name: "ForgeSelectLabel",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const labelProps = { ...api.getLabelProps(), ...attrs };
      if (props.asChild) return h(Slot, labelProps, slots["default"]);
      return h("label", labelProps, slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

const SelectTrigger = defineComponent({
  name: "ForgeSelectTrigger",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const triggerProps = { ...api.getTriggerProps(), ...attrs };
      if (props.asChild) return h(Slot, triggerProps, slots["default"]);
      return h("button", triggerProps, slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Value â€" slot that shows selected label or placeholder
// ---------------------------------------------------------------------------

const SelectValue = defineComponent({
  name: "ForgeSelectValue",
  props: {
    placeholder: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    const api = useCtx();
    return () => {
      const label = api.getValueLabel();
      // When a value is selected, always show the label â€" default slot acts as a placeholder slot.
      if (label)
        return h("span", { "data-forge-scope": "select", "data-forge-part": "value" }, label);
      if (slots["default"])
        return h(
          "span",
          { "data-forge-scope": "select", "data-forge-part": "value" },
          slots["default"]?.(),
        );
      return h(
        "span",
        { "data-forge-scope": "select", "data-forge-part": "value" },
        props.placeholder,
      );
    };
  },
});

// ---------------------------------------------------------------------------
// Placeholder â€" renders only when no value is selected.
// ---------------------------------------------------------------------------

const SelectPlaceholder = defineComponent({
  name: "ForgeSelectPlaceholder",
  setup(_props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      if (api.getValueLabel()) return null;
      return h(
        "span",
        { "data-forge-scope": "select", "data-forge-part": "placeholder", ...attrs },
        slots["default"]?.(),
      );
    };
  },
});

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

const SelectPortal = defineComponent({
  name: "ForgeSelectPortal",
  props: {
    to: { type: [String, Object] as PropType<string | HTMLElement>, default: "body" },
    disabled: { type: Boolean, default: false },
    forceMount: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const api = useCtx();
    const presence = inject(selectPresenceKey, null);
    return () => {
      const isPresent = presence?.isPresent.value ?? api.isOpen.value;
      if (!props.forceMount && !isPresent) return null;
      return h(DialogPortal, { to: props.to, disabled: props.disabled }, slots["default"]);
    };
  },
});

// ---------------------------------------------------------------------------
// Content â€" positioner div + listbox ul
// inheritAttrs: false prevents double application of attrs (same as Popover)
// ---------------------------------------------------------------------------

const SelectContent = defineComponent({
  name: "ForgeSelectContent",
  inheritAttrs: false,
  props: {
    forceMount: { type: Boolean, default: false },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    const injectedPresence = inject(selectPresenceKey, null);
    const ownPresence = usePresence(api.isOpen);
    const { isPresent, presenceRef } = injectedPresence ?? ownPresence;

    return () => {
      if (!props.forceMount && !isPresent.value) return null;

      const positionerProps = api.getPositionerProps();
      const contentProps = api.getContentProps();
      const closingProps = !api.isOpen.value
        ? { "aria-hidden": true, style: { pointerEvents: "none" } }
        : {};

      const machineRef = contentProps.ref as (el: HTMLElement | null) => void;
      const finalContentProps = {
        ...contentProps,
        ...closingProps,
        ...attrs,
        ref: (el: Element | ComponentPublicInstance | null) => {
          const htmlEl = el instanceof HTMLElement ? el : null;
          machineRef(htmlEl);
          presenceRef.value = htmlEl;
        },
      };

      if (props.asChild) {
        return h("div", positionerProps, h(Slot, finalContentProps, slots["default"]));
      }
      return h("div", positionerProps, h("ul", finalContentProps, slots["default"]?.()));
    };
  },
});

// ---------------------------------------------------------------------------
// Item (Option)
// ---------------------------------------------------------------------------

const SelectItem = defineComponent({
  name: "ForgeSelectItem",
  props: {
    value: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    label: { type: String, default: undefined },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();

    onMounted(() => {
      const defaultChildren = slots["default"]?.();
      const label =
        props.label ??
        (typeof defaultChildren?.[0]?.children === "string"
          ? (defaultChildren[0]?.children as string)
          : props.value);
      api.send({
        type: "REGISTER_OPTION",
        option: { value: props.value, label, disabled: props.disabled },
      });
    });
    onScopeDispose(() => api.send({ type: "UNREGISTER_OPTION", value: props.value }));

    return () => {
      const optionProps = {
        ...api.getOptionProps({ value: props.value, disabled: props.disabled }),
        ...attrs,
      };
      if (props.asChild) return h(Slot, optionProps, slots["default"]);
      return h("li", optionProps, slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// ItemText
// ---------------------------------------------------------------------------

const SelectItemText = defineComponent({
  name: "ForgeSelectItemText",
  setup(_props, { slots }) {
    return () =>
      h(
        "span",
        { "data-forge-scope": "select", "data-forge-part": "item-text" },
        slots["default"]?.(),
      );
  },
});

// ---------------------------------------------------------------------------
// ItemIndicator â€" shown when item is selected
// ---------------------------------------------------------------------------

const SelectItemIndicator = defineComponent({
  name: "ForgeSelectItemIndicator",
  setup(_props, { slots }) {
    return () =>
      h(
        "span",
        { "data-forge-scope": "select", "data-forge-part": "item-indicator" },
        slots["default"]?.(),
      );
  },
});

// ---------------------------------------------------------------------------
// Separator
// ---------------------------------------------------------------------------

const SelectSeparator = defineComponent({
  name: "ForgeSelectSeparator",
  setup(_props, { attrs }) {
    return () =>
      h("li", {
        role: "separator",
        "data-forge-scope": "select",
        "data-forge-part": "separator",
        ...attrs,
      });
  },
});

// ---------------------------------------------------------------------------
// Group + GroupLabel
// ---------------------------------------------------------------------------

const SelectGroup = defineComponent({
  name: "ForgeSelectGroup",
  setup(_props, { slots, attrs }) {
    return () =>
      h(
        "ul",
        { role: "group", "data-forge-scope": "select", "data-forge-part": "group", ...attrs },
        slots["default"]?.(),
      );
  },
});

const SelectGroupLabel = defineComponent({
  name: "ForgeSelectGroupLabel",
  setup(_props, { slots, attrs }) {
    return () =>
      h(
        "li",
        {
          role: "presentation",
          "data-forge-scope": "select",
          "data-forge-part": "group-label",
          ...attrs,
        },
        slots["default"]?.(),
      );
  },
});

// ---------------------------------------------------------------------------
// Indicator â€" visual chevron/arrow inside the trigger; reflects open/closed.
// ---------------------------------------------------------------------------

const SelectIndicator = defineComponent({
  name: "ForgeSelectIndicator",
  setup(_props, { slots, attrs }) {
    const api = useCtx();
    return () => h("span", { ...api.getIndicatorProps(), ...attrs }, slots["default"]?.());
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Select = {
  Root: SelectRoot,
  Label: SelectLabel,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Placeholder: SelectPlaceholder,
  Portal: SelectPortal,
  Content: SelectContent,
  Indicator: SelectIndicator,
  Item: SelectItem,
  ItemText: SelectItemText,
  ItemIndicator: SelectItemIndicator,
  Separator: SelectSeparator,
  Group: SelectGroup,
  GroupLabel: SelectGroupLabel,
} as const;

export {
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectIndicator,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectPlaceholder,
  SelectPortal,
  SelectRoot,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
