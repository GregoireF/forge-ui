/**
 * Prevents body scroll while a modal is open.
 * - Compensates scrollbar width to avoid layout shift.
 * - Uses position:fixed on iOS Safari where overflow:hidden is ignored.
 * Returns a cleanup that restores the original styles.
 */
export function lockScroll(): () => void {
  if (typeof window === "undefined") return () => {};

  const body = document.body;
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent);

  if (isIOS) {
    const scrollY = window.scrollY;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }

  // Measure actual scrollbar width to avoid layout shift when hiding it.
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  const prevOverflow = body.style.overflow;
  const prevPaddingRight = body.style.paddingRight;

  body.style.overflow = "hidden";
  if (scrollbarWidth > 0) {
    const currentPadding = Number.parseFloat(prevPaddingRight) || 0;
    body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
  }

  return () => {
    body.style.overflow = prevOverflow;
    body.style.paddingRight = prevPaddingRight;
  };
}
