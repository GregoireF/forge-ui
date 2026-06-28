import type { CreateAvatarOptions } from "@forge-ui/avatar";
import { connectAvatar, createAvatarMachine } from "@forge-ui/avatar";
import { useId, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseAvatarOptions extends Omit<CreateAvatarOptions, "id" | "src"> {
  id?: string;
}

export function useAvatar(options: UseAvatarOptions = {}) {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createAvatarMachine({ id, ...options }));

  const [snapshot, send] = useMachine(machine);

  return {
    ...connectAvatar(snapshot, send, machine),
    send,
    machine,
  };
}

export type UseAvatarReturn = ReturnType<typeof useAvatar>;
