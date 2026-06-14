/**
 * Fires `handler` when a pointerdown event occurs outside every element in
 * `containers`. Uses capture phase so it fires before click handlers.
 * Returns a cleanup that removes the listener.
 *
 * Pass both contentEl and triggerEl as containers so that clicking the trigger
 * does not also fire INTERACT_OUTSIDE (the trigger's own onClick handles it).
 */
export function interactOutside(
  containers: (HTMLElement | null)[],
  handler: () => void,
): () => void {
  if (typeof document === "undefined") return () => {};

  function onPointerDown(e: PointerEvent): void {
    const target = e.target as Node;
    const isInside = containers.some((c) => c?.contains(target));
    if (!isInside) handler();
  }

  document.addEventListener("pointerdown", onPointerDown, true);
  return () => document.removeEventListener("pointerdown", onPointerDown, true);
}
