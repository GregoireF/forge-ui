import type { ComponentPublicInstance, InjectionKey, PropType, Ref } from "vue";
import {
  defineComponent,
  h,
  inject,
  onMounted,
  onScopeDispose,
  provide,
  watchEffect,
} from "vue";
import { usePresence } from "../../hooks/use-presence.js";
import { DialogPortal } from "../dialog/DialogPortal.js";
import { Slot } from "../shared/Slot.js";
import { alertDialogKey } from "./alert-dialog-context.js";
import { useAlertDialog } from "./use-alert-dialog.js";

type AlertDialogApi = ReturnType<typeof useAlertDialog>;

function useCtx(): AlertDialogApi {
  const ctx = inject(alertDialogKey);
  if (!ctx) throw new Error("AlertDialog compound parts must be inside <AlertDialog.Root>");
  return ctx;
}

type AlertDialogPresenceContext = { isPresent: Ref<boolean>; presenceRef: Ref<HTMLElement | null> };
const alertDialogPresenceKey: InjectionKey<AlertDialogPresenceContext> = Symbol("forge-alert-dialog-presence");

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const AlertDialogRoot = defineComponent({
  name: "ForgeAlertDialogRoot",
  props: {
    open: { type: Boolean as PropType<boolean>, default: undefined },
    defaultOpen: { type: Boolean as PropType<boolean>, default: undefined },
    modal: { type: Boolean as PropType<boolean>, default: undefined },
    trapFocus: { type: Boolean as PropType<boolean>, default: undefined },
    preventScroll: { type: Boolean as PropType<boolean>, default: undefined },
    hideOthers: { type: Boolean as PropType<boolean>, default: undefined },
    id: { type: String, default: undefined },
    onOpenChange: { type: Function as PropType<(open: boolean) => void>, default: undefined },
    onOpenAutoFocus: { type: Function as PropType<(e: Event) => void>, default: undefined },
    onCloseAutoFocus: { type: Function as PropType<(e: Event) => void>, default: undefined },
    /** Informational â€" fires when Escape is pressed, but alertdialog never closes from it. */
    onEscapeKeyDown: { type: Function as PropType<(e: KeyboardEvent) => void>, default: undefined },
    initialFocusEl: { type: Function as PropType<() => HTMLElement | null>, default: undefined },
    finalFocusEl: { type: Function as PropType<() => HTMLElement | null>, default: undefined },
  },
  emits: {
    "update:open": (_v: boolean) => true,
  },
  setup(props, { slots, emit }) {
    const api = useAlertDialog({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.defaultOpen !== undefined && { defaultOpen: props.defaultOpen }),
      ...(props.open !== undefined && { open: props.open }),
      ...(props.modal !== undefined && { modal: props.modal }),
      ...(props.trapFocus !== undefined && { trapFocus: props.trapFocus }),
      ...(props.preventScroll !== undefined && { preventScroll: props.preventScroll }),
      ...(props.hideOthers !== undefined && { hideOthers: props.hideOthers }),
      ...(props.onOpenChange !== undefined && { onOpenChange: props.onOpenChange }),
      ...(props.onOpenAutoFocus !== undefined && { onOpenAutoFocus: props.onOpenAutoFocus }),
      ...(props.onCloseAutoFocus !== undefined && { onCloseAutoFocus: props.onCloseAutoFocus }),
      ...(props.onEscapeKeyDown !== undefined && { onEscapeKeyDown: props.onEscapeKeyDown }),
      ...(props.initialFocusEl !== undefined && { initialFocusEl: props.initialFocusEl }),
      ...(props.finalFocusEl !== undefined && { finalFocusEl: props.finalFocusEl }),
    });
    provide(alertDialogKey, api);

    const presence = usePresence(api.isOpen);
    provide(alertDialogPresenceKey, presence);

    watchEffect(() => {
      if (props.open === undefined) return;
      api.setOpen(props.open);
    });

    watchEffect(() => {
      emit("update:open", api.isOpen.value);
    });

    return () => slots['default']?.();
  },
});

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

const AlertDialogTrigger = defineComponent({
  name: "ForgeAlertDialogTrigger",
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
// Portal
// ---------------------------------------------------------------------------

const AlertDialogPortalCompound = defineComponent({
  name: "ForgeAlertDialogPortal",
  props: {
    to: { type: [String, Object] as PropType<string | HTMLElement>, default: "body" },
    disabled: { type: Boolean, default: false },
    forceMount: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const api = useCtx();
    const presence = inject(alertDialogPresenceKey, null);
    return () => {
      const isPresent = presence?.isPresent.value ?? api.isOpen.value;
      if (!props.forceMount && !isPresent) return null;
      return h(DialogPortal, { to: props.to, disabled: props.disabled }, slots['default']);
    };
  },
});

// ---------------------------------------------------------------------------
// Overlay
// ---------------------------------------------------------------------------

const AlertDialogOverlay = defineComponent({
  name: "ForgeAlertDialogOverlay",
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
      const isOpen = api.isOpen.value;
      const finalProps = {
        ...overlayProps,
        ...(!isOpen && { "aria-hidden": true }),
        ...attrs,
        ...(isOpen ? {} : { style: [attrs.style, { pointerEvents: "none" }] }),
        ref: presenceRef,
      };
      if (props.asChild) return h(Slot, finalProps, slots['default']);
      return h("div", finalProps);
    };
  },
});

// ---------------------------------------------------------------------------
// Content
// Accepts onOpenAutoFocus / onCloseAutoFocus overrides only.
// ---------------------------------------------------------------------------

const AlertDialogContent = defineComponent({
  name: "ForgeAlertDialogContent",
  props: {
    forceMount: { type: Boolean, default: false },
    asChild: { type: Boolean, default: false },
    onOpenAutoFocus: { type: Function as PropType<(e: Event) => void>, default: undefined },
    onCloseAutoFocus: { type: Function as PropType<(e: Event) => void>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    const injectedPresence = inject(alertDialogPresenceKey, null);
    const ownPresence = usePresence(api.isOpen);
    const { isPresent, presenceRef } = injectedPresence ?? ownPresence;

    // Dev-only a11y warnings.
    if (process.env.NODE_ENV !== "production") {
      watchEffect((onCleanup) => {
        if (!api.isOpen.value) return;
        const raf = requestAnimationFrame(() => {
          if (!api.titleRegistered.value && !attrs["aria-label"] && !attrs["aria-labelledby"]) {
            console.warn(
              "[forge-ui/alert-dialog] Missing accessible name: mount <AlertDialog.Title> inside <AlertDialog.Content>, or pass aria-label / aria-labelledby.",
            );
          }
          if (!api.descriptionRegistered.value && !attrs["aria-describedby"]) {
            console.warn(
              "[forge-ui/alert-dialog] Missing description: mount <AlertDialog.Description> inside <AlertDialog.Content>, or pass aria-describedby.",
            );
          }
        });
        onCleanup(() => cancelAnimationFrame(raf));
      });
    }

    watchEffect(() => {
      api.setContentCallbacks({
        onOpenAutoFocus: props.onOpenAutoFocus,
        onCloseAutoFocus: props.onCloseAutoFocus,
      });
    });

    onScopeDispose(() => api.setContentCallbacks({}));

    return () => {
      if (!props.forceMount && !isPresent.value) return null;

      const contentProps = api.getContentProps();
      const isOpen = api.isOpen.value;

      const machineRef = contentProps.ref as (el: HTMLElement | null) => void;
      const finalProps = {
        ...contentProps,
        ...(!isOpen && { "aria-hidden": true }),
        ...attrs,
        ...(isOpen ? {} : { style: [attrs.style, { pointerEvents: "none" }] }),
        ref: (el: Element | ComponentPublicInstance | null) => {
          const htmlEl = el instanceof HTMLElement ? el : null;
          machineRef(htmlEl);
          presenceRef.value = htmlEl;
        },
      };

      if (props.asChild) return h(Slot, finalProps, slots['default']);
      return h("div", finalProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

const AlertDialogTitle = defineComponent({
  name: "ForgeAlertDialogTitle",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    onMounted(() => api.send("REGISTER_TITLE"));
    onScopeDispose(() => api.send("UNREGISTER_TITLE"));
    return () => {
      const titleProps = { ...api.getTitleProps(), ...attrs };
      if (props.asChild) return h(Slot, titleProps, slots['default']);
      return h("h2", titleProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Description
// ---------------------------------------------------------------------------

const AlertDialogDescription = defineComponent({
  name: "ForgeAlertDialogDescription",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    onMounted(() => api.send("REGISTER_DESCRIPTION"));
    onScopeDispose(() => api.send("UNREGISTER_DESCRIPTION"));
    return () => {
      const descriptionProps = { ...api.getDescriptionProps(), ...attrs };
      if (props.asChild) return h(Slot, descriptionProps, slots['default']);
      return h("p", descriptionProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Cancel â€" dismisses without acting.
// ---------------------------------------------------------------------------

const AlertDialogCancel = defineComponent({
  name: "ForgeAlertDialogCancel",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const cancelProps = { ...api.getCancelProps(), ...attrs };
      if (props.asChild) return h(Slot, cancelProps, slots['default']);
      return h("button", cancelProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Action â€" destructive / confirm button. Does NOT auto-close.
// ---------------------------------------------------------------------------

const AlertDialogAction = defineComponent({
  name: "ForgeAlertDialogAction",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const actionProps = { ...api.getActionProps(), ...attrs };
      if (props.asChild) return h(Slot, actionProps, slots['default']);
      return h("button", actionProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const AlertDialog = {
  Root: AlertDialogRoot,
  Trigger: AlertDialogTrigger,
  Portal: AlertDialogPortalCompound,
  Overlay: AlertDialogOverlay,
  Content: AlertDialogContent,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Cancel: AlertDialogCancel,
  Action: AlertDialogAction,
} as const;

export {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
};
export { AlertDialogPortalCompound as AlertDialogPortal };
