import { createMachine, makeWatchOutsideActivity } from "@forge-ui/core";
import type { FloatingPositioning } from "@forge-ui/floating";
import { makeComputePositionActivity } from "@forge-ui/floating";
import type { ComboboxContext, ComboboxEvent, ComboboxOption, ComboboxState } from "./combobox.types.js";

// ---------------------------------------------------------------------------
// Navigation helpers (operate on the filtered visible options)
// ---------------------------------------------------------------------------

function getEnabled(options: ComboboxOption[]): ComboboxOption[] {
  return options.filter((o) => !o.disabled);
}

const defaultFilterFn = (option: ComboboxOption, inputValue: string): boolean =>
  option.label.toLowerCase().includes(inputValue.toLowerCase());

// For navigation: when allOptions is provided, use it filtered by inputValue.
// Otherwise, use the DOM-registered options.
function getEffectiveOptions(context: ComboboxContext): ComboboxOption[] {
  const base = context.allOptions ?? context.options;
  if (context.onInputChange) return base; // server-side filtering: already filtered externally
  const fn = context.filterFn ?? defaultFilterFn;
  return base.filter((o) => fn(o, context.inputValue));
}

function getNextHighlighted(options: ComboboxOption[], current: string | null): string | null {
  const enabled = getEnabled(options);
  if (enabled.length === 0) return null;
  if (current === null) return enabled[0].value;
  const idx = enabled.findIndex((o) => o.value === current);
  return enabled[(idx + 1) % enabled.length].value;
}

function getPrevHighlighted(options: ComboboxOption[], current: string | null): string | null {
  const enabled = getEnabled(options);
  if (enabled.length === 0) return null;
  if (current === null) return enabled[enabled.length - 1].value;
  const idx = enabled.findIndex((o) => o.value === current);
  return enabled[(idx - 1 + enabled.length) % enabled.length].value;
}

// ---------------------------------------------------------------------------
// Actions — use setContext (pure, no mutation)
// ---------------------------------------------------------------------------

function invokeOnOpenChange(open: boolean) {
  return ({ context }: { context: ComboboxContext }) => {
    context.onOpenChange?.(open);
  };
}

function invokeOnValueChange({ context }: { context: ComboboxContext }) {
  context.onValueChange?.(context.value);
}

function invokeOnHighlightChange({ context }: { context: ComboboxContext }) {
  context.onHighlightChange?.(context.highlighted);
}

function invokeOnHighlightedScroll({ context }: { context: ComboboxContext }) {
  if (context.highlighted === null || !context.onHighlightedScroll) return;
  const effectiveOpts = getEffectiveOptions(context);
  const index = effectiveOpts.findIndex((o) => o.value === context.highlighted);
  if (index >= 0) context.onHighlightedScroll(context.highlighted, index);
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

// computePosition uses ctx.triggerEl (the input) as the reference element.
const computePosition = makeComputePositionActivity<ComboboxContext>();

const watchOutside = makeWatchOutsideActivity<ComboboxContext>({
  getId: (ctx) => ctx.id,
  // Clicking inside the input, the listbox, or the toggle button should NOT close.
  // buttonEl is included because the listener runs in capture phase — without it,
  // INTERACT_OUTSIDE fires before the button's onClick, causing a reopen race.
  getContainers: (ctx) => [ctx.contentEl, ctx.triggerEl, ctx.buttonEl],
  sendClose: "INTERACT_OUTSIDE",
});

// ---------------------------------------------------------------------------
// Machine options
// ---------------------------------------------------------------------------

export interface CreateComboboxMachineOptions {
  id: string;
  defaultValue?: string | string[];
  value?: string | string[];
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  positioning?: FloatingPositioning;
  onInputChange?: (value: string) => void;
  onValueChange?: (value: string[]) => void;
  onOpenChange?: (open: boolean) => void;
  onHighlightChange?: (value: string | null) => void;
  filterFn?: (option: { value: string; label: string; disabled?: boolean }, inputValue: string) => boolean;
  options?: ComboboxOption[];
  onHighlightedScroll?: (value: string, index: number) => void;
}

// ---------------------------------------------------------------------------
// Machine factory
// ---------------------------------------------------------------------------

export function createComboboxMachine(options: CreateComboboxMachineOptions) {
  const { id } = options;
  const multiple = options.multiple ?? false;
  const pos = options.positioning ?? {};

  const rawValue = options.value ?? options.defaultValue ?? [];
  const initialValue = Array.isArray(rawValue) ? rawValue : [rawValue];

  return createMachine<ComboboxContext, ComboboxState, ComboboxEvent>({
    id: `forge-combobox:${id}`,
    context: {
      id,
      inputId: `${id}-input`,
      contentId: `${id}-listbox`,
      labelId: `${id}-label`,
      inputValue: "",
      value: initialValue,
      highlighted: null,
      options: [],
      multiple,
      disabled: options.disabled ?? false,
      readOnly: options.readOnly ?? false,
      required: options.required ?? false,
      invalid: options.invalid ?? false,
      placeholder: options.placeholder,
      ...(options.onInputChange !== undefined && { onInputChange: options.onInputChange }),
      ...(options.onValueChange !== undefined && { onValueChange: options.onValueChange }),
      ...(options.onOpenChange !== undefined && { onOpenChange: options.onOpenChange }),
      ...(options.onHighlightChange !== undefined && { onHighlightChange: options.onHighlightChange }),
      ...(options.filterFn !== undefined && { filterFn: options.filterFn }),
      ...(options.options !== undefined && { allOptions: options.options }),
      ...(options.onHighlightedScroll !== undefined && { onHighlightedScroll: options.onHighlightedScroll }),
      triggerEl: null,
      contentEl: null,
      buttonEl: null,
      arrowEl: null,
      selectedLabels: {},
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
        sameWidth: pos.sameWidth ?? true,
        avoidCollisions: pos.avoidCollisions ?? true,
        hideWhenDetached: pos.hideWhenDetached ?? false,
        disableAutoUpdate: pos.disableAutoUpdate ?? false,
        ...(pos.boundary !== undefined && { boundary: pos.boundary }),
        ...(pos.middleware !== undefined && { middleware: pos.middleware }),
      },
    },
    initial: "closed",

    states: {
      closed: {
        tags: ["closed"],
        on: {
          OPEN: { target: "open", actions: [invokeOnOpenChange(true)] },

          INPUT_CHANGE: {
            target: "open",
            actions: [
              ({ setContext, event }) => {
                if (event.type !== "INPUT_CHANGE") return;
                setContext({ inputValue: event.value, highlighted: null });
              },
              ({ context }) => { context.onInputChange?.(context.inputValue); },
              invokeOnOpenChange(true),
            ],
          },

          CLEAR: {
            actions: [
              ({ setContext }) => setContext({ value: [], inputValue: "", highlighted: null, selectedLabels: {} }),
              invokeOnValueChange,
            ],
          },

          REGISTER_OPTION: {
            actions: [({ context, setContext, event }) => {
              if (event.type !== "REGISTER_OPTION") return;
              const exists = context.options.some((o) => o.value === event.option.value);
              if (!exists) setContext({ options: [...context.options, event.option] });
            }],
          },
          UNREGISTER_OPTION: {
            actions: [({ context, setContext, event }) => {
              if (event.type !== "UNREGISTER_OPTION") return;
              setContext({ options: context.options.filter((o) => o.value !== event.value) });
            }],
          },
        },
      },

      open: {
        tags: ["open"],
        activities: ["computePosition", "watchOutside"],
        on: {
          CLOSE: {
            target: "closed",
            actions: [
              ({ context, setContext }) => {
                if (!context.multiple) {
                  const selected = context.options.find((o) => o.value === context.value[0]);
                  setContext({ inputValue: selected?.label ?? "", highlighted: null });
                } else {
                  // Capture labels while options are still mounted (before portal unmounts items).
                  const nextLabels: Record<string, string> = { ...context.selectedLabels };
                  for (const v of context.value) {
                    const opt = context.options.find((o) => o.value === v);
                    if (opt) nextLabels[v] = opt.label;
                  }
                  setContext({ highlighted: null, inputValue: "", selectedLabels: nextLabels });
                }
              },
              invokeOnOpenChange(false),
            ],
          },

          INTERACT_OUTSIDE: {
            target: "closed",
            actions: [
              ({ context, setContext }) => {
                if (!context.multiple) {
                  const selected = context.options.find((o) => o.value === context.value[0]);
                  setContext({ inputValue: selected?.label ?? "", highlighted: null });
                } else {
                  const nextLabels: Record<string, string> = { ...context.selectedLabels };
                  for (const v of context.value) {
                    const opt = context.options.find((o) => o.value === v);
                    if (opt) nextLabels[v] = opt.label;
                  }
                  setContext({ highlighted: null, inputValue: "", selectedLabels: nextLabels });
                }
              },
              invokeOnOpenChange(false),
            ],
          },

          INPUT_CHANGE: {
            actions: [
              ({ setContext, event }) => {
                if (event.type !== "INPUT_CHANGE") return;
                setContext({ inputValue: event.value, highlighted: null });
              },
              ({ context }) => { context.onInputChange?.(context.inputValue); },
            ],
          },

          // SELECT_OPTION stays in "open" state. The connect sends CLOSE after
          // selection for single-select (same pattern as @forge-ui/select).
          SELECT_OPTION: {
            actions: [
              ({ context, setContext, event }) => {
                if (event.type !== "SELECT_OPTION") return;
                const { value } = event;
                const opt = context.options.find((o) => o.value === value);
                if (context.multiple) {
                  const isSelected = context.value.includes(value);
                  const next = isSelected
                    ? context.value.filter((v) => v !== value)
                    : [...context.value, value];
                  const nextLabels = { ...context.selectedLabels };
                  if (isSelected) delete nextLabels[value];
                  else nextLabels[value] = opt?.label ?? value;
                  setContext({ value: next, highlighted: value, selectedLabels: nextLabels });
                } else {
                  setContext({ value: [value], inputValue: opt?.label ?? value, highlighted: value });
                }
              },
              invokeOnValueChange,
            ],
          },

          // SELECT_HIGHLIGHTED is sent from keyboard (Enter). Same no-close policy —
          // connect sends CLOSE afterward for single-select.
          SELECT_HIGHLIGHTED: {
            actions: [
              ({ context, setContext }) => {
                if (context.highlighted === null) return;
                const value = context.highlighted;
                const opt = context.options.find((o) => o.value === value);
                if (context.multiple) {
                  const isSelected = context.value.includes(value);
                  const next = isSelected
                    ? context.value.filter((v) => v !== value)
                    : [...context.value, value];
                  const nextLabels = { ...context.selectedLabels };
                  if (isSelected) delete nextLabels[value];
                  else nextLabels[value] = opt?.label ?? value;
                  setContext({ value: next, selectedLabels: nextLabels });
                } else {
                  setContext({ value: [value], inputValue: opt?.label ?? value });
                }
              },
              invokeOnValueChange,
            ],
          },

          HIGHLIGHT_OPTION: {
            actions: [
              ({ setContext, event }) => {
                if (event.type !== "HIGHLIGHT_OPTION") return;
                setContext({ highlighted: event.value });
              },
              invokeOnHighlightChange,
              invokeOnHighlightedScroll,
            ],
          },
          HIGHLIGHT_NEXT: {
            actions: [
              ({ context, setContext }) => {
                setContext({ highlighted: getNextHighlighted(getEffectiveOptions(context), context.highlighted) });
              },
              invokeOnHighlightChange,
              invokeOnHighlightedScroll,
            ],
          },
          HIGHLIGHT_PREV: {
            actions: [
              ({ context, setContext }) => {
                setContext({ highlighted: getPrevHighlighted(getEffectiveOptions(context), context.highlighted) });
              },
              invokeOnHighlightChange,
              invokeOnHighlightedScroll,
            ],
          },
          HIGHLIGHT_FIRST: {
            actions: [
              ({ context, setContext }) => {
                setContext({ highlighted: getEnabled(getEffectiveOptions(context))[0]?.value ?? null });
              },
              invokeOnHighlightChange,
              invokeOnHighlightedScroll,
            ],
          },
          HIGHLIGHT_LAST: {
            actions: [
              ({ context, setContext }) => {
                const enabled = getEnabled(getEffectiveOptions(context));
                setContext({ highlighted: enabled[enabled.length - 1]?.value ?? null });
              },
              invokeOnHighlightChange,
              invokeOnHighlightedScroll,
            ],
          },

          CLEAR: {
            actions: [
              ({ setContext }) => setContext({ value: [], inputValue: "", highlighted: null }),
              invokeOnValueChange,
            ],
            target: "closed",
          },

          REGISTER_OPTION: {
            actions: [({ context, setContext, event }) => {
              if (event.type !== "REGISTER_OPTION") return;
              const exists = context.options.some((o) => o.value === event.option.value);
              if (!exists) setContext({ options: [...context.options, event.option] });
            }],
          },
          UNREGISTER_OPTION: {
            actions: [({ context, setContext, event }) => {
              if (event.type !== "UNREGISTER_OPTION") return;
              setContext({ options: context.options.filter((o) => o.value !== event.value) });
            }],
          },
        },
      },
    },

    activities: {
      computePosition,
      watchOutside,
    },
  });
}
