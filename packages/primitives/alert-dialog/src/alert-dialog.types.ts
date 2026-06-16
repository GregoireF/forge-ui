import type { CreateDialogMachineOptions } from "@forge-ui/dialog";

/**
 * Options for createAlertDialogMachine.
 * Identical to CreateDialogMachineOptions except:
 * - role is always "alertdialog" (not configurable)
 * - Interaction-outside / Escape callbacks are informational — the alert dialog
 *   always blocks close from these events regardless of what the callbacks do.
 */
export type CreateAlertDialogMachineOptions = Omit<CreateDialogMachineOptions, "role">;
