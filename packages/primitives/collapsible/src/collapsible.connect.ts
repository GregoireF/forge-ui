import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import type { CollapsibleContext, CollapsibleEvent, CollapsibleState } from "./collapsible.types.js";

type CollapsibleSend = (event: CollapsibleEvent) => void;

export function connectCollapsible(
  snapshot: MachineSnapshot<CollapsibleContext, CollapsibleState>,
  send: CollapsibleSend,
  _machine: Pick<MachineInstance<CollapsibleContext, CollapsibleState, CollapsibleEvent>, "setContext">,
) {
  const { context } = snapshot;
  const isOpen = context.open;
  const state = isOpen ? ("open" as const) : ("closed" as const);

  return {
    isOpen,
    disabled: context.disabled,
    send,

    getRootProps() {
      return {
        "data-forge-scope": "collapsible",
        "data-forge-part": "root",
        "data-state": state,
        "data-disabled": context.disabled ? ("" as const) : undefined,
      };
    },

    getTriggerProps() {
      return {
        type: "button" as const,
        "aria-expanded": isOpen,
        "aria-controls": `forge-collapsible-content-${context.id}`,
        "aria-disabled": context.disabled || undefined,
        disabled: context.disabled || undefined,
        "data-state": state,
        "data-disabled": context.disabled ? ("" as const) : undefined,
        "data-forge-scope": "collapsible",
        "data-forge-part": "trigger",
        onClick() {
          if (!context.disabled) send({ type: "TOGGLE" });
        },
        onKeyDown(e: KeyboardEvent) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!context.disabled) send({ type: "TOGGLE" });
          }
        },
        onKeydown(e: KeyboardEvent) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!context.disabled) send({ type: "TOGGLE" });
          }
        },
      };
    },

    getContentProps() {
      return {
        id: `forge-collapsible-content-${context.id}`,
        "data-state": state,
        "data-disabled": context.disabled ? ("" as const) : undefined,
        "data-forge-scope": "collapsible",
        "data-forge-part": "content",
      };
    },
  };
}

export type CollapsibleApi = ReturnType<typeof connectCollapsible>;
