import {
  createMachine,
  makeKeyboardActivity,
  makeLayerActivity,
  makeWatchOutsideActivity,
  makeFocusActivity,
} from "@forge-ui/core";
import {
  addDays,
  addMonths,
  getDayOfWeek,
  getDaysInMonth,
  isDateDisabled,
  todayAsCalendarDate,
} from "./calendar.js";
import type {
  CalendarDate,
  CreateDatePickerOptions,
  DatePickerContext,
  DatePickerEvent,
  DatePickerState,
} from "./date-picker.types.js";

// ---------------------------------------------------------------------------
// Action helpers
// ---------------------------------------------------------------------------

function clampToValid(
  date: CalendarDate,
  ctx: DatePickerContext,
): CalendarDate {
  if (!isDateDisabled(date, ctx.min, ctx.max, ctx.isDateUnavailable)) return date;
  // Try to find nearest enabled date in forward direction
  for (let i = 1; i <= 365; i++) {
    const next = addDays(date, i);
    if (!isDateDisabled(next, ctx.min, ctx.max, ctx.isDateUnavailable)) return next;
  }
  return date;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function open({
  context,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
}) {
  context.onOpenChange?.(true);
  // Ensure focusedDate is within the valid range when opening
  const focused = clampToValid(context.focusedDate, context);
  setContext({ focusedDate: focused });
}

function close({ context }: { context: DatePickerContext }) {
  context.onOpenChange?.(false);
}

function selectDay({
  context,
  event,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
  event: Extract<DatePickerEvent, { type: "SELECT_DAY" }>;
}) {
  if (context.disabled || context.readOnly) return;
  if (isDateDisabled(event.date, context.min, context.max, context.isDateUnavailable)) return;
  setContext({ value: event.date, focusedDate: event.date });
  context.onValueChange?.(event.date);
}

function selectFocused({
  context,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
}) {
  if (context.disabled || context.readOnly) return;
  const { focusedDate } = context;
  if (isDateDisabled(focusedDate, context.min, context.max, context.isDateUnavailable)) return;
  setContext({ value: focusedDate });
  context.onValueChange?.(focusedDate);
}

function navigatePrevMonth({
  context,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
}) {
  const target = addMonths(context.focusedDate, -1);
  setContext({ focusedDate: clampToValid(target, context) });
}

function navigateNextMonth({
  context,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
}) {
  const target = addMonths(context.focusedDate, 1);
  setContext({ focusedDate: clampToValid(target, context) });
}

function navigateToMonth({
  context: ctx,
  event,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
  event: Extract<DatePickerEvent, { type: "NAVIGATE_TO_MONTH" }>;
}) {
  const maxDay = getDaysInMonth(event.year, event.month);
  const target = { year: event.year, month: event.month, day: Math.min(ctx.focusedDate.day, maxDay) };
  setContext({ focusedDate: clampToValid(target, ctx) });
}

function focusDay({
  event,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
  event: Extract<DatePickerEvent, { type: "FOCUS_DAY" }>;
}) {
  setContext({ focusedDate: event.date });
}

function moveFocus(delta: number) {
  return function ({
    context,
    setContext,
  }: {
    context: DatePickerContext;
    setContext: (u: Partial<DatePickerContext>) => void;
  }) {
    const next = addDays(context.focusedDate, delta);
    if (!isDateDisabled(next, context.min, context.max, context.isDateUnavailable)) {
      setContext({ focusedDate: next });
    }
  };
}

function moveFocusMonths(delta: number) {
  return function ({
    context,
    setContext,
  }: {
    context: DatePickerContext;
    setContext: (u: Partial<DatePickerContext>) => void;
  }) {
    const next = addMonths(context.focusedDate, delta);
    if (!isDateDisabled(next, context.min, context.max, context.isDateUnavailable)) {
      setContext({ focusedDate: next });
    }
  };
}

function moveFocusYears(delta: number) {
  return function ({
    context,
    setContext,
  }: {
    context: DatePickerContext;
    setContext: (u: Partial<DatePickerContext>) => void;
  }) {
    const next = addMonths(context.focusedDate, delta * 12);
    if (!isDateDisabled(next, context.min, context.max, context.isDateUnavailable)) {
      setContext({ focusedDate: next });
    }
  };
}

function focusWeekStart({
  context,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
}) {
  // Home → first day of week containing focusedDate (WAI-ARIA §3.4)
  const { focusedDate, firstDayOfWeek } = context;
  const currentDow = getDayOfWeek(focusedDate.year, focusedDate.month, focusedDate.day);
  const daysBack = (currentDow - firstDayOfWeek + 7) % 7;
  const next = addDays(focusedDate, -daysBack);
  if (!isDateDisabled(next, context.min, context.max, context.isDateUnavailable)) {
    setContext({ focusedDate: next });
  }
}

function focusWeekEnd({
  context,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
}) {
  // End → last day of week containing focusedDate (WAI-ARIA §3.4)
  const { focusedDate, firstDayOfWeek } = context;
  const currentDow = getDayOfWeek(focusedDate.year, focusedDate.month, focusedDate.day);
  const daysForward = (firstDayOfWeek + 6 - currentDow + 7) % 7;
  const next = addDays(focusedDate, daysForward);
  if (!isDateDisabled(next, context.min, context.max, context.isDateUnavailable)) {
    setContext({ focusedDate: next });
  }
}

function setValue({
  event,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
  event: Extract<DatePickerEvent, { type: "SET_VALUE" }>;
}) {
  // value: null = cleared, CalendarDate = selected.
  // null is assignable to CalendarDate | null (exactOptionalPropertyTypes safe).
  const date = event.date ?? null;
  setContext({ value: date, ...(date !== null && { focusedDate: date }) });
}

function setContentEl({
  event,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
  event: Extract<DatePickerEvent, { type: "SET_CONTENT_EL" }>;
}) {
  setContext({ contentEl: event.el });
}

function setTriggerEl({
  event,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
  event: Extract<DatePickerEvent, { type: "SET_TRIGGER_EL" }>;
}) {
  setContext({ triggerEl: event.el });
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

const registerLayer = makeLayerActivity<DatePickerContext>({
  getId: (ctx) => ctx.id,
  getContentEl: (ctx) => ctx.contentEl,
});

const manageFocus = makeFocusActivity<DatePickerContext>({
  getContentEl: (ctx) => ctx.contentEl,
  getFinalFocusEl: (ctx) => ctx.triggerEl,
});

const trapKeyboard = makeKeyboardActivity<DatePickerContext>({
  getId: (ctx) => ctx.id,
  getContentEl: (ctx) => ctx.contentEl,
  isModal: () => false,
  sendEscape: "ESCAPE_KEY",
});

const watchOutside = makeWatchOutsideActivity<DatePickerContext>({
  getId: (ctx) => ctx.id,
  getContainers: (ctx) => [ctx.contentEl, ctx.triggerEl],
  sendClose: "INTERACT_OUTSIDE",
});

// ---------------------------------------------------------------------------
// Machine factory
// ---------------------------------------------------------------------------

export function createDatePickerMachine(options: CreateDatePickerOptions) {
  const initialValue = options.value ?? options.defaultValue ?? null;
  const today = todayAsCalendarDate();
  const initialFocused = initialValue ?? today;

  return createMachine<DatePickerContext, DatePickerState, DatePickerEvent>({
    id: `forge-date-picker:${options.id ?? "root"}`,
    context: {
      id: options.id ?? "root",
      value: initialValue,
      focusedDate: initialFocused,
      locale: options.locale ?? "en",
      firstDayOfWeek: options.firstDayOfWeek ?? 0,
      disabled: options.disabled ?? false,
      readOnly: options.readOnly ?? false,
      contentEl: null,
      triggerEl: null,
      ...(options.min !== undefined && { min: options.min }),
      ...(options.max !== undefined && { max: options.max }),
      ...(options.isDateUnavailable !== undefined && { isDateUnavailable: options.isDateUnavailable }),
      ...(options.onValueChange !== undefined && { onValueChange: options.onValueChange }),
      ...(options.onOpenChange !== undefined && { onOpenChange: options.onOpenChange }),
    },
    initial: "closed",

    states: {
      closed: {
        tags: ["closed"],
        on: {
          OPEN: { target: "open", actions: [open] },
          TOGGLE: { target: "open", actions: [open] },
          SET_VALUE: { actions: [setValue] },
          SET_CONTENT_EL: { actions: [setContentEl] },
          SET_TRIGGER_EL: { actions: [setTriggerEl] },
        },
      },
      open: {
        tags: ["open"],
        activities: ["registerLayer", "manageFocus", "trapKeyboard", "watchOutside"],
        on: {
          CLOSE: { target: "closed", actions: [close] },
          TOGGLE: { target: "closed", actions: [close] },
          ESCAPE_KEY: { target: "closed", actions: [close] },
          INTERACT_OUTSIDE: { target: "closed", actions: [close] },
          SELECT_DAY: { actions: [selectDay] },
          SELECT_FOCUSED: { actions: [selectFocused] },
          NAVIGATE_PREV_MONTH: { actions: [navigatePrevMonth] },
          NAVIGATE_NEXT_MONTH: { actions: [navigateNextMonth] },
          NAVIGATE_TO_MONTH: { actions: [navigateToMonth] },
          FOCUS_DAY: { actions: [focusDay] },
          FOCUS_PREV_DAY: { actions: [moveFocus(-1)] },
          FOCUS_NEXT_DAY: { actions: [moveFocus(1)] },
          FOCUS_PREV_WEEK: { actions: [moveFocus(-7)] },
          FOCUS_NEXT_WEEK: { actions: [moveFocus(7)] },
          FOCUS_PREV_MONTH: { actions: [moveFocusMonths(-1)] },
          FOCUS_NEXT_MONTH: { actions: [moveFocusMonths(1)] },
          FOCUS_PREV_YEAR: { actions: [moveFocusYears(-1)] },
          FOCUS_NEXT_YEAR: { actions: [moveFocusYears(1)] },
          FOCUS_WEEK_START: { actions: [focusWeekStart] },
          FOCUS_WEEK_END: { actions: [focusWeekEnd] },
          SET_VALUE: { actions: [setValue] },
          SET_CONTENT_EL: { actions: [setContentEl] },
          SET_TRIGGER_EL: { actions: [setTriggerEl] },
        },
      },
    },

    activities: {
      registerLayer,
      manageFocus,
      trapKeyboard,
      watchOutside,
    },
  });
}
