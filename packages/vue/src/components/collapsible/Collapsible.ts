import type { InjectionKey, PropType } from "vue";
import { defineComponent, h, inject, provide, watch } from "vue";
import { usePresence } from "../../hooks/use-presence.js";
import { Slot } from "../shared/Slot.js";
import type { UseCollapsibleReturn } from "./use-collapsible.js";
import { useCollapsible } from "./use-collapsible.js";

const collapsibleKey: InjectionKey<UseCollapsibleReturn> = Symbol("forge-collapsible");

function useCtx(): UseCollapsibleReturn {
  const ctx = inject(collapsibleKey);
  if (!ctx) throw new Error("Collapsible compound parts must be inside <Collapsible.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const CollapsibleRoot = defineComponent({
  name: "ForgeCollapsibleRoot",
  props: {
    id: { type: String, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    onOpenChange: { type: Function as PropType<(open: boolean) => void>, default: undefined },
    asChild: { type: Boolean, default: false },
  },
  emits: {
    "update:open": (_v: boolean) => true,
  },
  setup(props, { slots, attrs, emit }) {
    const api = useCollapsible({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.open !== undefined && { open: props.open }),
      ...(props.defaultOpen !== undefined && { defaultOpen: props.defaultOpen }),
      ...(props.disabled !== undefined && { disabled: props.disabled }),
      ...(props.onOpenChange !== undefined && { onOpenChange: props.onOpenChange }),
    });
    watch(api.isOpen, (open) => emit("update:open", open));
    provide(collapsibleKey, api);
    return () => {
      const rootProps = { ...api.getRootProps(), ...attrs };
      if (props.asChild) return h(Slot, rootProps, slots['default']);
      return h("div", rootProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

const CollapsibleTrigger = defineComponent({
  name: "ForgeCollapsibleTrigger",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      // Strip React-only onKeyDown
      const { onKeyDown: _kd, ...triggerProps } = api.getTriggerProps();
      const merged = { ...triggerProps, ...attrs };
      if (props.asChild) return h(Slot, merged, slots['default']);
      return h("button", merged, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Content â€" Presence-aware. Supports forceMount for CSS exit animations.
// ---------------------------------------------------------------------------

const CollapsibleContent = defineComponent({
  name: "ForgeCollapsibleContent",
  props: {
    asChild: { type: Boolean, default: false },
    forceMount: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    const { isPresent, presenceRef } = usePresence(api.isOpen);
    return () => {
      if (!props.forceMount && !isPresent.value) return null;
      const contentProps = { ...api.getContentProps(), ref: presenceRef, ...attrs };
      if (props.asChild) return h(Slot, contentProps, slots['default']);
      return h("div", contentProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Collapsible = {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
} as const;

export { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger };
