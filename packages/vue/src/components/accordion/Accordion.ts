import type { InjectionKey, PropType } from "vue";
import { defineComponent, h, inject, provide, watch } from "vue";
import { Slot } from "../shared/Slot.js";
import type { UseAccordionReturn } from "./use-accordion.js";
import { useAccordion } from "./use-accordion.js";

// ---------------------------------------------------------------------------
// Injection keys
// ---------------------------------------------------------------------------

const accordionKey: InjectionKey<UseAccordionReturn> = Symbol("forge-accordion");
const accordionItemKey: InjectionKey<string> = Symbol("forge-accordion-item");

function useCtx(): UseAccordionReturn {
  const ctx = inject(accordionKey);
  if (!ctx) throw new Error("Accordion compound parts must be inside <Accordion.Root>");
  return ctx;
}

function useItemValue(): string {
  const val = inject(accordionItemKey);
  if (!val) throw new Error("Accordion.Header/Trigger/Content must be inside <Accordion.Item>");
  return val;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const AccordionRoot = defineComponent({
  name: "ForgeAccordionRoot",
  props: {
    id: { type: String, default: undefined },
    type: { type: String as PropType<"single" | "multiple">, default: undefined },
    value: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    collapsible: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    onValueChange: { type: Function as PropType<(v: string[]) => void>, default: undefined },
    asChild: { type: Boolean, default: false },
  },
  emits: {
    "update:value": (_v: string[]) => true,
  },
  setup(props, { slots, attrs, emit }) {
    // Spread conditionally: Vue LooseRequired makes all prop keys present (as T | undefined),
    // which is incompatible with exactOptionalPropertyTypes expecting keys to be absent.
    const api = useAccordion({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.type !== undefined && { type: props.type }),
      ...(props.value !== undefined && {
        value: Array.isArray(props.value) ? props.value : [props.value],
      }),
      ...(props.defaultValue !== undefined && { defaultValue: props.defaultValue }),
      ...(props.collapsible !== undefined && { collapsible: props.collapsible }),
      ...(props.disabled !== undefined && { disabled: props.disabled }),
      ...(props.onValueChange !== undefined && { onValueChange: props.onValueChange }),
    });
    // Sync controlled value prop changes after initial mount
    watch(
      () => props.value,
      (v) => {
        if (v === undefined) return;
        const normalized = Array.isArray(v) ? v : [v];
        api.send({ type: "SET_VALUE", value: normalized });
      },
    );

    watch(api.value, (v) => emit("update:value", v));
    provide(accordionKey, api);
    return () => {
      const rootProps = { ...api.getRootProps(), ...attrs };
      if (props.asChild) return h(Slot, rootProps, slots["default"]);
      return h("div", rootProps, slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

const AccordionItem = defineComponent({
  name: "ForgeAccordionItem",
  props: {
    value: { type: String, required: true },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    provide(accordionItemKey, props.value);
    return () => {
      const itemProps = { ...api.getItemProps(props.value), ...attrs };
      if (props.asChild) return h(Slot, itemProps, slots["default"]);
      return h("div", itemProps, slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

const AccordionHeader = defineComponent({
  name: "ForgeAccordionHeader",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    const itemValue = useItemValue();
    return () => {
      const headerProps = { ...api.getHeaderProps(itemValue), ...attrs };
      if (props.asChild) return h(Slot, headerProps, slots["default"]);
      return h("h3", headerProps, slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

const AccordionTrigger = defineComponent({
  name: "ForgeAccordionTrigger",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    const itemValue = useItemValue();
    return () => {
      const triggerProps = { ...api.getTriggerProps(itemValue), ...attrs };
      if (props.asChild) return h(Slot, triggerProps, slots["default"]);
      return h("button", triggerProps, slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const AccordionContent = defineComponent({
  name: "ForgeAccordionContent",
  props: {
    asChild: { type: Boolean, default: false },
    forceMount: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    const itemValue = useItemValue();
    return () => {
      const isOpen = api.value.value.includes(itemValue);
      if (!props.forceMount && !isOpen) return null;
      const contentProps = { ...api.getContentProps(itemValue), ...attrs };
      if (props.asChild) return h(Slot, contentProps, slots["default"]);
      return h("div", contentProps, slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Header: AccordionHeader,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
} as const;

export { AccordionContent, AccordionHeader, AccordionItem, AccordionRoot, AccordionTrigger };
