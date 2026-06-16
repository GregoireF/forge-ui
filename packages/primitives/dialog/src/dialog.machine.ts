import {
  createMachine,
  makeFocusActivity,
  makeHideBackgroundActivity,
  makeKeyboardActivity,
  makeLayerActivity,
  makeLockScrollActivity,
  makeWatchOutsideActivity,
} from "@forge-ui/core";
import type { DialogContext, DialogEvent, DialogState } from "./dialog.types.js";

export interface CreateDialogMachineOptions {
  id: string;
  /** Controlled open state. Pair with onOpenChange to manage externally. */
  open?: boolean;
  /** Uncontrolled initial open state. Use instead of open when you don't need to manage the state. */
  defaultOpen?: boolean;
  role?: "dialog" | "alertdialog";
  modal?: boolean;
  trapFocus?: boolean;
  preventScroll?: boolean;
  hideOthers?: boolean;
  initialFocusEl?: () => HTMLElement | null;
  finalFocusEl?: () => HTMLElement | null;
  onOpenAutoFocus?: (e: Event) => void;
  onCloseAutoFocus?: (e: Event) => void;
  onPointerDownOutside?: (e: PointerEvent) => void;
  onFocusOutside?: (e: FocusEvent) => void;
  onInteractOutside?: (e: PointerEvent | FocusEvent) => void;
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
  onOpenChange?: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Named actions
// ---------------------------------------------------------------------------

function invokeOnOpenChange(open: boolean) {
  return function action({ context }: { context: DialogContext }) {
    context.onOpenChange?.(open);
  };
}

function registerTitle({ setContext }: { setContext: (u: Partial<DialogContext>) => void }) {
  setContext({ titleRegistered: true });
}
function unregisterTitle({ setContext }: { setContext: (u: Partial<DialogContext>) => void }) {
  setContext({ titleRegistered: false });
}
function registerDescription({ setContext }: { setContext: (u: Partial<DialogContext>) => void }) {
  setContext({ descriptionRegistered: true });
}
function unregisterDescription({
  setContext,
}: {
  setContext: (u: Partial<DialogContext>) => void;
}) {
  setContext({ descriptionRegistered: false });
}

// ---------------------------------------------------------------------------
// Activity factories
// ---------------------------------------------------------------------------

const registerLayer = makeLayerActivity<DialogContext>({
  getId: (ctx) => ctx.id,
  getContentEl: (ctx) => ctx.contentEl,
});

const manageFocus = makeFocusActivity<DialogContext>({
  getContentEl: (ctx) => ctx.contentEl,
  getInitialFocusEl: (ctx) => ctx.initialFocusEl?.() ?? null,
  getFinalFocusEl: (ctx) => ctx.finalFocusEl?.() ?? null,
  // Content-level overrides take precedence over Root-level callbacks.
  getOnOpenAutoFocus: (ctx) => ctx.contentOnOpenAutoFocus ?? ctx.onOpenAutoFocus,
  getOnCloseAutoFocus: (ctx) => ctx.contentOnCloseAutoFocus ?? ctx.onCloseAutoFocus,
});

const trapKeyboard = makeKeyboardActivity<DialogContext>({
  getId: (ctx) => ctx.id,
  getContentEl: (ctx) => ctx.contentEl,
  isModal: (ctx) => ctx.trapFocus,
  sendEscape: "ESCAPE_KEY",
  getOnEscapeKeyDown: (ctx) => ctx.contentOnEscapeKeyDown ?? ctx.onEscapeKeyDown,
});

const hideBackground = makeHideBackgroundActivity<DialogContext>({
  getId: (ctx) => ctx.id,
  getContentEl: (ctx) => ctx.contentEl,
  isHideOthers: (ctx) => ctx.hideOthers,
});

const lockBodyScroll = makeLockScrollActivity<DialogContext>({
  isPreventScroll: (ctx) => ctx.preventScroll,
});

const watchOutside = makeWatchOutsideActivity<DialogContext>({
  getId: (ctx) => ctx.id,
  getContainers: (ctx) => [ctx.contentEl, ctx.triggerEl],
  sendClose: "INTERACT_OUTSIDE",
  getOnPointerDownOutside: (ctx) => ctx.contentOnPointerDownOutside ?? ctx.onPointerDownOutside,
  getOnFocusOutside: (ctx) => ctx.contentOnFocusOutside ?? ctx.onFocusOutside,
  getOnInteractOutside: (ctx) => ctx.contentOnInteractOutside ?? ctx.onInteractOutside,
});

// ---------------------------------------------------------------------------
// Machine factory
// ---------------------------------------------------------------------------

export function createDialogMachine(options: CreateDialogMachineOptions) {
  const { id } = options;
  const role = options.role ?? "dialog";
  const modal = options.modal ?? true;
  const initialOpen = options.open ?? options.defaultOpen ?? false;

  // alertdialog must never close on outside interaction (WAI-ARIA 1.2 §3.2).
  // Use a default handler that calls preventDefault; if the consumer also
  // provides one, keep theirs (they can still call preventDefault themselves).
  const onInteractOutside =
    options.onInteractOutside ??
    (role === "alertdialog"
      ? (e: PointerEvent | FocusEvent) => e.preventDefault()
      : undefined);

  return createMachine<DialogContext, DialogState, DialogEvent>({
    id: `forge-dialog:${id}`,
    context: {
      id,
      open: initialOpen,
      role,
      modal,
      trapFocus: options.trapFocus ?? modal,
      preventScroll: options.preventScroll ?? modal,
      hideOthers: options.hideOthers ?? modal,
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
      titleId: `${id}-title`,
      descriptionId: `${id}-description`,
      titleRegistered: false,
      descriptionRegistered: false,
      contentEl: null,
      triggerEl: null,
      ...(options.initialFocusEl !== undefined && { initialFocusEl: options.initialFocusEl }),
      ...(options.finalFocusEl !== undefined && { finalFocusEl: options.finalFocusEl }),
      ...(options.onOpenAutoFocus !== undefined && { onOpenAutoFocus: options.onOpenAutoFocus }),
      ...(options.onCloseAutoFocus !== undefined && { onCloseAutoFocus: options.onCloseAutoFocus }),
      ...(options.onPointerDownOutside !== undefined && {
        onPointerDownOutside: options.onPointerDownOutside,
      }),
      ...(options.onFocusOutside !== undefined && { onFocusOutside: options.onFocusOutside }),
      ...(onInteractOutside !== undefined && { onInteractOutside }),
      ...(options.onEscapeKeyDown !== undefined && { onEscapeKeyDown: options.onEscapeKeyDown }),
      ...(options.onOpenChange !== undefined && { onOpenChange: options.onOpenChange }),
    },
    initial: initialOpen ? "open" : "closed",

    states: {
      closed: {
        tags: ["closed"],
        on: {
          OPEN: { target: "open", actions: [invokeOnOpenChange(true)] },
          TOGGLE: { target: "open", actions: [invokeOnOpenChange(true)] },
          REGISTER_TITLE: { actions: [registerTitle] },
          UNREGISTER_TITLE: { actions: [unregisterTitle] },
          REGISTER_DESCRIPTION: { actions: [registerDescription] },
          UNREGISTER_DESCRIPTION: { actions: [unregisterDescription] },
        },
      },
      open: {
        tags: ["open"],
        // registerLayer MUST be first — other activities read the registry.
        activities: [
          "registerLayer",
          "manageFocus",
          "trapKeyboard",
          "hideBackground",
          "lockBodyScroll",
          "watchOutside",
        ],
        on: {
          CLOSE: { target: "closed", actions: [invokeOnOpenChange(false)] },
          TOGGLE: { target: "closed", actions: [invokeOnOpenChange(false)] },
          ESCAPE_KEY: { target: "closed", actions: [invokeOnOpenChange(false)] },
          INTERACT_OUTSIDE: { target: "closed", actions: [invokeOnOpenChange(false)] },
          REGISTER_TITLE: { actions: [registerTitle] },
          UNREGISTER_TITLE: { actions: [unregisterTitle] },
          REGISTER_DESCRIPTION: { actions: [registerDescription] },
          UNREGISTER_DESCRIPTION: { actions: [unregisterDescription] },
        },
      },
    },

    activities: {
      registerLayer,
      manageFocus,
      trapKeyboard,
      hideBackground,
      lockBodyScroll,
      watchOutside,
    },
  });
}
