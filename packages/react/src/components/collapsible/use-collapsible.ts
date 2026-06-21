import type { CollapsibleApi, CreateCollapsibleOptions } from "@forge-ui/collapsible";
import { connectCollapsible, createCollapsibleMachine } from "@forge-ui/collapsible";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseCollapsibleOptions extends Omit<CreateCollapsibleOptions, "id"> {
  id?: string;
}

export function useCollapsible(options: UseCollapsibleOptions = {}): CollapsibleApi {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createCollapsibleMachine({ id, ...options }));
  const [snapshot, send] = useMachine(machine);

  useLayoutEffect(() => {
    if (options.open !== undefined) {
      machine.send({ type: "SET_OPEN", open: options.open });
    }
  }, [options.open]);

  return connectCollapsible(snapshot, send, machine);
}
