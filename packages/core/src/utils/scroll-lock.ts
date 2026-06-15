// ---------------------------------------------------------------------------
// lockScroll — prevents body scroll while modals are open.
//
// Handles three concerns:
//   1. Scrollbar gutter: compensates the gap left when the scrollbar disappears
//      so page content doesn't jump (skipped if scrollbar-gutter:stable is set).
//   2. iOS Safari: overflow:hidden is ignored on body; uses position:fixed + scrollY
//      instead so content doesn't scroll under the modal.
//   3. Nested locks: multiple stacked dialogs share one lock — only the first
//      caller applies the style; only the last cleanup removes it.
//
// Scrollbar compensation uses CSS custom properties so consumers with an
// existing body padding-right can compose with it:
//   body { padding-right: var(--forge-body-padding-right, 0px); }
// ---------------------------------------------------------------------------

let lockCount = 0;
let savedStyles: { overflow: string; paddingRight: string } | null = null;
let savedScrollY = 0;
let savedIosStyles: {
  position: string;
  top: string;
  width: string;
  overflow: string;
} | null = null;

function isIOS(): boolean {
  return typeof navigator !== "undefined" && /iP(hone|ad|od)/.test(navigator.userAgent);
}

function isScrollbarGutterStable(): boolean {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return false;
  if (!CSS.supports("scrollbar-gutter", "stable")) return false;
  const computed = getComputedStyle(document.body) as CSSStyleDeclaration & {
    scrollbarGutter?: string;
  };
  return computed.scrollbarGutter?.startsWith("stable") ?? false;
}

function applyLock(): void {
  const body = document.body;

  if (isIOS()) {
    savedScrollY = window.scrollY;
    savedIosStyles = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${savedScrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return;
  }

  savedStyles = {
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
  };

  body.style.overflow = "hidden";

  if (!isScrollbarGutterStable()) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      body.style.setProperty("--forge-scrollbar-width", `${scrollbarWidth}px`);
      const current = Number.parseFloat(savedStyles.paddingRight) || 0;
      body.style.paddingRight = `${current + scrollbarWidth}px`;
    }
  }
}

function removeLock(): void {
  const body = document.body;

  if (savedIosStyles) {
    body.style.position = savedIosStyles.position;
    body.style.top = savedIosStyles.top;
    body.style.width = savedIosStyles.width;
    body.style.overflow = savedIosStyles.overflow;
    window.scrollTo(0, savedScrollY);
    savedIosStyles = null;
    return;
  }

  if (savedStyles) {
    body.style.overflow = savedStyles.overflow;
    body.style.paddingRight = savedStyles.paddingRight;
    body.style.removeProperty("--forge-scrollbar-width");
    savedStyles = null;
  }
}

export function lockScroll(): () => void {
  if (typeof window === "undefined") return () => {};

  lockCount++;
  if (lockCount === 1) applyLock();

  return () => {
    lockCount--;
    if (lockCount === 0) removeLock();
  };
}
