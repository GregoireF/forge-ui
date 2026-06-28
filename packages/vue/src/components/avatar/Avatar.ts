import type { InjectionKey, PropType } from "vue";
import {
  computed,
  defineComponent,
  h,
  inject,
  onMounted,
  provide,
  ref,
  useAttrs,
  watch,
  watchEffect,
} from "vue";
import { Slot } from "../shared/Slot.js";
import type { UseAvatarReturn } from "./use-avatar.js";
import { useAvatar } from "./use-avatar.js";

const avatarKey: InjectionKey<UseAvatarReturn> = Symbol("forge-avatar");

function useCtx(): UseAvatarReturn {
  const ctx = inject(avatarKey);
  if (!ctx) throw new Error("Avatar compound parts must be inside <Avatar.Root>");
  return ctx;
}

/**
 * Access the Avatar API from anywhere inside `<Avatar.Root>` / `<AvatarRoot>`.
 * Use this to read `api.initials.value`, `api.status.value`, etc. from custom
 * child components without duplicating the machine.
 *
 * @example
 * ```ts
 * // In a child component setup():
 * const { initials } = injectAvatarContext();
 * // → "JD" when Root has name="John Doe"
 * ```
 */
export function injectAvatarContext(): UseAvatarReturn {
  return useCtx();
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const AvatarRoot = defineComponent({
  name: "ForgeAvatarRoot",
  props: {
    id: { type: String, default: undefined },
    alt: { type: String, default: undefined },
    name: { type: String, default: undefined },
    onStatusChange: {
      type: Function as PropType<(status: string) => void>,
      default: undefined,
    },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useAvatar({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.alt !== undefined && { alt: props.alt }),
      ...(props.name !== undefined && { name: props.name }),
      ...(props.onStatusChange !== undefined && { onStatusChange: props.onStatusChange }),
    });

    provide(avatarKey, api);

    return () => {
      const rootProps = { ...api.getRootProps(), ...attrs };
      if (props.asChild) return h(Slot, rootProps, slots["default"]);
      return h("span", rootProps, slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Image — syncs src via watch so the machine tracks src changes reactively
// ---------------------------------------------------------------------------

const AvatarImage = defineComponent({
  name: "ForgeAvatarImage",
  props: {
    src: { type: String, default: undefined },
    alt: { type: String, default: undefined },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { attrs }) {
    const api = useCtx();

    onMounted(() => {
      api.setSrc(props.src);
    });

    watch(
      () => props.src,
      (src) => {
        api.setSrc(src);
      },
    );

    return () => {
      const imageProps = api.getImageProps();
      const mergedProps = {
        ...imageProps,
        ...attrs,
        ...(props.alt !== undefined ? { alt: props.alt } : {}),
      };
      if (props.asChild) return h(Slot, mergedProps, undefined);
      return h("img", mergedProps);
    };
  },
});

// ---------------------------------------------------------------------------
// Fallback — manages its own delay/visibility (NOT in the machine).
//
// The machine starts synchronously during Root's setup(), so we cannot rely
// on a lifecycle hook in Fallback to influence the initial machine state.
// Instead, each Fallback component manages its own local `showDelayed` ref,
// mirroring Radix UI's approach (delayMs on Fallback, not Root).
// ---------------------------------------------------------------------------

const AvatarFallback = defineComponent({
  name: "ForgeAvatarFallback",
  props: {
    /**
     * Delay in ms before the fallback appears while loading.
     * Prevents a flash-of-fallback on fast connections.
     */
    delayMs: { type: Number, default: 0 },
    asChild: { type: Boolean, default: false },
    /**
     * Keep the fallback element in the DOM even when the image has loaded.
     * Without this prop, the fallback is unmounted when `visible=false` to keep
     * the DOM clean. Use `forceMount` when you need CSS exit animations or when
     * an animation library (e.g. <Transition>) controls mounting itself.
     */
    forceMount: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const api = useCtx();
    const attrs = useAttrs();

    // Initialise showDelayed based on the machine's current state.
    // The machine is already started synchronously (in Root's useAvatar),
    // so api.isLoading.value is accurate at this point.
    const showDelayed = ref(!api.isLoading.value || props.delayMs <= 0);

    watchEffect((onCleanup) => {
      const isLoading = api.isLoading.value;
      const delay = props.delayMs;

      if (!isLoading || delay <= 0) {
        showDelayed.value = true;
        return;
      }

      // Loading with delay: hide immediately, reveal after delay.
      showDelayed.value = false;
      const id = setTimeout(() => {
        showDelayed.value = true;
      }, delay);
      onCleanup(() => {
        clearTimeout(id);
        showDelayed.value = true; // reset so next load cycle starts fresh
      });
    });

    // Fallback visible when: no src (idle), errored, OR loading within delay window.
    const visible = computed(
      () => api.isIdle.value || api.hasError.value || (api.isLoading.value && showDelayed.value),
    );

    return () => {
      // Without forceMount: unmount when not visible so the DOM stays clean and
      // Vue <Transition> / animation libraries that control mount/unmount work.
      if (!props.forceMount && !visible.value) return null;

      const baseProps = api.getFallbackProps();
      const mergedProps = {
        ...baseProps,
        "data-state": visible.value ? "visible" : "hidden",
        ...(visible.value ? {} : { "aria-hidden": true }),
        ...attrs,
      };
      if (props.asChild) return h(Slot, mergedProps, slots["default"]);
      return h("span", mergedProps, slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Avatar = {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
} as const;

export { AvatarFallback, AvatarImage, AvatarRoot };
