import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import { getAlignFromPlacement, getSideFromPlacement } from "@forge-ui/floating";
import type {
  HoverCardContext,
  HoverCardEvent,
  HoverCardSend,
  HoverCardState,
} from "./hover-card.types.js";

export type HoverCardApi = ReturnType<typeof connectHoverCard>;

/**
 * Maps machine snapshot → framework-agnostic DOM props.
 *
 * Timer scheduling (open/close delays) is handled here in connect rather than
 * in the machine FSM — timers are mutable context fields (`_openTimerId`,
 * `_closeTimerId`), keeping this fully within the 3-tier law with no exceptions.
 *
 * Content gets role="dialog" and mouse enter/leave handlers so hovering over
 * the content panel keeps the card open.
 */
export function connectHoverCard(
  snapshot: MachineSnapshot<HoverCardContext, HoverCardState>,
  send: HoverCardSend,
  machine: Pick<MachineInstance<HoverCardContext, HoverCardState, HoverCardEvent>, "setContext">,
) {
  const { context } = snapshot;
  const isOpen = snapshot.matches("open", "closing");
  const state = isOpen ? "open" : "closed";

  const side = getSideFromPlacement(
    context.currentPlacement as Parameters<typeof getSideFromPlacement>[0],
  );
  const align = getAlignFromPlacement(
    context.currentPlacement as Parameters<typeof getAlignFromPlacement>[0],
  );

  function scheduleOpen(): void {
    clearTimeout(context._closeTimerId);
    context._closeTimerId = undefined;
    context._openTimerId = setTimeout(() => {
      context._openTimerId = undefined;
      send({ type: "OPEN_TIMEOUT" });
    }, context.openDelay);
  }

  function scheduleClose(): void {
    clearTimeout(context._openTimerId);
    context._openTimerId = undefined;
    context._closeTimerId = setTimeout(() => {
      context._closeTimerId = undefined;
      send({ type: "CLOSE_TIMEOUT" });
    }, context.closeDelay);
  }

  return {
    isOpen,

    getTriggerProps() {
      return {
        id: context.triggerId,
        "aria-haspopup": "dialog" as const,
        "aria-expanded": isOpen,
        "aria-controls": context.contentId,
        "data-state": state,
        "data-forge-scope": "hover-card",
        "data-forge-part": "trigger",
        ref: (el: unknown) => machine.setContext({ triggerEl: el as HTMLElement | null }),
        onMouseEnter() {
          send({ type: "MOUSE_ENTER" });
          scheduleOpen();
        },
        onMouseLeave() {
          send({ type: "MOUSE_LEAVE" });
          scheduleClose();
        },
        onFocus() {
          clearTimeout(context._openTimerId);
          context._openTimerId = undefined;
          send({ type: "FOCUS" });
        },
        onBlur() {
          send({ type: "BLUR" });
        },
      };
    },

    getPositionerProps() {
      return {
        style: {
          position: context.positioning.strategy,
          top: `${context.y}px`,
          left: `${context.x}px`,
          width: "max-content",
          opacity: "var(--forge-revealed, 0)" as unknown as number,
          // Only block pointer events when card is fully closed.
          // During open/closing the positioner must be interactive so
          // hover-on-content can cancel the close timer.
          ...(!isOpen && { pointerEvents: "none" as const }),
        },
        "data-forge-scope": "hover-card",
        "data-forge-part": "positioner",
        "data-side": side,
        "data-align": align,
        "data-placement": context.currentPlacement,
      };
    },

    getContentProps() {
      return {
        id: context.contentId,
        role: "dialog" as const,
        "data-state": state,
        "data-forge-scope": "hover-card",
        "data-forge-part": "content",
        "data-side": side,
        "data-align": align,
        "data-placement": context.currentPlacement,
        ref: (el: unknown) => machine.setContext({ contentEl: el as HTMLElement | null }),
        onMouseEnter() {
          // Cancel any pending close timer when hovering over the content panel.
          // This keeps the card open while the user interacts with the content.
          send({ type: "MOUSE_ENTER" });
          clearTimeout(context._closeTimerId);
          context._closeTimerId = undefined;
        },
        onMouseLeave() {
          send({ type: "MOUSE_LEAVE" });
          scheduleClose();
        },
      };
    },

    getArrowProps() {
      return {
        "data-forge-scope": "hover-card",
        "data-forge-part": "arrow",
        "data-side": side,
        ref: (el: unknown) => machine.setContext({ arrowEl: el as Element | null }),
      };
    },
  };
}
