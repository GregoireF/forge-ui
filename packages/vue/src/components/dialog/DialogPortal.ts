import type { Component, PropType } from "vue";
import { defineComponent, h, onMounted, ref, Teleport } from "vue";

/**
 * Portals dialog content to a configurable container (default: document.body).
 * Uses Vue's built-in <Teleport> â€” zero extra deps.
 *
 * SSR-safe: defers rendering until after mount to avoid hydration mismatches.
 * Pass container=null to disable portal and render inline (e.g. in tests).
 *
 * Justification vs Ark UI: explicit isMounted gate matches Radix's deferred
 * pattern. The `disabled` prop maps directly to <Teleport :disabled> so
 * consumers can disable portaling at runtime without conditional rendering.
 */
export const DialogPortal = defineComponent({
  name: "ForgeDialogPortal",
  props: {
    to: {
      type: [String, Object] as PropType<string | HTMLElement>,
      default: "body",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const isMounted = ref(false);
    onMounted(() => {
      isMounted.value = true;
    });

    return () => {
      if (!isMounted.value) return null;
      return h(
        Teleport as unknown as Component,
        { to: props.to, disabled: props.disabled },
        slots['default']?.(),
      );
    };
  },
});
