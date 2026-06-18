import type { TooltipProviderContext } from "@forge-ui/tooltip";
import { createContext, useContext } from "react";

export const TooltipProviderCtx = createContext<TooltipProviderContext | null>(null);

export function useTooltipProvider(): TooltipProviderContext | null {
  return useContext(TooltipProviderCtx);
}
