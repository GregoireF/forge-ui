import { watchPresence } from "@forge-ui/core";
import { onScopeDispose, type Ref, ref, watch } from "vue";

/**
 * Vue composable — delays unmount until CSS animations/transitions finish.
 *
 * Usage in a defineComponent setup:
 *   const { isPresent, presenceRef } = usePresence(computed(() => api.isOpen.value))
 *   if (!isPresent.value) return null
 *   // merge presenceRef onto the element ref
 */
export function usePresence(open: Ref<boolean>): {
  isPresent: Ref<boolean>;
  presenceRef: Ref<HTMLElement | null>;
} {
  const isPresent = ref(open.value);
  const presenceRef = ref<HTMLElement | null>(null);
  let cleanupFn: (() => void) | undefined;

  watch(
    open,
    (isOpen) => {
      cleanupFn?.();
      cleanupFn = watchPresence(() => presenceRef.value, isOpen, {
        onMount: () => {
          isPresent.value = true;
        },
        onUnmount: () => {
          isPresent.value = false;
        },
      });
    },
    { immediate: true },
  );

  onScopeDispose(() => {
    cleanupFn?.();
  });

  return { isPresent, presenceRef };
}
