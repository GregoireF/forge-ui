import type { InjectionKey } from "vue";
import type { useAlertDialog } from "./use-alert-dialog.js";

export type AlertDialogReturn = ReturnType<typeof useAlertDialog>;
export const alertDialogKey: InjectionKey<AlertDialogReturn> = Symbol("forge-alert-dialog");
