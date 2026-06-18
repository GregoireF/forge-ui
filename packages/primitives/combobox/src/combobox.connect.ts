import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import { getAlignFromPlacement, getSideFromPlacement } from "@forge-ui/floating";
import type { ComboboxContext, ComboboxEvent, ComboboxOption, ComboboxSend, ComboboxState } from "./combobox.types.js";

export type ComboboxApi = ReturnType<typeof connectCombobox>;

const defaultFilterFn = (option: ComboboxOption, inputValue: string): boolean =>
  option.label.toLowerCase().includes(inputValue.toLowerCase());

export function connectCombobox(
  snapshot: MachineSnapshot<ComboboxContext, ComboboxState>,
  send: ComboboxSend,
  machine: Pick<MachineInstance<ComboboxContext, ComboboxState, ComboboxEvent>, "setContext">,
) {
  const { context } = snapshot;
  const isOpen = snapshot.matches("open");
  const state = isOpen ? "open" : "closed";

  const side = getSideFromPlacement(context.currentPlacement);
  const align = getAlignFromPlacement(context.currentPlacement);

  // Client-side filter — skipped when caller provides onInputChange (async mode).
  // When allOptions is provided (virtual scrolling), use it as the base list.
  const effectiveBase = context.allOptions ?? context.options;
  const filteredOptions: ComboboxOption[] = context.onInputChange
    ? effectiveBase
    : effectiveBase.filter((o) => {
        const fn = context.filterFn ?? defaultFilterFn;
        return fn(o, context.inputValue);
      });

  const highlightedId =
    context.highlighted !== null
      ? `${context.contentId}-option-${context.highlighted}`
      : undefined;

  // Derive label of current selection (for single-select display).
  const valueLabel: string =
    context.value.length === 0
      ? ""
      : (effectiveBase.find((o) => o.value === context.value[0])?.label ?? context.value[0]);

  return {
    isOpen,
    state,
    inputValue: context.inputValue,
    value: context.value,
    valueLabel,
    filteredOptions,
    isDisabled: context.disabled,
    isReadOnly: context.readOnly,
    isRequired: context.required,
    isInvalid: context.invalid,

    getLabelProps() {
      return {
        id: context.labelId,
        htmlFor: context.inputId,
        "data-forge-scope": "combobox",
        "data-forge-part": "label",
      };
    },

    getInputProps() {
      return {
        id: context.inputId,
        role: "combobox" as const,
        "aria-expanded": isOpen,
        "aria-controls": context.contentId,
        "aria-activedescendant": highlightedId,
        "aria-labelledby": context.labelId,
        "aria-required": context.required ? true : undefined,
        "aria-disabled": context.disabled ? true : undefined,
        "aria-readonly": context.readOnly ? true : undefined,
        "aria-invalid": context.invalid ? true : undefined,
        "aria-autocomplete": (context.onInputChange ? "list" : "both") as "list" | "both",
        autocomplete: "off" as const,
        value: context.inputValue,
        placeholder: context.placeholder,
        disabled: context.disabled ? true : undefined,
        readOnly: context.readOnly ? true : undefined,
        "data-state": state,
        "data-forge-scope": "combobox",
        "data-forge-part": "input",
        ref: (el: unknown) => machine.setContext({ triggerEl: el as HTMLElement | null }),
        onInput(e: Event) {
          if (context.disabled || context.readOnly) return;
          const value = (e.target as HTMLInputElement).value;
          send({ type: "INPUT_CHANGE", value });
        },
        onKeydown(e: KeyboardEvent) {
          if (context.disabled || context.readOnly) return;
          switch (e.key) {
            case "ArrowDown":
              e.preventDefault();
              if (!isOpen) {
                send("OPEN");
              } else {
                send(context.highlighted === null ? "HIGHLIGHT_FIRST" : "HIGHLIGHT_NEXT");
              }
              break;
            case "ArrowUp":
              e.preventDefault();
              if (!isOpen) {
                send("OPEN");
              } else {
                send(context.highlighted === null ? "HIGHLIGHT_LAST" : "HIGHLIGHT_PREV");
              }
              break;
            case "Home":
              if (isOpen) { e.preventDefault(); send("HIGHLIGHT_FIRST"); }
              break;
            case "End":
              if (isOpen) { e.preventDefault(); send("HIGHLIGHT_LAST"); }
              break;
            case "Enter":
              if (isOpen && context.highlighted !== null) {
                e.preventDefault();
                send("SELECT_HIGHLIGHTED");
                if (!context.multiple) send("CLOSE");
              }
              break;
            case "Escape":
              if (isOpen) {
                e.preventDefault();
                send("CLOSE");
              }
              break;
            case "Tab":
              if (isOpen) send("CLOSE");
              break;
          }
        },
      };
    },

    getPositionerProps() {
      return {
        style: {
          position: context.positioning.strategy,
          top: "0px",
          left: "0px",
          width: "max-content",
          opacity: "var(--forge-revealed, 0)" as unknown as number,
        },
        "data-forge-scope": "combobox",
        "data-forge-part": "positioner",
        "data-side": side,
        "data-align": align,
        "data-placement": context.currentPlacement,
      };
    },

    getContentProps() {
      return {
        id: context.contentId,
        role: "listbox" as const,
        "aria-labelledby": context.labelId,
        "aria-multiselectable": context.multiple ? true : undefined,
        "data-state": state,
        "data-forge-scope": "combobox",
        "data-forge-part": "content",
        "data-side": side,
        "data-align": align,
        ref: (el: unknown) => machine.setContext({ contentEl: el as HTMLElement | null }),
      };
    },

    getOptionProps({ value, disabled = false }: { value: string; disabled?: boolean }) {
      const isSelected = context.value.includes(value);
      const isHighlighted = context.highlighted === value;
      return {
        id: `${context.contentId}-option-${value}`,
        role: "option" as const,
        "aria-selected": isSelected,
        "aria-disabled": disabled ? true : undefined,
        "data-selected": isSelected ? "" : undefined,
        "data-highlighted": isHighlighted ? "" : undefined,
        "data-disabled": disabled ? "" : undefined,
        "data-forge-scope": "combobox",
        "data-forge-part": "option",
        onMousemove() {
          if (!disabled && context.highlighted !== value) {
            send({ type: "HIGHLIGHT_OPTION", value });
          }
        },
        onMouseleave() {
          send({ type: "HIGHLIGHT_OPTION", value: null });
        },
        onClick() {
          if (!disabled) {
            send({ type: "SELECT_OPTION", value });
            // Single-select auto-closes; multi-select stays open.
            if (!context.multiple) send("CLOSE");
          }
        },
      };
    },

    getClearTriggerProps() {
      return {
        type: "button" as const,
        "aria-label": "Clear",
        "data-forge-scope": "combobox",
        "data-forge-part": "clear-trigger",
        onClick() {
          if (!context.disabled && !context.readOnly) send("CLEAR");
        },
      };
    },

    getTriggerProps() {
      // Optional toggle button (chevron icon). Opens/closes the dropdown.
      // ref registers buttonEl so watchOutside (capture-phase) excludes it from
      // INTERACT_OUTSIDE — without this, clicking the button fires INTERACT_OUTSIDE
      // first, then onClick re-opens, leaving the dropdown perpetually open.
      return {
        type: "button" as const,
        tabIndex: -1 as const,
        "aria-label": isOpen ? "Close" : "Open",
        "data-state": state,
        "data-forge-scope": "combobox",
        "data-forge-part": "trigger",
        ref: (el: unknown) => machine.setContext({ buttonEl: el as HTMLElement | null }),
        onClick() {
          if (!context.disabled && !context.readOnly) {
            send(isOpen ? "CLOSE" : "OPEN");
          }
        },
      };
    },
  };
}
