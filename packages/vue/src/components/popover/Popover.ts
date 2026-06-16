import type { PopoverPositioning } from "@forge-ui/popover";
import type { ComponentPublicInstance, PropType } from "vue";
import { defineComponent, h, inject, onMounted, onUnmounted, provide, watch } from "vue";
import { usePresence } from "../../hooks/use-presence.js";
import { DialogPortal } from "../dialog/DialogPortal.js";
import { Slot } from "../dialog/Slot.js";
import { popoverKey } from "./popover-context.js";
import { usePopover } from "./use-popover.js";

type PopoverApi = ReturnType<typeof usePopover>;

function useCtx(): PopoverApi {
  const ctx = inject(popoverKey);
  if (!ctx) throw new Error("Popover compound parts must be inside <Popover.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const PopoverRoot = defineComponent({
  name: "ForgePopoverRoot",
  props: {
    open: { type: Boolean as PropType<boolean>, default: undefined },
    modal: { type: Boolean as PropType<boolean>, default: undefined },
    trapFocus: { type: Boolean as PropType<boolean>, default: undefined },
    preventScroll: { type: Boolean as PropType<boolean>, default: undefined },
    hideOthers: { type: Boolean as PropType<boolean>, default: undefined },
    id: { type: String, default: undefined },
    positioning: { type: Object as PropType<PopoverPositioning>, default: undefined },
    onOpenChange: { type: Function as PropType<(open: boolean) => void>, default: undefined },
    onOpenAutoFocus: { type: Function as PropType<(e: Event) => void>, default: undefined },
    onCloseAutoFocus: { type: Function as PropType<(e: Event) => void>, default: undefined },
    onPointerDownOutside: {
      type: Function as PropType<(e: PointerEvent) => void>,
      default: undefined,
    },
    onFocusOutside: { type: Function as PropType<(e: FocusEvent) => void>, default: undefined },
    onInteractOutside: {
      type: Function as PropType<(e: PointerEvent | FocusEvent) => void>,
      default: undefined,
    },
    onEscapeKeyDown: {
      type: Function as PropType<(e: KeyboardEvent) => void>,
      default: undefined,
    },
    initialFocusEl: {
      type: Function as PropType<() => HTMLElement | null>,
      default: undefined,
    },
    finalFocusEl: {
      type: Function as PropType<() => HTMLElement | null>,
      default: undefined,
    },
  },
  emits: ["update:open"],
  setup(props, { slots, emit }) {
    const api = usePopover({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.open !== undefined && { open: props.open }),
      ...(props.modal !== undefined && { modal: props.modal }),
      ...(props.trapFocus !== undefined && { trapFocus: props.trapFocus }),
      ...(props.preventScroll !== undefined && { preventScroll: props.preventScroll }),
      ...(props.hideOthers !== undefined && { hideOthers: props.hideOthers }),
      ...(props.positioning !== undefined && { positioning: props.positioning }),
      ...(props.onOpenChange !== undefined && { onOpenChange: props.onOpenChange }),
      ...(props.onOpenAutoFocus !== undefined && { onOpenAutoFocus: props.onOpenAutoFocus }),
      ...(props.onCloseAutoFocus !== undefined && { onCloseAutoFocus: props.onCloseAutoFocus }),
      ...(props.onPointerDownOutside !== undefined && {
        onPointerDownOutside: props.onPointerDownOutside,
      }),
      ...(props.onFocusOutside !== undefined && { onFocusOutside: props.onFocusOutside }),
      ...(props.onInteractOutside !== undefined && {
        onInteractOutside: props.onInteractOutside,
      }),
      ...(props.onEscapeKeyDown !== undefined && { onEscapeKeyDown: props.onEscapeKeyDown }),
      ...(props.initialFocusEl !== undefined && { initialFocusEl: props.initialFocusEl }),
      ...(props.finalFocusEl !== undefined && { finalFocusEl: props.finalFocusEl }),
    });
    provide(popoverKey, api);

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

const PopoverTrigger = defineComponent({
  name: "ForgePopoverTrigger",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const triggerProps = { ...api.getTriggerProps(), ...attrs };
      if (props.asChild) return h(Slot, triggerProps, slots.default);
      return h("button", triggerProps, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Anchor
// ---------------------------------------------------------------------------

const PopoverAnchor = defineComponent({
  name: "ForgePopoverAnchor",
  setup(_props, { slots }) {
    const api = useCtx();
    return () => h(Slot, api.getAnchorProps(), slots.default);
  },
});

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

const PopoverPortal = defineComponent({
  name: "ForgePopoverPortal",
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
// During exit: aria-hidden + pointer-events:none keep content inert.
// ---------------------------------------------------------------------------

const PopoverContent = defineComponent({
  name: "ForgePopoverContent",
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
        return h("div", positionerProps, h(Slot, finalContentProps, slots.default));
      }
      return h("div", positionerProps, h("div", finalContentProps, slots.default?.()));
    };
  },
});

// ---------------------------------------------------------------------------
// Arrow — renderless, always Slot.
// ---------------------------------------------------------------------------

const PopoverArrow = defineComponent({
  name: "ForgePopoverArrow",
  setup(_props, { slots }) {
    const api = useCtx();
    return () => h(Slot, api.getArrowProps(), slots.default);
  },
});

// ---------------------------------------------------------------------------
// Close
// ---------------------------------------------------------------------------

const PopoverClose = defineComponent({
  name: "ForgePopoverClose",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const closeProps = { ...api.getCloseProps(), ...attrs };
      if (props.asChild) return h(Slot, closeProps, slots.default);
      return h("button", closeProps, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

const PopoverTitle = defineComponent({
  name: "ForgePopoverTitle",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    onMounted(() => api.send("REGISTER_TITLE"));
    onUnmounted(() => api.send("UNREGISTER_TITLE"));
    return () => {
      const titleProps = { ...api.getTitleProps(), ...attrs };
      if (props.asChild) return h(Slot, titleProps, slots.default);
      return h("h2", titleProps, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Description
// ---------------------------------------------------------------------------

const PopoverDescription = defineComponent({
  name: "ForgePopoverDescription",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    onMounted(() => api.send("REGISTER_DESCRIPTION"));
    onUnmounted(() => api.send("UNREGISTER_DESCRIPTION"));
    return () => {
      const descriptionProps = { ...api.getDescriptionProps(), ...attrs };
      if (props.asChild) return h(Slot, descriptionProps, slots.default);
      return h("p", descriptionProps, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Popover = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Anchor: PopoverAnchor,
  Portal: PopoverPortal,
  Content: PopoverContent,
  Arrow: PopoverArrow,
  Close: PopoverClose,
  Title: PopoverTitle,
  Description: PopoverDescription,
} as const;

export {
  PopoverAnchor,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverPortal,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
};
