import { arrow, autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/dom";
import type { ActivityFn } from "@forge-ui/core";
import type { PopoverContext } from "./popover.types.js";

/**
 * Computes and continuously updates the popover position using @floating-ui/dom.
 * Uses autoUpdate to re-compute on scroll, resize, and reference mutations.
 * Calls notify() (not send()) to push new x/y/placement into context without
 * dispatching a state transition.
 */
export const makeComputePositionActivity = (): ActivityFn<PopoverContext> => {
  return (ctx, { notify }) => {
    if (typeof document === "undefined") return;

    function getReference(): HTMLElement | null {
      return ctx.anchorEl ?? ctx.triggerEl;
    }

    function update(): void {
      const reference = getReference();
      const floating = ctx.contentEl;
      if (!reference || !floating) return;

      const {
        placement,
        strategy,
        offset: offsetValue,
        middleware: extraMiddleware,
      } = ctx.positioning;

      const middleware = [
        offset(offsetValue),
        flip(),
        shift({ padding: 8 }),
        ...(ctx.arrowEl ? [arrow({ element: ctx.arrowEl })] : []),
        ...(extraMiddleware ?? []),
      ];

      computePosition(reference, floating, { placement, strategy, middleware }).then((result) => {
        ctx.x = result.x;
        ctx.y = result.y;
        ctx.currentPlacement = result.placement;

        // Update arrow position if present.
        if (ctx.arrowEl && result.middlewareData.arrow) {
          const { x: ax, y: ay } = result.middlewareData.arrow;
          if (ax != null) ctx.arrowEl.style.left = `${ax}px`;
          if (ay != null) ctx.arrowEl.style.top = `${ay}px`;
        }

        notify();
      });
    }

    const reference = getReference();
    const floating = ctx.contentEl;
    if (!reference || !floating) return;

    const cleanup = autoUpdate(reference, floating, update);
    update();

    return cleanup;
  };
};
