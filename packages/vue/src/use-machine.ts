import type { EventObject, MachineInstance, MachineSnapshot } from "@forge-ui/core";
import { onUnmounted, shallowRef } from "vue";

/**
 * Binds a machine instance to Vue's reactivity via shallowRef.
 * shallowRef is used because MachineSnapshot is already immutable — deep
 * reactivity would be wasteful and could trigger false re-renders.
 */
export function useMachine<
  TContext extends object,
  TState extends string,
  TEvent extends EventObject,
>(machine: MachineInstance<TContext, TState, TEvent>) {
  const snapshot = shallowRef<MachineSnapshot<TContext, TState>>(machine.getSnapshot());

  machine.start();

  const unsubscribe = machine.subscribe((s) => {
    snapshot.value = s;
  });

  onUnmounted(() => {
    unsubscribe();
    machine.stop();
  });

  function send(event: TEvent | TEvent["type"]) {
    machine.send(event);
  }

  return { snapshot, send };
}
