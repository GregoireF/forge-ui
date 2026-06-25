import type { CreateDateFieldOptions } from "@forge-ui/date-field";
import { connectDateField, createDateFieldMachine } from "@forge-ui/date-field";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseDateFieldOptions extends Omit<CreateDateFieldOptions, "id"> {
  id?: string;
}

export function useDateField(options: UseDateFieldOptions = {}) {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createDateFieldMachine({ id, ...options }));
  const [snapshot, send] = useMachine(machine);

  useLayoutEffect(() => {
    if (options.value !== undefined) {
      machine.update({
        dayValue: options.value?.day ?? null,
        monthValue: options.value?.month ?? null,
        yearValue: options.value?.year ?? null,
      });
    }
  // biome-ignore lint/correctness/useExhaustiveDependencies: value object reference triggers sync
  }, [options.value]);

  const api = connectDateField(snapshot, send, machine);

  useLayoutEffect(() => {
    const seg = api.focusedSegment;
    if (!seg) return;
    const groupEl = document.getElementById(`${id}-group`);
    if (!groupEl) return;
    const el = groupEl.querySelector<HTMLElement>(`[data-forge-part="segment-${seg}"]`);
    if (el && document.activeElement !== el) el.focus();
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional DOM focus sync
  }, [api.focusedSegment]);

  return api;
}

export type UseDateFieldReturn = ReturnType<typeof useDateField>;
