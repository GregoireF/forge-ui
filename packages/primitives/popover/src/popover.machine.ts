import {
  createMachine,
  makeFocusActivity,
  makeHideBackgroundActivity,
  makeKeyboardActivity,
  makeLayerActivity,
  makeLockScrollActivity,
  makeWatchOutsideActivity,
} from "@forge-ui/core";
import type { FloatingPositioning } from "@forge-ui/floating";
import { makeComputePositionActivity } from "@forge-ui/floating";
import type { PopoverContext, PopoverEvent, PopoverState } from "./popover.types.js";

export interface CreatePopoverMachineOptions {
  id: string;
  open?: boolean;
  modal?: boolean;
  trapFocus?: boolean;
  preventScroll?: boolean;
  hideOthers?: boolean;
  positioning?: FloatingPositioning;
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
// Actions
// ---------------------------------------------------------------------------

function invokeOnOpenChange(open: boolean) {
  return function action({ context }: { context: PopoverContext }) {
    context.onOpenChange?.(open);
  };
}

function registerTitle({ setContext }: { setContext: (u: Partial<PopoverContext>) => void }) {
  setContext({ titleRegistered: true });
}
function unregisterTitle({ setContext }: { setContext: (u: Partial<PopoverContext>) => void }) {
  setContext({ titleRegistered: false });
}
function registerDescription({ setContext }: { setContext: (u: Partial<PopoverContext>) => void }) {
  setContext({ descriptionRegistered: true });
}
function unregisterDescription({
  setContext,
}: {
  setContext: (u: Partial<PopoverContext>) => void;
}) {
  setContext({ descriptionRegistered: false });
}

// ---------------------------------------------------------------------------
// Activity factories
// ---------------------------------------------------------------------------

const registerLayer = makeLayerActivity<PopoverContext>({
  getId: (ctx) => ctx.id,
  getContentEl: (ctx) => ctx.contentEl,
});

const computePosition = makeComputePositionActivity<PopoverContext>();

const manageFocus = makeFocusActivity<PopoverContext>({
  getContentEl: (ctx) => ctx.contentEl,
  getInitialFocusEl: (ctx) => ctx.initialFocusEl?.() ?? null,
  getFinalFocusEl: (ctx) => ctx.finalFocusEl?.() ?? null,
  getOnOpenAutoFocus: (ctx) => ctx.onOpenAutoFocus,
  getOnCloseAutoFocus: (ctx) => ctx.onCloseAutoFocus,
});

const trapKeyboard = makeKeyboardActivity<PopoverContext>({
  getId: (ctx) => ctx.id,
  getContentEl: (ctx) => ctx.contentEl,
  isModal: (ctx) => ctx.trapFocus,
  sendEscape: "ESCAPE_KEY",
  getOnEscapeKeyDown: (ctx) => ctx.onEscapeKeyDown,
});

const hideBackground = makeHideBackgroundActivity<PopoverContext>({
  getId: (ctx) => ctx.id,
  getContentEl: (ctx) => ctx.contentEl,
  isHideOthers: (ctx) => ctx.hideOthers,
});

const lockBodyScroll = makeLockScrollActivity<PopoverContext>({
  isPreventScroll: (ctx) => ctx.preventScroll,
});

const watchOutside = makeWatchOutsideActivity<PopoverContext>({
  getId: (ctx) => ctx.id,
  // Include anchorEl: clicking the anchor should not close the popover.
  getContainers: (ctx) => [ctx.contentEl, ctx.triggerEl, ctx.anchorEl],
  sendClose: "INTERACT_OUTSIDE",
  getOnPointerDownOutside: (ctx) => ctx.onPointerDownOutside,
  getOnFocusOutside: (ctx) => ctx.onFocusOutside,
  getOnInteractOutside: (ctx) => ctx.onInteractOutside,
});

// ---------------------------------------------------------------------------
// Machine factory
// ---------------------------------------------------------------------------

export function createPopoverMachine(options: CreatePopoverMachineOptions) {
  const { id } = options;
  const modal = options.modal ?? false;
  const pos = options.positioning ?? {};

  return createMachine<PopoverContext, PopoverState, PopoverEvent>({
    id: `forge-popover:${id}`,
    context: {
      id,
      open: options.open ?? false,
      modal,
      trapFocus: options.trapFocus ?? modal,
      preventScroll: options.preventScroll ?? false,
      hideOthers: options.hideOthers ?? modal,
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
      titleId: `${id}-title`,
      descriptionId: `${id}-description`,
      titleRegistered: false,
      descriptionRegistered: false,
      triggerEl: null,
      anchorEl: null,
      contentEl: null,
      arrowEl: null,
      x: 0,
      y: 0,
      currentPlacement: pos.placement ?? "bottom",
      positioning: {
        placement: pos.placement ?? "bottom",
        strategy: pos.strategy ?? "fixed",
        offset: pos.offset ?? 4,
        alignOffset: pos.alignOffset ?? 0,
        shiftPadding: pos.shiftPadding ?? 8,
        sameWidth: pos.sameWidth ?? false,
        avoidCollisions: pos.avoidCollisions ?? true,
        hideWhenDetached: pos.hideWhenDetached ?? false,
        disableAutoUpdate: pos.disableAutoUpdate ?? false,
        ...(pos.boundary !== undefined && { boundary: pos.boundary }),
        ...(pos.middleware !== undefined && { middleware: pos.middleware }),
      },
      ...(options.initialFocusEl !== undefined && { initialFocusEl: options.initialFocusEl }),
      ...(options.finalFocusEl !== undefined && { finalFocusEl: options.finalFocusEl }),
      ...(options.onOpenAutoFocus !== undefined && { onOpenAutoFocus: options.onOpenAutoFocus }),
      ...(options.onCloseAutoFocus !== undefined && { onCloseAutoFocus: options.onCloseAutoFocus }),
      ...(options.onPointerDownOutside !== undefined && {
        onPointerDownOutside: options.onPointerDownOutside,
      }),
      ...(options.onFocusOutside !== undefined && { onFocusOutside: options.onFocusOutside }),
      ...(options.onInteractOutside !== undefined && {
        onInteractOutside: options.onInteractOutside,
      }),
      ...(options.onEscapeKeyDown !== undefined && { onEscapeKeyDown: options.onEscapeKeyDown }),
      ...(options.onOpenChange !== undefined && { onOpenChange: options.onOpenChange }),
    },
    initial: options.open ? "open" : "closed",

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
        // registerLayer first — other activities read the registry.
        // computePosition first among behaviours — positions before focus.
        activities: [
          "registerLayer",
          "computePosition",
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
      computePosition,
      manageFocus,
      trapKeyboard,
      hideBackground,
      lockBodyScroll,
      watchOutside,
    },
  });
}
