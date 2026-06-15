import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import { updateLayerContentEl } from "@forge-ui/core";
import type { DialogContext, DialogEvent, DialogSend, DialogState } from "./dialog.types.js";

export type DialogApi = ReturnType<typeof connectDialog>;

/** Callbacks that can be provided on Dialog.Content to override Root-level ones. */
export interface DialogContentCallbacks {
  onOpenAutoFocus?: ((e: Event) => void) | undefined;
  onCloseAutoFocus?: ((e: Event) => void) | undefined;
  onPointerDownOutside?: ((e: PointerEvent) => void) | undefined;
  onFocusOutside?: ((e: FocusEvent) => void) | undefined;
  onInteractOutside?: ((e: PointerEvent | FocusEvent) => void) | undefined;
  onEscapeKeyDown?: ((e: KeyboardEvent) => void) | undefined;
}

/**
 * Maps machine snapshot → framework-agnostic DOM props.
 *
 * - getTriggerProps / getContentProps include a `ref` callback to set DOM refs.
 * - Escape + Tab + interact-outside are handled by machine activities.
 * - data-forge-scope="dialog" on every part enables precise CSS scoping.
 * - aria-labelledby / aria-describedby are conditional on presence registration.
 * - setContentCallbacks allows Dialog.Content to override Root-level event callbacks.
 */
export function connectDialog(
  snapshot: MachineSnapshot<DialogContext, DialogState>,
  send: DialogSend,
  machine: Pick<MachineInstance<DialogContext, DialogState, DialogEvent>, "setContext">,
) {
  const { context } = snapshot;
  const isOpen = snapshot.matches("open");
  const state = isOpen ? "open" : "closed";

  return {
    isOpen,

    getTriggerProps() {
      return {
        id: context.triggerId,
        type: "button" as const,
        "aria-expanded": isOpen,
        "aria-controls": context.contentId,
        // aria-haspopup must match the role of the popup (dialog or alertdialog).
        "aria-haspopup": context.role,
        "data-state": state,
        "data-forge-scope": "dialog",
        "data-forge-part": "trigger",
        ref: (el: unknown) => machine.setContext({ triggerEl: el as HTMLElement | null }),
        onClick() {
          send("TOGGLE");
        },
      };
    },

    getOverlayProps() {
      return {
        "aria-hidden": true as const,
        tabIndex: -1,
        "data-state": state,
        "data-forge-scope": "dialog",
        "data-forge-part": "overlay",
      };
    },

    getContentProps() {
      return {
        id: context.contentId,
        role: context.role,
        "aria-modal": context.modal,
        // Only emit when the corresponding part is actually mounted to avoid
        // dangling ARIA references that screen readers announce as empty.
        ...(context.titleRegistered && { "aria-labelledby": context.titleId }),
        ...(context.descriptionRegistered && { "aria-describedby": context.descriptionId }),
        tabIndex: -1,
        "data-state": state,
        "data-forge-scope": "dialog",
        "data-forge-part": "content",
        ref: (el: unknown) => {
          const contentEl = el as HTMLElement | null;
          machine.setContext({ contentEl });
          updateLayerContentEl(context.id, contentEl);
        },
      };
    },

    getTitleProps() {
      return {
        id: context.titleId,
        "data-forge-scope": "dialog",
        "data-forge-part": "title",
      };
    },

    getDescriptionProps() {
      return {
        id: context.descriptionId,
        "data-forge-scope": "dialog",
        "data-forge-part": "description",
      };
    },

    getCloseProps() {
      return {
        type: "button" as const,
        "data-forge-scope": "dialog",
        "data-forge-part": "close",
        onClick() {
          send("CLOSE");
        },
      };
    },

    /**
     * Override event callbacks from Dialog.Content.
     * Content-level callbacks take precedence over Root-level ones (set via machine options).
     * Pass an empty object or call with no-ops to clear overrides.
     */
    setContentCallbacks(callbacks: DialogContentCallbacks) {
      machine.setContext({
        contentOnOpenAutoFocus: callbacks.onOpenAutoFocus,
        contentOnCloseAutoFocus: callbacks.onCloseAutoFocus,
        contentOnPointerDownOutside: callbacks.onPointerDownOutside,
        contentOnFocusOutside: callbacks.onFocusOutside,
        contentOnInteractOutside: callbacks.onInteractOutside,
        contentOnEscapeKeyDown: callbacks.onEscapeKeyDown,
      });
    },
  };
}
