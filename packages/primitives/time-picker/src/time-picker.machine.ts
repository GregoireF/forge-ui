/**
 * Time Picker machine — spinbutton segments for H:MM:SS [AM/PM].
 *
 * WHY spinbutton pattern (same as date-field):
 * Consistent with DateField, accessible, works with all AT.
 * Native <input type="time"> has poor styling control and no way to
 * show/hide seconds or customize step without a hack.
 *
 * Internal storage: always 24h (0-23). Display in 12h when hourCycle=12.
 * WHY 24h internally: avoids AM/PM confusion in onValueChange callbacks.
 * Consumers always receive { hours: 0-23, minutes, seconds }.
 *
 * WHY minuteStep / secondStep:
 * Common UX need (e.g. step=15 → 0, 15, 30, 45). Matches what competitors
 * (React Aria, Mantine, DayPicker) expose. Arrow-key increment uses step.
 */

import { createMachine } from "@forge-ui/core";
import type {
  CreateTimePickerOptions,
  TimePickerContext,
  TimePickerEvent,
  TimePickerState,
  TimeSegmentType,
  TimeValue,
} from "./time-picker.types.js";

function getSegmentValue(ctx: TimePickerContext, seg: TimeSegmentType): number | null {
  if (seg === "hours") return ctx.hoursValue;
  if (seg === "minutes") return ctx.minutesValue;
  if (seg === "seconds") return ctx.secondsValue;
  return null; // period is not a number
}

function tryBuildTime(ctx: TimePickerContext): TimeValue | null {
  if (ctx.hoursValue === null || ctx.minutesValue === null) return null;
  if (ctx.showSeconds && ctx.secondsValue === null) return null;
  return {
    hours: ctx.hoursValue,
    minutes: ctx.minutesValue,
    seconds: ctx.secondsValue ?? 0,
  };
}

function segmentOrder(ctx: TimePickerContext): TimeSegmentType[] {
  const order: TimeSegmentType[] = ["hours", "minutes"];
  if (ctx.showSeconds) order.push("seconds");
  if (ctx.hourCycle === 12) order.push("period");
  return order;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function focusSegment({
  event,
  setContext,
}: {
  context: TimePickerContext;
  setContext: (u: Partial<TimePickerContext>) => void;
  event: Extract<TimePickerEvent, { type: "FOCUS_SEGMENT" }>;
}) {
  setContext({ focusedSegment: event.segment, typingBuffer: "" });
}

function blurSegment({
  setContext,
}: {
  context: TimePickerContext;
  setContext: (u: Partial<TimePickerContext>) => void;
}) {
  setContext({ focusedSegment: null, typingBuffer: "" });
}

function typeDigit({
  context,
  event,
  setContext,
}: {
  context: TimePickerContext;
  setContext: (u: Partial<TimePickerContext>) => void;
  event: Extract<TimePickerEvent, { type: "TYPE_DIGIT" }>;
}) {
  if (context.disabled || context.readOnly) return;
  const seg = context.focusedSegment;
  if (!seg || seg === "period") return;

  const maxDigits = seg === "hours" ? 2 : 2;
  const maxVals: Record<string, number> = {
    hours: context.hourCycle === 12 ? 12 : 23,
    minutes: 59,
    seconds: 59,
  };
  const maxVal = maxVals[seg] ?? 59;
  const newBuffer = context.typingBuffer + event.digit;
  const newVal = parseInt(newBuffer, 10);

  if (newBuffer.length >= maxDigits || newVal * 10 > maxVal) {
    let committed = Math.min(newVal, maxVal);
    // Convert 12h display back to 24h
    let hoursUpdate = context.hoursValue;
    if (seg === "hours" && context.hourCycle === 12) {
      if (committed === 12) committed = context.period === "AM" ? 0 : 12;
      else committed = context.period === "PM" ? committed + 12 : committed;
      hoursUpdate = committed;
    }
    const update = seg === "hours" ? { hoursValue: context.hourCycle === 12 ? hoursUpdate : committed }
      : seg === "minutes" ? { minutesValue: committed }
      : { secondsValue: committed };

    const order = segmentOrder(context);
    const idx = order.indexOf(seg);
    const nextSeg = order[idx + 1] ?? null;
    setContext({ ...update, typingBuffer: "", focusedSegment: nextSeg });
    const draft = { ...context, ...update };
    const time = tryBuildTime(draft);
    if (time) context.onValueChange?.(time);
  } else {
    const update = seg === "hours" ? { hoursValue: newVal }
      : seg === "minutes" ? { minutesValue: newVal }
      : { secondsValue: newVal };
    setContext({ ...update, typingBuffer: newBuffer });
  }
}

function increment({
  context,
  setContext,
}: {
  context: TimePickerContext;
  setContext: (u: Partial<TimePickerContext>) => void;
}) {
  if (context.disabled || context.readOnly || !context.focusedSegment) return;
  const seg = context.focusedSegment;

  if (seg === "period") {
    const next = context.period === "AM" ? "PM" : "AM";
    const h = context.hoursValue ?? 0;
    const newHours = next === "PM" ? (h % 12) + 12 : h % 12;
    setContext({ period: next, hoursValue: newHours });
    const time = tryBuildTime({ ...context, period: next, hoursValue: newHours });
    if (time) context.onValueChange?.(time);
    return;
  }

  const step = seg === "minutes" ? context.minuteStep : seg === "seconds" ? context.secondStep : 1;
  const maxVals: Record<string, number> = {
    hours: context.hourCycle === 12 ? 12 : 23,
    minutes: 59,
    seconds: 59,
  };
  const minVals: Record<string, number> = {
    hours: context.hourCycle === 12 ? 1 : 0,
    minutes: 0,
    seconds: 0,
  };
  const maxVal = maxVals[seg] ?? 59;
  const minVal = minVals[seg] ?? 0;
  const current = getSegmentValue(context, seg) ?? minVal - step;
  let next = current + step;
  if (next > maxVal) next = minVal;

  const update = seg === "hours" ? { hoursValue: next }
    : seg === "minutes" ? { minutesValue: next }
    : { secondsValue: next };
  setContext({ ...update, typingBuffer: "" });
  const time = tryBuildTime({ ...context, ...update });
  if (time) context.onValueChange?.(time);
}

function decrement({
  context,
  setContext,
}: {
  context: TimePickerContext;
  setContext: (u: Partial<TimePickerContext>) => void;
}) {
  if (context.disabled || context.readOnly || !context.focusedSegment) return;
  const seg = context.focusedSegment;

  if (seg === "period") {
    const next = context.period === "AM" ? "PM" : "AM";
    const h = context.hoursValue ?? 0;
    const newHours = next === "PM" ? (h % 12) + 12 : h % 12;
    setContext({ period: next, hoursValue: newHours });
    const time = tryBuildTime({ ...context, period: next, hoursValue: newHours });
    if (time) context.onValueChange?.(time);
    return;
  }

  const step = seg === "minutes" ? context.minuteStep : seg === "seconds" ? context.secondStep : 1;
  const maxVals: Record<string, number> = {
    hours: context.hourCycle === 12 ? 12 : 23,
    minutes: 59,
    seconds: 59,
  };
  const minVals: Record<string, number> = {
    hours: context.hourCycle === 12 ? 1 : 0,
    minutes: 0,
    seconds: 0,
  };
  const maxVal = maxVals[seg] ?? 59;
  const minVal = minVals[seg] ?? 0;
  const current = getSegmentValue(context, seg) ?? maxVal + step;
  let next = current - step;
  if (next < minVal) next = maxVal;

  const update = seg === "hours" ? { hoursValue: next }
    : seg === "minutes" ? { minutesValue: next }
    : { secondsValue: next };
  setContext({ ...update, typingBuffer: "" });
  const time = tryBuildTime({ ...context, ...update });
  if (time) context.onValueChange?.(time);
}

function togglePeriod({
  context,
  setContext,
}: {
  context: TimePickerContext;
  setContext: (u: Partial<TimePickerContext>) => void;
}) {
  if (context.disabled || context.readOnly || context.hourCycle !== 12) return;
  const next = context.period === "AM" ? "PM" : "AM";
  const h = context.hoursValue ?? 0;
  const newHours = next === "PM" ? (h % 12) + 12 : h % 12;
  setContext({ period: next, hoursValue: newHours });
  const time = tryBuildTime({ ...context, period: next, hoursValue: newHours });
  if (time) context.onValueChange?.(time);
}

function clearSegment({
  context,
  setContext,
}: {
  context: TimePickerContext;
  setContext: (u: Partial<TimePickerContext>) => void;
}) {
  if (context.disabled || context.readOnly || !context.focusedSegment) return;
  const seg = context.focusedSegment;
  if (seg === "hours") setContext({ hoursValue: null, typingBuffer: "" });
  else if (seg === "minutes") setContext({ minutesValue: null, typingBuffer: "" });
  else if (seg === "seconds") setContext({ secondsValue: null, typingBuffer: "" });
  context.onValueChange?.(null);
}

function setValueAction({
  event,
  context,
  setContext,
}: {
  context: TimePickerContext;
  setContext: (u: Partial<TimePickerContext>) => void;
  event: Extract<TimePickerEvent, { type: "SET_VALUE" }>;
}) {
  if (event.time === null) {
    setContext({ hoursValue: null, minutesValue: null, secondsValue: null, typingBuffer: "" });
    context.onValueChange?.(null);
  } else {
    const { hours, minutes, seconds } = event.time;
    const period = hours >= 12 ? "PM" : "AM";
    setContext({ hoursValue: hours, minutesValue: minutes, secondsValue: seconds, period, typingBuffer: "" });
    context.onValueChange?.(event.time);
  }
}

function nextSegment({
  context,
  setContext,
}: {
  context: TimePickerContext;
  setContext: (u: Partial<TimePickerContext>) => void;
}) {
  const order = segmentOrder(context);
  const idx = context.focusedSegment ? order.indexOf(context.focusedSegment) : -1;
  setContext({ focusedSegment: order[idx + 1] ?? null, typingBuffer: "" });
}

function prevSegment({
  context,
  setContext,
}: {
  context: TimePickerContext;
  setContext: (u: Partial<TimePickerContext>) => void;
}) {
  const order = segmentOrder(context);
  const idx = context.focusedSegment ? order.indexOf(context.focusedSegment) : order.length;
  setContext({ focusedSegment: order[idx - 1] ?? null, typingBuffer: "" });
}

// ---------------------------------------------------------------------------
// Machine factory
// ---------------------------------------------------------------------------

export function createTimePickerMachine(options: CreateTimePickerOptions) {
  const initial = options.value ?? options.defaultValue ?? null;

  return createMachine<TimePickerContext, TimePickerState, TimePickerEvent>({
    id: `forge-time-picker:${options.id ?? "root"}`,
    context: {
      id: options.id ?? "root",
      hoursValue: initial?.hours ?? null,
      minutesValue: initial?.minutes ?? null,
      secondsValue: initial?.seconds ?? null,
      period: initial ? (initial.hours >= 12 ? "PM" : "AM") : "AM",
      focusedSegment: null,
      typingBuffer: "",
      hourCycle: options.hourCycle ?? 24,
      showSeconds: options.showSeconds ?? false,
      minuteStep: options.minuteStep ?? 1,
      secondStep: options.secondStep ?? 1,
      locale: options.locale ?? "en",
      disabled: options.disabled ?? false,
      readOnly: options.readOnly ?? false,
      ...(options.onValueChange !== undefined && { onValueChange: options.onValueChange }),
    },
    initial: "idle",

    states: {
      idle: {
        on: {
          FOCUS_SEGMENT: { actions: [focusSegment] },
          BLUR_SEGMENT: { actions: [blurSegment] },
          TYPE_DIGIT: { actions: [typeDigit] },
          INCREMENT: { actions: [increment] },
          DECREMENT: { actions: [decrement] },
          TOGGLE_PERIOD: { actions: [togglePeriod] },
          CLEAR_SEGMENT: { actions: [clearSegment] },
          SET_VALUE: { actions: [setValueAction] },
          NEXT_SEGMENT: { actions: [nextSegment] },
          PREV_SEGMENT: { actions: [prevSegment] },
        },
      },
    },
  });
}
