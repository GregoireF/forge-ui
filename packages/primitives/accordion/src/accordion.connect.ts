import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import type { AccordionContext, AccordionEvent } from "./accordion.types.js";

type AccordionSend = (event: AccordionEvent) => void;

export function connectAccordion(
  snapshot: MachineSnapshot<AccordionContext, "idle">,
  send: AccordionSend,
  _machine: Pick<MachineInstance<AccordionContext, "idle", AccordionEvent>, "setContext">,
) {
  const { context } = snapshot;

  function isItemOpen(itemValue: string): boolean {
    return context.value.includes(itemValue);
  }

  return {
    /** Current open item value(s). */
    value: context.value,

    /** Whether the accordion is disabled. */
    disabled: context.disabled,

    send,

    getRootProps() {
      return {
        "data-forge-scope": "accordion",
        "data-forge-part": "root",
        "data-disabled": context.disabled ? ("" as const) : undefined,
      };
    },

    getItemProps(itemValue: string) {
      const open = isItemOpen(itemValue);
      return {
        "data-forge-scope": "accordion",
        "data-forge-part": "item",
        "data-state": open ? ("open" as const) : ("closed" as const),
        "data-disabled": context.disabled ? ("" as const) : undefined,
      };
    },

    getHeaderProps(itemValue: string) {
      return {
        "data-forge-scope": "accordion",
        "data-forge-part": "header",
        "data-state": isItemOpen(itemValue) ? ("open" as const) : ("closed" as const),
      };
    },

    getTriggerProps(itemValue: string) {
      const open = isItemOpen(itemValue);
      return {
        id: `forge-accordion-trigger-${itemValue}`,
        type: "button" as const,
        "aria-expanded": open,
        "aria-controls": `forge-accordion-content-${itemValue}`,
        "aria-disabled": context.disabled || undefined,
        disabled: context.disabled || undefined,
        "data-state": open ? ("open" as const) : ("closed" as const),
        "data-disabled": context.disabled ? ("" as const) : undefined,
        "data-forge-scope": "accordion",
        "data-forge-part": "trigger",
        onClick() {
          if (!context.disabled) {
            send({ type: "TOGGLE_ITEM", value: itemValue });
          }
        },
        onKeyDown(e: KeyboardEvent) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!context.disabled) {
              send({ type: "TOGGLE_ITEM", value: itemValue });
            }
          }
        },
        // Vue casing
        onKeydown(e: KeyboardEvent) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!context.disabled) {
              send({ type: "TOGGLE_ITEM", value: itemValue });
            }
          }
        },
      };
    },

    getContentProps(itemValue: string) {
      const open = isItemOpen(itemValue);
      return {
        id: `forge-accordion-content-${itemValue}`,
        role: "region" as const,
        "aria-labelledby": `forge-accordion-trigger-${itemValue}`,
        "data-state": open ? ("open" as const) : ("closed" as const),
        "data-forge-scope": "accordion",
        "data-forge-part": "content",
      };
    },
  };
}

export type AccordionApi = ReturnType<typeof connectAccordion>;
