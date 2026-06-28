import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import type {
  AvatarContext,
  AvatarEvent,
  AvatarSend,
  AvatarState,
} from "./avatar.types.js";

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Derives initials from a full name string.
 * "John Doe" → "JD", "Alice" → "A", "Ana Garcia Lopez" → "AG" (max 2 words).
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

// ---------------------------------------------------------------------------
// Connect
// ---------------------------------------------------------------------------

export type AvatarApi = ReturnType<typeof connectAvatar>;

export function connectAvatar(
  snapshot: MachineSnapshot<AvatarContext, AvatarState>,
  send: AvatarSend,
  _machine: Pick<MachineInstance<AvatarContext, AvatarState, AvatarEvent>, "setContext">,
) {
  const { context } = snapshot;
  const status = snapshot.value;
  const isLoaded = snapshot.matches("loaded");
  const isLoading = snapshot.matches("loading");
  const hasError = snapshot.matches("error");
  const isIdle = snapshot.matches("idle");

  return {
    /** Current image loading status. */
    status,
    isLoaded,
    isLoading,
    hasError,
    isIdle,

    /**
     * Initials computed from `context.name`.
     * "John Doe" → "JD". Empty string when name is not provided.
     * Use this to render accessible fallback text without hard-coding.
     */
    initials: context.name ? getInitials(context.name) : "",

    /**
     * Props for the Avatar root container (structural wrapper, no ARIA role).
     * `data-status` mirrors the machine state for CSS + debugging.
     */
    getRootProps() {
      return {
        "data-forge-scope": "avatar",
        "data-forge-part": "root",
        "data-status": status,
      } as const;
    },

    /**
     * Props for the <img> element.
     *
     * `onLoad` / `onError` drive the machine state transitions.
     * `data-state` reflects the loading status — use it in CSS to hide the
     * image while not yet loaded:
     *
     * ```css
     * [data-forge-part="image"]:not([data-state="loaded"]) { display: none; }
     * ```
     */
    getImageProps() {
      return {
        src: context.src,
        alt: context.alt,
        "data-forge-scope": "avatar",
        "data-forge-part": "image",
        "data-state": status,
        onLoad() {
          send("IMAGE_LOAD");
        },
        onError() {
          send("IMAGE_ERROR");
        },
      };
    },

    /**
     * Base props for the fallback element.
     *
     * Note: `data-state` ("visible" | "hidden") and `aria-hidden` are NOT set
     * here — they depend on `delayMs` which lives in the framework layer
     * (React `useLayoutEffect` / Vue `watchEffect`). The framework Fallback
     * component merges those attributes on top of these base props.
     *
     * CSS target:
     * ```css
     * [data-forge-part="fallback"][data-state="hidden"] { display: none; }
     * ```
     */
    getFallbackProps() {
      return {
        "data-forge-scope": "avatar",
        "data-forge-part": "fallback",
      } as const;
    },

    /**
     * Imperatively update the image src and restart the loading cycle.
     * Call this from a framework effect when the src prop changes.
     */
    setSrc(src: string | undefined) {
      send({ type: "SRC_CHANGE", src });
    },
  };
}
