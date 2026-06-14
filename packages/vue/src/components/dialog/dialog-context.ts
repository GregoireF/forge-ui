import type { InjectionKey } from "vue";
import type { useDialog } from "./use-dialog.js";

export type DialogReturn = ReturnType<typeof useDialog>;
export const dialogKey: InjectionKey<DialogReturn> = Symbol("forge-dialog");
