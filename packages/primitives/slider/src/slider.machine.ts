import { createMachine } from "@forge-ui/core";
import type { ActivityFn } from "@forge-ui/core";
import type { CreateSliderOptions, SliderContext, SliderEvent, SliderState } from "./slider.types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function snapToStep(value: number, min: number, step: number): number {
  const snapped = Math.round((value - min) / step) * step + min;
  // Avoid floating point drift (e.g. 0.1 + 0.2 = 0.30000000000000004)
  const decimals = String(step).split(".")[1]?.length ?? 0;
  return Number(snapped.toFixed(decimals));
}

function computeValueFromPointer(e: PointerEvent, ctx: SliderContext): number {
  const el = ctx.trackEl;
  if (!el) return ctx.value;
  const rect = el.getBoundingClientRect();
  let percent: number;
  if (ctx.orientation === "horizontal") {
    percent = (e.clientX - rect.left) / rect.width;
  } else {
    percent = 1 - (e.clientY - rect.top) / rect.height;
  }
  percent = clamp(percent, 0, 1);
  const raw = ctx.min + percent * (ctx.max - ctx.min);
  return clamp(snapToStep(raw, ctx.min, ctx.step), ctx.min, ctx.max);
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
  event: SliderEvent;
}) {
  if (event.type !== "POINTER_DOWN") return;
  if (context.disabled) return;
  const next = clamp(event.value, context.min, context.max);
  setContext({ value: next });
  context.onValueChange?.(next);
}

function increment({
  context,
  setContext,
}: {
  context: SliderContext;
  setContext: (u: Partial<SliderContext>) => void;
  event: SliderEvent;
}) {
  if (context.disabled) return;
  const next = clamp(snapToStep(context.value + context.step, context.min, context.step), context.min, context.max);
  setContext({ value: next });
  context.onValueChange?.(next);
  context.onValueCommit?.(next);
}

function decrement({
  context,
  setContext,
}: {
  context: SliderContext;
  setContext: (u: Partial<SliderContext>) => void;
  event: SliderEvent;
}) {
  if (context.disabled) return;
  const next = clamp(snapToStep(context.value - context.step, context.min, context.step), context.min, context.max);
  setContext({ value: next });
  context.onValueChange?.(next);
  context.onValueCommit?.(next);
}

function incrementPage({
  context,
  setContext,
}: {
  context: SliderContext;
  setContext: (u: Partial<SliderContext>) => void;
  event: SliderEvent;
}) {
  if (context.disabled) return;
  const pageStep = (context.max - context.min) / 10;
  const next = clamp(snapToStep(context.value + pageStep, context.min, context.step), context.min, context.max);
  setContext({ value: next });
  context.onValueChange?.(next);
  context.onValueCommit?.(next);
}

function decrementPage({
  context,
  setContext,
}: {
  context: SliderContext;
  setContext: (u: Partial<SliderContext>) => void;
  event: SliderEvent;
}) {
  if (context.disabled) return;
  const pageStep = (context.max - context.min) / 10;
  const next = clamp(snapToStep(context.value - pageStep, context.min, context.step), context.min, context.max);
  setContext({ value: next });
  context.onValueChange?.(next);
  context.onValueCommit?.(next);
}

function setValue({
  setContext,
  event,
}: {
  context: SliderContext;
  setContext: (u: Partial<SliderContext>) => void;
  event: SliderEvent;
}) {
  if (event.type !== "SET_VALUE") return;
  setContext({ value: event.value });
}

// ---------------------------------------------------------------------------
// Drag activity — runs while in "dragging" state
// ---------------------------------------------------------------------------

const drag: ActivityFn<SliderContext> = (ctx, { send, notify }) => {
  if (typeof document === "undefined") return;

  function onPointerMove(e: PointerEvent) {
    if (ctx.disabled) return;
    const newValue = computeValueFromPointer(e, ctx);
    if (newValue === ctx.value) return;
    ctx.value = newValue;
    ctx.onValueChange?.(newValue);
    notify();
  }

  function onPointerUp(e: PointerEvent) {
    const committed = computeValueFromPointer(e, ctx);
    ctx.onValueCommit?.(committed);
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

export function createSliderMachine(options: CreateSliderOptions) {
  const min = options.min ?? 0;
  const max = options.max ?? 100;
  const step = options.step ?? 1;
  const initialValue = clamp(
    options.value ?? options.defaultValue ?? min,
    min,
    max,
  );

  return createMachine<SliderContext, SliderState, SliderEvent>({
    id: `forge-slider:${options.id ?? "root"}`,
    context: {
      value: initialValue,
      min,
      max,
      step,
      orientation: options.orientation ?? "horizontal",
      disabled: options.disabled ?? false,
      trackEl: null,
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
