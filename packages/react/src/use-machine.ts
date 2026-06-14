import type { EventObject, MachineInstance, MachineSnapshot } from "@forge-ui/core";
import { useCallback, useEffect, useSyncExternalStore } from "react";

export function useMachine<
  TContext extends object,
  TState extends string,
  TEvent extends EventObject,
>(
  machine: MachineInstance<TContext, TState, TEvent>,
): [MachineSnapshot<TContext, TState>, (event: TEvent | TEvent["type"]) => void] {
  useEffect(() => {
    machine.start();
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
