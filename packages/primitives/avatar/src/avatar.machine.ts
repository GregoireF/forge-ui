import { createMachine } from "@forge-ui/core";
import type {
  AvatarContext,
  AvatarEvent,
  AvatarState,
  CreateAvatarOptions,
} from "./avatar.types.js";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function onSrcChange({
  setContext,
  event,
}: {
  context: AvatarContext;
  setContext: (u: Partial<AvatarContext>) => void;
  event: Extract<AvatarEvent, { type: "SRC_CHANGE" }>;
}) {
  setContext({ src: event.src });
}

function onLoaded({ context }: { context: AvatarContext; setContext: (u: Partial<AvatarContext>) => void; event: AvatarEvent }) {
  context.onStatusChange?.("loaded");
}

function onError({ context }: { context: AvatarContext; setContext: (u: Partial<AvatarContext>) => void; event: AvatarEvent }) {
  context.onStatusChange?.("error");
}

function onLoadingStart({ context }: { context: AvatarContext; setContext: (u: Partial<AvatarContext>) => void; event: AvatarEvent }) {
  context.onStatusChange?.("loading");
}

// ---------------------------------------------------------------------------
// Machine factory
//
// Deliberately minimal: tracks image load status only.
// The delayMs / showFallback logic is a VIEW concern and lives in the
// framework layer (React Fallback useLayoutEffect / Vue watchEffect) so that
// each Fallback can declare its own delay independently — matching the
// industry-standard API established by Radix UI and Ark UI.
// ---------------------------------------------------------------------------

export function createAvatarMachine(options: CreateAvatarOptions = {}) {
  const hasSrc = options.src !== undefined && options.src !== "";
  const initial: AvatarState = hasSrc ? "loading" : "idle";

  return createMachine<AvatarContext, AvatarState, AvatarEvent>({
    id: `forge-avatar:${options.id ?? "root"}`,
    context: {
      id: options.id ?? "root",
      src: options.src,
      alt: options.alt ?? "",
      ...(options.name !== undefined && { name: options.name }),
      ...(options.onStatusChange !== undefined && { onStatusChange: options.onStatusChange }),
    },
    initial,

    states: {
      // No src — always render fallback.
      idle: {
        tags: ["fallback"],
        on: {
          SRC_CHANGE: {
            target: "loading",
            actions: [onSrcChange, onLoadingStart],
          },
        },
      },

      // Src set, browser is fetching the image.
      loading: {
        tags: ["loading"],
        on: {
          IMAGE_LOAD: { target: "loaded", actions: [onLoaded] },
          IMAGE_ERROR: { target: "error", actions: [onError] },
          // New src mid-load: restart cycle.
          SRC_CHANGE: {
            target: "loading",
            actions: [onSrcChange, onLoadingStart],
          },
        },
      },

      // Image decoded and displayed — hide fallback.
      loaded: {
        tags: ["loaded"],
        on: {
          SRC_CHANGE: {
            target: "loading",
            actions: [onSrcChange, onLoadingStart],
          },
        },
      },

      // Image failed — show fallback.
      error: {
        tags: ["fallback"],
        on: {
          SRC_CHANGE: {
            target: "loading",
            actions: [onSrcChange, onLoadingStart],
          },
        },
      },
    },
  });
}
