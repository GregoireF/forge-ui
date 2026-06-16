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

    // Reset immediately so the positioner is opacity:0 on the very first
    // render after open — happens before emit() so the snapshot is correct.
    ctx.positioned = false;

    function getReference(): HTMLElement | null {
      return ctx.anchorEl ?? ctx.triggerEl ?? null;
    }

    // Guards stale computePosition callbacks that outlive this activity.
    // Without this, a promise from open#N can resolve after close and set
    // ctx.positioned = true, so open#(N+1) renders without opacity:0 at (0,0).
    let active = true;
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
        if (!active) return;

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

        if (!positioned) {
          positioned = true;
          ctx.positioned = true;
          // Reveal the positioner directly — bypasses React/Vue render timing.
          // Position is now correct so removing opacity is safe here.
          const positionerEl = floating.parentElement;
          if (positionerEl) {
            positionerEl.style.opacity = "";
            positionerEl.style.pointerEvents = "";
          }
        }

        notify();
      });
    }

    let autoUpdateCleanup: (() => void) | undefined;
    let rafId = -1;

    // Retry RAF: framework rendering (React Portal, Vue Teleport) may commit the
    // floating element asynchronously after the machine transition. If contentEl
    // is null on the first frame, keep retrying each frame until it appears.
    // The cleanup below always cancels the last scheduled rafId so we never leak.
    function scheduleSetup() {
      rafId = requestAnimationFrame(() => {
        if (!active) return;
        const reference = getReference();
        const floating = ctx.contentEl;
        if (!reference || !floating) {
          scheduleSetup(); // contentEl not mounted yet — try next frame
          return;
        }

        // Hide the positioner directly before computePosition runs. This is
        // synchronous and fires pre-paint (RAF is a pre-paint hook), so the
        // element can never flash at (0,0) regardless of React/Vue render timing.
        // The declarative opacity:0 in getPositionerProps is a belt-and-suspenders
        // backup; this direct DOM write is the authoritative hide.
        const positionerEl = floating.parentElement;
        if (positionerEl) {
          positionerEl.style.opacity = "0";
          positionerEl.style.pointerEvents = "none";
        }

        if (!ctx.positioning.disableAutoUpdate) {
          // autoUpdate calls runUpdate immediately on setup — no second call needed.
          autoUpdateCleanup = autoUpdate(reference, floating, runUpdate);
        } else {
          runUpdate();
        }
      });
    }

    scheduleSetup();

    return () => {
      active = false;
      cancelAnimationFrame(rafId);
      autoUpdateCleanup?.();
      ctx.positioned = false;
    };
  };
}
