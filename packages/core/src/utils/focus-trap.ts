const FOCUSABLE = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  "details > summary:not([disabled])",
  "iframe",
].join(", ");

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.closest("[hidden]") && !el.closest("[inert]"),
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
