import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import { connectDialog } from "@forge-ui/dialog";
import type { DialogContentCallbacks, DialogContext, DialogEvent, DialogState } from "@forge-ui/dialog";

export type { DialogContentCallbacks as AlertDialogContentCallbacks };

export type AlertDialogApi = ReturnType<typeof connectAlertDialog>;

/**
 * Maps an alert-dialog machine snapshot → framework-agnostic DOM props.
 *
 * Differences from connectDialog:
 * - data-forge-scope is "alert-dialog" on all parts
 * - getCancelProps() replaces getCloseProps() — semantically "dismiss without acting"
 * - getActionProps() — the destructive/confirm action button (does NOT auto-close)
 * - getCloseProps() is omitted from the public surface
 */
export function connectAlertDialog(
  snapshot: MachineSnapshot<DialogContext, DialogState>,
  send: (event: DialogEvent | DialogEvent["type"]) => void,
  machine: Pick<MachineInstance<DialogContext, DialogState, DialogEvent>, "setContext">,
) {
  const base = connectDialog(snapshot, send, machine);
  const scope = "alert-dialog" as const;

  return {
    isOpen: base.isOpen,
    titleRegistered: base.titleRegistered,
    descriptionRegistered: base.descriptionRegistered,

    getTriggerProps: () => ({
      ...base.getTriggerProps(),
      "data-forge-scope": scope,
    }),

    getOverlayProps: () => ({
      ...base.getOverlayProps(),
      "data-forge-scope": scope,
    }),

    getContentProps: () => ({
      ...base.getContentProps(),
      "data-forge-scope": scope,
    }),

    getTitleProps: () => ({
      ...base.getTitleProps(),
      "data-forge-scope": scope,
    }),

    getDescriptionProps: () => ({
      ...base.getDescriptionProps(),
      "data-forge-scope": scope,
    }),

    /** Closes the alert dialog — semantically "cancel without acting". */
    getCancelProps: () => ({
      ...base.getCloseProps(),
      "data-forge-scope": scope,
      "data-forge-part": "cancel" as const,
    }),

    /**
     * The destructive / confirm action button.
     * Does NOT close the dialog automatically — the caller decides whether to
     * close after a successful async action (e.g. API call) or leave open on error.
     */
    getActionProps: () => ({
      type: "button" as const,
      "data-forge-scope": scope,
      "data-forge-part": "action" as const,
    }),

    setContentCallbacks: base.setContentCallbacks,
  };
}
