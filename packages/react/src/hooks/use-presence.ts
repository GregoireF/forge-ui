import { watchPresence } from "@forge-ui/core";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Delays unmount until CSS animations/transitions finish on the tracked element.
 *
 * Usage:
 *   const { isPresent, presenceRef } = usePresence(api.isOpen)
 *   if (!isPresent) return null
 *   return <div ref={mergeRefs(api.getContentProps().ref, presenceRef)} data-state={...} />
 *
 * When `open` is true  → isPresent is true immediately.
 * When `open` is false → isPresent stays true until animationend/transitionend fires
 *                        on the element (or 1 s fallback), then becomes false.
 *
 * Set `forceMount` to bypass Presence and control mounting externally.
 */
export function usePresence(open: boolean): {
  isPresent: boolean;
  presenceRef: (el: HTMLElement | null) => void;
} {
  const [isPresent, setIsPresent] = useState(open);
  const elRef = useRef<HTMLElement | null>(null);

  const presenceRef = useCallback((el: HTMLElement | null) => {
    elRef.current = el;
  }, []);

  useEffect(() => {
    const cleanup = watchPresence(() => elRef.current, open, {
      onMount: () => setIsPresent(true),
      onUnmount: () => setIsPresent(false),
    });
    return cleanup;
  }, [open]);

  return { isPresent, presenceRef };
}
