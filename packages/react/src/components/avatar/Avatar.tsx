import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";
import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Slot } from "../shared/Slot.js";
import type { UseAvatarOptions, UseAvatarReturn } from "./use-avatar.js";
import { useAvatar } from "./use-avatar.js";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AvatarCtx = createContext<UseAvatarReturn | null>(null);

function useCtx(): UseAvatarReturn {
  const ctx = useContext(AvatarCtx);
  if (!ctx) throw new Error("Avatar compound parts must be used inside <Avatar.Root>");
  return ctx;
}

/**
 * Access the Avatar API from anywhere inside `<Avatar.Root>`.
 * Use this to read `api.initials`, `api.status`, etc. from custom sub-components
 * without duplicating the machine.
 *
 * @example
 * ```tsx
 * function AvatarInitials() {
 *   const { initials } = useAvatarContext();
 *   return <Avatar.Fallback>{initials}</Avatar.Fallback>;
 * }
 * ```
 */
export function useAvatarContext(): UseAvatarReturn {
  return useCtx();
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface AvatarRootProps extends UseAvatarOptions, HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /** Render as the child element rather than a <span>. */
  asChild?: boolean;
}

function Root({
  children,
  asChild,
  // Machine options — consumed by useAvatar, not forwarded to DOM.
  id,
  src,
  alt,
  name,
  onStatusChange,
  ...htmlProps
}: AvatarRootProps) {
  const api = useAvatar({ id, src, alt, name, onStatusChange });
  const Comp = asChild ? Slot : "span";
  return (
    <AvatarCtx.Provider value={api}>
      <Comp {...api.getRootProps()} {...htmlProps}>{children}</Comp>
    </AvatarCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Image — drives SRC_CHANGE via useLayoutEffect on src changes
// ---------------------------------------------------------------------------

export interface AvatarImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "onLoad" | "onError"> {
  src?: string;
  /** Render as the child element rather than an <img>. Useful for Next.js Image. */
  asChild?: boolean;
}

function Image({ src, alt, asChild, ...rest }: AvatarImageProps) {
  const api = useCtx();

  const prevSrc = useRef<string | undefined>(undefined);
  useLayoutEffect(() => {
    if (prevSrc.current !== src) {
      prevSrc.current = src;
      api.setSrc(src);
    }
  }, [src, api]);

  const imageProps = api.getImageProps();
  const Comp = asChild ? Slot : "img";
  return <Comp {...imageProps} alt={alt ?? imageProps.alt} {...rest} />;
}

// ---------------------------------------------------------------------------
// Fallback — visible while image is loading (with optional delay) or errored
//
// delayMs lives here (not in the machine) because useMachine starts the
// machine synchronously during Root's render — before any child effect can
// influence it. Keeping the delay as a view concern in Fallback is the
// correct architecture and matches Radix UI / Ark UI's API surface.
// ---------------------------------------------------------------------------

export interface AvatarFallbackProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  /**
   * Delay in ms before the fallback becomes visible while loading.
   * Prevents a flash-of-fallback on fast connections (e.g. `delayMs={600}`).
   * Defaults to 0 (show immediately).
   */
  delayMs?: number;
  /** Render as the child element rather than a <span>. */
  asChild?: boolean;
  /**
   * Keep the fallback element in the DOM even when the image has loaded.
   * Without this prop, the fallback is unmounted when `visible=false` to keep
   * the DOM clean. Use `forceMount` when you need CSS exit animations or when
   * an animation library (e.g. Framer Motion) controls mounting itself.
   */
  forceMount?: boolean;
}

function Fallback({ children, delayMs = 0, asChild, forceMount = false, ...rest }: AvatarFallbackProps) {
  const api = useCtx();

  // Initialise to the correct state on the very first render to avoid a
  // one-frame flash. The machine is already started synchronously (useMachine
  // calls machine.start() during Root render), so api.isLoading is reliable here.
  const [showDelayed, setShowDelayed] = useState(
    () => !api.isLoading || delayMs <= 0,
  );

  useLayoutEffect(() => {
    if (!api.isLoading || delayMs <= 0) {
      setShowDelayed(true);
      return;
    }
    // Hide immediately when a new load starts, reveal after delayMs.
    setShowDelayed(false);
    const id = setTimeout(() => setShowDelayed(true), delayMs);
    return () => {
      clearTimeout(id);
      setShowDelayed(true); // reset so next load cycle starts fresh
    };
  }, [api.isLoading, delayMs]);

  // Fallback is visible when: no src (idle), image errored, OR loading within delay window.
  const visible = api.isIdle || api.hasError || (api.isLoading && showDelayed);

  // Without forceMount: unmount when not visible so the DOM stays clean and
  // animation libraries that control mount/unmount can work (AnimatePresence etc.)
  if (!forceMount && !visible) return null;

  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      {...api.getFallbackProps()}
      data-state={visible ? "visible" : "hidden"}
      aria-hidden={!visible || undefined}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

Root.displayName = "Avatar.Root";
Image.displayName = "Avatar.Image";
Fallback.displayName = "Avatar.Fallback";

export const Avatar = {
  Root,
  Image,
  Fallback,
} as const;
