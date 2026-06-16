import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import { updateLayerContentEl } from "@forge-ui/core";
import {
  getAlignFromPlacement,
  getSideFromPlacement,
  getTransformOrigin,
} from "@forge-ui/floating";
import type { SelectContext, SelectEvent, SelectOption, SelectSend, SelectState } from "./select.types.js";

export type SelectApi = ReturnType<typeof connectSelect>;

/** Sanitize a value so it can be safely used as part of an HTML id attribute. */
function sanitizeId(value: string): string {
  return value.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "");
}

export function getOptionId(selectId: string, value: string): string {
  return `${selectId}-opt-${sanitizeId(value)}`;
}

// ---------------------------------------------------------------------------
// Typeahead — managed in connect closure, not in machine context
// ---------------------------------------------------------------------------

function createTypeahead(
  getOptions: () => SelectOption[],
  getCurrent: () => string | null,
  onMatch: (value: string) => void,
) {
  let buffer = "";
  let timerId: ReturnType<typeof setTimeout> | undefined;

  function flush() {
    buffer = "";
    timerId = undefined;
  }

  function handleChar(char: string) {
    if (timerId !== undefined) clearTimeout(timerId);
    buffer += char.toLowerCase();
    timerId = setTimeout(flush, 500);

    const options = getOptions().filter((o) => !o.disabled);
    if (options.length === 0) return;

    // Cycle through options that start with the buffer
    const matches = options.filter((o) => o.label.toLowerCase().startsWith(buffer));
    if (matches.length === 0) return;

    const current = getCurrent();
    // If the current highlighted is already a match, advance to the next
    if (matches.length > 1) {
      const idx = matches.findIndex((o) => o.value === current);
      if (idx !== -1) {
        onMatch(matches[(idx + 1) % matches.length].value);
        return;
      }
    }
    onMatch(matches[0].value);
  }

  return { handleChar };
}

// ---------------------------------------------------------------------------
// Connect
// ---------------------------------------------------------------------------

export function connectSelect(
  snapshot: MachineSnapshot<SelectContext, SelectState>,
  send: SelectSend,
  machine: Pick<MachineInstance<SelectContext, SelectState, SelectEvent>, "setContext">,
) {
  const { context } = snapshot;
  const isOpen = snapshot.matches("open");
  const state = isOpen ? "open" : "closed";

  const side = getSideFromPlacement(context.currentPlacement);
  const align = getAlignFromPlacement(context.currentPlacement);

  const typeahead = createTypeahead(
    () => context.options,
    () => context.highlighted,
    (value) => send({ type: "HIGHLIGHT_OPTION", value }),
  );

  function selectValue(value: string) {
    send({ type: "SELECT_OPTION", value });
    if (!context.multiple) send("CLOSE");
  }

  function triggerKeyDown(event: KeyboardEvent) {
    const isDisabled = context.disabled;
    if (isDisabled) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          send("OPEN");
        } else {
          send("HIGHLIGHT_NEXT");
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) {
          send("OPEN");
          send("HIGHLIGHT_LAST");
        } else {
          send("HIGHLIGHT_PREV");
        }
        break;
      case "Home":
        event.preventDefault();
        if (isOpen) send("HIGHLIGHT_FIRST");
        break;
      case "End":
        event.preventDefault();
        if (isOpen) send("HIGHLIGHT_LAST");
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (!isOpen) {
          send("OPEN");
        } else if (context.highlighted !== null) {
          selectValue(context.highlighted);
        }
        break;
      case "Escape":
        if (isOpen) {
          event.preventDefault();
          send("ESCAPE_KEY");
        }
        break;
      case "Tab":
        if (isOpen) send("CLOSE");
        break;
      default:
        // Typeahead — printable characters only
        if (isOpen && event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
          typeahead.handleChar(event.key);
        }
    }
  }

  // Displayed label — resolved from persistent valueLabelMap (survives close/unmount)
  const resolveLabel = (v: string) => context.valueLabelMap[v] ?? v;

  const activeDescendantId =
    isOpen && context.highlighted !== null
      ? getOptionId(context.id, context.highlighted)
      : undefined;

  return {
    isOpen,

    /** The label text for the currently selected value(s). Empty string when nothing is selected. */
    valueLabel: context.value.length === 0
      ? ""
      : context.multiple
        ? context.value.map(resolveLabel).join(", ")
        : resolveLabel(context.value[0]),

    /** Machine-level placeholder. Prefer using SelectValue's placeholder prop in compounds. */
    placeholder: context.placeholder,

    /** Current selected value(s). */
    value: context.value,

    getLabelProps() {
      return {
        id: context.labelId,
        "data-forge-scope": "select",
        "data-forge-part": "label",
        htmlFor: context.triggerId,
      };
    },

    getTriggerProps() {
      return {
        id: context.triggerId,
        role: "combobox" as const,
        type: "button" as const,
        "aria-haspopup": "listbox" as const,
        "aria-expanded": isOpen,
        "aria-controls": context.contentId,
        "aria-labelledby": `${context.labelId} ${context.triggerId}`,
        "aria-activedescendant": activeDescendantId,
        "aria-disabled": context.disabled || undefined,
        disabled: context.disabled || undefined,
        "data-state": state,
        "data-disabled": context.disabled ? "" : undefined,
        "data-placeholder": context.value.length === 0 ? "" : undefined,
        "data-forge-scope": "select",
        "data-forge-part": "trigger",
        ref: (el: unknown) => machine.setContext({ triggerEl: el as HTMLElement | null }),
        onClick() {
          if (!context.disabled) send("TOGGLE");
        },
        // Both casings: React uses onKeyDown, Vue uses onKeydown (native DOM event)
        onKeyDown: triggerKeyDown,
        onKeydown: triggerKeyDown,
      };
    },

    /** Internal — rendered inside Select.Content to position the listbox. */
    getPositionerProps() {
      return {
        style: {
          position: context.positioning.strategy,
          top: `${context.y}px`,
          left: `${context.x}px`,
          width: context.positioning.sameWidth ? `${context.triggerEl?.offsetWidth ?? 0}px` : "max-content",
        } as const,
        "data-forge-scope": "select",
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
        "aria-multiselectable": context.multiple || undefined,
        "data-state": state,
        "data-forge-scope": "select",
        "data-forge-part": "content",
        "data-side": side,
        "data-align": align,
        "data-placement": context.currentPlacement,
        style: {
          "--forge-select-content-transform-origin": getTransformOrigin(context.currentPlacement),
        } as unknown as Record<string, string>,
        ref: (el: unknown) => {
          const contentEl = el as HTMLElement | null;
          machine.setContext({ contentEl });
          updateLayerContentEl(context.id, contentEl);
        },
      };
    },

    getOptionProps(option: Pick<SelectOption, "value" | "disabled">) {
      const isSelected = context.value.includes(option.value);
      const isHighlighted = context.highlighted === option.value;
      const isDisabled = option.disabled;

      return {
        id: getOptionId(context.id, option.value),
        role: "option" as const,
        "aria-selected": isSelected,
        "aria-disabled": isDisabled || undefined,
        "data-selected": isSelected ? "" : undefined,
        "data-highlighted": isHighlighted ? "" : undefined,
        "data-disabled": isDisabled ? "" : undefined,
        "data-forge-scope": "select",
        "data-forge-part": "option",
        onClick() {
          if (!isDisabled) selectValue(option.value);
        },
        onMouseMove() {
          if (!isDisabled && context.highlighted !== option.value) {
            send({ type: "HIGHLIGHT_OPTION", value: option.value });
          }
        },
        // Vue uses onMousemove / onMouseleave (native DOM casing)
        onMousemove() {
          if (!isDisabled && context.highlighted !== option.value) {
            send({ type: "HIGHLIGHT_OPTION", value: option.value });
          }
        },
        onMouseLeave() {
          send({ type: "HIGHLIGHT_OPTION", value: null });
        },
        onMouseleave() {
          send({ type: "HIGHLIGHT_OPTION", value: null });
        },
      };
    },
  };
}
