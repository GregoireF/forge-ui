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
  arrowEl: Element | null;
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

    // Reset immediately so the positioner is hidden on the very first render
    // after open — happens before emit() so the snapshot is correct.
    ctx.positioned = false;

    function getReference(): HTMLElement | null {
      return ctx.anchorEl ?? ctx.triggerEl ?? null;
    }

    // Guards stale computePosition callbacks that outlive this activity.
    // Without this, a promise from open#N can resolve after close and set
    // ctx.positioned = true, so open#(N+1) renders with a visible positioner.
    let active = true;
    let positioned = false;

    function runUpdate(): void {
      const reference = getReference();
      const contentEl = ctx.contentEl;
      if (!reference || !contentEl) return;

      // computePosition must receive the *positioner* (position:fixed wrapper),
      // NOT the inner content div. If we pass contentEl, floating-ui's
      // getOffsetParent(contentEl) resolves to the positioner itself (its nearest
      // positioned ancestor), so computePosition returns coordinates relative to
      // the positioner rather than the viewport. On the second open the positioner
      // is already at (171,380), so every result is offset by -(171,380) and lands
      // at (0,0). Passing the positioner directly makes getOffsetParent resolve to
      // window (fixed elements' containing block), giving stable viewport-relative
      // coordinates regardless of the positioner's current position.
      const positionerEl = contentEl.parentElement;
      if (!positionerEl) return;

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
        // sameWidth: match positioner width to reference width.
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

      computePosition(reference, positionerEl, { placement, strategy, middleware }).then((result) => {
        if (!active) return;

        ctx.x = result.x;
        ctx.y = result.y;
        ctx.currentPlacement = result.placement;

        // Arrow position.
        if (ctx.arrowEl && result.middlewareData.arrow) {
          const { x: ax, y: ay } = result.middlewareData.arrow;
          if (ax != null) (ctx.arrowEl as HTMLElement).style.left = `${ax}px`;
          if (ay != null) (ctx.arrowEl as HTMLElement).style.top = `${ay}px`;
        }

        // data-hidden for hideWhenDetached (written on content div).
        if (hideWhenDetached) {
          const hidden = result.middlewareData.hide?.referenceHidden ?? false;
          contentEl.dataset.hidden = String(hidden);
        }

        // CSS var for transform-origin and data-side/align/placement.
        contentEl.style.setProperty(
          "--forge-floating-transform-origin",
          getTransformOrigin(result.placement),
        );
        contentEl.dataset.side = getSideFromPlacement(result.placement);
        contentEl.dataset.align = getAlignFromPlacement(result.placement);
        contentEl.dataset.placement = result.placement;

        if (!positioned) {
          positioned = true;
          ctx.positioned = true;
          // Reveal the positioner via direct DOM writes that bypass React/Vue's
          // render cycle entirely. Using a CSS custom property (--forge-revealed)
          // decouples reveal from React/Vue inline-style reconciliation: even if
          // a deferred React/Vue render with positioned=false runs AFTER this
          // point, it only sets style.opacity="var(--forge-revealed,0)" which
          // re-evaluates to 1 because --forge-revealed is already "1".
          // Write top/left first so the element is never briefly visible at
          // stale coordinates when the CSS variable is toggled on.
          positionerEl.style.top = `${result.y}px`;
          positionerEl.style.left = `${result.x}px`;
          positionerEl.style.setProperty("--forge-revealed", "1");
          positionerEl.style.pointerEvents = "";
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
        const contentEl = ctx.contentEl;
        if (!reference || !contentEl) {
          scheduleSetup(); // contentEl not mounted yet — try next frame
          return;
        }

        // Explicitly remove --forge-revealed before computePosition so the
        // positioner stays hidden even if a prior render left it visible.
        const positionerEl = contentEl.parentElement;
        if (positionerEl) {
          positionerEl.style.removeProperty("--forge-revealed");
          positionerEl.style.pointerEvents = "none";
        }

        if (!ctx.positioning.disableAutoUpdate) {
          // Pass positionerEl (not contentEl) so autoUpdate's ResizeObserver
          // tracks the positioned element directly. See runUpdate comment above.
          const floating = positionerEl ?? contentEl;
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
      // Clear the reveal flag synchronously while contentEl is still in DOM.
      // This ensures the next open's initial render always starts hidden,
      // even if the cleanup runs before the positioner unmounts.
      ctx.contentEl?.parentElement?.style.removeProperty("--forge-revealed");
    };
  };
}
