import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import { getAlignFromPlacement, getSideFromPlacement } from "@forge-ui/floating";
import type { TooltipContext, TooltipEvent, TooltipSend, TooltipState } from "./tooltip.types.js";

export type TooltipApi = ReturnType<typeof connectTooltip>;

/**
 * Maps machine snapshot → framework-agnostic DOM props.
 *
 * Timer scheduling (open/close delays) is handled here in connect rather than
 * in the machine FSM — timers are mutable context fields (`_openTimerId`,
 * `_closeTimerId`), keeping this fully within the 3-tier law with no exceptions.
 *
 * Positioner is INTERNAL — rendered by the framework's Content component.
 * Provider callbacks (`_isInQuickSuccession`, `_notifyOpen`, `_notifyClose`) are
 * set into mutable context by the framework hook (useTooltip) at mount time.
 */
export function connectTooltip(
  snapshot: MachineSnapshot<TooltipContext, TooltipState>,
  send: TooltipSend,
  machine: Pick<MachineInstance<TooltipContext, TooltipState, TooltipEvent>, "setContext">,
) {
  const { context } = snapshot;
  const isOpen = snapshot.matches("open");
  const state = isOpen ? "open" : "closed";

  const side = getSideFromPlacement(context.currentPlacement);
  const align = getAlignFromPlacement(context.currentPlacement);

  function scheduleOpen(): void {
    if (context.disabled) return;
    clearTimeout(context._closeTimerId);
    context._closeTimerId = undefined;
    const delay = context._isInQuickSuccession?.() ? 0 : context.openDelay;
    context._openTimerId = setTimeout(() => {
      context._openTimerId = undefined;
      send("OPEN");
      context._notifyOpen?.();
    }, delay);
  }

  function scheduleClose(): void {
    clearTimeout(context._openTimerId);
    context._openTimerId = undefined;
    context._closeTimerId = setTimeout(() => {
      context._closeTimerId = undefined;
      send("CLOSE");
      context._notifyClose?.();
    }, context.closeDelay);
  }

  return {
    isOpen,

    getTriggerProps() {
      return {
        // WAI-ARIA §4.2.5: omit aria-describedby when disabled — content is never revealed
        "aria-describedby": context.disabled ? undefined : context.contentId,
        "data-state": state,
        "data-disabled": context.disabled || undefined,
        "data-forge-scope": "tooltip",
        "data-forge-part": "trigger",
        ref: (el: unknown) => machine.setContext({ triggerEl: el as HTMLElement | null }),
        onPointerEnter(e: { pointerType: string }) {
          if (e.pointerType === "touch") return;
          scheduleOpen();
        },
        onPointerLeave() {
          scheduleClose();
        },
        onFocus() {
          scheduleOpen();
        },
        onBlur() {
          scheduleClose();
        },
        onKeyDown(e: { key: string }) {
          if (e.key === "Escape" && isOpen) {
            clearTimeout(context._openTimerId);
            context._openTimerId = undefined;
            send("CLOSE");
            context._notifyClose?.();
          }
        },
        ...(context.closeOnPointerDown && {
          onPointerDown() {
            clearTimeout(context._openTimerId);
            context._openTimerId = undefined;
            if (isOpen) {
              send("CLOSE");
              context._notifyClose?.();
            }
          },
        }),
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
          pointerEvents: "none" as const,
        },
        "data-forge-scope": "tooltip",
        "data-forge-part": "positioner",
        "data-side": side,
        "data-align": align,
        "data-placement": context.currentPlacement,
      };
    },

    getContentProps() {
      return {
        id: context.contentId,
        role: "tooltip" as const,
        "data-state": state,
        "data-forge-scope": "tooltip",
        "data-forge-part": "content",
        "data-side": side,
        "data-align": align,
        "data-placement": context.currentPlacement,
        ref: (el: unknown) => machine.setContext({ contentEl: el as HTMLElement | null }),
        ...(context.interactive && {
          onPointerEnter() {
            scheduleOpen();
          },
          onPointerLeave() {
            scheduleClose();
          },
        }),
      };
    },

    /** Positions the tooltip relative to a different element than the trigger.
     *  When rendered, computePosition uses anchorEl as the reference instead of triggerEl. */
    getAnchorProps() {
      return {
        "data-forge-scope": "tooltip",
        "data-forge-part": "anchor",
        ref: (el: unknown) => machine.setContext({ anchorEl: el as HTMLElement | null }),
      };
    },

    getArrowProps() {
      return {
        "data-forge-scope": "tooltip",
        "data-forge-part": "arrow",
        "data-side": side,
        ref: (el: unknown) => machine.setContext({ arrowEl: el as Element | null }),
      };
    },

    getArrowTipProps() {
      return {
        "data-forge-scope": "tooltip",
        "data-forge-part": "arrow-tip",
      };
    },
  };
}
