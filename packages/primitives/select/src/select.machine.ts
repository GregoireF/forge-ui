import {
  createMachine,
  makeLayerActivity,
  makeWatchOutsideActivity,
} from "@forge-ui/core";
import type { FloatingPositioning } from "@forge-ui/floating";
import { makeComputePositionActivity } from "@forge-ui/floating";
import type { SelectContext, SelectEvent, SelectOption, SelectState } from "./select.types.js";

// ---------------------------------------------------------------------------
// Option helpers
// ---------------------------------------------------------------------------

function getEnabled(options: SelectOption[]): SelectOption[] {
  return options.filter((o) => !o.disabled);
}

function getNextHighlighted(options: SelectOption[], current: string | null): string | null {
  const enabled = getEnabled(options);
  if (enabled.length === 0) return null;
  if (current === null) return enabled[0].value;
  const idx = enabled.findIndex((o) => o.value === current);
  return enabled[(idx + 1) % enabled.length].value;
}

function getPrevHighlighted(options: SelectOption[], current: string | null): string | null {
  const enabled = getEnabled(options);
  if (enabled.length === 0) return null;
  if (current === null) return enabled[enabled.length - 1].value;
  const idx = enabled.findIndex((o) => o.value === current);
  return enabled[(idx - 1 + enabled.length) % enabled.length].value;
}

/** Default highlighted on open: first selected value if present, else first enabled option. */
function getDefaultHighlighted(options: SelectOption[], value: string[]): string | null {
  if (value.length > 0) {
    const selected = options.find((o) => o.value === value[0] && !o.disabled);
    if (selected) return selected.value;
  }
  return getEnabled(options)[0]?.value ?? null;
}

// ---------------------------------------------------------------------------
// Machine options
// ---------------------------------------------------------------------------

export interface CreateSelectMachineOptions {
  id: string;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Initial selected value(s). */
  defaultValue?: string | string[];
  /**
   * Labels for the initial selected value(s) — used to show the trigger label
   * before items mount (i.e., before the listbox is opened for the first time).
   * Corresponds positionally to `defaultValue`. Single string if `defaultValue` is a string.
   */
  defaultLabel?: string | string[];
  /** Controlled selected value(s). */
  value?: string | string[];
  /** Allow multiple selection. Default: false. */
  multiple?: boolean;
  /** Placeholder text. Default: "Select an option". */
  placeholder?: string;
  /** Disable the entire select. */
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  positioning?: FloatingPositioning;
  onValueChange?: (value: string[]) => void;
  onOpenChange?: (open: boolean) => void;
  onHighlightChange?: (value: string | null) => void;
  /** Static options list — bypasses DOM REGISTER/UNREGISTER for navigation. Required for virtual scrolling. */
  allOptions?: import("./select.types.js").SelectOption[];
  /** Called after every highlighted change — user scrolls their virtualizer to the given index. */
  onHighlightedScroll?: (value: string, index: number) => void;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function invokeOnOpenChange(open: boolean) {
  return ({ context }: { context: SelectContext }) => {
    context.onOpenChange?.(open);
  };
}

function invokeOnValueChange({ context }: { context: SelectContext }) {
  context.onValueChange?.(context.value);
}

function invokeOnHighlightChange({ context }: { context: SelectContext }) {
  context.onHighlightChange?.(context.highlighted);
}

function invokeOnHighlightedScroll({ context }: { context: SelectContext }) {
  if (!context.highlighted || !context.onHighlightedScroll) return;
  const effectiveOpts = getEnabled(context.allOptions ?? context.options);
  const index = effectiveOpts.findIndex((o) => o.value === context.highlighted);
  if (index >= 0) context.onHighlightedScroll(context.highlighted, index);
}

function effectiveOptions(context: SelectContext) {
  return context.allOptions ?? context.options;
}

function setHighlightedToDefault({ context, setContext }: { context: SelectContext; setContext: (u: Partial<SelectContext>) => void }) {
  setContext({ highlighted: getDefaultHighlighted(effectiveOptions(context), context.value) });
}

function highlightNext({ context, setContext }: { context: SelectContext; setContext: (u: Partial<SelectContext>) => void }) {
  setContext({ highlighted: getNextHighlighted(effectiveOptions(context), context.highlighted) });
}

function highlightPrev({ context, setContext }: { context: SelectContext; setContext: (u: Partial<SelectContext>) => void }) {
  setContext({ highlighted: getPrevHighlighted(effectiveOptions(context), context.highlighted) });
}

function highlightFirst({ context, setContext }: { context: SelectContext; setContext: (u: Partial<SelectContext>) => void }) {
  const first = getEnabled(effectiveOptions(context))[0]?.value ?? null;
  setContext({ highlighted: first });
}

function highlightLast({ context, setContext }: { context: SelectContext; setContext: (u: Partial<SelectContext>) => void }) {
  const enabled = getEnabled(effectiveOptions(context));
  setContext({ highlighted: enabled[enabled.length - 1]?.value ?? null });
}

function clearHighlight({ setContext }: { setContext: (u: Partial<SelectContext>) => void }) {
  setContext({ highlighted: null });
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

const registerLayer = makeLayerActivity<SelectContext>({
  getId: (ctx) => ctx.id,
  getContentEl: (ctx) => ctx.contentEl,
});

const computePosition = makeComputePositionActivity<SelectContext>();

const watchOutside = makeWatchOutsideActivity<SelectContext>({
  getId: (ctx) => ctx.id,
  getContainers: (ctx) => [ctx.contentEl, ctx.triggerEl],
  sendClose: "INTERACT_OUTSIDE",
});

// ---------------------------------------------------------------------------
// Machine factory
// ---------------------------------------------------------------------------

export function createSelectMachine(options: CreateSelectMachineOptions) {
  const { id } = options;
  const multiple = options.multiple ?? false;
  const pos = options.positioning ?? {};
  const initialOpen = options.open ?? options.defaultOpen ?? false;

  // Normalize value to string[].
  const rawValue = options.value ?? options.defaultValue ?? [];
  const initialValue = Array.isArray(rawValue) ? rawValue : [rawValue];

  // Pre-seed label map from defaultLabel so trigger shows the right text before options mount.
  const initialLabelMap: Record<string, string> = {};
  if (options.defaultLabel !== undefined) {
    const rawLabels = Array.isArray(options.defaultLabel) ? options.defaultLabel : [options.defaultLabel];
    initialValue.forEach((v, i) => {
      if (rawLabels[i] !== undefined) initialLabelMap[v] = rawLabels[i];
    });
  }

  return createMachine<SelectContext, SelectState, SelectEvent>({
    id: `forge-select:${id}`,
    context: {
      id,
      multiple,
      value: initialValue,
      highlighted: null,
      options: [],
      valueLabelMap: initialLabelMap,
      placeholder: options.placeholder ?? "Select an option",
      disabled: options.disabled ?? false,
      required: options.required ?? false,
      invalid: options.invalid ?? false,
      x: 0,
      y: 0,
      positioned: false,
      currentPlacement: pos.placement ?? "bottom",
      positioning: {
        placement: pos.placement ?? "bottom",
        strategy: pos.strategy ?? "fixed",
        offset: pos.offset ?? 4,
        alignOffset: pos.alignOffset ?? 0,
        shiftPadding: pos.shiftPadding ?? 8,
        sameWidth: pos.sameWidth ?? true, // Matches reference width by default for Select
        avoidCollisions: pos.avoidCollisions ?? true,
        hideWhenDetached: pos.hideWhenDetached ?? false,
        disableAutoUpdate: pos.disableAutoUpdate ?? false,
        ...(pos.boundary !== undefined && { boundary: pos.boundary }),
        ...(pos.middleware !== undefined && { middleware: pos.middleware }),
      },
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
      labelId: `${id}-label`,
      triggerEl: null,
      contentEl: null,
      arrowEl: null,
      ...(options.onValueChange !== undefined && { onValueChange: options.onValueChange }),
      ...(options.onOpenChange !== undefined && { onOpenChange: options.onOpenChange }),
      ...(options.onHighlightChange !== undefined && { onHighlightChange: options.onHighlightChange }),
      ...(options.allOptions !== undefined && { allOptions: options.allOptions }),
      ...(options.onHighlightedScroll !== undefined && { onHighlightedScroll: options.onHighlightedScroll }),
    },
    initial: initialOpen ? "open" : "closed",

    states: {
      closed: {
        tags: ["closed"],
        on: {
          OPEN: { target: "open", actions: [setHighlightedToDefault, invokeOnOpenChange(true)] },
          TOGGLE: { target: "open", actions: [setHighlightedToDefault, invokeOnOpenChange(true)] },
          REGISTER_OPTION: {
            actions: [({ context, setContext, event }) => {
              const exists = context.options.some((o) => o.value === event.option.value);
              if (!exists) setContext({ options: [...context.options, event.option] });
              // Always keep labels in the persistent map for value display after close.
              if (context.valueLabelMap[event.option.value] !== event.option.label) {
                setContext({ valueLabelMap: { ...context.valueLabelMap, [event.option.value]: event.option.label } });
              }
            }],
          },
          UNREGISTER_OPTION: {
            actions: [({ context, setContext, event }) => {
              setContext({ options: context.options.filter((o) => o.value !== event.value) });
              // Intentionally DO NOT remove from valueLabelMap — label must survive close.
            }],
          },
        },
      },

      open: {
        tags: ["open"],
        activities: ["registerLayer", "computePosition", "watchOutside"],
        on: {
          CLOSE: { target: "closed", actions: [clearHighlight, invokeOnOpenChange(false)] },
          TOGGLE: { target: "closed", actions: [clearHighlight, invokeOnOpenChange(false)] },
          ESCAPE_KEY: { target: "closed", actions: [clearHighlight, invokeOnOpenChange(false)] },
          INTERACT_OUTSIDE: { target: "closed", actions: [clearHighlight, invokeOnOpenChange(false)] },

          SELECT_OPTION: {
            // Stays "open" — the connect layer sends CLOSE after this for single-select.
            actions: [
              ({ context, setContext, event }) => {
                const { value } = event;
                let next: string[];
                if (context.multiple) {
                  next = context.value.includes(value)
                    ? context.value.filter((v) => v !== value)
                    : [...context.value, value];
                } else {
                  next = [value];
                }
                setContext({ value: next, highlighted: value });
              },
              invokeOnValueChange,
            ],
          },

          SELECT_HIGHLIGHTED: {
            actions: [
              ({ context, setContext }) => {
                if (context.highlighted === null) return;
                const value = context.highlighted;
                let next: string[];
                if (context.multiple) {
                  next = context.value.includes(value)
                    ? context.value.filter((v) => v !== value)
                    : [...context.value, value];
                } else {
                  next = [value];
                  setContext({ highlighted: value });
                }
                setContext({ value: next });
              },
              invokeOnValueChange,
            ],
          },

          HIGHLIGHT_OPTION: {
            actions: [
              ({ setContext, event }) => {
                setContext({ highlighted: event.value });
              },
              invokeOnHighlightChange,
            ],
          },
          HIGHLIGHT_NEXT: { actions: [highlightNext, invokeOnHighlightChange, invokeOnHighlightedScroll] },
          HIGHLIGHT_PREV: { actions: [highlightPrev, invokeOnHighlightChange, invokeOnHighlightedScroll] },
          HIGHLIGHT_FIRST: { actions: [highlightFirst, invokeOnHighlightChange, invokeOnHighlightedScroll] },
          HIGHLIGHT_LAST: { actions: [highlightLast, invokeOnHighlightChange, invokeOnHighlightedScroll] },

          REGISTER_OPTION: {
            actions: [({ context, setContext, event }) => {
              const exists = context.options.some((o) => o.value === event.option.value);
              if (!exists) setContext({ options: [...context.options, event.option] });
              if (context.valueLabelMap[event.option.value] !== event.option.label) {
                setContext({ valueLabelMap: { ...context.valueLabelMap, [event.option.value]: event.option.label } });
              }
            }],
          },
          UNREGISTER_OPTION: {
            actions: [({ context, setContext, event }) => {
              setContext({ options: context.options.filter((o) => o.value !== event.value) });
              // Intentionally DO NOT remove from valueLabelMap — label must survive close.
            }],
          },
        },
      },
    },

    activities: {
      registerLayer,
      computePosition,
      watchOutside,
    },
  });
}
