import type { ActivityFn } from "@forge-ui/core";
import { createMachine } from "@forge-ui/core";
import type {
  CreateNumberInputOptions,
  NumberInputContext,
  NumberInputEvent,
  NumberInputState,
} from "./number-input.types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function snapToStep(value: number, min: number, step: number): number {
  if (step <= 0) return value;
  const snapped = Math.round((value - min) / step) * step + min;
  const decimals = String(step).split(".")[1]?.length ?? 0;
  return Number(snapped.toFixed(decimals));
}

function clampSnap(value: number, min: number, max: number, step: number): number {
  return clamp(snapToStep(value, min, step), min, max);
}

function parseNumber(text: string): number | null {
  const cleaned = text.trim().replace(/[^\d.-]/g, "");
  if (cleaned === "" || cleaned === "-") return null;
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? null : n;
}

function formatNumber(
  value: number,
  locale: string,
  fractionDigits: number,
  formatOptions?: Intl.NumberFormatOptions,
): string {
  try {
    const opts: Intl.NumberFormatOptions = formatOptions ?? {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    };
    return new Intl.NumberFormat(locale, opts).format(value);
  } catch {
    return String(value);
  }
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function increment({
  context,
  setContext,
}: {
  context: NumberInputContext;
  setContext: (u: Partial<NumberInputContext>) => void;
}) {
  if (context.disabled || context.readOnly) return;
  const current = context.value ?? context.min;
  const next = clampSnap(current + context.step, context.min, context.max, context.step);
  setContext({
    value: next,
    inputText: formatNumber(next, context.locale, context.fractionDigits, context.formatOptions),
  });
  context.onValueChange?.(next);
  context.onValueCommit?.(next);
}

function decrement({
  context,
  setContext,
}: {
  context: NumberInputContext;
  setContext: (u: Partial<NumberInputContext>) => void;
}) {
  if (context.disabled || context.readOnly) return;
  const current = context.value ?? context.max;
  const next = clampSnap(current - context.step, context.min, context.max, context.step);
  setContext({
    value: next,
    inputText: formatNumber(next, context.locale, context.fractionDigits, context.formatOptions),
  });
  context.onValueChange?.(next);
  context.onValueCommit?.(next);
}

function incrementPage({
  context,
  setContext,
}: {
  context: NumberInputContext;
  setContext: (u: Partial<NumberInputContext>) => void;
}) {
  if (context.disabled || context.readOnly) return;
  const current = context.value ?? context.min;
  const next = clampSnap(current + context.largeStep, context.min, context.max, context.step);
  setContext({
    value: next,
    inputText: formatNumber(next, context.locale, context.fractionDigits, context.formatOptions),
  });
  context.onValueChange?.(next);
  context.onValueCommit?.(next);
}

function decrementPage({
  context,
  setContext,
}: {
  context: NumberInputContext;
  setContext: (u: Partial<NumberInputContext>) => void;
}) {
  if (context.disabled || context.readOnly) return;
  const current = context.value ?? context.max;
  const next = clampSnap(current - context.largeStep, context.min, context.max, context.step);
  setContext({
    value: next,
    inputText: formatNumber(next, context.locale, context.fractionDigits, context.formatOptions),
  });
  context.onValueChange?.(next);
  context.onValueCommit?.(next);
}

function setValue({
  context,
  setContext,
  event,
}: {
  context: NumberInputContext;
  setContext: (u: Partial<NumberInputContext>) => void;
  event: Extract<NumberInputEvent, { type: "SET_VALUE" }>;
}) {
  const next = event.value !== null ? clamp(event.value, context.min, context.max) : null;
  setContext({
    value: next,
    inputText:
      next !== null
        ? formatNumber(next, context.locale, context.fractionDigits, context.formatOptions)
        : "",
  });
  context.onValueChange?.(next);
}

function setMin({
  context,
  setContext,
}: {
  context: NumberInputContext;
  setContext: (u: Partial<NumberInputContext>) => void;
}) {
  if (context.disabled || context.readOnly) return;
  setContext({
    value: context.min,
    inputText: formatNumber(
      context.min,
      context.locale,
      context.fractionDigits,
      context.formatOptions,
    ),
  });
  context.onValueChange?.(context.min);
  context.onValueCommit?.(context.min);
}

function setMax({
  context,
  setContext,
}: {
  context: NumberInputContext;
  setContext: (u: Partial<NumberInputContext>) => void;
}) {
  if (context.disabled || context.readOnly) return;
  setContext({
    value: context.max,
    inputText: formatNumber(
      context.max,
      context.locale,
      context.fractionDigits,
      context.formatOptions,
    ),
  });
  context.onValueChange?.(context.max);
  context.onValueCommit?.(context.max);
}

function setInputText({
  setContext,
  event,
}: {
  context: NumberInputContext;
  setContext: (u: Partial<NumberInputContext>) => void;
  event: Extract<NumberInputEvent, { type: "SET_INPUT_TEXT" }>;
}) {
  setContext({ inputText: event.text });
}

function onFocus({
  context,
  setContext,
  event,
}: {
  context: NumberInputContext;
  setContext: (u: Partial<NumberInputContext>) => void;
  event: Extract<NumberInputEvent, { type: "FOCUS" }>;
}) {
  // When focused, show raw number for easy editing
  const raw = context.value !== null ? String(context.value) : "";
  setContext({ focused: true, inputText: raw });
  context.onFocus?.(event.event);
}

function onBlur({
  context,
  setContext,
  event,
}: {
  context: NumberInputContext;
  setContext: (u: Partial<NumberInputContext>) => void;
  event: Extract<NumberInputEvent, { type: "BLUR" }>;
}) {
  // Parse → clamp → round to fractionDigits → format on blur
  const parsed = parseNumber(context.inputText);
  const clamped =
    parsed !== null ? clampSnap(parsed, context.min, context.max, context.step) : null;
  const rounded = clamped !== null ? Number(clamped.toFixed(context.fractionDigits)) : null;
  const next = rounded !== null ? rounded : context.allowEmpty ? null : context.value;
  const prevValue = context.value;
  setContext({
    focused: false,
    value: next,
    inputText:
      next !== null
        ? formatNumber(next, context.locale, context.fractionDigits, context.formatOptions)
        : "",
  });
  if (next !== prevValue) {
    context.onValueChange?.(next);
  }
  context.onValueCommit?.(next);
  context.onBlur?.(event.event);
}

// ---------------------------------------------------------------------------
// Spin activity — pointer held on stepper button fires repeating increment.
// 300ms initial delay then 50ms repeat (standard OS key-repeat cadence).
// ---------------------------------------------------------------------------

function makeSpinActivity(direction: "up" | "down"): ActivityFn<NumberInputContext> {
  return (ctx, { notify }) => {
    if (typeof window === "undefined") return;
    let raf = 0;
    const startTime = Date.now();
    let lastFire = startTime;

    function tick() {
      const now = Date.now();
      const elapsed = now - startTime;
      if (elapsed > 300 && now - lastFire >= 50) {
        const step = ctx.step;
        const current = ctx.value ?? (direction === "up" ? ctx.min : ctx.max);
        const delta = direction === "up" ? step : -step;
        const next = clampSnap(current + delta, ctx.min, ctx.max, step);
        if (next !== ctx.value) {
          ctx.value = next;
          ctx.inputText = formatNumber(next, ctx.locale, ctx.fractionDigits, ctx.formatOptions);
          ctx.onValueChange?.(next);
          notify();
        }
        lastFire = now;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  };
}

const spinUp = makeSpinActivity("up");
const spinDown = makeSpinActivity("down");

// ---------------------------------------------------------------------------
// Machine factory
// ---------------------------------------------------------------------------

export function createNumberInputMachine(options: CreateNumberInputOptions) {
  const min = options.min ?? 0;
  const max = options.max ?? Number.POSITIVE_INFINITY;
  const step = options.step ?? 1;
  const largeStep = options.largeStep ?? step * 10;
  const fractionDigits = options.fractionDigits ?? 0;
  const locale = options.locale ?? "en";
  const formatOptions = options.formatOptions;

  const rawInitial =
    options.value !== undefined
      ? options.value
      : options.defaultValue !== undefined
        ? options.defaultValue
        : null;
  const initialValue = rawInitial !== null ? clamp(rawInitial ?? 0, min, max) : null;
  const initialText =
    initialValue !== null ? formatNumber(initialValue, locale, fractionDigits, formatOptions) : "";

  return createMachine<NumberInputContext, NumberInputState, NumberInputEvent>({
    id: `forge-number-input:${options.id ?? "root"}`,
    context: {
      value: initialValue,
      inputText: initialText,
      min,
      max,
      step,
      largeStep,
      disabled: options.disabled ?? false,
      readOnly: options.readOnly ?? false,
      required: options.required ?? false,
      focused: false,
      locale,
      fractionDigits,
      allowEmpty: options.allowEmpty ?? false,
      ...(formatOptions !== undefined && { formatOptions }),
      ...(options.getValueLabel !== undefined && { getValueLabel: options.getValueLabel }),
      ...(options.onValueChange !== undefined && { onValueChange: options.onValueChange }),
      ...(options.onValueCommit !== undefined && { onValueCommit: options.onValueCommit }),
      ...(options.onFocus !== undefined && { onFocus: options.onFocus }),
      ...(options.onBlur !== undefined && { onBlur: options.onBlur }),
    },
    initial: "idle",
    states: {
      idle: {
        on: {
          INCREMENT: { actions: [increment] },
          DECREMENT: { actions: [decrement] },
          INCREMENT_PAGE: { actions: [incrementPage] },
          DECREMENT_PAGE: { actions: [decrementPage] },
          SET_VALUE: { actions: [setValue] },
          SET_MIN: { actions: [setMin] },
          SET_MAX: { actions: [setMax] },
          SET_INPUT_TEXT: { actions: [setInputText] },
          FOCUS: { actions: [onFocus] },
          BLUR: { actions: [onBlur] },
          SPIN_START_UP: { target: "spinning.up" },
          SPIN_START_DOWN: { target: "spinning.down" },
        },
      },
      "spinning.up": {
        activities: ["spinUp"],
        on: {
          SPIN_STOP: { target: "idle" },
          SPIN_START_DOWN: { target: "spinning.down" },
        },
      },
      "spinning.down": {
        activities: ["spinDown"],
        on: {
          SPIN_STOP: { target: "idle" },
          SPIN_START_UP: { target: "spinning.up" },
        },
      },
    },
    activities: { spinUp, spinDown },
  });
}
