import type { CreateSwitchMachineOptions } from "@forge-ui/switch";
import { connectSwitch, createSwitchMachine } from "@forge-ui/switch";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseSwitchOptions extends Omit<CreateSwitchMachineOptions, "id"> {
  id?: string;
}

export function useSwitch(options: UseSwitchOptions = {}) {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createSwitchMachine({ id, ...options }));

  // Sync controlled `checked` prop via layout effect.
  const { checked } = options;
  useLayoutEffect(() => {
    if (checked === undefined) return;
    const state = machine.getSnapshot().value as string;
    const target = checked ? "on" : "off";
    if (state === target) return;
    machine.send(checked ? "CHECK" : "UNCHECK");
  }, [checked, machine]);

  const [snapshot, send] = useMachine(machine);

  return {
    ...connectSwitch(snapshot, send, machine),
    send,
  };
}

export type UseSwitchReturn = ReturnType<typeof useSwitch>;
