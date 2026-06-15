// ---------------------------------------------------------------------------
// Layer stack registry — unified for all floating/modal primitives.
//
// Tracks open layers in insertion order so we can determine the "top" layer
// at event time. This lets stacked primitives (Dialog → Popover, Dialog →
// Dialog) behave correctly: Escape and outside-click close only the topmost
// layer; aria-hidden excludes ALL open layer elements.
//
// Module-level singleton: all primitive instances share the same stack, which
// is the only correct approach for nested layers across the component tree.
// Call clearRegistry() in test teardown to reset state between tests.
// ---------------------------------------------------------------------------

interface LayerEntry {
  contentEl: HTMLElement | null;
}

const layers = new Map<string, LayerEntry>();

export function pushLayer(id: string, contentEl: HTMLElement | null): void {
  layers.set(id, { contentEl });
}

export function popLayer(id: string): void {
  layers.delete(id);
}

export function isTopLayer(id: string): boolean {
  const keys = [...layers.keys()];
  return keys[keys.length - 1] === id;
}

/** Returns content elements of ALL open layers (used by hideOthers to exclude them). */
export function getLayerContentEls(): (HTMLElement | null)[] {
  return [...layers.values()].map((e) => e.contentEl);
}

/** Update the contentEl for an existing layer (called after the ref callback fires). */
export function updateLayerContentEl(id: string, contentEl: HTMLElement | null): void {
  const entry = layers.get(id);
  if (entry) entry.contentEl = contentEl;
}

/** Reset — use in test teardown only. */
export function clearRegistry(): void {
  layers.clear();
}
