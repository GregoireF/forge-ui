import type { InjectionKey } from "vue";
import type { useSelect } from "./use-select.js";

export type SelectReturn = ReturnType<typeof useSelect>;
export const selectKey: InjectionKey<SelectReturn> = Symbol("forge-select");
