import type { InjectionKey } from "vue";
import type { UseComboboxReturn } from "./use-combobox.js";

export const comboboxKey: InjectionKey<UseComboboxReturn> = Symbol("forge-combobox");
