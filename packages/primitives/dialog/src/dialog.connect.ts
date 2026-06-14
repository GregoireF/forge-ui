import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import type { DialogContext, DialogEvent, DialogSend, DialogState } from "./dialog.types.js";

export type DialogApi = ReturnType<typeof connectDialog>;

/**
 * Maps machine snapshot → framework-agnostic DOM props.
 *
 * Key differences from the old connect:
 * - getTriggerProps / getContentProps include a `ref` callback that sets
 *   ctx.triggerEl / ctx.contentEl on the machine (used by activities).
 * - No onKeyDown on content — Escape + Tab are handled by machine activities.
 * - No onClick on backdrop — interact-outside is handled by the watchOutside activity.
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
        "aria-haspopup": "dialog" as const,
        "data-state": state,
        "data-forge-part": "trigger",
        ref: (el: unknown) => machine.setContext({ triggerEl: el as HTMLElement | null }),
        onClick() {
          send("TOGGLE");
        },
      };
    },

    getBackdropProps() {
      return {
        "aria-hidden": true as const,
        tabIndex: -1,
        "data-state": state,
        "data-forge-part": "backdrop",
      };
    },

    getContentProps() {
      return {
        id: context.contentId,
        role: "dialog" as const,
        "aria-modal": context.modal,
        "aria-labelledby": context.titleId,
        "aria-describedby": context.descriptionId,
        tabIndex: -1,
        "data-state": state,
        "data-forge-part": "content",
        ref: (el: unknown) => machine.setContext({ contentEl: el as HTMLElement | null }),
      };
    },

    getTitleProps() {
      return { id: context.titleId, "data-forge-part": "title" };
    },

    getDescriptionProps() {
      return { id: context.descriptionId, "data-forge-part": "description" };
    },

    getCloseProps() {
      return {
        type: "button" as const,
        "aria-label": "Close dialog",
        "data-forge-part": "close",
        onClick() {
          send("CLOSE");
        },
      };
    },
  };
}
