import type { ActivityFn } from "@forge-ui/core";
import { createMachine } from "@forge-ui/core";
import type {
  CreateSliderOptions,
  SliderContext,
  SliderEvent,
  SliderState,
} from "./slider.types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function snapToStep(value: number, min: number, step: number): number {
  const snapped = Math.round((value - min) / step) * step + min;
  const decimals = String(step).split(".")[1]?.length ?? 0;
  return Number(snapped.toFixed(decimals));
}

function snapAndClamp(value: number, min: number, max: number, step: number): number {
  return clamp(snapToStep(value, min, step), min, max);
}

function computeValueFromPointer(e: PointerEvent, ctx: SliderContext): number {
  const el = ctx.trackEl;
  if (!el) return ctx.values[0] ?? ctx.min;
  const rect = el.getBoundingClientRect();
  let percent: number;
  if (ctx.orientation === "horizontal") {
    percent = (e.clientX - rect.left) / rect.width;
  } else {
    percent = 1 - (e.clientY - rect.top) / rect.height;
  }
  percent = clamp(percent, 0, 1);
  const raw = ctx.min + percent * (ctx.max - ctx.min);
  return snapAndClamp(raw, ctx.min, ctx.max, ctx.step);
}

// Produce updated values array with one thumb changed, clamped between neighbors.
function updateThumb(
  values: number[],
  index: number,
  next: number,
  min: number,
  max: number,
): number[] {
  const lo = index > 0 ? (values[index - 1] ?? min) : min;
  const hi = index < values.length - 1 ? (values[index + 1] ?? max) : max;
  const clamped = clamp(next, lo, hi);
  const copy = [...values];
  copy[index] = clamped;
  return copy;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function setValueFromPointerDown({
  context,
  setContext,
  event,
}: {
  context: SliderContext;
  setContext: (u: Partial<SliderContext>) => void;
  event: Extract<SliderEvent, { type: "POINTER_DOWN" }>;
}) {
  if (context.disabled) return;
  const next = updateThumb(context.values, event.thumbIndex, event.value, context.min, context.max);
  setContext({ values: next, activeThumb: event.thumbIndex });
  context.onValueChange?.(next);
}

function increment({
  context,
  setContext,
  event,
}: {
  context: SliderContext;
  setContext: (u: Partial<SliderContext>) => void;
  event: Extract<SliderEvent, { type: "INCREMENT" }>;
}) {
  if (context.disabled) return;
  const { thumbIndex } = event;
  const current = context.values[thumbIndex];
  if (current === undefined) return;
  const next = updateThumb(
    context.values,
    thumbIndex,
    snapAndClamp(current + context.step, context.min, context.max, context.step),
    context.min,
    context.max,
  );
  setContext({ values: next });
  context.onValueChange?.(next);
  context.onValueCommit?.(next);
}

function decrement({
  context,
  setContext,
  event,
}: {
  context: SliderContext;
  setContext: (u: Partial<SliderContext>) => void;
  event: Extract<SliderEvent, { type: "DECREMENT" }>;
}) {
  if (context.disabled) return;
  const { thumbIndex } = event;
  const current = context.values[thumbIndex];
  if (current === undefined) return;
  const next = updateThumb(
    context.values,
    thumbIndex,
    snapAndClamp(current - context.step, context.min, context.max, context.step),
    context.min,
    context.max,
  );
  setContext({ values: next });
  context.onValueChange?.(next);
  context.onValueCommit?.(next);
}

function incrementPage({
  context,
  setContext,
  event,
}: {
  context: SliderContext;
  setContext: (u: Partial<SliderContext>) => void;
  event: Extract<SliderEvent, { type: "INCREMENT_PAGE" }>;
}) {
  if (context.disabled) return;
  const { thumbIndex } = event;
  const current = context.values[thumbIndex];
  if (current === undefined) return;
  const pageStep = (context.max - context.min) / 10;
  const next = updateThumb(
    context.values,
    thumbIndex,
    snapAndClamp(current + pageStep, context.min, context.max, context.step),
    context.min,
    context.max,
  );
  setContext({ values: next });
  context.onValueChange?.(next);
  context.onValueCommit?.(next);
}

function decrementPage({
  context,
  setContext,
  event,
}: {
  context: SliderContext;
  setContext: (u: Partial<SliderContext>) => void;
  event: Extract<SliderEvent, { type: "DECREMENT_PAGE" }>;
}) {
  if (context.disabled) return;
  const { thumbIndex } = event;
  const current = context.values[thumbIndex];
  if (current === undefined) return;
  const pageStep = (context.max - context.min) / 10;
  const next = updateThumb(
    context.values,
    thumbIndex,
    snapAndClamp(current - pageStep, context.min, context.max, context.step),
    context.min,
    context.max,
  );
  setContext({ values: next });
  context.onValueChange?.(next);
  context.onValueCommit?.(next);
}

function setValue({
  context,
  setContext,
  event,
}: {
  context: SliderContext;
  setContext: (u: Partial<SliderContext>) => void;
  event: Extract<SliderEvent, { type: "SET_VALUE" }>;
}) {
  const next = updateThumb(context.values, event.thumbIndex, event.value, context.min, context.max);
  setContext({ values: next });
}

function setMin({
  context,
  setContext,
  event,
}: {
  context: SliderContext;
  setContext: (u: Partial<SliderContext>) => void;
  event: Extract<SliderEvent, { type: "SET_MIN" }>;
}) {
  const next = updateThumb(context.values, event.thumbIndex, context.min, context.min, context.max);
  setContext({ values: next });
}

function setMax({
  context,
  setContext,
  event,
}: {
  context: SliderContext;
  setContext: (u: Partial<SliderContext>) => void;
  event: Extract<SliderEvent, { type: "SET_MAX" }>;
}) {
  const next = updateThumb(context.values, event.thumbIndex, context.max, context.min, context.max);
  setContext({ values: next });
}

// ---------------------------------------------------------------------------
// Drag activity — runs while in "dragging" state
// ---------------------------------------------------------------------------

const drag: ActivityFn<SliderContext> = (ctx, { send, notify }) => {
  if (typeof document === "undefined") return;

  function onPointerMove(e: PointerEvent) {
    if (ctx.disabled) return;
    const newValue = computeValueFromPointer(e, ctx);
    const thumbIndex = ctx.activeThumb;
    const current = ctx.values[thumbIndex];
    if (current === undefined) return;
    const lo = thumbIndex > 0 ? (ctx.values[thumbIndex - 1] ?? ctx.min) : ctx.min;
    const hi =
      thumbIndex < ctx.values.length - 1 ? (ctx.values[thumbIndex + 1] ?? ctx.max) : ctx.max;
    const clamped = clamp(newValue, lo, hi);
    if (clamped === current) return;
    ctx.values = [...ctx.values];
    ctx.values[thumbIndex] = clamped;
    ctx.onValueChange?.(ctx.values);
    notify();
  }

  function onPointerUp(e: PointerEvent) {
    const committed = computeValueFromPointer(e, ctx);
    const thumbIndex = ctx.activeThumb;
    const current = ctx.values[thumbIndex];
    if (current !== undefined) {
      const lo = thumbIndex > 0 ? (ctx.values[thumbIndex - 1] ?? ctx.min) : ctx.min;
      const hi =
        thumbIndex < ctx.values.length - 1 ? (ctx.values[thumbIndex + 1] ?? ctx.max) : ctx.max;
      const final = [...ctx.values];
      final[thumbIndex] = clamp(committed, lo, hi);
      ctx.onValueCommit?.(final);
    }
    send("POINTER_UP");
  }

  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp, { once: true });
  document.addEventListener("pointercancel", () => send("POINTER_UP"), { once: true });

  return () => {
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
  };
};

// ---------------------------------------------------------------------------
// Machine factory
// ---------------------------------------------------------------------------

function normalizeValues(raw: number | number[] | undefined, min: number, max: number): number[] {
  if (raw === undefined) return [min];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map((v) => clamp(v, min, max));
}

export function createSliderMachine(options: CreateSliderOptions) {
  const min = options.min ?? 0;
  const max = options.max ?? 100;
  const step = options.step ?? 1;
  const initialValues = normalizeValues(options.value ?? options.defaultValue, min, max);

  return createMachine<SliderContext, SliderState, SliderEvent>({
    id: `forge-slider:${options.id ?? "root"}`,
    context: {
      values: initialValues,
      min,
      max,
      step,
      orientation: options.orientation ?? "horizontal",
      disabled: options.disabled ?? false,
      trackEl: null,
      activeThumb: -1,
      ...(options.marks !== undefined && { marks: options.marks }),
      ...(options.getValueLabel !== undefined && { getValueLabel: options.getValueLabel }),
      ...(options.onValueChange !== undefined && { onValueChange: options.onValueChange }),
      ...(options.onValueCommit !== undefined && { onValueCommit: options.onValueCommit }),
    },
    initial: "idle",
    states: {
      idle: {
        on: {
          POINTER_DOWN: { target: "dragging", actions: [setValueFromPointerDown] },
          INCREMENT: { actions: [increment] },
          DECREMENT: { actions: [decrement] },
          INCREMENT_PAGE: { actions: [incrementPage] },
          DECREMENT_PAGE: { actions: [decrementPage] },
          SET_VALUE: { actions: [setValue] },
          SET_MIN: { actions: [setMin] },
          SET_MAX: { actions: [setMax] },
        },
      },
      dragging: {
        activities: ["drag"],
        on: {
          POINTER_UP: { target: "idle" },
        },
      },
    },
    activities: { drag },
  });
}
