import type { CreateTooltipMachineOptions, TooltipPositioning, TooltipProviderContext } from "@forge-ui/tooltip";
import { connectTooltip, createTooltipMachine } from "@forge-ui/tooltip";
import { computed, inject, useId, watchEffect } from "vue";
import { useMachine } from "../../use-machine.js";
import { tooltipProviderKey } from "./use-tooltip-provider.js";

export interface UseTooltipOptions extends Omit<CreateTooltipMachineOptions, "id"> {
  id?: string;
  positioning?: TooltipPositioning;
}

export function useTooltip(options: UseTooltipOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;
  const provider = inject<TooltipProviderContext | null>(tooltipProviderKey, null);

  const machine = createTooltipMachine({
    id,
    open: options.open ?? false,
    disabled: options.disabled ?? false,
    interactive: options.interactive ?? provider?.interactive ?? false,
    closeOnPointerDown: options.closeOnPointerDown ?? true,
    openDelay: options.openDelay ?? provider?.openDelay ?? 700,
    closeDelay: options.closeDelay ?? provider?.closeDelay ?? 300,
    ...(options.positioning !== undefined && { positioning: options.positioning }),
    ...(options.onOpenChange !== undefined && { onOpenChange: options.onOpenChange }),
  });

  // Sync mutable context from options + provider — runs on mount and when reactive deps change.
  watchEffect(() => {
    machine.setContext({
      disabled: options.disabled ?? false,
      interactive: options.interactive ?? provider?.interactive ?? false,
      openDelay: options.openDelay ?? provider?.openDelay ?? 700,
      closeDelay: options.closeDelay ?? provider?.closeDelay ?? 300,
      ...(provider != null && {
        _isInQuickSuccession: provider.isInQuickSuccession,
        _notifyOpen: provider.notifyOpen,
        _notifyClose: provider.notifyClose,
      }),
      ...(options.onOpenChange !== undefined && { onOpenChange: options.onOpenChange }),
    });
  });

  const { snapshot, send } = useMachine(machine);
  const api = computed(() => connectTooltip(snapshot.value, send, machine));

  return {
    isOpen: computed(() => snapshot.value.matches("open")),
    send,
    setOpen: (open: boolean) => send(open ? "OPEN" : "CLOSE"),
    getTriggerProps: () => api.value.getTriggerProps(),
    getPositionerProps: () => api.value.getPositionerProps(),
    getContentProps: () => api.value.getContentProps(),
    getAnchorProps: () => api.value.getAnchorProps(),
    getArrowProps: () => api.value.getArrowProps(),
    getArrowTipProps: () => api.value.getArrowTipProps(),
  };
}
