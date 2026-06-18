import type { CreateTooltipMachineOptions, TooltipPositioning } from "@forge-ui/tooltip";
import { connectTooltip, createTooltipMachine } from "@forge-ui/tooltip";
import { useId, useLayoutEffect, useState } from "react";
import { useMachine } from "../../use-machine.js";
import { useTooltipProvider } from "./use-tooltip-provider.js";

export interface UseTooltipOptions extends Omit<CreateTooltipMachineOptions, "id"> {
  id?: string;
  positioning?: TooltipPositioning;
}

export function useTooltip(options: UseTooltipOptions = {}) {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");
  const provider = useTooltipProvider();

  const [machine] = useState(() =>
    createTooltipMachine({
      id,
      open: options.open ?? false,
      disabled: options.disabled ?? false,
      interactive: options.interactive ?? provider?.interactive ?? false,
      closeOnPointerDown: options.closeOnPointerDown ?? true,
      openDelay: options.openDelay ?? provider?.openDelay ?? 700,
      closeDelay: options.closeDelay ?? provider?.closeDelay ?? 300,
      positioning: options.positioning,
      ...(options.onOpenChange !== undefined && { onOpenChange: options.onOpenChange }),
    }),
  );

  const [snapshot, send] = useMachine(machine);

  // Sync mutable context fields from options + provider so changes after mount
  // are reflected in the next timer/event (reads happen lazily in connect).
  useLayoutEffect(() => {
    machine.setContext({
      disabled: options.disabled ?? false,
      interactive: options.interactive ?? provider?.interactive ?? false,
      openDelay: options.openDelay ?? provider?.openDelay ?? 700,
      closeDelay: options.closeDelay ?? provider?.closeDelay ?? 300,
      _isInQuickSuccession: provider?.isInQuickSuccession,
      _notifyOpen: provider?.notifyOpen,
      _notifyClose: provider?.notifyClose,
      ...(options.onOpenChange !== undefined && { onOpenChange: options.onOpenChange }),
    });
  }, [
    machine,
    options.disabled,
    options.interactive,
    options.openDelay,
    options.closeDelay,
    options.onOpenChange,
    provider,
  ]);

  // Controlled mode: sync open prop → machine state.
  useLayoutEffect(() => {
    if (options.open === undefined) return;
    const currentState = snapshot.value as string;
    if (options.open && currentState !== "open") send("OPEN");
    else if (!options.open && currentState === "open") send("CLOSE");
  }, [options.open, snapshot.value, send]);

  return {
    ...connectTooltip(snapshot, send, machine),
    send,
    setOpen: (open: boolean) => send(open ? "OPEN" : "CLOSE"),
  };
}
