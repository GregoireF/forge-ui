import type { EventObject, MachineInstance, MachineSnapshot } from "@forge-ui/core";
import { useCallback, useEffect, useSyncExternalStore } from "react";

export function useMachine<
  TContext extends object,
  TState extends string,
  TEvent extends EventObject,
>(
  machine: MachineInstance<TContext, TState, TEvent>,
): [MachineSnapshot<TContext, TState>, (event: TEvent | TEvent["type"]) => void] {
  // Start synchronously so the machine is running when child useLayoutEffect hooks
  // fire (e.g., Dialog.Title sending REGISTER_TITLE). machine.start() is idempotent
  // (guarded by `if (running) return`), so re-renders and Strict Mode double render
  // are safe.
  //
  // React Strict Mode also simulates unmount→remount of *effects* (without a new
  // render). The cleanup below calls machine.stop() (running = false). Because no
  // render runs between cleanup and re-setup, the synchronous machine.start() in
  // the render body is NOT called again. We therefore also call machine.start() in
  // the effect setup so the machine is restarted after the Strict Mode simulation.
  machine.start();

  useEffect(() => {
    machine.start(); // re-start after Strict Mode effect cleanup (idempotent if already running)
    return () => machine.stop();
  }, [machine]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => machine.subscribe(() => onStoreChange()),
    [machine],
  );

  const snapshot = useSyncExternalStore(subscribe, machine.getSnapshot, machine.getSnapshot);

  const send = useCallback((event: TEvent | TEvent["type"]) => machine.send(event), [machine]);

  return [snapshot, send];
}
