import { createMachine } from "@forge-ui/core";
import type {
  CollapsibleContext,
  CollapsibleEvent,
  CollapsibleState,
  CreateCollapsibleOptions,
} from "./collapsible.types.js";

function toggle({
  context,
  setContext,
}: {
  context: CollapsibleContext;
  setContext: (u: Partial<CollapsibleContext>) => void;
  event: CollapsibleEvent;
}) {
  if (context.disabled) return;
  const next = !context.open;
  setContext({ open: next });
  context.onOpenChange?.(next);
}

function setOpen({
  setContext,
  event,
}: {
  context: CollapsibleContext;
  setContext: (u: Partial<CollapsibleContext>) => void;
  event: CollapsibleEvent;
}) {
  if (event.type !== "SET_OPEN") return;
  setContext({ open: event.open });
}

export function createCollapsibleMachine(options: CreateCollapsibleOptions) {
  return createMachine<CollapsibleContext, CollapsibleState, CollapsibleEvent>({
    id: `forge-collapsible:${options.id ?? "root"}`,
    context: {
      id: options.id ?? "root",
      open: options.open ?? options.defaultOpen ?? false,
      disabled: options.disabled ?? false,
      ...(options.onOpenChange !== undefined && { onOpenChange: options.onOpenChange }),
    },
    initial: "idle",
    states: {
      idle: {
        on: {
          TOGGLE: { actions: [toggle] },
          SET_OPEN: { actions: [setOpen] },
        },
      },
    },
    activities: {},
  });
}
