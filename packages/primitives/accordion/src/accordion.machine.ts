import { createMachine } from "@forge-ui/core";
import type { AccordionContext, AccordionEvent, CreateAccordionOptions } from "./accordion.types.js";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function toggle({
  context,
  setContext,
  event,
}: {
  context: AccordionContext;
  setContext: (u: Partial<AccordionContext>) => void;
  event: AccordionEvent;
}) {
  if (event.type !== "TOGGLE_ITEM") return;
  const { value: itemValue } = event;
  const { value, type, collapsible, disabled } = context;

  if (disabled) return;

  if (type === "single") {
    const isOpen = value.includes(itemValue);
    if (isOpen) {
      // Only collapse if collapsible is true
      if (collapsible) {
        const next: string[] = [];
        setContext({ value: next });
        context.onValueChange?.(next);
      }
    } else {
      const next = [itemValue];
      setContext({ value: next });
      context.onValueChange?.(next);
    }
  } else {
    // multiple mode: toggle the item in/out
    const isOpen = value.includes(itemValue);
    const next = isOpen ? value.filter((v) => v !== itemValue) : [...value, itemValue];
    setContext({ value: next });
    context.onValueChange?.(next);
  }
}

function setValue({
  setContext,
  event,
  context,
}: {
  context: AccordionContext;
  setContext: (u: Partial<AccordionContext>) => void;
  event: AccordionEvent;
}) {
  if (event.type !== "SET_VALUE") return;
  setContext({ value: event.value });
  context.onValueChange?.(event.value);
}

// ---------------------------------------------------------------------------
// Machine factory
// ---------------------------------------------------------------------------

export function createAccordionMachine(options: CreateAccordionOptions) {
  const type = options.type ?? "single";
  const collapsible = options.collapsible ?? false;

  // Normalize defaultValue → string[]
  const rawDefault = options.defaultValue ?? [];
  const initialValue = Array.isArray(rawDefault) ? rawDefault : [rawDefault];
  // In uncontrolled mode, start with defaultValue. Controlled value is synced externally.
  const startValue = options.value !== undefined
    ? (Array.isArray(options.value) ? options.value : [options.value])
    : initialValue;

  return createMachine<AccordionContext, "idle", AccordionEvent>({
    id: `forge-accordion:${options.id ?? "root"}`,
    context: {
      value: startValue,
      type,
      collapsible,
      disabled: options.disabled ?? false,
      ...(options.onValueChange !== undefined && { onValueChange: options.onValueChange }),
    },
    initial: "idle",
    states: {
      idle: {
        on: {
          TOGGLE_ITEM: { actions: [toggle] },
          SET_VALUE: { actions: [setValue] },
        },
      },
    },
    activities: {},
  });
}
