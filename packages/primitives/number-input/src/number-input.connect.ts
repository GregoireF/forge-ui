import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import type {
  NumberInputContext,
  NumberInputEvent,
  NumberInputState,
} from "./number-input.types.js";

export type NumberInputSend = (event: NumberInputEvent) => void;

export function connectNumberInput(
  snapshot: MachineSnapshot<NumberInputContext, NumberInputState>,
  send: NumberInputSend,
  _machine: Pick<
    MachineInstance<NumberInputContext, NumberInputState, NumberInputEvent>,
    "setContext"
  >,
) {
  const { context } = snapshot;
  const { value, inputText, min, max, disabled, readOnly, required, focused } = context;
  const isSpinning = snapshot.value === "spinning.up" || snapshot.value === "spinning.down";

  return {
    value,
    inputText,
    focused,
    isSpinning,

    getLabelProps() {
      return {
        "data-forge-scope": "number-input",
        "data-forge-part": "label",
        "data-disabled": disabled ? ("" as const) : undefined,
      };
    },

    getControlProps() {
      return {
        "data-forge-scope": "number-input",
        "data-forge-part": "control",
        "data-disabled": disabled ? ("" as const) : undefined,
        "data-readonly": readOnly ? ("" as const) : undefined,
        "data-focused": focused ? ("" as const) : undefined,
      };
    },

    // WAI-ARIA §3.21: role="spinbutton" on the input element.
    // aria-valuenow is the raw numeric value; aria-valuetext for formatted/custom labels.
    // aria-valuemin/max inform AT of the valid range.
    getInputProps() {
      return {
        role: "spinbutton" as const,
        type: "text" as const,
        value: inputText,
        "aria-valuenow": value ?? undefined,
        "aria-valuemin": min,
        "aria-valuemax": Number.isFinite(max) ? max : undefined,
        "aria-valuetext":
          value !== null ? (context.getValueLabel?.(value) ?? undefined) : undefined,
        "aria-disabled": disabled || undefined,
        "aria-readonly": readOnly || undefined,
        "aria-required": required || undefined,
        "data-forge-scope": "number-input",
        "data-forge-part": "input",
        "data-disabled": disabled ? ("" as const) : undefined,
        "data-readonly": readOnly ? ("" as const) : undefined,
        disabled: disabled || undefined,
        readOnly: readOnly || undefined,
        required: required || undefined,
        onInput(e: Event) {
          if (disabled || readOnly) return;
          send({ type: "SET_INPUT_TEXT", text: (e.target as HTMLInputElement).value });
        },
        // Vue alias
        onInput_vue(e: Event) {
          if (disabled || readOnly) return;
          send({ type: "SET_INPUT_TEXT", text: (e.target as HTMLInputElement).value });
        },
        onChange(e: Event) {
          if (disabled || readOnly) return;
          send({ type: "SET_INPUT_TEXT", text: (e.target as HTMLInputElement).value });
        },
        onFocus(e: FocusEvent) {
          send({ type: "FOCUS", event: e });
        },
        onBlur(e: FocusEvent) {
          send({ type: "BLUR", event: e });
        },
        onKeyDown(e: KeyboardEvent) {
          if (disabled || readOnly) return;
          switch (e.key) {
            case "ArrowUp":
              e.preventDefault();
              send({ type: "INCREMENT" });
              break;
            case "ArrowDown":
              e.preventDefault();
              send({ type: "DECREMENT" });
              break;
            case "PageUp":
              e.preventDefault();
              send({ type: "INCREMENT_PAGE" });
              break;
            case "PageDown":
              e.preventDefault();
              send({ type: "DECREMENT_PAGE" });
              break;
            case "Home":
              if (Number.isFinite(min)) {
                e.preventDefault();
                send({ type: "SET_MIN" });
              }
              break;
            case "End":
              if (Number.isFinite(max)) {
                e.preventDefault();
                send({ type: "SET_MAX" });
              }
              break;
          }
        },
        // Vue lowercase alias
        onKeydown(e: KeyboardEvent) {
          if (disabled || readOnly) return;
          switch (e.key) {
            case "ArrowUp":
              e.preventDefault();
              send({ type: "INCREMENT" });
              break;
            case "ArrowDown":
              e.preventDefault();
              send({ type: "DECREMENT" });
              break;
            case "PageUp":
              e.preventDefault();
              send({ type: "INCREMENT_PAGE" });
              break;
            case "PageDown":
              e.preventDefault();
              send({ type: "DECREMENT_PAGE" });
              break;
            case "Home":
              if (Number.isFinite(min)) {
                e.preventDefault();
                send({ type: "SET_MIN" });
              }
              break;
            case "End":
              if (Number.isFinite(max)) {
                e.preventDefault();
                send({ type: "SET_MAX" });
              }
              break;
          }
        },
      };
    },

    getIncrementTriggerProps() {
      return {
        type: "button" as const,
        tabIndex: -1,
        "aria-label": "Increase value",
        "aria-disabled": disabled || value === max || undefined,
        "data-forge-scope": "number-input",
        "data-forge-part": "increment-trigger",
        "data-disabled": disabled ? ("" as const) : undefined,
        disabled: disabled || undefined,
        onPointerDown(e: PointerEvent) {
          if (disabled || readOnly || e.button !== 0) return;
          e.preventDefault();
          send({ type: "INCREMENT" });
          send({ type: "SPIN_START_UP" });
        },
        onPointerUp() {
          send({ type: "SPIN_STOP" });
        },
        onPointerLeave() {
          send({ type: "SPIN_STOP" });
        },
        // Vue lowercase aliases
        onPointerdown(e: PointerEvent) {
          if (disabled || readOnly || e.button !== 0) return;
          e.preventDefault();
          send({ type: "INCREMENT" });
          send({ type: "SPIN_START_UP" });
        },
        onPointerup() {
          send({ type: "SPIN_STOP" });
        },
        onPointerleave() {
          send({ type: "SPIN_STOP" });
        },
      };
    },

    getDecrementTriggerProps() {
      return {
        type: "button" as const,
        tabIndex: -1,
        "aria-label": "Decrease value",
        "aria-disabled": disabled || value === min || undefined,
        "data-forge-scope": "number-input",
        "data-forge-part": "decrement-trigger",
        "data-disabled": disabled ? ("" as const) : undefined,
        disabled: disabled || undefined,
        onPointerDown(e: PointerEvent) {
          if (disabled || readOnly || e.button !== 0) return;
          e.preventDefault();
          send({ type: "DECREMENT" });
          send({ type: "SPIN_START_DOWN" });
        },
        onPointerUp() {
          send({ type: "SPIN_STOP" });
        },
        onPointerLeave() {
          send({ type: "SPIN_STOP" });
        },
        onPointerdown(e: PointerEvent) {
          if (disabled || readOnly || e.button !== 0) return;
          e.preventDefault();
          send({ type: "DECREMENT" });
          send({ type: "SPIN_START_DOWN" });
        },
        onPointerup() {
          send({ type: "SPIN_STOP" });
        },
        onPointerleave() {
          send({ type: "SPIN_STOP" });
        },
      };
    },

    getHiddenInputProps(name?: string) {
      return {
        type: "hidden" as const,
        ...(name !== undefined && { name }),
        value: value !== null ? String(value) : "",
        "aria-hidden": true as const,
      };
    },
  };
}

export type NumberInputApi = ReturnType<typeof connectNumberInput>;
