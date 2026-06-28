import type { CreateToggleOptions } from "@forge-ui/toggle";
import { connectToggle, createToggleMachine } from "@forge-ui/toggle";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseToggleOptions extends Omit<CreateToggleOptions, "id"> {
  id?: string;
}

export function useToggle(options: UseToggleOptions = {}) {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createToggleMachine({ id, ...options }));

  const { pressed } = options;
  useLayoutEffect(() => {
    if (pressed === undefined) return;
    const state = machine.getSnapshot().value as string;
    const target = pressed ? "on" : "off";
    if (state === target) return;
    machine.send(pressed ? { type: "PRESS" } : { type: "RELEASE" });
  }, [pressed, machine]);

  const [snapshot, send] = useMachine(machine);

  return {
    ...connectToggle(snapshot, send, machine),
    send,
  };
}

export type UseToggleReturn = ReturnType<typeof useToggle>;
