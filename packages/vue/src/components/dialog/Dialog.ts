import type { PropType } from "vue";
import { defineComponent, h, inject, provide, watch } from "vue";
import { DialogPortal } from "./DialogPortal.js";
import { dialogKey } from "./dialog-context.js";
import { Slot } from "./Slot.js";
import { useDialog } from "./use-dialog.js";

function useCtx() {
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
    closeOnEscapeKey: { type: Boolean as PropType<boolean>, default: undefined },
    closeOnInteractOutside: { type: Boolean as PropType<boolean>, default: undefined },
    id: { type: String, default: undefined },
    onOpen: { type: Function as PropType<() => void>, default: undefined },
    onClose: { type: Function as PropType<() => void>, default: undefined },
    onOpenChange: { type: Function as PropType<(open: boolean) => void>, default: undefined },
  },
  emits: ["update:open"],
  setup(props, { slots, emit }) {
    const api = useDialog({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.open !== undefined && { open: props.open }),
      ...(props.modal !== undefined && { modal: props.modal }),
      ...(props.closeOnEscapeKey !== undefined && { closeOnEscapeKey: props.closeOnEscapeKey }),
      ...(props.closeOnInteractOutside !== undefined && {
        closeOnInteractOutside: props.closeOnInteractOutside,
      }),
      ...(props.onOpen !== undefined && { onOpen: props.onOpen }),
      ...(props.onClose !== undefined && { onClose: props.onClose }),
      ...(props.onOpenChange !== undefined && { onOpenChange: props.onOpenChange }),
    });
    provide(dialogKey, api);

    // Controlled mode: external `open` prop drives the machine after mount.
    watch(
      () => props.open,
      (open) => {
        if (open === undefined) return;
        api.setOpen(open);
      },
    );

    // v-model:open — notify parent of every transition.
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
      if (props.asChild) {
        return h(Slot, triggerProps, slots.default);
      }
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
  },
  setup(props, { slots }) {
    return () => h(DialogPortal, { to: props.to, disabled: props.disabled }, slots.default);
  },
});

// ---------------------------------------------------------------------------
// Overlay (backdrop)
// ---------------------------------------------------------------------------

const DialogOverlay = defineComponent({
  name: "ForgeDialogOverlay",
  props: { forceMount: { type: Boolean, default: false } },
  setup(props, { attrs }) {
    const api = useCtx();
    return () => {
      if (!props.forceMount && !api.isOpen.value) return null;
      return h("div", { ...api.getBackdropProps(), ...attrs });
    };
  },
});

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const DialogContent = defineComponent({
  name: "ForgeDialogContent",
  props: { forceMount: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      if (!props.forceMount && !api.isOpen.value) return null;
      return h("div", { ...api.getContentProps(), ...attrs }, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

const DialogTitle = defineComponent({
  name: "ForgeDialogTitle",
  setup(_props, { slots, attrs }) {
    const api = useCtx();
    return () => h("h2", { ...api.getTitleProps(), ...attrs }, slots.default?.());
  },
});

// ---------------------------------------------------------------------------
// Description
// ---------------------------------------------------------------------------

const DialogDescription = defineComponent({
  name: "ForgeDialogDescription",
  setup(_props, { slots, attrs }) {
    const api = useCtx();
    return () => h("p", { ...api.getDescriptionProps(), ...attrs }, slots.default?.());
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
      if (props.asChild) {
        return h(Slot, closeProps, slots.default);
      }
      return h("button", closeProps, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Namespace export — Dialog.Root, Dialog.Trigger, ...
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

// Named exports for consumers who prefer `import { DialogRoot } from '@forge-ui/vue'`
export {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
};
