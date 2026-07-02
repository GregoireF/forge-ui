import { type MachineSnapshot, updateLayerContentEl } from "@forge-ui/core";
import type { DialogContentCallbacks, DialogContext, DialogSend, DialogState } from "./dialog.types.js";

export type DialogApi = ReturnType<typeof connectDialog>;

/**
 * Maps machine snapshot → framework-agnostic DOM props.
 *
 * - getTriggerProps / getContentProps include a `ref` callback to set DOM refs.
 * - Escape + Tab + interact-outside are handled by machine activities.
 * - data-forge-scope="dialog" on every part enables precise CSS scoping.
 * - aria-labelledby / aria-describedby are conditional on presence registration.
 * - setContentCallbacks allows Dialog.Content to override Root-level event callbacks.
 *
 * @param snapshot  Current machine snapshot (read-only).
 * @param send      Dispatch a DialogEvent to the machine.
 * @param setContext Mutate machine context in-place (does not emit). Used for DOM refs
 *                  and content-level callback overrides.
 */
export function connectDialog(
  snapshot: MachineSnapshot<DialogContext, DialogState>,
  send: DialogSend,
  setContext: (updates: Partial<DialogContext>) => void,
) {
  const { context } = snapshot;
  const isOpen = snapshot.matches("open");
  const state = isOpen ? "open" : "closed";

  return {
    isOpen,
    titleRegistered: context.titleRegistered,
    descriptionRegistered: context.descriptionRegistered,

    getTriggerProps() {
      return {
        id: context.triggerId,
        type: "button" as const,
        "aria-expanded": isOpen,
        "aria-controls": context.contentId,
        // aria-haspopup: cast to "dialog" — @types/react omits "alertdialog" from the union
        // even though WAI-ARIA 1.2 lists it. Semantically equivalent for browser AT.
        "aria-haspopup": context.role as "dialog",
        "data-state": state,
        "data-forge-scope": "dialog",
        "data-forge-part": "trigger",
        ref: (el: unknown) => setContext({ triggerEl: el as HTMLElement | null }),
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
          setContext({ contentEl });
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
     * Content-level callbacks take precedence over Root-level ones.
     * Call with an empty object to clear all overrides (on Content unmount).
     */
    setContentCallbacks(callbacks: DialogContentCallbacks) {
      setContext({ contentCallbacks: callbacks });
    },
  };
}
