import type { CreateTabsOptions, TabsApi } from "@forge-ui/tabs";
import { connectTabs, createTabsMachine } from "@forge-ui/tabs";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseTabsOptions extends Omit<CreateTabsOptions, "id"> {
  id?: string;
}

export function useTabs(options: UseTabsOptions = {}): TabsApi {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createTabsMachine({ id, ...options }));
  const [snapshot, send] = useMachine(machine);

  // Sync controlled value
  useLayoutEffect(() => {
    if (options.value !== undefined) {
      machine.send({ type: "SET_VALUE", value: options.value });
    }
  }, [options.value]);

  return connectTabs(snapshot, send, machine);
}
