import type { MachineSnapshot } from "@forge-ui/core";
import { describe, expect, it, vi } from "vitest";
import { getYearGridStart } from "../src/calendar.js";
import { connectDatePicker } from "../src/date-picker.connect.js";
import type { DatePickerContext, DatePickerState } from "../src/date-picker.types.js";

const JUNE15 = { year: 2024, month: 6, day: 15 };
const JAN15 = { year: 2024, month: 1, day: 15 };
const TODAY = { year: 2024, month: 3, day: 1 };

function makeCtx(overrides: Partial<DatePickerContext> = {}): DatePickerContext {
  return {
    id: "test",
    value: null,
    focusedDate: JUNE15,
    today: TODAY,
    locale: "en",
    firstDayOfWeek: 0,
    numberOfMonths: 1,
    disabled: false,
    readOnly: false,
    yearGridStart: getYearGridStart(2024),
    contentEl: null,
    triggerEl: null,
    ...overrides,
  };
}

function makeApi(overrides: Partial<DatePickerContext> = {}, state: DatePickerState = "closed") {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn<(updates: Partial<DatePickerContext>) => void>() };
  const openStates = ["open.day", "open.month", "open.year"];
  const tags = openStates.includes(state) ? ["open"] : ["closed"];
  const snapshot: MachineSnapshot<DatePickerContext, DatePickerState> = {
    value: state,
    context: ctx,
    matches: (...values) => values.includes(state),
    hasTag: (t: string) => tags.includes(t),
    tags,
  };
  return { api: connectDatePicker(snapshot, send, machine), send, machine };
}

// ---------------------------------------------------------------------------
// getTriggerProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — getTriggerProps", () => {
  it("type is button", () => {
    expect(makeApi().api.getTriggerProps().type).toBe("button");
  });

  it("aria-haspopup is dialog", () => {
    expect(makeApi().api.getTriggerProps()["aria-haspopup"]).toBe("dialog");
  });

  it("aria-expanded false when closed", () => {
    expect(makeApi().api.getTriggerProps()["aria-expanded"]).toBe(false);
  });

  it("aria-expanded true when open.day", () => {
    expect(makeApi({}, "open.day").api.getTriggerProps()["aria-expanded"]).toBe(true);
  });

  it("aria-expanded true when open.month", () => {
    expect(makeApi({}, "open.month").api.getTriggerProps()["aria-expanded"]).toBe(true);
  });

  it("aria-controls references content id", () => {
    expect(makeApi().api.getTriggerProps()["aria-controls"]).toBe("test-content");
  });

  it("data-forge-scope is date-picker", () => {
    expect(makeApi().api.getTriggerProps()["data-forge-scope"]).toBe("date-picker");
  });

  it("data-forge-part is trigger", () => {
    expect(makeApi().api.getTriggerProps()["data-forge-part"]).toBe("trigger");
  });

  it("disabled when context.disabled", () => {
    expect(makeApi({ disabled: true }).api.getTriggerProps().disabled).toBe(true);
  });

  it("onClick sends TOGGLE", () => {
    const { api, send } = makeApi();
    api.getTriggerProps().onClick();
    expect(send).toHaveBeenCalledWith("TOGGLE");
  });

  it("onClick does not send when disabled", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getTriggerProps().onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("ref callback calls machine.setContext with triggerEl", () => {
    const { api, machine } = makeApi();
    const el = document.createElement("button");
    api.getTriggerProps().ref(el);
    expect(machine.setContext).toHaveBeenCalledWith({ triggerEl: el });
  });
});

// ---------------------------------------------------------------------------
// getContentProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — getContentProps", () => {
  it("role is dialog", () => {
    expect(makeApi({}, "open.day").api.getContentProps().role).toBe("dialog");
  });

  it("aria-modal is true", () => {
    expect(makeApi({}, "open.day").api.getContentProps()["aria-modal"]).toBe(true);
  });

  it("id is test-content", () => {
    expect(makeApi().api.getContentProps().id).toBe("test-content");
  });

  it("aria-label contains month and year", () => {
    const label = makeApi({ focusedDate: JUNE15 }).api.getContentProps()["aria-label"];
    expect(label).toMatch(/june/i);
    expect(label).toMatch(/2024/);
  });

  it("data-view is 'day' when open.day", () => {
    expect(makeApi({}, "open.day").api.getContentProps()["data-view"]).toBe("day");
  });

  it("data-view is 'month' when open.month", () => {
    expect(makeApi({}, "open.month").api.getContentProps()["data-view"]).toBe("month");
  });

  it("data-view is 'year' when open.year", () => {
    expect(makeApi({}, "open.year").api.getContentProps()["data-view"]).toBe("year");
  });

  it("data-view is undefined when closed", () => {
    expect(makeApi({}, "closed").api.getContentProps()["data-view"]).toBeUndefined();
  });

  it("ref callback calls machine.setContext with contentEl", () => {
    const { api, machine } = makeApi();
    const el = document.createElement("div");
    api.getContentProps().ref(el);
    expect(machine.setContext).toHaveBeenCalledWith({ contentEl: el });
  });
});

// ---------------------------------------------------------------------------
// getCalendarHeaderProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — getCalendarHeaderProps", () => {
  it("aria-live is polite", () => {
    expect(makeApi().api.getCalendarHeaderProps()["aria-live"]).toBe("polite");
  });

  it("aria-atomic is true (SR reads full header when month changes)", () => {
    expect(makeApi().api.getCalendarHeaderProps()["aria-atomic"]).toBe(true);
  });

  it("data-forge-part is calendar-header", () => {
    expect(makeApi().api.getCalendarHeaderProps()["data-forge-part"]).toBe("calendar-header");
  });
});

// ---------------------------------------------------------------------------
// getViewSwitchButtonProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — getViewSwitchButtonProps", () => {
  it("type is button", () => {
    expect(makeApi({}, "open.day").api.getViewSwitchButtonProps().type).toBe("button");
  });

  it("aria-pressed is false when in day view", () => {
    expect(makeApi({}, "open.day").api.getViewSwitchButtonProps()["aria-pressed"]).toBe(false);
  });

  it("aria-pressed is true when in month view", () => {
    expect(makeApi({}, "open.month").api.getViewSwitchButtonProps()["aria-pressed"]).toBe(true);
  });

  it("aria-pressed is true when in year view", () => {
    expect(makeApi({}, "open.year").api.getViewSwitchButtonProps()["aria-pressed"]).toBe(true);
  });

  it("onClick sends VIEW_MONTHS when in day view", () => {
    const { api, send } = makeApi({}, "open.day");
    api.getViewSwitchButtonProps().onClick();
    expect(send).toHaveBeenCalledWith("VIEW_MONTHS");
  });

  it("onClick sends VIEW_YEARS when in month view", () => {
    const { api, send } = makeApi({}, "open.month");
    api.getViewSwitchButtonProps().onClick();
    expect(send).toHaveBeenCalledWith("VIEW_YEARS");
  });

  it("onClick sends VIEW_DAYS when in year view", () => {
    const { api, send } = makeApi({}, "open.year");
    api.getViewSwitchButtonProps().onClick();
    expect(send).toHaveBeenCalledWith("VIEW_DAYS");
  });

  it("onClick does nothing when disabled", () => {
    const { api, send } = makeApi({ disabled: true }, "open.day");
    api.getViewSwitchButtonProps().onClick();
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getPrevMonthButtonProps / getNextMonthButtonProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — month navigation buttons", () => {
  it("prev button aria-label is 'Go to previous month'", () => {
    expect(makeApi().api.getPrevMonthButtonProps()["aria-label"]).toBe("Go to previous month");
  });

  it("next button aria-label is 'Go to next month'", () => {
    expect(makeApi().api.getNextMonthButtonProps()["aria-label"]).toBe("Go to next month");
  });

  it("prev button onClick sends NAVIGATE_PREV_MONTH", () => {
    const { api, send } = makeApi();
    api.getPrevMonthButtonProps().onClick();
    expect(send).toHaveBeenCalledWith("NAVIGATE_PREV_MONTH");
  });

  it("next button onClick sends NAVIGATE_NEXT_MONTH", () => {
    const { api, send } = makeApi();
    api.getNextMonthButtonProps().onClick();
    expect(send).toHaveBeenCalledWith("NAVIGATE_NEXT_MONTH");
  });

  it("prev button disabled when at min month boundary", () => {
    const { api } = makeApi({ focusedDate: JUNE15, min: JUNE15 });
    expect(api.getPrevMonthButtonProps().disabled).toBe(true);
  });

  it("prev button not disabled when above min", () => {
    const { api } = makeApi({ focusedDate: JUNE15, min: JAN15 });
    expect(api.getPrevMonthButtonProps().disabled).toBeUndefined();
  });

  it("next button disabled when at max month boundary", () => {
    const { api } = makeApi({ focusedDate: JUNE15, max: JUNE15 });
    expect(api.getNextMonthButtonProps().disabled).toBe(true);
  });

  it("prev button onClick does NOT send when at min", () => {
    const { api, send } = makeApi({ focusedDate: JUNE15, min: JUNE15 });
    api.getPrevMonthButtonProps().onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("next button onClick does NOT send when at max", () => {
    const { api, send } = makeApi({ focusedDate: JUNE15, max: JUNE15 });
    api.getNextMonthButtonProps().onClick();
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getPrevYearRangeButtonProps / getNextYearRangeButtonProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — year range navigation buttons", () => {
  it("prev range button has data-forge-part prev-year-range-button", () => {
    expect(makeApi().api.getPrevYearRangeButtonProps()["data-forge-part"]).toBe(
      "prev-year-range-button",
    );
  });

  it("next range button has data-forge-part next-year-range-button", () => {
    expect(makeApi().api.getNextYearRangeButtonProps()["data-forge-part"]).toBe(
      "next-year-range-button",
    );
  });

  it("prev range onClick sends NAVIGATE_PREV_YEAR_RANGE", () => {
    const { api, send } = makeApi({}, "open.year");
    api.getPrevYearRangeButtonProps().onClick();
    expect(send).toHaveBeenCalledWith("NAVIGATE_PREV_YEAR_RANGE");
  });

  it("next range onClick sends NAVIGATE_NEXT_YEAR_RANGE", () => {
    const { api, send } = makeApi({}, "open.year");
    api.getNextYearRangeButtonProps().onClick();
    expect(send).toHaveBeenCalledWith("NAVIGATE_NEXT_YEAR_RANGE");
  });
});

// ---------------------------------------------------------------------------
// getCalendarGridProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — getCalendarGridProps", () => {
  it("role is grid", () => {
    expect(makeApi().api.getCalendarGridProps().role).toBe("grid");
  });

  it("aria-label contains month/year", () => {
    expect(makeApi({ focusedDate: JUNE15 }).api.getCalendarGridProps()["aria-label"]).toMatch(
      /june/i,
    );
  });

  it("aria-disabled when context.disabled", () => {
    expect(makeApi({ disabled: true }).api.getCalendarGridProps()["aria-disabled"]).toBe(true);
  });

  it("aria-readonly when context.readOnly", () => {
    expect(makeApi({ readOnly: true }).api.getCalendarGridProps()["aria-readonly"]).toBe(true);
  });

  it("onKeyDown ArrowLeft sends FOCUS_PREV_DAY", () => {
    const { api, send } = makeApi();
    const e = new KeyboardEvent("keydown", { key: "ArrowLeft" });
    vi.spyOn(e, "preventDefault");
    api.getCalendarGridProps().onKeyDown(e);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith("FOCUS_PREV_DAY");
  });

  it("onKeyDown ArrowRight sends FOCUS_NEXT_DAY", () => {
    const { api, send } = makeApi();
    api.getCalendarGridProps().onKeyDown(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(send).toHaveBeenCalledWith("FOCUS_NEXT_DAY");
  });

  it("onKeyDown ArrowUp sends FOCUS_PREV_WEEK", () => {
    const { api, send } = makeApi();
    api.getCalendarGridProps().onKeyDown(new KeyboardEvent("keydown", { key: "ArrowUp" }));
    expect(send).toHaveBeenCalledWith("FOCUS_PREV_WEEK");
  });

  it("onKeyDown ArrowDown sends FOCUS_NEXT_WEEK", () => {
    const { api, send } = makeApi();
    api.getCalendarGridProps().onKeyDown(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    expect(send).toHaveBeenCalledWith("FOCUS_NEXT_WEEK");
  });

  it("onKeyDown PageUp sends FOCUS_PREV_MONTH", () => {
    const { api, send } = makeApi();
    api.getCalendarGridProps().onKeyDown(new KeyboardEvent("keydown", { key: "PageUp" }));
    expect(send).toHaveBeenCalledWith("FOCUS_PREV_MONTH");
  });

  it("onKeyDown PageDown sends FOCUS_NEXT_MONTH", () => {
    const { api, send } = makeApi();
    api.getCalendarGridProps().onKeyDown(new KeyboardEvent("keydown", { key: "PageDown" }));
    expect(send).toHaveBeenCalledWith("FOCUS_NEXT_MONTH");
  });

  it("onKeyDown Shift+PageUp sends FOCUS_PREV_YEAR", () => {
    const { api, send } = makeApi();
    api
      .getCalendarGridProps()
      .onKeyDown(new KeyboardEvent("keydown", { key: "PageUp", shiftKey: true }));
    expect(send).toHaveBeenCalledWith("FOCUS_PREV_YEAR");
  });

  it("onKeyDown Shift+PageDown sends FOCUS_NEXT_YEAR", () => {
    const { api, send } = makeApi();
    api
      .getCalendarGridProps()
      .onKeyDown(new KeyboardEvent("keydown", { key: "PageDown", shiftKey: true }));
    expect(send).toHaveBeenCalledWith("FOCUS_NEXT_YEAR");
  });

  it("onKeyDown Home sends FOCUS_WEEK_START", () => {
    const { api, send } = makeApi();
    api.getCalendarGridProps().onKeyDown(new KeyboardEvent("keydown", { key: "Home" }));
    expect(send).toHaveBeenCalledWith("FOCUS_WEEK_START");
  });

  it("onKeyDown End sends FOCUS_WEEK_END", () => {
    const { api, send } = makeApi();
    api.getCalendarGridProps().onKeyDown(new KeyboardEvent("keydown", { key: "End" }));
    expect(send).toHaveBeenCalledWith("FOCUS_WEEK_END");
  });

  it("onKeyDown Enter sends SELECT_FOCUSED", () => {
    const { api, send } = makeApi();
    api.getCalendarGridProps().onKeyDown(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(send).toHaveBeenCalledWith("SELECT_FOCUSED");
  });

  it("onKeyDown Space sends SELECT_FOCUSED", () => {
    const { api, send } = makeApi();
    api.getCalendarGridProps().onKeyDown(new KeyboardEvent("keydown", { key: " " }));
    expect(send).toHaveBeenCalledWith("SELECT_FOCUSED");
  });

  it("onKeyDown Enter does NOT send SELECT_FOCUSED in readOnly mode", () => {
    const { api, send } = makeApi({ readOnly: true });
    api.getCalendarGridProps().onKeyDown(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(send).not.toHaveBeenCalledWith("SELECT_FOCUSED");
  });

  it("unhandled key does not send anything", () => {
    const { api, send } = makeApi();
    api.getCalendarGridProps().onKeyDown(new KeyboardEvent("keydown", { key: "a" }));
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getCalendarCellProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — getCalendarCellProps", () => {
  it("role is gridcell", () => {
    expect(makeApi().api.getCalendarCellProps(JUNE15).role).toBe("gridcell");
  });

  it("aria-selected true for selected date", () => {
    expect(
      makeApi({ value: JUNE15, focusedDate: JUNE15 }).api.getCalendarCellProps(JUNE15)[
        "aria-selected"
      ],
    ).toBe(true);
  });

  it("aria-selected false for non-selected date", () => {
    expect(
      makeApi({ value: JAN15, focusedDate: JUNE15 }).api.getCalendarCellProps(JUNE15)[
        "aria-selected"
      ],
    ).toBe(false);
  });

  it("tabIndex 0 for focused date", () => {
    expect(makeApi({ focusedDate: JUNE15 }).api.getCalendarCellProps(JUNE15).tabIndex).toBe(0);
  });

  it("tabIndex -1 for non-focused date", () => {
    expect(makeApi({ focusedDate: JUNE15 }).api.getCalendarCellProps(JAN15).tabIndex).toBe(-1);
  });

  it("aria-disabled for date below min", () => {
    expect(
      makeApi({ min: JUNE15, focusedDate: JUNE15 }).api.getCalendarCellProps(JAN15)[
        "aria-disabled"
      ],
    ).toBe(true);
  });

  it("aria-disabled for unavailable date", () => {
    expect(
      makeApi({
        isDateUnavailable: (d) => d.month === 6,
        focusedDate: JUNE15,
      }).api.getCalendarCellProps(JUNE15)["aria-disabled"],
    ).toBe(true);
  });

  it("aria-label contains full date", () => {
    const label = makeApi({ focusedDate: JUNE15 }).api.getCalendarCellProps(JUNE15)["aria-label"];
    expect(label).toMatch(/2024/);
    expect(label).toMatch(/june/i);
    expect(label).toMatch(/15/);
  });

  it("aria-label includes 'today' suffix for today's date", () => {
    const label = makeApi({ focusedDate: TODAY, today: TODAY }).api.getCalendarCellProps(TODAY)[
      "aria-label"
    ];
    expect(label).toMatch(/today/i);
  });

  it("aria-label does NOT include 'today' for non-today date", () => {
    const label = makeApi({ focusedDate: JUNE15, today: TODAY }).api.getCalendarCellProps(JUNE15)[
      "aria-label"
    ];
    expect(label).not.toMatch(/today/i);
  });

  it("data-today present for today's date (from context.today)", () => {
    const { api } = makeApi({ focusedDate: TODAY, today: TODAY });
    expect(api.getCalendarCellProps(TODAY)["data-today"]).toBe("");
  });

  it("data-today absent for non-today date", () => {
    expect(
      makeApi({ focusedDate: JUNE15, today: TODAY }).api.getCalendarCellProps(JUNE15)["data-today"],
    ).toBeUndefined();
  });

  it("data-selected present on selected cell", () => {
    expect(
      makeApi({ value: JUNE15, focusedDate: JUNE15 }).api.getCalendarCellProps(JUNE15)[
        "data-selected"
      ],
    ).toBe("");
  });

  it("data-focused present on focused cell", () => {
    expect(makeApi({ focusedDate: JUNE15 }).api.getCalendarCellProps(JUNE15)["data-focused"]).toBe(
      "",
    );
  });

  it("data-disabled present on unavailable cell", () => {
    expect(
      makeApi({ isDateUnavailable: () => true, focusedDate: JUNE15 }).api.getCalendarCellProps(
        JUNE15,
      )["data-disabled"],
    ).toBe("");
  });

  it("data-outside-month present when isOutsideMonth=true", () => {
    expect(makeApi().api.getCalendarCellProps(JUNE15, true)["data-outside-month"]).toBe("");
  });

  it("data-outside-month absent when isOutsideMonth=false (default)", () => {
    expect(makeApi().api.getCalendarCellProps(JUNE15)["data-outside-month"]).toBeUndefined();
  });

  it("onClick sends SELECT_DAY and FOCUS_DAY", () => {
    const { api, send } = makeApi({ focusedDate: JUNE15 });
    api.getCalendarCellProps(JUNE15).onClick();
    expect(send).toHaveBeenCalledWith({ type: "SELECT_DAY", date: JUNE15 });
    expect(send).toHaveBeenCalledWith({ type: "FOCUS_DAY", date: JUNE15 });
  });

  it("onClick does NOT send for disabled date", () => {
    const { api, send } = makeApi({ isDateUnavailable: () => true, focusedDate: JUNE15 });
    api.getCalendarCellProps(JUNE15).onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("onClick does NOT send in readOnly mode", () => {
    const { api, send } = makeApi({ readOnly: true, focusedDate: JUNE15 });
    api.getCalendarCellProps(JUNE15).onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("onFocus sends FOCUS_DAY", () => {
    const { api, send } = makeApi({ focusedDate: JUNE15 });
    api.getCalendarCellProps(JAN15).onFocus();
    expect(send).toHaveBeenCalledWith({ type: "FOCUS_DAY", date: JAN15 });
  });
});

// ---------------------------------------------------------------------------
// getMonthGridProps / getMonthCellProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — getMonthGridProps", () => {
  it("role is grid", () => {
    expect(makeApi().api.getMonthGridProps().role).toBe("grid");
  });

  it("aria-label is the focused year", () => {
    expect(makeApi({ focusedDate: JUNE15 }).api.getMonthGridProps()["aria-label"]).toBe("2024");
  });
});

describe("connectDatePicker — getMonthCellProps", () => {
  it("role is gridcell", () => {
    expect(makeApi().api.getMonthCellProps(6).role).toBe("gridcell");
  });

  it("aria-selected true for selected month in same year", () => {
    const { api } = makeApi({ value: JUNE15, focusedDate: JUNE15 });
    expect(api.getMonthCellProps(6)["aria-selected"]).toBe(true);
  });

  it("aria-selected false when value month differs", () => {
    const { api } = makeApi({ value: JAN15, focusedDate: JUNE15 });
    expect(api.getMonthCellProps(6)["aria-selected"]).toBe(false);
  });

  it("aria-label contains month name and year", () => {
    const { api } = makeApi({ focusedDate: JUNE15 });
    expect(api.getMonthCellProps(6)["aria-label"]).toMatch(/june/i);
    expect(api.getMonthCellProps(6)["aria-label"]).toMatch(/2024/);
  });

  it("data-focused present for focusedDate.month", () => {
    expect(makeApi({ focusedDate: JUNE15 }).api.getMonthCellProps(6)["data-focused"]).toBe("");
  });

  it("onClick sends SELECT_MONTH", () => {
    const { api, send } = makeApi({}, "open.month");
    api.getMonthCellProps(9).onClick();
    expect(send).toHaveBeenCalledWith({ type: "SELECT_MONTH", month: 9 });
  });

  it("onClick does nothing when disabled", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getMonthCellProps(6).onClick();
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getYearGridProps / getYearCellProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — getYearGridProps", () => {
  it("role is grid", () => {
    expect(makeApi().api.getYearGridProps().role).toBe("grid");
  });

  it("aria-label is year range", () => {
    const start = getYearGridStart(2024);
    const { api } = makeApi({ yearGridStart: start });
    expect(api.getYearGridProps()["aria-label"]).toBe(`${start}–${start + 11}`);
  });
});

describe("connectDatePicker — getYearCellProps", () => {
  it("role is gridcell", () => {
    expect(makeApi().api.getYearCellProps(2024).role).toBe("gridcell");
  });

  it("aria-selected true when value.year matches", () => {
    expect(
      makeApi({ value: JUNE15, focusedDate: JUNE15 }).api.getYearCellProps(2024)["aria-selected"],
    ).toBe(true);
  });

  it("aria-selected false when no value", () => {
    expect(makeApi().api.getYearCellProps(2024)["aria-selected"]).toBe(false);
  });

  it("aria-label is the year as string", () => {
    expect(makeApi().api.getYearCellProps(2024)["aria-label"]).toBe("2024");
  });

  it("data-focused present for focusedDate.year", () => {
    expect(makeApi({ focusedDate: JUNE15 }).api.getYearCellProps(2024)["data-focused"]).toBe("");
  });

  it("onClick sends SELECT_YEAR", () => {
    const { api, send } = makeApi({}, "open.year");
    api.getYearCellProps(2030).onClick();
    expect(send).toHaveBeenCalledWith({ type: "SELECT_YEAR", year: 2030 });
  });

  it("onClick does nothing when disabled", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getYearCellProps(2024).onClick();
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getPresetProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — getPresetProps", () => {
  const todayPreset = {
    label: "Today",
    getValue: (_today: typeof TODAY) => TODAY,
  };

  it("type is button", () => {
    expect(makeApi().api.getPresetProps(todayPreset).type).toBe("button");
  });

  it("aria-label matches preset.label", () => {
    expect(makeApi().api.getPresetProps(todayPreset)["aria-label"]).toBe("Today");
  });

  it("onClick sends SELECT_PRESET with resolved date", () => {
    const { api, send } = makeApi({ today: TODAY }, "open.day");
    api.getPresetProps(todayPreset).onClick();
    expect(send).toHaveBeenCalledWith({ type: "SELECT_PRESET", date: TODAY });
  });

  it("onClick does nothing when disabled", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getPresetProps(todayPreset).onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("onClick does nothing when readOnly", () => {
    const { api, send } = makeApi({ readOnly: true });
    api.getPresetProps(todayPreset).onClick();
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getWeekdayHeaderProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — getWeekdayHeaderProps", () => {
  it("role is columnheader", () => {
    expect(makeApi().api.getWeekdayHeaderProps(0).role).toBe("columnheader");
  });

  it("abbr contains full weekday name", () => {
    // Sunday-first, index 0 = Sunday
    expect(makeApi().api.getWeekdayHeaderProps(0).abbr).toMatch(/sunday/i);
  });
});

// ---------------------------------------------------------------------------
// getCalendarRowProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — getCalendarRowProps", () => {
  it("role is row", () => {
    expect(makeApi().api.getCalendarRowProps(0).role).toBe("row");
  });

  it("data-week reflects week index", () => {
    expect(makeApi().api.getCalendarRowProps(2)["data-week"]).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// getHiddenInputProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — getHiddenInputProps", () => {
  it("type is hidden", () => {
    expect(makeApi({ value: JUNE15 }).api.getHiddenInputProps("date").type).toBe("hidden");
  });

  it("name matches provided name", () => {
    expect(makeApi({ value: JUNE15 }).api.getHiddenInputProps("date").name).toBe("date");
  });

  it("value is ISO string YYYY-MM-DD", () => {
    expect(makeApi({ value: JUNE15 }).api.getHiddenInputProps("date").value).toBe("2024-06-15");
  });

  it("value is empty string when no value selected", () => {
    expect(makeApi({ value: null }).api.getHiddenInputProps("date").value).toBe("");
  });

  it("zero-pads month and day", () => {
    expect(makeApi({ value: JAN15 }).api.getHiddenInputProps("date").value).toBe("2024-01-15");
  });

  it("aria-hidden is true", () => {
    expect(makeApi().api.getHiddenInputProps("date")["aria-hidden"]).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Computed properties
// ---------------------------------------------------------------------------

describe("connectDatePicker — computed properties", () => {
  it("isOpen is false when closed", () => {
    expect(makeApi({}, "closed").api.isOpen).toBe(false);
  });

  it("isOpen is true when open.day", () => {
    expect(makeApi({}, "open.day").api.isOpen).toBe(true);
  });

  it("isOpen is true when open.month", () => {
    expect(makeApi({}, "open.month").api.isOpen).toBe(true);
  });

  it("view is null when closed", () => {
    expect(makeApi({}, "closed").api.view).toBeNull();
  });

  it("view is 'day' when open.day", () => {
    expect(makeApi({}, "open.day").api.view).toBe("day");
  });

  it("view is 'month' when open.month", () => {
    expect(makeApi({}, "open.month").api.view).toBe("month");
  });

  it("view is 'year' when open.year", () => {
    expect(makeApi({}, "open.year").api.view).toBe("year");
  });

  it("formattedValue is empty string when no value", () => {
    expect(makeApi({ value: null }).api.formattedValue).toBe("");
  });

  it("formattedValue is a non-empty string when value set", () => {
    expect(makeApi({ value: JUNE15 }).api.formattedValue).toBeTruthy();
    expect(makeApi({ value: JUNE15 }).api.formattedValue).toMatch(/2024/);
  });

  it("monthYearLabel contains June 2024", () => {
    expect(makeApi({ focusedDate: JUNE15 }).api.monthYearLabel).toMatch(/june/i);
  });

  it("weeks is 2D array with 7 columns", () => {
    for (const week of makeApi({ focusedDate: JUNE15 }).api.weeks) expect(week).toHaveLength(7);
  });

  it("weekdays has 7 entries", () => {
    expect(makeApi().api.weekdays).toHaveLength(7);
  });

  it("weekdays first entry is Sunday when firstDayOfWeek=0", () => {
    expect(makeApi({ firstDayOfWeek: 0 }).api.weekdays[0]?.index).toBe(0);
  });

  it("weekdays first entry is Monday when firstDayOfWeek=1", () => {
    expect(makeApi({ firstDayOfWeek: 1 }).api.weekdays[0]?.index).toBe(1);
  });

  it("months has 12 entries", () => {
    expect(makeApi().api.months).toHaveLength(12);
  });

  it("yearRange has 12 entries", () => {
    expect(makeApi().api.yearRange).toHaveLength(12);
  });

  it("yearRange starts at yearGridStart", () => {
    const start = getYearGridStart(2024);
    expect(makeApi({ yearGridStart: start }).api.yearRange[0]).toBe(start);
  });

  it("weeksPerMonth has numberOfMonths entries", () => {
    expect(makeApi({ numberOfMonths: 2 }).api.weeksPerMonth).toHaveLength(2);
  });
});
