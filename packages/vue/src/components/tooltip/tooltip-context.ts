import type { InjectionKey } from "vue";
import type { useTooltip } from "./use-tooltip.js";

export type TooltipApi = ReturnType<typeof useTooltip>;

export const tooltipKey = Symbol("forge-tooltip") as InjectionKey<TooltipApi>;
