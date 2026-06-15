// ---------------------------------------------------------------------------
// mergeRefs — combines multiple callback refs into one.
//
// All our refs are callback refs: `(el: T | null) => void`. This utility
// composes them so a single ref prop can update multiple targets.
//
// Usage:
//   ref={mergeRefs(machineRef, presenceRef)}
// ---------------------------------------------------------------------------

export function mergeRefs<T>(
  ...refs: Array<((el: T | null) => void) | null | undefined>
): (el: T | null) => void {
  return (el) => {
    for (const ref of refs) {
      ref?.(el);
    }
  };
}
