interface HiddenRecord {
  el: Element;
  prevValue: string | null;
}

/**
 * Hides all DOM elements outside of `container` from assistive technologies
 * by setting `aria-hidden="true"` on their siblings at every ancestor level.
 * Returns a cleanup function that restores the original attribute values.
 *
 * Implements WAI-ARIA requirement for modal dialogs: background content must
 * be hidden from screen readers when a modal is open.
 */
export function hideOthers(container: Element): () => void {
  const hidden: HiddenRecord[] = [];

  function hide(el: Element): void {
    hidden.push({ el, prevValue: el.getAttribute("aria-hidden") });
    el.setAttribute("aria-hidden", "true");
  }

  let node: Element | null = container;
  while (node && node !== document.body && node.parentElement) {
    for (const sibling of Array.from(node.parentElement.children)) {
      if (sibling !== node) {
        hide(sibling);
      }
    }
    node = node.parentElement;
  }

  return function cleanup() {
    for (const { el, prevValue } of hidden) {
      if (prevValue === null) {
        el.removeAttribute("aria-hidden");
      } else {
        el.setAttribute("aria-hidden", prevValue);
      }
    }
  };
}
