import type { TooltipProviderContext } from "@forge-ui/tooltip";
import type { InjectionKey } from "vue";

export const tooltipProviderKey = Symbol(
  "forge-tooltip-provider",
) as InjectionKey<TooltipProviderContext>;
