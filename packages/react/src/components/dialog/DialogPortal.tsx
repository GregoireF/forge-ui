import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface DialogPortalProps {
  children: React.ReactNode;
  /** Target container. Defaults to document.body. Pass null to disable portal (renders inline). */
  container?: HTMLElement | null;
}

/**
 * Portals dialog content outside the DOM hierarchy to avoid z-index and
 * overflow clipping issues. SSR-safe: defers rendering until after mount.
 *
 * Justification vs Radix: configurable container + disabled=false defaults
 * match Radix API exactly. SSR gate via useState avoids hydration mismatches
 * in Next.js / Remix without requiring a separate isBrowser guard.
 */
export function DialogPortal({ children, container }: DialogPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (container === null) return <>{children}</>;

  return createPortal(children, container ?? document.body);
}
