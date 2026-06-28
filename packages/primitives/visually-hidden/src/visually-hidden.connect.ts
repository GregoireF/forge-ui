/**
 * The canonical "visually hidden" CSS technique.
 * Hides content from sighted users while keeping it accessible to screen readers.
 *
 * Rationale for each property:
 *   position:absolute + width/height 1px — removes from flow, avoids zero-size clip issues
 *   padding:0 margin:-1px — collapses surrounding space without reflow
 *   overflow:hidden — clips any overflowing text from the 1×1 box
 *   clip:rect(0,0,0,0) — legacy clip (IE/old WebKit)
 *   clip-path:inset(50%) — modern equivalent
 *   white-space:nowrap — prevents text from wrapping and leaking outside clip
 *   border-width:0 — removes any UA default border that could expand hit area
 */
export const VISUALLY_HIDDEN_STYLE: Readonly<Record<string, string | number>> = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
  borderWidth: "0",
} as const;

export interface VisuallyHiddenOptions {
  /** When true the element is focusable but only visually hidden. Used for skip links. */
  focusable?: boolean;
}

export function connectVisuallyHidden(options: VisuallyHiddenOptions = {}) {
  return {
    getProps() {
      return {
        style: VISUALLY_HIDDEN_STYLE,
        "data-forge-scope": "visually-hidden",
        "data-forge-part": "root",
        // Focusable visually-hidden elements (skip links) need tabIndex.
        // When focused the skip link becomes visible via :focus-visible CSS on the consumer side.
        tabIndex: options.focusable ? 0 : undefined,
      };
    },
  };
}

export type VisuallyHiddenApi = ReturnType<typeof connectVisuallyHidden>;
