import type { ComponentPublicInstance, PropType } from "vue";
import { defineComponent, h, inject, provide, reactive, ref, watch } from "vue";
import { usePresence } from "../../hooks/use-presence.js";
import { DialogPortal } from "../dialog/DialogPortal.js";
import { Slot } from "../dialog/Slot.js";
import { tooltipKey } from "./tooltip-context.js";
import { tooltipProviderKey } from "./use-tooltip-provider.js";
import { useTooltip } from "./use-tooltip.js";

type TooltipApi = ReturnType<typeof useTooltip>;

function useCtx(): TooltipApi {
  const ctx = inject(tooltipKey);
  if (!ctx) throw new Error("Tooltip compound parts must be inside <Tooltip.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider — optional global delay management (SSR-safe, instance-isolated).
// ---------------------------------------------------------------------------

const TooltipProvider = defineComponent({
  name: "ForgeTooltipProvider",
  props: {
    openDelay: { type: Number, default: 700 },
    closeDelay: { type: Number, default: 300 },
    skipDelay: { type: Number, default: 300 },
    interactive: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const lastClosedAt = ref(0);

    const value = reactive({
      get openDelay() {
        return props.openDelay;
      },
      get closeDelay() {
        return props.closeDelay;
      },
      get skipDelay() {
        return props.skipDelay;
      },
      get interactive() {
        return props.interactive;
      },
      isInQuickSuccession: () => Date.now() - lastClosedAt.value < props.skipDelay,
      notifyOpen: () => {},
      notifyClose: () => {
        lastClosedAt.value = Date.now();
      },
    });

    provide(tooltipProviderKey, value);

    return () => slots.default?.();
  },
});

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const TooltipRoot = defineComponent({
  name: "ForgeTooltipRoot",
  props: {
    open: { type: Boolean as PropType<boolean>, default: undefined },
    disabled: { type: Boolean as PropType<boolean>, default: undefined },
    interactive: { type: Boolean as PropType<boolean>, default: undefined },
    closeOnPointerDown: { type: Boolean as PropType<boolean>, default: undefined },
    openDelay: { type: Number, default: undefined },
    closeDelay: { type: Number, default: undefined },
    id: { type: String, default: undefined },
    onOpenChange: { type: Function as PropType<(open: boolean) => void>, default: undefined },
  },
  emits: ["update:open"],
  setup(props, { slots, emit }) {
    const api = useTooltip({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.open !== undefined && { open: props.open }),
      ...(props.disabled !== undefined && { disabled: props.disabled }),
      ...(props.interactive !== undefined && { interactive: props.interactive }),
      ...(props.closeOnPointerDown !== undefined && {
        closeOnPointerDown: props.closeOnPointerDown,
      }),
      ...(props.openDelay !== undefined && { openDelay: props.openDelay }),
      ...(props.closeDelay !== undefined && { closeDelay: props.closeDelay }),
      ...(props.onOpenChange !== undefined && { onOpenChange: props.onOpenChange }),
    });

    provide(tooltipKey, api);

    watch(
      () => props.open,
      (open) => {
        if (open === undefined) return;
        api.setOpen(open);
      },
    );

    watch(api.isOpen, (open) => emit("update:open", open));

    return () => slots.default?.();
  },
});

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

// Vue's h() uses hyphenate() to convert prop keys: onPointerEnter → "pointer-enter"
// (not the DOM event "pointerenter"). Remap multi-word pointer/keyboard events to all-
// lowercase-after-on form so hyphenate yields the correct DOM event name.
function patchVueEvents(props: Record<string, unknown>): Record<string, unknown> {
  const {
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onKeyDown,
    ...rest
  } = props as Record<string, unknown>;
  return {
    ...rest,
    ...(onPointerEnter !== undefined && { onPointerenter: onPointerEnter }),
    ...(onPointerLeave !== undefined && { onPointerleave: onPointerLeave }),
    ...(onPointerDown !== undefined && { onPointerdown: onPointerDown }),
    ...(onKeyDown !== undefined && { onKeydown: onKeyDown }),
  };
}

const TooltipTrigger = defineComponent({
  name: "ForgeTooltipTrigger",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const triggerProps = { ...patchVueEvents(api.getTriggerProps()), ...attrs };
      if (props.asChild) return h(Slot, triggerProps, slots.default);
      return h("button", triggerProps, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

const TooltipPortal = defineComponent({
  name: "ForgeTooltipPortal",
  props: {
    to: { type: [String, Object] as PropType<string | HTMLElement>, default: "body" },
    disabled: { type: Boolean, default: false },
    forceMount: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const api = useCtx();
    return () => {
      if (!props.forceMount && !api.isOpen.value) return null;
      return h(DialogPortal, { to: props.to, disabled: props.disabled }, slots.default);
    };
  },
});

// ---------------------------------------------------------------------------
// Content — Presence-aware. Positioner div wraps content div.
// ---------------------------------------------------------------------------

const TooltipContent = defineComponent({
  name: "ForgeTooltipContent",
  inheritAttrs: false,
  props: {
    forceMount: { type: Boolean, default: false },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    const { isPresent, presenceRef } = usePresence(api.isOpen);

    return () => {
      if (!props.forceMount && !isPresent.value) return null;

      const positionerProps = api.getPositionerProps();
      const contentProps = api.getContentProps();
      const isOpen = api.isOpen.value;

      const machineRef = contentProps.ref as (el: HTMLElement | null) => void;
      const { ref: _ref, ...patchedContentProps } = patchVueEvents(contentProps) as Record<string, unknown>;
      const finalContentProps = {
        ...patchedContentProps,
        ...(!isOpen && { "aria-hidden": true }),
        ...attrs,
        ...(!isOpen && { style: [attrs.style, { pointerEvents: "none" }] }),
        ref: (el: Element | ComponentPublicInstance | null) => {
          const htmlEl = el instanceof HTMLElement ? el : null;
          machineRef(htmlEl);
          presenceRef.value = htmlEl;
        },
      };

      if (props.asChild) {
        return h("div", positionerProps, h(Slot, finalContentProps, slots.default));
      }
      return h("div", positionerProps, h("div", finalContentProps, slots.default?.()));
    };
  },
});

// ---------------------------------------------------------------------------
// Anchor — makes computePosition use this element as reference instead of trigger.
// ---------------------------------------------------------------------------

const TooltipAnchor = defineComponent({
  name: "ForgeTooltipAnchor",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const anchorProps = { ...api.getAnchorProps(), ...attrs };
      if (props.asChild) return h(Slot, anchorProps, slots.default);
      return h("div", anchorProps, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Arrow — renderless, always Slot.
// ---------------------------------------------------------------------------

const TooltipArrow = defineComponent({
  name: "ForgeTooltipArrow",
  setup(_props, { slots }) {
    const api = useCtx();
    return () => h(Slot, api.getArrowProps(), slots.default);
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Tooltip = {
  Provider: TooltipProvider,
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Anchor: TooltipAnchor,
  Portal: TooltipPortal,
  Content: TooltipContent,
  Arrow: TooltipArrow,
} as const;

export {
  TooltipAnchor,
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
};
