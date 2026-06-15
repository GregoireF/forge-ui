import type { ComponentPublicInstance, PropType } from "vue";
import { defineComponent, h, inject, onMounted, onUnmounted, provide, watch } from "vue";
import { usePresence } from "../../hooks/use-presence.js";
import { DialogPortal } from "./DialogPortal.js";
import { dialogKey } from "./dialog-context.js";
import { Slot } from "./Slot.js";
import { useDialog } from "./use-dialog.js";

type DialogApi = ReturnType<typeof useDialog>;

function useCtx(): DialogApi {
  const ctx = inject(dialogKey);
  if (!ctx) throw new Error("Dialog compound parts must be inside <Dialog.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const DialogRoot = defineComponent({
  name: "ForgeDialogRoot",
  props: {
    open: { type: Boolean as PropType<boolean>, default: undefined },
    modal: { type: Boolean as PropType<boolean>, default: undefined },
    role: { type: String as PropType<"dialog" | "alertdialog">, default: undefined },
    trapFocus: { type: Boolean as PropType<boolean>, default: undefined },
    preventScroll: { type: Boolean as PropType<boolean>, default: undefined },
    hideOthers: { type: Boolean as PropType<boolean>, default: undefined },
    id: { type: String, default: undefined },
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
    const api = useDialog({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.open !== undefined && { open: props.open }),
      ...(props.modal !== undefined && { modal: props.modal }),
      ...(props.role !== undefined && { role: props.role }),
      ...(props.trapFocus !== undefined && { trapFocus: props.trapFocus }),
      ...(props.preventScroll !== undefined && { preventScroll: props.preventScroll }),
      ...(props.hideOthers !== undefined && { hideOthers: props.hideOthers }),
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
    provide(dialogKey, api);

    watch(
      () => props.open,
      (open) => {
        if (open === undefined) return;
        api.setOpen(open);
      },
    );

    watch(api.isOpen, (open) => {
      emit("update:open", open);
    });

    return () => slots.default?.();
  },
});

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

const DialogTrigger = defineComponent({
  name: "ForgeDialogTrigger",
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
// Portal
// ---------------------------------------------------------------------------

const DialogPortalCompound = defineComponent({
  name: "ForgeDialogPortal",
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
// Overlay — Presence-aware.
// ---------------------------------------------------------------------------

const DialogOverlay = defineComponent({
  name: "ForgeDialogOverlay",
  props: {
    forceMount: { type: Boolean, default: false },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { attrs, slots }) {
    const api = useCtx();
    const { isPresent, presenceRef } = usePresence(api.isOpen);

    return () => {
      if (!props.forceMount && !isPresent.value) return null;

      const overlayProps = api.getOverlayProps();
      const closingProps = !api.isOpen.value
        ? { "aria-hidden": true, style: { pointerEvents: "none" } }
        : {};

      const finalProps = {
        ...overlayProps,
        ...closingProps,
        ...attrs,
        ref: presenceRef,
      };

      if (props.asChild) return h(Slot, finalProps, slots.default);
      return h("div", finalProps);
    };
  },
});

// ---------------------------------------------------------------------------
// Content — Presence-aware.
// ---------------------------------------------------------------------------

const DialogContent = defineComponent({
  name: "ForgeDialogContent",
  props: {
    forceMount: { type: Boolean, default: false },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    const { isPresent, presenceRef } = usePresence(api.isOpen);

    return () => {
      if (!props.forceMount && !isPresent.value) return null;

      const contentProps = api.getContentProps();
      const closingProps = !api.isOpen.value
        ? { "aria-hidden": true, style: { pointerEvents: "none" } }
        : {};

      const machineRef = contentProps.ref as (el: HTMLElement | null) => void;
      const finalProps = {
        ...contentProps,
        ...closingProps,
        ...attrs,
        ref: (el: Element | ComponentPublicInstance | null) => {
          const htmlEl = el instanceof HTMLElement ? el : null;
          machineRef(htmlEl);
          presenceRef.value = htmlEl;
        },
      };

      if (props.asChild) return h(Slot, finalProps, slots.default);
      return h("div", finalProps, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Title (with presence registration)
// ---------------------------------------------------------------------------

const DialogTitle = defineComponent({
  name: "ForgeDialogTitle",
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
// Description (with presence registration)
// ---------------------------------------------------------------------------

const DialogDescription = defineComponent({
  name: "ForgeDialogDescription",
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
// Close
// ---------------------------------------------------------------------------

const DialogClose = defineComponent({
  name: "ForgeDialogClose",
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
// Namespace export
// ---------------------------------------------------------------------------

export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Portal: DialogPortalCompound,
  Overlay: DialogOverlay,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
} as const;

export {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
};
