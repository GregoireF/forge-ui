import type { Middleware, Placement, Strategy } from "@floating-ui/dom";

// ---------------------------------------------------------------------------
// FloatingPositioning — shared by Popover, Tooltip, DropdownMenu, etc.
// ---------------------------------------------------------------------------

export interface FloatingPositioning {
  /** Placement relative to the reference element. Default: "bottom". */
  placement?: Placement;
  /** "fixed" (default, safe for portaled content) or "absolute". */
  strategy?: Strategy;
  /** Distance between reference and floating on the main axis in px. Default: 4. */
  offset?: number;
  /** Distance between reference and floating on the cross axis in px. Default: 0. */
  alignOffset?: number;
  /** Padding (px) to keep the floating element away from viewport edges. Default: 8. */
  shiftPadding?: number;
  /** Match the floating width to the reference element width. Default: false. */
  sameWidth?: boolean;
  /**
   * Whether to flip the floating element to the opposite side when it would
   * overflow the boundary. When false, the floating element stays in place and
   * may be clipped. Default: true.
   */
  avoidCollisions?: boolean;
  /** Clipping boundary for flip + shift. Default: "clippingAncestors". */
  boundary?: Element | Element[] | "clippingAncestors";
  /**
   * Hide the floating element when the reference is fully outside the boundary.
   * Sets data-hidden on the floating element. Default: false.
   */
  hideWhenDetached?: boolean;
  /** Disable autoUpdate (position re-computation on scroll/resize). Default: false. */
  disableAutoUpdate?: boolean;
  /** Additional @floating-ui/dom middleware injected after built-ins. Escape hatch. */
  middleware?: Middleware[];
}

// Resolved version stored in machine context (all required except extras).
export type ResolvedFloatingPositioning = Required<
  Omit<FloatingPositioning, "middleware" | "boundary">
> & {
  boundary?: FloatingPositioning["boundary"];
  middleware?: FloatingPositioning["middleware"];
};

// Convenience helpers to build a placement string from separate side+align props.
export function buildPlacement(
  side: Side,
  align: Align | "center",
): Placement {
  return align === "center" ? side : (`${side}-${align}` as Placement);
}

// ---------------------------------------------------------------------------
// Helpers: extract side / align from a resolved placement
// ---------------------------------------------------------------------------

export type Side = "top" | "right" | "bottom" | "left";
export type Align = "start" | "center" | "end";

export function getSideFromPlacement(placement: Placement): Side {
  return placement.split("-")[0] as Side;
}

export function getAlignFromPlacement(placement: Placement): Align {
  const part = placement.split("-")[1];
  return (part as Align | undefined) ?? "center";
}

/** CSS transform-origin from placement — mirrors the floating element's anchor point. */
export function getTransformOrigin(placement: Placement): string {
  const side = getSideFromPlacement(placement);
  const align = getAlignFromPlacement(placement);
  const alignMap: Record<Align, string> = { start: "0%", center: "50%", end: "100%" };

  switch (side) {
    case "top":
      return `${alignMap[align]} 100%`;
    case "bottom":
      return `${alignMap[align]} 0%`;
    case "left":
      return `100% ${alignMap[align]}`;
    case "right":
      return `0% ${alignMap[align]}`;
  }
}
