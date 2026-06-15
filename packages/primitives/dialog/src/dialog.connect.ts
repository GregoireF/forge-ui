import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import type { DialogContext, DialogEvent, DialogSend, DialogState } from "./dialog.types.js";

export type DialogApi = ReturnType<typeof connectDialog>;

/**
 * Maps machine snapshot → framework-agnostic DOM props.
 *
 * - getTriggerProps / getContentProps include a `ref` callback to set DOM refs.
 * - Escape + Tab + interact-outside are handled by machine activities.
 * - data-forge-scope="dialog" on every part enables precise CSS scoping.
 * - aria-labelledby / aria-describedby are conditional on presence registration.
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

    /** @deprecated Use getOverlayProps() — renamed for consistency with compound parts */
    getBackdropProps() {
      return this.getOverlayProps();
    },

    getContentProps() {
      return {
        id: context.contentId,
        role: context.role,
        "aria-modal": context.modal,
        "aria-labelledby": context.titleId,
        "aria-describedby": context.descriptionId,
        tabIndex: -1,
        "data-state": state,
        "data-forge-scope": "dialog",
        "data-forge-part": "content",
        ref: (el: unknown) => machine.setContext({ contentEl: el as HTMLElement | null }),
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
        "aria-label": "Close dialog",
        "data-forge-scope": "dialog",
        "data-forge-part": "close",
        onClick() {
          send("CLOSE");
        },
      };
    },
  };
}
