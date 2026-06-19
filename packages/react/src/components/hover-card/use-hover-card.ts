import type { CreateHoverCardMachineOptions, HoverCardApi, HoverCardPositioning } from "@forge-ui/hover-card";
import { connectHoverCard, createHoverCardMachine } from "@forge-ui/hover-card";
import type { HoverCardSend } from "@forge-ui/hover-card";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseHoverCardOptions extends Omit<CreateHoverCardMachineOptions, "id"> {
  id?: string;
  positioning?: HoverCardPositioning;
}

export type UseHoverCardReturn = HoverCardApi & { send: HoverCardSend };

export function useHoverCard(options: UseHoverCardOptions = {}): UseHoverCardReturn {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() =>
    createHoverCardMachine({
      id,
      openDelay: options.openDelay ?? 700,
      closeDelay: options.closeDelay ?? 300,
      ...(options.positioning !== undefined && { positioning: options.positioning }),
      ...(options.onOpenChange !== undefined && { onOpenChange: options.onOpenChange }),
    }),
  );

  const [snapshot, send] = useMachine(machine);

  // Sync mutable context fields from options so changes after mount
  // are reflected in the next timer/event (reads happen lazily in connect).
  useLayoutEffect(() => {
    machine.setContext({
      openDelay: options.openDelay ?? 700,
      closeDelay: options.closeDelay ?? 300,
      ...(options.onOpenChange !== undefined && { onOpenChange: options.onOpenChange }),
    });
  }, [machine, options.openDelay, options.closeDelay, options.onOpenChange]);

  return {
    ...connectHoverCard(snapshot, send, machine),
    send,
  };
}
