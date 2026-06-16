import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  hide,
  offset,
  shift,
  size,
} from "@floating-ui/dom";
import type { ActivityFn } from "@forge-ui/core";
import type { ResolvedFloatingPositioning } from "./types.js";
import { getAlignFromPlacement, getSideFromPlacement, getTransformOrigin } from "./types.js";

// ---------------------------------------------------------------------------
// FloatingContext — minimal interface that makeComputePositionActivity requires.
// Consuming machine contexts (PopoverContext, TooltipContext…) must implement
// these fields. Using a structural interface keeps the factory generic.
// ---------------------------------------------------------------------------

export interface FloatingContext {
  x: number;
  y: number;
  /** True after the first computePosition resolves. Used by connects to hide positioner until positioned. */
  positioned: boolean;
  currentPlacement: import("@floating-ui/dom").Placement;
  positioning: ResolvedFloatingPositioning;
  contentEl: HTMLElement | null;
  arrowEl: HTMLElement | null;
  /** Primary reference element (anchor override when provided). */
  anchorEl?: HTMLElement | null;
  /** Fallback reference (trigger). */
  triggerEl?: HTMLElement | null;
}

// ---------------------------------------------------------------------------
// makeComputePositionActivity
//
// Uses requestAnimationFrame to defer setup until after the framework
// (React/Vue) has rendered the floating content element and the ref
// callback has fired — at that point ctx.contentEl is guaranteed non-null.
// ---------------------------------------------------------------------------

export function makeComputePositionActivity<
  TContext extends FloatingContext & object,
>(): ActivityFn<TContext> {
  return (ctx, { notify }) => {
    if (typeof document === "undefined") return;

    function getReference(): HTMLElement | null {
      return ctx.anchorEl ?? ctx.triggerEl ?? null;
    }

    let positioned = false;

    function runUpdate(): void {
      const reference = getReference();
      const floating = ctx.contentEl;
      if (!reference || !floating) return;

      const {
        placement,
        strategy,
        offset: offsetValue,
        alignOffset,
        shiftPadding,
        sameWidth,
        avoidCollisions,
        boundary,
        hideWhenDetached,
        middleware: extraMiddleware,
      } = ctx.positioning;

      const middleware = [
        offset({ mainAxis: offsetValue, crossAxis: alignOffset }),
        ...(avoidCollisions
          ? [
              flip({ ...(boundary !== undefined && { boundary }) }),
              shift({
                padding: shiftPadding,
                ...(boundary !== undefined && { boundary }),
              }),
            ]
          : []),
        // sameWidth: match floating width to reference width.
        ...(sameWidth
          ? [
              size({
                apply({ rects, elements }) {
                  elements.floating.style.width = `${rects.reference.width}px`;
                },
                ...(boundary !== undefined && { boundary }),
              }),
            ]
          : []),
        // hide: expose data-hidden when reference scrolls out of boundary.
        ...(hideWhenDetached ? [hide({ strategy: "referenceHidden" })] : []),
        // arrow: only if arrowEl is set.
        ...(ctx.arrowEl ? [arrow({ element: ctx.arrowEl })] : []),
        // escape hatch: consumer-provided middleware appended last.
        ...(extraMiddleware ?? []),
      ];

      computePosition(reference, floating, { placement, strategy, middleware }).then((result) => {
        ctx.x = result.x;
        ctx.y = result.y;
        ctx.currentPlacement = result.placement;

        // Arrow position.
        if (ctx.arrowEl && result.middlewareData.arrow) {
          const { x: ax, y: ay } = result.middlewareData.arrow;
          if (ax != null) ctx.arrowEl.style.left = `${ax}px`;
          if (ay != null) ctx.arrowEl.style.top = `${ay}px`;
        }

        // data-hidden for hideWhenDetached.
        if (hideWhenDetached) {
          const hidden = result.middlewareData.hide?.referenceHidden ?? false;
          floating.dataset.hidden = String(hidden);
        }

        // CSS var for transform-origin (animation anchor point).
        floating.style.setProperty(
          "--forge-floating-transform-origin",
          getTransformOrigin(result.placement),
        );

        // data-side / data-align / data-placement.
        floating.dataset.side = getSideFromPlacement(result.placement);
        floating.dataset.align = getAlignFromPlacement(result.placement);
        floating.dataset.placement = result.placement;

        // Signal to connects/components that a real position is available.
        // getPositionerProps() hides the positioner while !ctx.positioned so
        // the first frame never shows the element at (0, 0).
        if (!positioned) {
          positioned = true;
          ctx.positioned = true;
        }

        notify();
      });
    }

    let autoUpdateCleanup: (() => void) | undefined;

    // Defer setup until after the framework has rendered the floating element
    // and the ref callback has fired (contentEl becomes non-null).
    // This matches the pattern used by makeFocusActivity.
    const raf = requestAnimationFrame(() => {
      const reference = getReference();
      const floating = ctx.contentEl;
      if (!reference || !floating) return;

      if (!ctx.positioning.disableAutoUpdate) {
        autoUpdateCleanup = autoUpdate(reference, floating, runUpdate);
        runUpdate();
      } else {
        runUpdate();
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      autoUpdateCleanup?.();
      // Reset so next open starts hidden again until position is computed.
      ctx.positioned = false;
    };
  };
}
