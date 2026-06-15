import type { InjectionKey } from "vue";
import type { usePopover } from "./use-popover.js";

export type PopoverReturn = ReturnType<typeof usePopover>;
export const popoverKey: InjectionKey<PopoverReturn> = Symbol("forge-popover");
