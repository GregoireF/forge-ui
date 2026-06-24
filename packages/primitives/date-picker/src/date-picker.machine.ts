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
  getYearGridStart,
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
// Helpers
// ---------------------------------------------------------------------------

function clampToValid(date: CalendarDate, ctx: DatePickerContext): CalendarDate {
  if (!isDateDisabled(date, ctx.min, ctx.max, ctx.isDateUnavailable, ctx.disabledWeekdays)) return date;
  for (let i = 1; i <= 365; i++) {
    const next = addDays(date, i);
    if (!isDateDisabled(next, ctx.min, ctx.max, ctx.isDateUnavailable, ctx.disabledWeekdays)) return next;
  }
  return date;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function openCalendar({
  context,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
}) {
  context.onOpenChange?.(true);
  setContext({ focusedDate: clampToValid(context.focusedDate, context) });
}

function closeCalendar({ context }: { context: DatePickerContext }) {
  context.onOpenChange?.(false);
}

function enterYearView({
  context,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
}) {
  setContext({ yearGridStart: getYearGridStart(context.focusedDate.year) });
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
  if (isDateDisabled(event.date, context.min, context.max, context.isDateUnavailable, context.disabledWeekdays)) return;
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
  if (isDateDisabled(context.focusedDate, context.min, context.max, context.isDateUnavailable, context.disabledWeekdays)) return;
  setContext({ value: context.focusedDate });
  context.onValueChange?.(context.focusedDate);
}

function selectPreset({
  context,
  event,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
  event: Extract<DatePickerEvent, { type: "SELECT_PRESET" }>;
}) {
  if (context.disabled || context.readOnly) return;
  setContext({ value: event.date, focusedDate: event.date });
  context.onValueChange?.(event.date);
}

function selectMonth({
  context,
  event,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
  event: Extract<DatePickerEvent, { type: "SELECT_MONTH" }>;
}) {
  const { focusedDate } = context;
  const maxDay = getDaysInMonth(focusedDate.year, event.month);
  const next = { year: focusedDate.year, month: event.month, day: Math.min(focusedDate.day, maxDay) };
  setContext({ focusedDate: clampToValid(next, context) });
}

function selectYear({
  context,
  event,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
  event: Extract<DatePickerEvent, { type: "SELECT_YEAR" }>;
}) {
  const { focusedDate } = context;
  const maxDay = getDaysInMonth(event.year, focusedDate.month);
  const next = { year: event.year, month: focusedDate.month, day: Math.min(focusedDate.day, maxDay) };
  setContext({ focusedDate: clampToValid(next, context) });
}

function navigatePrevMonth({
  context,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
}) {
  setContext({ focusedDate: clampToValid(addMonths(context.focusedDate, -1), context) });
}

function navigateNextMonth({
  context,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
}) {
  setContext({ focusedDate: clampToValid(addMonths(context.focusedDate, 1), context) });
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
  const next = { year: event.year, month: event.month, day: Math.min(ctx.focusedDate.day, maxDay) };
  setContext({ focusedDate: clampToValid(next, ctx) });
}

function navigatePrevYearRange({
  context,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
}) {
  setContext({ yearGridStart: context.yearGridStart - 12 });
}

function navigateNextYearRange({
  context,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
}) {
  setContext({ yearGridStart: context.yearGridStart + 12 });
}

function moveFocus(delta: number) {
  return ({
    context,
    setContext,
  }: {
    context: DatePickerContext;
    setContext: (u: Partial<DatePickerContext>) => void;
  }) => {
    const next = addDays(context.focusedDate, delta);
    if (!isDateDisabled(next, context.min, context.max, context.isDateUnavailable, context.disabledWeekdays)) {
      setContext({ focusedDate: next });
    }
  };
}

function moveFocusMonths(delta: number) {
  return ({
    context,
    setContext,
  }: {
    context: DatePickerContext;
    setContext: (u: Partial<DatePickerContext>) => void;
  }) => {
    const next = addMonths(context.focusedDate, delta);
    if (!isDateDisabled(next, context.min, context.max, context.isDateUnavailable, context.disabledWeekdays)) {
      setContext({ focusedDate: next });
    }
  };
}

function moveFocusYears(delta: number) {
  return ({
    context,
    setContext,
  }: {
    context: DatePickerContext;
    setContext: (u: Partial<DatePickerContext>) => void;
  }) => {
    const next = addMonths(context.focusedDate, delta * 12);
    if (!isDateDisabled(next, context.min, context.max, context.isDateUnavailable, context.disabledWeekdays)) {
      setContext({ focusedDate: next });
    }
  };
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

function focusWeekStart({
  context,
  setContext,
}: {
  context: DatePickerContext;
  setContext: (u: Partial<DatePickerContext>) => void;
}) {
  const { focusedDate, firstDayOfWeek } = context;
  const currentDow = getDayOfWeek(focusedDate.year, focusedDate.month, focusedDate.day);
  const daysBack = (currentDow - firstDayOfWeek + 7) % 7;
  const next = addDays(focusedDate, -daysBack);
  if (!isDateDisabled(next, context.min, context.max, context.isDateUnavailable, context.disabledWeekdays)) {
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
  const { focusedDate, firstDayOfWeek } = context;
  const currentDow = getDayOfWeek(focusedDate.year, focusedDate.month, focusedDate.day);
  const daysForward = (firstDayOfWeek + 6 - currentDow + 7) % 7;
  const next = addDays(focusedDate, daysForward);
  if (!isDateDisabled(next, context.min, context.max, context.isDateUnavailable, context.disabledWeekdays)) {
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
// Common transitions shared across all open states
// ---------------------------------------------------------------------------

const OPEN_COMMON_EVENTS = {
  CLOSE: { target: "closed" as DatePickerState, actions: [closeCalendar] },
  TOGGLE: { target: "closed" as DatePickerState, actions: [closeCalendar] },
  ESCAPE_KEY: { target: "closed" as DatePickerState, actions: [closeCalendar] },
  INTERACT_OUTSIDE: { target: "closed" as DatePickerState, actions: [closeCalendar] },
  SELECT_PRESET: { actions: [selectPreset] },
  SET_VALUE: { actions: [setValue] },
  SET_CONTENT_EL: { actions: [setContentEl] },
  SET_TRIGGER_EL: { actions: [setTriggerEl] },
};

const OPEN_ACTIVITIES = ["registerLayer", "manageFocus", "trapKeyboard", "watchOutside"] as const;

// ---------------------------------------------------------------------------
// Machine factory
// ---------------------------------------------------------------------------

export function createDatePickerMachine(options: CreateDatePickerOptions) {
  const initialValue = options.value ?? options.defaultValue ?? null;
  const today = options.today ?? todayAsCalendarDate();
  const initialFocused = initialValue ?? today;

  return createMachine<DatePickerContext, DatePickerState, DatePickerEvent>({
    id: `forge-date-picker:${options.id ?? "root"}`,
    context: {
      id: options.id ?? "root",
      value: initialValue,
      focusedDate: initialFocused,
      today,
      locale: options.locale ?? "en",
      firstDayOfWeek: options.firstDayOfWeek ?? 0,
      numberOfMonths: options.numberOfMonths ?? 1,
      disabled: options.disabled ?? false,
      readOnly: options.readOnly ?? false,
      yearGridStart: getYearGridStart(initialFocused.year),
      contentEl: null,
      triggerEl: null,
      ...(options.min !== undefined && { min: options.min }),
      ...(options.max !== undefined && { max: options.max }),
      ...(options.isDateUnavailable !== undefined && { isDateUnavailable: options.isDateUnavailable }),
      ...(options.disabledWeekdays !== undefined && { disabledWeekdays: options.disabledWeekdays }),
      ...(options.presets !== undefined && { presets: options.presets }),
      ...(options.onValueChange !== undefined && { onValueChange: options.onValueChange }),
      ...(options.onOpenChange !== undefined && { onOpenChange: options.onOpenChange }),
    },
    initial: "closed",

    states: {
      closed: {
        tags: ["closed"],
        on: {
          OPEN: { target: "open.day", actions: [openCalendar] },
          TOGGLE: { target: "open.day", actions: [openCalendar] },
          SET_VALUE: { actions: [setValue] },
          SET_CONTENT_EL: { actions: [setContentEl] },
          SET_TRIGGER_EL: { actions: [setTriggerEl] },
        },
      },

      "open.day": {
        tags: ["open"],
        activities: [...OPEN_ACTIVITIES],
        on: {
          ...OPEN_COMMON_EVENTS,
          VIEW_MONTHS: { target: "open.month" },
          VIEW_YEARS: { target: "open.year", actions: [enterYearView] },
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
        },
      },

      "open.month": {
        tags: ["open"],
        activities: [...OPEN_ACTIVITIES],
        on: {
          ...OPEN_COMMON_EVENTS,
          VIEW_DAYS: { target: "open.day" },
          VIEW_YEARS: { target: "open.year", actions: [enterYearView] },
          SELECT_MONTH: { target: "open.day", actions: [selectMonth] },
        },
      },

      "open.year": {
        tags: ["open"],
        activities: [...OPEN_ACTIVITIES],
        on: {
          ...OPEN_COMMON_EVENTS,
          VIEW_DAYS: { target: "open.day" },
          VIEW_MONTHS: { target: "open.month" },
          SELECT_YEAR: { target: "open.month", actions: [selectYear] },
          NAVIGATE_PREV_YEAR_RANGE: { actions: [navigatePrevYearRange] },
          NAVIGATE_NEXT_YEAR_RANGE: { actions: [navigateNextYearRange] },
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
