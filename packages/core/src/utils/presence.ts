// ---------------------------------------------------------------------------
// Presence utility — delays unmount until CSS animations/transitions finish.
//
// Framework bindings (React usePresence, Vue usePresence) wrap this to provide
// `isPresent` state. The core utility is pure DOM with no framework dependency.
//
// Algorithm (same as @radix-ui/react-presence, made framework-agnostic):
//   open → true  : call onMount()
//   open → false : wait for animationend/transitionend on el, then onUnmount()
//   open → true during exit animation : call onMount() and cancel pending unmount
//
// The 1 s fallback covers elements with no CSS animation — without it, a typo
// in CSS would leave the element mounted forever.
// ---------------------------------------------------------------------------

export interface WatchPresenceOptions {
  onMount: () => void;
  onUnmount: () => void;
  /** Fallback timeout in ms when no animation/transition event fires. Default 1000. */
  fallbackMs?: number;
}

export function watchPresence(
  getEl: () => HTMLElement | null,
  open: boolean,
  options: WatchPresenceOptions,
): () => void {
  const { onMount, onUnmount, fallbackMs = 1000 } = options;

  if (open) {
    onMount();
    return () => {};
  }

  const el = getEl();
  if (!el) {
    onUnmount();
    return () => {};
  }

  let settled = false;

  function finish(): void {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    el!.removeEventListener("animationend", finish);
    el!.removeEventListener("transitionend", finish);
    onUnmount();
  }

  el.addEventListener("animationend", finish, { once: true });
  el.addEventListener("transitionend", finish, { once: true });
  const timer = setTimeout(finish, fallbackMs);

  return () => {
    settled = true;
    clearTimeout(timer);
    el.removeEventListener("animationend", finish);
    el.removeEventListener("transitionend", finish);
  };
}
