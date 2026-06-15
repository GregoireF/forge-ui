import type { ActivityFn } from "../machine/types.js";
import { hideOthers } from "../utils/aria-hidden.js";
import { focusFirst, trapFocus } from "../utils/focus-trap.js";
import { lockScroll } from "../utils/scroll-lock.js";

// ---------------------------------------------------------------------------
// makeFocusActivity
// Manages focus on open/close: saves previous focus, focuses initial element,
// restores focus on cleanup. Supports initialFocusEl, finalFocusEl,
// onOpenAutoFocus, and onCloseAutoFocus preventable callbacks.
// ---------------------------------------------------------------------------

export interface FocusActivityOptions<TContext extends object> {
  getContentEl: (ctx: TContext) => HTMLElement | null;
  getInitialFocusEl?: (ctx: TContext) => HTMLElement | null;
  getFinalFocusEl?: (ctx: TContext) => HTMLElement | null;
  getOnOpenAutoFocus?: (ctx: TContext) => ((e: Event) => void) | undefined;
  getOnCloseAutoFocus?: (ctx: TContext) => ((e: Event) => void) | undefined;
}

export function makeFocusActivity<TContext extends object>(
  opts: FocusActivityOptions<TContext>,
): ActivityFn<TContext> {
  return (ctx) => {
    const previousFocus =
      typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null;

    const raf = requestAnimationFrame(() => {
      const contentEl = opts.getContentEl(ctx);
      if (!contentEl) return;
      const openCallback = opts.getOnOpenAutoFocus?.(ctx);
      if (openCallback) {
        const event = new Event("openautoFocus", { cancelable: true, bubbles: false });
        openCallback(event);
        if (event.defaultPrevented) return;
      }
      const initialEl = opts.getInitialFocusEl?.(ctx);
      if (initialEl) {
        initialEl.focus();
      } else {
        focusFirst(contentEl);
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      const finalEl = opts.getFinalFocusEl?.(ctx) ?? previousFocus;
      const closeCallback = opts.getOnCloseAutoFocus?.(ctx);
      if (closeCallback) {
        const event = new Event("closeautofocus", { cancelable: true, bubbles: false });
        closeCallback(event);
        if (event.defaultPrevented) return;
      }
      finalEl?.focus();
    };
  };
}

// ---------------------------------------------------------------------------
// makeWatchOutsideActivity
// Fires preventable callbacks when pointer/focus events occur outside containers.
// If the event is not prevented and no specific callback handles it, sends
// the provided close event type.
// ---------------------------------------------------------------------------

export interface WatchOutsideActivityOptions<TContext extends object> {
  getContainers: (ctx: TContext) => (HTMLElement | null)[];
  sendClose: string;
  getOnPointerDownOutside?: (ctx: TContext) => ((e: PointerEvent) => void) | undefined;
  getOnFocusOutside?: (ctx: TContext) => ((e: FocusEvent) => void) | undefined;
  getOnInteractOutside?: (ctx: TContext) => ((e: PointerEvent | FocusEvent) => void) | undefined;
}

export function makeWatchOutsideActivity<TContext extends object>(
  opts: WatchOutsideActivityOptions<TContext>,
): ActivityFn<TContext> {
  return (ctx, { send }) => {
    if (typeof document === "undefined") return;

    function isOutside(target: Node): boolean {
      const containers = opts.getContainers(ctx);
      return !containers.some((c) => c?.contains(target));
    }

    function handlePointerDown(e: PointerEvent): void {
      if (!isOutside(e.target as Node)) return;
      const onPointer = opts.getOnPointerDownOutside?.(ctx);
      const onInteract = opts.getOnInteractOutside?.(ctx);
      if (onPointer) onPointer(e);
      if (onInteract) onInteract(e);
      if (!e.defaultPrevented) send(opts.sendClose);
    }

    function handleFocusIn(e: FocusEvent): void {
      if (!isOutside(e.target as Node)) return;
      const onFocus = opts.getOnFocusOutside?.(ctx);
      const onInteract = opts.getOnInteractOutside?.(ctx);
      if (onFocus) onFocus(e);
      if (onInteract) onInteract(e);
      if (!e.defaultPrevented) send(opts.sendClose);
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("focusin", handleFocusIn, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("focusin", handleFocusIn, true);
    };
  };
}

// ---------------------------------------------------------------------------
// makeKeyboardActivity
// Handles Tab (trap focus when modal) and Escape key with preventable callback.
// ---------------------------------------------------------------------------

export interface KeyboardActivityOptions<TContext extends object> {
  getContentEl: (ctx: TContext) => HTMLElement | null;
  isModal: (ctx: TContext) => boolean;
  sendEscape: string;
  getOnEscapeKeyDown?: (ctx: TContext) => ((e: KeyboardEvent) => void) | undefined;
}

export function makeKeyboardActivity<TContext extends object>(
  opts: KeyboardActivityOptions<TContext>,
): ActivityFn<TContext> {
  return (ctx, { send }) => {
    if (typeof document === "undefined") return;

    function handler(e: KeyboardEvent): void {
      if (e.key === "Tab") {
        const contentEl = opts.getContentEl(ctx);
        if (contentEl && opts.isModal(ctx)) trapFocus(contentEl, e);
        return;
      }
      if (e.key === "Escape") {
        const onEscape = opts.getOnEscapeKeyDown?.(ctx);
        if (onEscape) onEscape(e);
        if (!e.defaultPrevented) send(opts.sendEscape);
      }
    }

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  };
}

// ---------------------------------------------------------------------------
// makeHideBackgroundActivity
// Hides all elements outside content from assistive technologies (aria-hidden).
// Only active when hideOthers option resolves to true.
// ---------------------------------------------------------------------------

export interface HideBackgroundActivityOptions<TContext extends object> {
  getContentEl: (ctx: TContext) => HTMLElement | null;
  isHideOthers: (ctx: TContext) => boolean;
}

export function makeHideBackgroundActivity<TContext extends object>(
  opts: HideBackgroundActivityOptions<TContext>,
): ActivityFn<TContext> {
  return (ctx) => {
    if (!opts.isHideOthers(ctx)) return;
    let cleanup: (() => void) | undefined;
    const raf = requestAnimationFrame(() => {
      const contentEl = opts.getContentEl(ctx);
      if (contentEl) cleanup = hideOthers(contentEl);
    });
    return () => {
      cancelAnimationFrame(raf);
      cleanup?.();
    };
  };
}

// ---------------------------------------------------------------------------
// makeLockScrollActivity
// Prevents body scroll while active. Only active when preventScroll resolves true.
// ---------------------------------------------------------------------------

export interface LockScrollActivityOptions<TContext extends object> {
  isPreventScroll: (ctx: TContext) => boolean;
}

export function makeLockScrollActivity<TContext extends object>(
  opts: LockScrollActivityOptions<TContext>,
): ActivityFn<TContext> {
  return (ctx) => {
    if (!opts.isPreventScroll(ctx)) return;
    return lockScroll();
  };
}
