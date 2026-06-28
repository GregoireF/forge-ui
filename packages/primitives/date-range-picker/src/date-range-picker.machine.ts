import {
  createMachine,
  makeFocusActivity,
  makeKeyboardActivity,
  makeLayerActivity,
  makeWatchOutsideActivity,
} from "@forge-ui/core";
import {
  addDays,
  addMonths,
  compareDate,
  getDayOfWeek,
  isDateDisabled,
  todayAsCalendarDate,
} from "@forge-ui/date-picker";
import type {
  CreateDateRangePickerOptions,
  DateRangePickerContext,
  DateRangePickerEvent,
  DateRangePickerState,
} from "./date-range-picker.types.js";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function openCalendar({
  context,
  setContext,
}: {
  context: DateRangePickerContext;
  setContext: (u: Partial<DateRangePickerContext>) => void;
}) {
  context.onOpenChange?.(true);
  // If partial range (start set but no end), resume from "end" phase
  const phase: "start" | "end" = context.startDate && !context.endDate ? "end" : "start";
  setContext({ selectionPhase: phase, hoveredDate: null });
}

function closeCalendar({ context }: { context: DateRangePickerContext }) {
  context.onOpenChange?.(false);
}

function selectDay({
  context,
  event,
  setContext,
}: {
  context: DateRangePickerContext;
  setContext: (u: Partial<DateRangePickerContext>) => void;
  event: Extract<DateRangePickerEvent, { type: "SELECT_DAY" }>;
}) {
  if (context.disabled || context.readOnly) return;
  if (
    isDateDisabled(
      event.date,
      context.min,
      context.max,
      context.isDateUnavailable,
      context.disabledWeekdays,
    )
  )
    return;

  if (context.selectionPhase === "start") {
    setContext({
      startDate: event.date,
      endDate: null,
      focusedDate: event.date,
      selectionPhase: "end",
    });
  } else {
    // end phase — ensure start <= end (swap if needed)
    let start = context.startDate!;
    let end = event.date;
    if (compareDate(end, start) < 0) {
      [start, end] = [end, start];
    }
    setContext({ startDate: start, endDate: end, hoveredDate: null, selectionPhase: "start" });
    context.onValueChange?.({ start, end });
  }
}

function hoverDay({
  context,
  event,
  setContext,
}: {
  context: DateRangePickerContext;
  setContext: (u: Partial<DateRangePickerContext>) => void;
  event: Extract<DateRangePickerEvent, { type: "HOVER_DAY" }>;
}) {
  if (context.selectionPhase === "end") {
    setContext({ hoveredDate: event.date });
  }
}

function clearHover({ setContext }: { setContext: (u: Partial<DateRangePickerContext>) => void }) {
  setContext({ hoveredDate: null });
}

function selectPreset({
  context,
  event,
  setContext,
}: {
  context: DateRangePickerContext;
  setContext: (u: Partial<DateRangePickerContext>) => void;
  event: Extract<DateRangePickerEvent, { type: "SELECT_PRESET" }>;
}) {
  if (context.disabled || context.readOnly) return;
  const { start, end } = event.range;
  setContext({
    startDate: start,
    endDate: end,
    selectionPhase: "start",
    hoveredDate: null,
    ...(start !== null && { focusedDate: start }),
  });
  context.onValueChange?.({ start, end });
}

function clearSelection({
  context,
  setContext,
}: {
  context: DateRangePickerContext;
  setContext: (u: Partial<DateRangePickerContext>) => void;
}) {
  if (context.disabled || context.readOnly) return;
  setContext({ startDate: null, endDate: null, selectionPhase: "start", hoveredDate: null });
  context.onValueChange?.({ start: null, end: null });
}

function navigatePrevMonth({
  context,
  setContext,
}: {
  context: DateRangePickerContext;
  setContext: (u: Partial<DateRangePickerContext>) => void;
}) {
  setContext({ focusedDate: addMonths(context.focusedDate, -1) });
}

function navigateNextMonth({
  context,
  setContext,
}: {
  context: DateRangePickerContext;
  setContext: (u: Partial<DateRangePickerContext>) => void;
}) {
  setContext({ focusedDate: addMonths(context.focusedDate, 1) });
}

function navigateToMonth({
  context: ctx,
  event,
  setContext,
}: {
  context: DateRangePickerContext;
  setContext: (u: Partial<DateRangePickerContext>) => void;
  event: Extract<DateRangePickerEvent, { type: "NAVIGATE_TO_MONTH" }>;
}) {
  setContext({ focusedDate: { year: event.year, month: event.month, day: ctx.focusedDate.day } });
}

function moveFocus(delta: number) {
  return ({
    context,
    setContext,
  }: {
    context: DateRangePickerContext;
    setContext: (u: Partial<DateRangePickerContext>) => void;
  }) => {
    const next = addDays(context.focusedDate, delta);
    if (
      !isDateDisabled(
        next,
        context.min,
        context.max,
        context.isDateUnavailable,
        context.disabledWeekdays,
      )
    ) {
      setContext({ focusedDate: next });
    }
  };
}

function moveFocusMonths(delta: number) {
  return ({
    context,
    setContext,
  }: {
    context: DateRangePickerContext;
    setContext: (u: Partial<DateRangePickerContext>) => void;
  }) => {
    const next = addMonths(context.focusedDate, delta);
    if (
      !isDateDisabled(
        next,
        context.min,
        context.max,
        context.isDateUnavailable,
        context.disabledWeekdays,
      )
    ) {
      setContext({ focusedDate: next });
    }
  };
}

function focusDay({
  event,
  setContext,
}: {
  context: DateRangePickerContext;
  setContext: (u: Partial<DateRangePickerContext>) => void;
  event: Extract<DateRangePickerEvent, { type: "FOCUS_DAY" }>;
}) {
  setContext({ focusedDate: event.date });
}

function focusWeekStart({
  context,
  setContext,
}: {
  context: DateRangePickerContext;
  setContext: (u: Partial<DateRangePickerContext>) => void;
}) {
  const { focusedDate, firstDayOfWeek } = context;
  const dow = getDayOfWeek(focusedDate.year, focusedDate.month, focusedDate.day);
  const back = (dow - firstDayOfWeek + 7) % 7;
  const next = addDays(focusedDate, -back);
  if (
    !isDateDisabled(
      next,
      context.min,
      context.max,
      context.isDateUnavailable,
      context.disabledWeekdays,
    )
  ) {
    setContext({ focusedDate: next });
  }
}

function focusWeekEnd({
  context,
  setContext,
}: {
  context: DateRangePickerContext;
  setContext: (u: Partial<DateRangePickerContext>) => void;
}) {
  const { focusedDate, firstDayOfWeek } = context;
  const dow = getDayOfWeek(focusedDate.year, focusedDate.month, focusedDate.day);
  const forward = (firstDayOfWeek + 6 - dow + 7) % 7;
  const next = addDays(focusedDate, forward);
  if (
    !isDateDisabled(
      next,
      context.min,
      context.max,
      context.isDateUnavailable,
      context.disabledWeekdays,
    )
  ) {
    setContext({ focusedDate: next });
  }
}

function setValue({
  event,
  setContext,
}: {
  setContext: (u: Partial<DateRangePickerContext>) => void;
  event: Extract<DateRangePickerEvent, { type: "SET_VALUE" }>;
}) {
  const start = event.range?.start ?? null;
  const end = event.range?.end ?? null;
  setContext({
    startDate: start,
    endDate: end,
    selectionPhase: start && !end ? "end" : "start",
    ...(start !== null && { focusedDate: start }),
  });
}

function setContentEl({
  event,
  setContext,
}: {
  context: DateRangePickerContext;
  setContext: (u: Partial<DateRangePickerContext>) => void;
  event: Extract<DateRangePickerEvent, { type: "SET_CONTENT_EL" }>;
}) {
  setContext({ contentEl: event.el });
}

function setTriggerEl({
  event,
  setContext,
}: {
  context: DateRangePickerContext;
  setContext: (u: Partial<DateRangePickerContext>) => void;
  event: Extract<DateRangePickerEvent, { type: "SET_TRIGGER_EL" }>;
}) {
  setContext({ triggerEl: event.el });
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

const registerLayer = makeLayerActivity<DateRangePickerContext>({
  getId: (ctx) => ctx.id,
  getContentEl: (ctx) => ctx.contentEl,
});

const manageFocus = makeFocusActivity<DateRangePickerContext>({
  getContentEl: (ctx) => ctx.contentEl,
  getFinalFocusEl: (ctx) => ctx.triggerEl,
});

const trapKeyboard = makeKeyboardActivity<DateRangePickerContext>({
  getId: (ctx) => ctx.id,
  getContentEl: (ctx) => ctx.contentEl,
  isModal: () => false,
  sendEscape: "ESCAPE_KEY",
});

const watchOutside = makeWatchOutsideActivity<DateRangePickerContext>({
  getId: (ctx) => ctx.id,
  getContainers: (ctx) => [ctx.contentEl, ctx.triggerEl],
  sendClose: "INTERACT_OUTSIDE",
});

// ---------------------------------------------------------------------------
// Machine factory
// ---------------------------------------------------------------------------

export function createDateRangePickerMachine(options: CreateDateRangePickerOptions) {
  const today = options.today ?? todayAsCalendarDate();
  const initialStart = options.value?.start ?? options.defaultValue?.start ?? null;
  const initialEnd = options.value?.end ?? options.defaultValue?.end ?? null;
  const initialFocused = initialStart ?? today;

  return createMachine<DateRangePickerContext, DateRangePickerState, DateRangePickerEvent>({
    id: `forge-date-range-picker:${options.id ?? "root"}`,
    context: {
      id: options.id ?? "root",
      startDate: initialStart,
      endDate: initialEnd,
      selectionPhase: initialStart && !initialEnd ? "end" : "start",
      hoveredDate: null,
      focusedDate: initialFocused,
      today,
      locale: options.locale ?? "en",
      firstDayOfWeek: options.firstDayOfWeek ?? 0,
      numberOfMonths: options.numberOfMonths ?? 2,
      disabled: options.disabled ?? false,
      readOnly: options.readOnly ?? false,
      contentEl: null,
      triggerEl: null,
      ...(options.min !== undefined && { min: options.min }),
      ...(options.max !== undefined && { max: options.max }),
      ...(options.isDateUnavailable !== undefined && {
        isDateUnavailable: options.isDateUnavailable,
      }),
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
          OPEN: { target: "open", actions: [openCalendar] },
          TOGGLE: { target: "open", actions: [openCalendar] },
          SET_VALUE: { actions: [setValue] },
          SET_CONTENT_EL: { actions: [setContentEl] },
          SET_TRIGGER_EL: { actions: [setTriggerEl] },
        },
      },

      open: {
        tags: ["open"],
        activities: ["registerLayer", "manageFocus", "trapKeyboard", "watchOutside"],
        on: {
          CLOSE: { target: "closed", actions: [closeCalendar] },
          TOGGLE: { target: "closed", actions: [closeCalendar] },
          ESCAPE_KEY: { target: "closed", actions: [closeCalendar] },
          INTERACT_OUTSIDE: { target: "closed", actions: [closeCalendar] },
          SELECT_DAY: { actions: [selectDay] },
          HOVER_DAY: { actions: [hoverDay] },
          CLEAR_HOVER: { actions: [clearHover] },
          SELECT_PRESET: { actions: [selectPreset] },
          CLEAR: { actions: [clearSelection] },
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
