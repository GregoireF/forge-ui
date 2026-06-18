import { createMachine } from "@forge-ui/core";
import type { FloatingPositioning } from "@forge-ui/floating";
import { makeComputePositionActivity } from "@forge-ui/floating";
import type { TooltipContext, TooltipEvent, TooltipState } from "./tooltip.types.js";

export interface CreateTooltipMachineOptions {
  id: string;
  open?: boolean;
  disabled?: boolean;
  interactive?: boolean;
  closeOnPointerDown?: boolean;
  openDelay?: number;
  closeDelay?: number;
  positioning?: FloatingPositioning;
  onOpenChange?: (open: boolean) => void;
}

function invokeOnOpenChange(open: boolean) {
  return function action({ context }: { context: TooltipContext }) {
    context.onOpenChange?.(open);
  };
}

const computePosition = makeComputePositionActivity<TooltipContext>();

export function createTooltipMachine(options: CreateTooltipMachineOptions) {
  const { id } = options;
  const pos = options.positioning ?? {};

  return createMachine<TooltipContext, TooltipState, TooltipEvent>({
    id: `forge-tooltip:${id}`,
    context: {
      id,
      open: options.open ?? false,
      disabled: options.disabled ?? false,
      interactive: options.interactive ?? false,
      closeOnPointerDown: options.closeOnPointerDown ?? true,
      openDelay: options.openDelay ?? 700,
      closeDelay: options.closeDelay ?? 300,
      contentId: `${id}-content`,
      triggerEl: null,
      contentEl: null,
      arrowEl: null,
      x: 0,
      y: 0,
      positioned: false,
      currentPlacement: pos.placement ?? "top",
      positioning: {
        placement: pos.placement ?? "top",
        strategy: pos.strategy ?? "fixed",
        offset: pos.offset ?? 8,
        alignOffset: pos.alignOffset ?? 0,
        shiftPadding: pos.shiftPadding ?? 8,
        sameWidth: pos.sameWidth ?? false,
        avoidCollisions: pos.avoidCollisions ?? true,
        hideWhenDetached: pos.hideWhenDetached ?? false,
        disableAutoUpdate: pos.disableAutoUpdate ?? false,
        ...(pos.boundary !== undefined && { boundary: pos.boundary }),
        ...(pos.middleware !== undefined && { middleware: pos.middleware }),
      },
      _openTimerId: undefined,
      _closeTimerId: undefined,
      ...(options.onOpenChange !== undefined && { onOpenChange: options.onOpenChange }),
    },
    initial: options.open ? "open" : "closed",

    states: {
      closed: {
        tags: ["closed"],
        on: {
          OPEN: { target: "open", actions: [invokeOnOpenChange(true)] },
        },
      },
      open: {
        tags: ["open"],
        activities: ["computePosition"],
        on: {
          CLOSE: { target: "closed", actions: [invokeOnOpenChange(false)] },
        },
      },
    },

    activities: { computePosition },
  });
}
