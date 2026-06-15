const FOCUSABLE = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  "details > summary:not([disabled])",
  // contenteditable covers rich-text editors (Tiptap, Quill, Slate…)
  "[contenteditable]:not([contenteditable='false'])",
  "iframe",
].join(", ");

// display:none is not inherited in CSS, so we must walk up the ancestor chain.
// visibility:hidden IS inherited — getComputedStyle on the element itself is enough.
function isVisibleAndRendered(el: HTMLElement): boolean {
  let node: HTMLElement | null = el;
  while (node) {
    if (window.getComputedStyle(node).display === "none") return false;
    node = node.parentElement;
  }
  return window.getComputedStyle(el).visibility !== "hidden";
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    // [hidden] and [inert] are explicit DOM contracts; check them first (fast path).
    // isVisibleAndRendered catches CSS-applied display:none / visibility:hidden.
    (el) => !el.closest("[hidden]") && !el.closest("[inert]") && isVisibleAndRendered(el),
  );
}

export function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  if (typeof document === "undefined") return;

  const elements = getFocusableElements(container);
  if (elements.length === 0) {
    event.preventDefault();
    return;
  }

  const first = elements[0];
  const last = elements[elements.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

export function focusFirst(container: HTMLElement): void {
  if (typeof document === "undefined") return;
  const autofocused = container.querySelector<HTMLElement>("[autofocus]");
  if (autofocused) {
    autofocused.focus();
    return;
  }
  const elements = getFocusableElements(container);
  elements[0]?.focus();
}
