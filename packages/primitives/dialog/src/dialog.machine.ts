import { createMachine, focusFirst, hideOthers, lockScroll, trapFocus } from "@forge-ui/core";
import type { DialogContext, DialogEvent, DialogState } from "./dialog.types.js";

export interface CreateDialogMachineOptions
  extends Partial<
    Pick<
      DialogContext,
      | "open"
      | "modal"
      | "closeOnEscapeKey"
      | "closeOnInteractOutside"
      | "onOpen"
      | "onClose"
      | "onOpenChange"
    >
  > {
  id: string;
}

// ---------------------------------------------------------------------------
// Named actions — called on state transitions (not entry/exit hooks)
// ---------------------------------------------------------------------------

function invokeOnOpen({ context }: { context: DialogContext }) {
  context.onOpen?.();
  context.onOpenChange?.(true);
}

function invokeOnClose({ context }: { context: DialogContext }) {
  context.onClose?.();
  context.onOpenChange?.(false);
}

// ---------------------------------------------------------------------------
// Machine factory
// ---------------------------------------------------------------------------

export function createDialogMachine(options: CreateDialogMachineOptions) {
  const { id } = options;

  return createMachine<DialogContext, DialogState, DialogEvent>({
    id: `forge-dialog:${id}`,
    context: {
      id,
      open: options.open ?? false,
      modal: options.modal ?? true,
      closeOnEscapeKey: options.closeOnEscapeKey ?? true,
      closeOnInteractOutside: options.closeOnInteractOutside ?? true,
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
      titleId: `${id}-title`,
      descriptionId: `${id}-description`,
      contentEl: null,
      triggerEl: null,
      ...(options.onOpen !== undefined && { onOpen: options.onOpen }),
      ...(options.onClose !== undefined && { onClose: options.onClose }),
      ...(options.onOpenChange !== undefined && { onOpenChange: options.onOpenChange }),
    },
    initial: options.open ? "open" : "closed",

    states: {
      closed: {
        tags: ["closed"],
        on: {
          OPEN: { target: "open", actions: [invokeOnOpen] },
          TOGGLE: { target: "open", actions: [invokeOnOpen] },
        },
      },
      open: {
        tags: ["open"],
        activities: [
          "manageFocus",
          "trapKeyboard",
          "hideBackground",
          "lockBodyScroll",
          "watchOutside",
        ],
        on: {
          CLOSE: { target: "closed", actions: [invokeOnClose] },
          TOGGLE: { target: "closed", actions: [invokeOnClose] },
          ESCAPE_KEY: {
            target: "closed",
            guard: ({ context }) => context.closeOnEscapeKey,
            actions: [invokeOnClose],
          },
          INTERACT_OUTSIDE: {
            target: "closed",
            guard: ({ context }) => context.closeOnInteractOutside,
            actions: [invokeOnClose],
          },
        },
      },
    },

    // -------------------------------------------------------------------------
    // Activities — long-running effects while in `open` state.
    // ctx is the live mutable context; DOM refs are read at handler-invocation
    // time (after the framework has set contentEl / triggerEl via ref callbacks).
    // -------------------------------------------------------------------------
    activities: {
      // Save previous focus, focus first element inside content, restore on close.
      manageFocus: (ctx) => {
        const previousFocus = document.activeElement as HTMLElement | null;
        const raf = requestAnimationFrame(() => {
          if (ctx.contentEl) focusFirst(ctx.contentEl);
        });
        return () => {
          cancelAnimationFrame(raf);
          previousFocus?.focus();
        };
      },

      // Document-level Tab trap + Escape key dispatch.
      trapKeyboard: (ctx, { send }) => {
        function handler(e: KeyboardEvent) {
          if (e.key === "Tab" && ctx.contentEl && ctx.modal) {
            trapFocus(ctx.contentEl, e);
          }
          if (e.key === "Escape" && ctx.closeOnEscapeKey) {
            send("ESCAPE_KEY");
          }
        }
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
      },

      // Hide background elements from assistive technology (modal only).
      hideBackground: (ctx) => {
        if (!ctx.modal) return;
        let cleanup: (() => void) | undefined;
        const raf = requestAnimationFrame(() => {
          if (ctx.contentEl) cleanup = hideOthers(ctx.contentEl);
        });
        return () => {
          cancelAnimationFrame(raf);
          cleanup?.();
        };
      },

      // Prevent body scroll with scrollbar-width compensation (modal only).
      lockBodyScroll: (ctx) => {
        if (!ctx.modal) return;
        return lockScroll();
      },

      // Close on pointerdown outside content + trigger.
      // Reads ctx.contentEl / ctx.triggerEl at event time (set by ref callbacks).
      watchOutside: (ctx, { send }) => {
        if (!ctx.closeOnInteractOutside) return;
        function onPointerDown(e: PointerEvent) {
          const target = e.target as Node;
          if (!ctx.contentEl?.contains(target) && !ctx.triggerEl?.contains(target)) {
            send("INTERACT_OUTSIDE");
          }
        }
        document.addEventListener("pointerdown", onPointerDown, true);
        return () => document.removeEventListener("pointerdown", onPointerDown, true);
      },
    },
  });
}
