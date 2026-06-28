import type { CreateAccordionOptions } from "@forge-ui/accordion";
import { connectAccordion, createAccordionMachine } from "@forge-ui/accordion";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseAccordionOptions extends Omit<CreateAccordionOptions, "id"> {
  id?: string;
}

export function useAccordion(options: UseAccordionOptions = {}) {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createAccordionMachine({ id, ...options }));

  // Sync controlled `value` prop
  const { value } = options;
  useLayoutEffect(() => {
    if (value === undefined) return;
    const normalized = Array.isArray(value) ? value : [value];
    const current = machine.getSnapshot().context.value;
    if (JSON.stringify(current) === JSON.stringify(normalized)) return;
    machine.send({ type: "SET_VALUE", value: normalized });
  }, [value, machine]);

  const [snapshot, send] = useMachine(machine);

  return connectAccordion(snapshot, send, machine);
}

export type UseAccordionReturn = ReturnType<typeof useAccordion>;
