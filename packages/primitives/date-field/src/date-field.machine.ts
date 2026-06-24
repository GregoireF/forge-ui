/**
 * Date Field machine — spinbutton segment input.
 *
 * WHY spinbutton segments (not a plain text input):
 * WCAG 2.1 SC 1.3.5 (Identify Input Purpose) requires date inputs to be
 * identifiable by AT. role="spinbutton" segments give each date part an
 * accessible name ("Day", "Month", "Year"), support arrow-key increment/decrement,
 * and are understood by all major screen readers.
 *
 * This pattern matches the WAI-ARIA APG "Spinbutton Design Pattern" and is used
 * by React Aria, Zag.js DateInput, and native <input type="date"> polyfills.
 *
 * Typing logic:
 * - Buffer accumulates digits as the user types.
 * - For month/day (max 2 digits): if the buffer would exceed max, commit on first digit.
 *   e.g. "5" for month → buffer="5", display "05", wait for second digit.
 *       "7" → could be 7 (wait), but typing "2" → 72 > 12 → commit "7", move to next.
 * - For year (4 digits): commit when buffer reaches 4 characters.
 * - After committing, auto-advance to the next segment.
 *
 * WHY not <input type="date">:
 * Browser-native date inputs have inconsistent keyboard behavior and styling
 * constraints across platforms (especially iOS Safari). The spinbutton pattern
 * gives full control and matches design system conventions.
 */

import { createMachine } from "@forge-ui/core";
import { getDaysInMonth } from "@forge-ui/date-picker";
import type {
  CalendarDate,
  CreateDateFieldOptions,
  DateFieldContext,
  DateFieldEvent,
  DateFieldState,
  DateSegmentType,
} from "./date-field.types.js";

// ---------------------------------------------------------------------------
// Segment limits
// ---------------------------------------------------------------------------

const SEGMENT_MIN: Record<DateSegmentType, number> = { day: 1, month: 1, year: 1 };
const SEGMENT_MAX: Record<DateSegmentType, number> = { day: 31, month: 12, year: 9999 };
const SEGMENT_DIGITS: Record<DateSegmentType, number> = { day: 2, month: 2, year: 4 };

function getSegmentValue(ctx: DateFieldContext, seg: DateSegmentType): number | null {
  if (seg === "day") return ctx.dayValue;
  if (seg === "month") return ctx.monthValue;
  return ctx.yearValue;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function tryBuildDate(ctx: DateFieldContext): CalendarDate | null {
  const { dayValue, monthValue, yearValue } = ctx;
  if (dayValue === null || monthValue === null || yearValue === null) return null;
  const maxDay = getDaysInMonth(yearValue, monthValue);
  const day = Math.min(dayValue, maxDay);
  return { year: yearValue, month: monthValue, day };
}

function segmentOrder(): DateSegmentType[] {
  // Locale-aware ordering could be added; default to month/day/year (en-US)
  return ["month", "day", "year"];
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function focusSegment({
  event,
  setContext,
}: {
  context: DateFieldContext;
  setContext: (u: Partial<DateFieldContext>) => void;
  event: Extract<DateFieldEvent, { type: "FOCUS_SEGMENT" }>;
}) {
  setContext({ focusedSegment: event.segment, typingBuffer: "" });
}

function blurSegment({
  setContext,
}: {
  context: DateFieldContext;
  setContext: (u: Partial<DateFieldContext>) => void;
}) {
  setContext({ focusedSegment: null, typingBuffer: "" });
}

function typeDigit({
  context,
  event,
  setContext,
}: {
  context: DateFieldContext;
  setContext: (u: Partial<DateFieldContext>) => void;
  event: Extract<DateFieldEvent, { type: "TYPE_DIGIT" }>;
}) {
  if (context.disabled || context.readOnly || !context.focusedSegment) return;
  const seg = context.focusedSegment;
  const maxDigits = SEGMENT_DIGITS[seg];
  const maxVal = SEGMENT_MAX[seg];
  const newBuffer = context.typingBuffer + event.digit;
  const newVal = parseInt(newBuffer, 10);

  if (newBuffer.length >= maxDigits || newVal * 10 > maxVal) {
    // Commit this segment, advance
    const committed = clamp(newVal, SEGMENT_MIN[seg], maxVal);
    const update = setSegmentValue(seg, committed);
    const order = segmentOrder();
    const idx = order.indexOf(seg);
    const nextSeg = order[idx + 1] ?? null;
    setContext({ ...update, typingBuffer: "", focusedSegment: nextSeg });
    const draft = { ...context, ...update };
    const date = tryBuildDate(draft);
    if (date) context.onValueChange?.(date);
  } else {
    // Accumulate
    const update = setSegmentValue(seg, newVal);
    setContext({ ...update, typingBuffer: newBuffer });
  }
}

function setSegmentValue(seg: DateSegmentType, val: number): Partial<DateFieldContext> {
  if (seg === "day") return { dayValue: val };
  if (seg === "month") return { monthValue: val };
  return { yearValue: val };
}

function increment({
  context,
  setContext,
}: {
  context: DateFieldContext;
  setContext: (u: Partial<DateFieldContext>) => void;
}) {
  if (context.disabled || context.readOnly || !context.focusedSegment) return;
  const seg = context.focusedSegment;
  const current = getSegmentValue(context, seg) ?? SEGMENT_MIN[seg] - 1;
  const max = seg === "day" && context.monthValue && context.yearValue
    ? getDaysInMonth(context.yearValue, context.monthValue)
    : SEGMENT_MAX[seg];
  const next = current >= max ? SEGMENT_MIN[seg] : current + 1;
  const update = setSegmentValue(seg, next);
  setContext({ ...update, typingBuffer: "" });
  const date = tryBuildDate({ ...context, ...update });
  if (date) context.onValueChange?.(date);
}

function decrement({
  context,
  setContext,
}: {
  context: DateFieldContext;
  setContext: (u: Partial<DateFieldContext>) => void;
}) {
  if (context.disabled || context.readOnly || !context.focusedSegment) return;
  const seg = context.focusedSegment;
  const current = getSegmentValue(context, seg) ?? SEGMENT_MAX[seg] + 1;
  const max = seg === "day" && context.monthValue && context.yearValue
    ? getDaysInMonth(context.yearValue, context.monthValue)
    : SEGMENT_MAX[seg];
  const next = current <= SEGMENT_MIN[seg] ? max : current - 1;
  const update = setSegmentValue(seg, next);
  setContext({ ...update, typingBuffer: "" });
  const date = tryBuildDate({ ...context, ...update });
  if (date) context.onValueChange?.(date);
}

function clearSegment({
  context,
  setContext,
}: {
  context: DateFieldContext;
  setContext: (u: Partial<DateFieldContext>) => void;
}) {
  if (context.disabled || context.readOnly || !context.focusedSegment) return;
  const update = setSegmentValue(context.focusedSegment, null as unknown as number);
  // null is intentional here — segment is being cleared
  if (context.focusedSegment === "day") setContext({ dayValue: null, typingBuffer: "" });
  else if (context.focusedSegment === "month") setContext({ monthValue: null, typingBuffer: "" });
  else setContext({ yearValue: null, typingBuffer: "" });
  const draft = { ...context, ...update, [context.focusedSegment + "Value"]: null };
  const date = tryBuildDate(draft);
  context.onValueChange?.(date);
}

function setValue({
  event,
  context,
  setContext,
}: {
  context: DateFieldContext;
  setContext: (u: Partial<DateFieldContext>) => void;
  event: Extract<DateFieldEvent, { type: "SET_VALUE" }>;
}) {
  if (event.date === null) {
    setContext({ dayValue: null, monthValue: null, yearValue: null, typingBuffer: "" });
    context.onValueChange?.(null);
  } else {
    setContext({
      dayValue: event.date.day,
      monthValue: event.date.month,
      yearValue: event.date.year,
      typingBuffer: "",
    });
    context.onValueChange?.(event.date);
  }
}

function nextSegment({
  context,
  setContext,
}: {
  context: DateFieldContext;
  setContext: (u: Partial<DateFieldContext>) => void;
}) {
  const order = segmentOrder();
  const idx = context.focusedSegment ? order.indexOf(context.focusedSegment) : -1;
  const next = order[idx + 1] ?? null;
  setContext({ focusedSegment: next, typingBuffer: "" });
}

function prevSegment({
  context,
  setContext,
}: {
  context: DateFieldContext;
  setContext: (u: Partial<DateFieldContext>) => void;
}) {
  const order = segmentOrder();
  const idx = context.focusedSegment ? order.indexOf(context.focusedSegment) : order.length;
  const prev = order[idx - 1] ?? null;
  setContext({ focusedSegment: prev, typingBuffer: "" });
}

// ---------------------------------------------------------------------------
// Machine factory
// ---------------------------------------------------------------------------

export function createDateFieldMachine(options: CreateDateFieldOptions) {
  const initial = options.value ?? options.defaultValue ?? null;

  return createMachine<DateFieldContext, DateFieldState, DateFieldEvent>({
    id: `forge-date-field:${options.id ?? "root"}`,
    context: {
      id: options.id ?? "root",
      dayValue: initial?.day ?? null,
      monthValue: initial?.month ?? null,
      yearValue: initial?.year ?? null,
      focusedSegment: null,
      typingBuffer: "",
      locale: options.locale ?? "en",
      disabled: options.disabled ?? false,
      readOnly: options.readOnly ?? false,
      ...(options.min !== undefined && { min: options.min }),
      ...(options.max !== undefined && { max: options.max }),
      ...(options.isDateUnavailable !== undefined && { isDateUnavailable: options.isDateUnavailable }),
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
          CLEAR_SEGMENT: { actions: [clearSegment] },
          SET_VALUE: { actions: [setValue] },
          NEXT_SEGMENT: { actions: [nextSegment] },
          PREV_SEGMENT: { actions: [prevSegment] },
        },
      },
    },
  });
}
