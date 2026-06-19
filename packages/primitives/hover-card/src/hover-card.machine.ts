import { createMachine } from "@forge-ui/core";
import type { FloatingPositioning, ResolvedFloatingPositioning } from "@forge-ui/floating";
import { makeComputePositionActivity } from "@forge-ui/floating";
import type { HoverCardContext, HoverCardEvent, HoverCardState } from "./hover-card.types.js";

export interface CreateHoverCardMachineOptions {
  id: string;
  openDelay?: number;
  closeDelay?: number;
  positioning?: FloatingPositioning;
  onOpenChange?: (open: boolean) => void;
}

function invokeOnOpenChange(open: boolean) {
  return function action({ context }: { context: HoverCardContext }) {
    context.isOpen = open;
    context.onOpenChange?.(open);
  };
}

const computePosition = makeComputePositionActivity<HoverCardContext>();

export function createHoverCardMachine(options: CreateHoverCardMachineOptions) {
  const { id } = options;
  const pos = options.positioning ?? {};

  const resolvedPositioning: ResolvedFloatingPositioning = {
    placement: pos.placement ?? "bottom",
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
  };

  return createMachine<HoverCardContext, HoverCardState, HoverCardEvent>({
    id: `forge-hover-card:${id}`,
    context: {
      id,
      openDelay: options.openDelay ?? 700,
      closeDelay: options.closeDelay ?? 300,
      isOpen: false,
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
      currentPlacement: pos.placement ?? "bottom",
      positioning: resolvedPositioning,
      triggerEl: null,
      contentEl: null,
      arrowEl: null,
      x: 0,
      y: 0,
      positioned: false,
      _openTimerId: undefined,
      _closeTimerId: undefined,
      ...(options.onOpenChange !== undefined && { onOpenChange: options.onOpenChange }),
    },
    initial: "idle",

    states: {
      idle: {
        tags: ["closed"],
        on: {
          MOUSE_ENTER: { target: "opening" },
          FOCUS: { target: "open", actions: [invokeOnOpenChange(true)] },
        },
      },
      opening: {
        tags: ["closed"],
        on: {
          MOUSE_LEAVE: { target: "idle" },
          OPEN_TIMEOUT: { target: "open", actions: [invokeOnOpenChange(true)] },
        },
      },
      open: {
        tags: ["open"],
        activities: ["computePosition"],
        on: {
          MOUSE_LEAVE: { target: "closing" },
          BLUR: { target: "idle", actions: [invokeOnOpenChange(false)] },
        },
      },
      closing: {
        tags: ["open"],
        activities: ["computePosition"],
        on: {
          MOUSE_ENTER: { target: "open" },
          CLOSE_TIMEOUT: { target: "idle", actions: [invokeOnOpenChange(false)] },
        },
      },
    },

    activities: { computePosition },
  });
}

export type { CreateHoverCardMachineOptions as HoverCardMachineOptions };
