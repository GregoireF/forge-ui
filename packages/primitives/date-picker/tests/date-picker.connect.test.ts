import { describe, expect, it, vi } from "vitest";
import { connectDatePicker } from "../src/date-picker.connect.js";
import type { DatePickerContext } from "../src/date-picker.types.js";

// Fixed date for deterministic tests — June 15, 2024 (Saturday)
const JUNE15 = { year: 2024, month: 6, day: 15 };
const JAN15 = { year: 2024, month: 1, day: 15 };

function makeCtx(overrides: Partial<DatePickerContext> = {}): DatePickerContext {
  return {
    id: "test",
    value: null,
    focusedDate: JUNE15,
    locale: "en",
    firstDayOfWeek: 0,
    disabled: false,
    readOnly: false,
    contentEl: null,
    triggerEl: null,
    ...overrides,
  };
}

function makeApi(overrides: Partial<DatePickerContext> = {}, isOpen = false) {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  const snapshot = {
    value: isOpen ? ("open" as const) : ("closed" as const),
    context: ctx,
    matches: (s: string) => s === (isOpen ? "open" : "closed"),
  };
  return { api: connectDatePicker(snapshot, send, machine), send, machine };
}

// ---------------------------------------------------------------------------
// getTriggerProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — getTriggerProps", () => {
  it("type is button", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps().type).toBe("button");
  });

  it("aria-haspopup is dialog", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps()["aria-haspopup"]).toBe("dialog");
  });

  it("aria-expanded false when closed", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps()["aria-expanded"]).toBe(false);
  });

  it("aria-expanded true when open", () => {
    const { api } = makeApi({}, true);
    expect(api.getTriggerProps()["aria-expanded"]).toBe(true);
  });

  it("aria-controls references content id", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps()["aria-controls"]).toBe("test-content");
  });

  it("data-forge-scope is date-picker", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps()["data-forge-scope"]).toBe("date-picker");
  });

  it("data-forge-part is trigger", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps()["data-forge-part"]).toBe("trigger");
  });

  it("disabled when context.disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getTriggerProps().disabled).toBe(true);
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
    const { api } = makeApi({}, true);
    expect(api.getContentProps().role).toBe("dialog");
  });

  it("aria-modal is true", () => {
    const { api } = makeApi({}, true);
    expect(api.getContentProps()["aria-modal"]).toBe(true);
  });

  it("id is test-content", () => {
    const { api } = makeApi();
    expect(api.getContentProps().id).toBe("test-content");
  });

  it("aria-label contains month and year", () => {
    const { api } = makeApi({ focusedDate: JUNE15 });
    const label = api.getContentProps()["aria-label"];
    expect(label).toMatch(/june/i);
    expect(label).toMatch(/2024/);
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
  it("aria-live is polite (announces month changes to SR)", () => {
    const { api } = makeApi();
    expect(api.getCalendarHeaderProps()["aria-live"]).toBe("polite");
  });

  it("data-forge-part is calendar-header", () => {
    const { api } = makeApi();
    expect(api.getCalendarHeaderProps()["data-forge-part"]).toBe("calendar-header");
  });
});

// ---------------------------------------------------------------------------
// getPrevMonthButtonProps / getNextMonthButtonProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — month navigation buttons", () => {
  it("prev button aria-label is 'Go to previous month'", () => {
    const { api } = makeApi();
    expect(api.getPrevMonthButtonProps()["aria-label"]).toBe("Go to previous month");
  });

  it("next button aria-label is 'Go to next month'", () => {
    const { api } = makeApi();
    expect(api.getNextMonthButtonProps()["aria-label"]).toBe("Go to next month");
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
    // focusedDate is June 2024, min is June 2024 → prev month (May) is before min
    const { api } = makeApi({ focusedDate: JUNE15, min: JUNE15 });
    expect(api.getPrevMonthButtonProps().disabled).toBe(true);
  });

  it("prev button not disabled when above min", () => {
    const { api } = makeApi({ focusedDate: JUNE15, min: JAN15 });
    expect(api.getPrevMonthButtonProps().disabled).toBeUndefined();
  });

  it("next button disabled when at max month boundary", () => {
    // focusedDate June 2024, max June 2024 → next month (July) is after max
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
// getCalendarGridProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — getCalendarGridProps", () => {
  it("role is grid", () => {
    const { api } = makeApi();
    expect(api.getCalendarGridProps().role).toBe("grid");
  });

  it("aria-label contains month/year", () => {
    const { api } = makeApi({ focusedDate: JUNE15 });
    expect(api.getCalendarGridProps()["aria-label"]).toMatch(/june/i);
  });

  it("aria-disabled when context.disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getCalendarGridProps()["aria-disabled"]).toBe(true);
  });

  it("aria-readonly when context.readOnly", () => {
    const { api } = makeApi({ readOnly: true });
    expect(api.getCalendarGridProps()["aria-readonly"]).toBe(true);
  });

  it("onKeyDown ArrowLeft sends FOCUS_PREV_DAY", () => {
    const { api, send } = makeApi();
    const e = new KeyboardEvent("keydown", { key: "ArrowLeft" });
    const prevent = vi.spyOn(e, "preventDefault");
    api.getCalendarGridProps().onKeyDown(e);
    expect(prevent).toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith("FOCUS_PREV_DAY");
  });

  it("onKeyDown ArrowRight sends FOCUS_NEXT_DAY", () => {
    const { api, send } = makeApi();
    const e = new KeyboardEvent("keydown", { key: "ArrowRight" });
    api.getCalendarGridProps().onKeyDown(e);
    expect(send).toHaveBeenCalledWith("FOCUS_NEXT_DAY");
  });

  it("onKeyDown ArrowUp sends FOCUS_PREV_WEEK", () => {
    const { api, send } = makeApi();
    const e = new KeyboardEvent("keydown", { key: "ArrowUp" });
    api.getCalendarGridProps().onKeyDown(e);
    expect(send).toHaveBeenCalledWith("FOCUS_PREV_WEEK");
  });

  it("onKeyDown ArrowDown sends FOCUS_NEXT_WEEK", () => {
    const { api, send } = makeApi();
    const e = new KeyboardEvent("keydown", { key: "ArrowDown" });
    api.getCalendarGridProps().onKeyDown(e);
    expect(send).toHaveBeenCalledWith("FOCUS_NEXT_WEEK");
  });

  it("onKeyDown PageUp sends FOCUS_PREV_MONTH", () => {
    const { api, send } = makeApi();
    const e = new KeyboardEvent("keydown", { key: "PageUp" });
    api.getCalendarGridProps().onKeyDown(e);
    expect(send).toHaveBeenCalledWith("FOCUS_PREV_MONTH");
  });

  it("onKeyDown PageDown sends FOCUS_NEXT_MONTH", () => {
    const { api, send } = makeApi();
    const e = new KeyboardEvent("keydown", { key: "PageDown" });
    api.getCalendarGridProps().onKeyDown(e);
    expect(send).toHaveBeenCalledWith("FOCUS_NEXT_MONTH");
  });

  it("onKeyDown Shift+PageUp sends FOCUS_PREV_YEAR", () => {
    const { api, send } = makeApi();
    const e = new KeyboardEvent("keydown", { key: "PageUp", shiftKey: true });
    api.getCalendarGridProps().onKeyDown(e);
    expect(send).toHaveBeenCalledWith("FOCUS_PREV_YEAR");
  });

  it("onKeyDown Shift+PageDown sends FOCUS_NEXT_YEAR", () => {
    const { api, send } = makeApi();
    const e = new KeyboardEvent("keydown", { key: "PageDown", shiftKey: true });
    api.getCalendarGridProps().onKeyDown(e);
    expect(send).toHaveBeenCalledWith("FOCUS_NEXT_YEAR");
  });

  it("onKeyDown Home sends FOCUS_WEEK_START", () => {
    const { api, send } = makeApi();
    const e = new KeyboardEvent("keydown", { key: "Home" });
    api.getCalendarGridProps().onKeyDown(e);
    expect(send).toHaveBeenCalledWith("FOCUS_WEEK_START");
  });

  it("onKeyDown End sends FOCUS_WEEK_END", () => {
    const { api, send } = makeApi();
    const e = new KeyboardEvent("keydown", { key: "End" });
    api.getCalendarGridProps().onKeyDown(e);
    expect(send).toHaveBeenCalledWith("FOCUS_WEEK_END");
  });

  it("onKeyDown Enter sends SELECT_FOCUSED", () => {
    const { api, send } = makeApi();
    const e = new KeyboardEvent("keydown", { key: "Enter" });
    api.getCalendarGridProps().onKeyDown(e);
    expect(send).toHaveBeenCalledWith("SELECT_FOCUSED");
  });

  it("onKeyDown Space sends SELECT_FOCUSED", () => {
    const { api, send } = makeApi();
    const e = new KeyboardEvent("keydown", { key: " " });
    api.getCalendarGridProps().onKeyDown(e);
    expect(send).toHaveBeenCalledWith("SELECT_FOCUSED");
  });

  it("onKeyDown Enter does NOT send in readOnly mode", () => {
    const { api, send } = makeApi({ readOnly: true });
    const e = new KeyboardEvent("keydown", { key: "Enter" });
    api.getCalendarGridProps().onKeyDown(e);
    expect(send).not.toHaveBeenCalledWith("SELECT_FOCUSED");
  });

  it("unhandled key does not send anything", () => {
    const { api, send } = makeApi();
    const e = new KeyboardEvent("keydown", { key: "a" });
    api.getCalendarGridProps().onKeyDown(e);
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getCalendarCellProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — getCalendarCellProps", () => {
  it("role is gridcell", () => {
    const { api } = makeApi();
    expect(api.getCalendarCellProps(JUNE15).role).toBe("gridcell");
  });

  it("aria-selected true for selected date", () => {
    const { api } = makeApi({ value: JUNE15, focusedDate: JUNE15 });
    expect(api.getCalendarCellProps(JUNE15)["aria-selected"]).toBe(true);
  });

  it("aria-selected false for non-selected date", () => {
    const { api } = makeApi({ value: JAN15, focusedDate: JUNE15 });
    expect(api.getCalendarCellProps(JUNE15)["aria-selected"]).toBe(false);
  });

  it("tabIndex 0 for focused date", () => {
    const { api } = makeApi({ focusedDate: JUNE15 });
    expect(api.getCalendarCellProps(JUNE15).tabIndex).toBe(0);
  });

  it("tabIndex -1 for non-focused date", () => {
    const { api } = makeApi({ focusedDate: JUNE15 });
    expect(api.getCalendarCellProps(JAN15).tabIndex).toBe(-1);
  });

  it("aria-disabled for disabled date (below min)", () => {
    const { api } = makeApi({ min: JUNE15, focusedDate: JUNE15 });
    // JAN15 is before min JUNE15 → disabled
    expect(api.getCalendarCellProps(JAN15)["aria-disabled"]).toBe(true);
  });

  it("aria-disabled for disabled date (isDateUnavailable)", () => {
    const { api } = makeApi({ isDateUnavailable: (d) => d.month === 6, focusedDate: JUNE15 });
    expect(api.getCalendarCellProps(JUNE15)["aria-disabled"]).toBe(true);
  });

  it("aria-label is a full date string", () => {
    const { api } = makeApi({ focusedDate: JUNE15 });
    const label = api.getCalendarCellProps(JUNE15)["aria-label"];
    expect(label).toMatch(/2024/);
    expect(label).toMatch(/june/i);
    expect(label).toMatch(/15/);
  });

  it("data-selected attribute present on selected cell", () => {
    const { api } = makeApi({ value: JUNE15, focusedDate: JUNE15 });
    expect(api.getCalendarCellProps(JUNE15)["data-selected"]).toBe("");
  });

  it("data-focused attribute present on focused cell", () => {
    const { api } = makeApi({ focusedDate: JUNE15 });
    expect(api.getCalendarCellProps(JUNE15)["data-focused"]).toBe("");
  });

  it("data-disabled attribute present on unavailable cell", () => {
    const { api } = makeApi({ isDateUnavailable: () => true, focusedDate: JUNE15 });
    expect(api.getCalendarCellProps(JUNE15)["data-disabled"]).toBe("");
  });

  it("onClick sends SELECT_DAY and FOCUS_DAY for available date", () => {
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
// getWeekdayHeaderProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — getWeekdayHeaderProps", () => {
  it("role is columnheader", () => {
    const { api } = makeApi();
    expect(api.getWeekdayHeaderProps(0).role).toBe("columnheader");
  });

  it("abbr contains full weekday name", () => {
    const { api } = makeApi();
    // Sunday-first, index 0 = Sunday
    const abbr = api.getWeekdayHeaderProps(0).abbr;
    expect(abbr).toMatch(/sunday/i);
  });
});

// ---------------------------------------------------------------------------
// getCalendarRowProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — getCalendarRowProps", () => {
  it("role is row", () => {
    const { api } = makeApi();
    expect(api.getCalendarRowProps(0).role).toBe("row");
  });

  it("data-week reflects week index", () => {
    const { api } = makeApi();
    expect(api.getCalendarRowProps(2)["data-week"]).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// getHiddenInputProps
// ---------------------------------------------------------------------------

describe("connectDatePicker — getHiddenInputProps", () => {
  it("type is hidden", () => {
    const { api } = makeApi({ value: JUNE15 });
    expect(api.getHiddenInputProps("date").type).toBe("hidden");
  });

  it("name matches provided name", () => {
    const { api } = makeApi({ value: JUNE15 });
    expect(api.getHiddenInputProps("date").name).toBe("date");
  });

  it("value is ISO string YYYY-MM-DD", () => {
    const { api } = makeApi({ value: JUNE15 });
    expect(api.getHiddenInputProps("date").value).toBe("2024-06-15");
  });

  it("value is empty string when no value selected", () => {
    const { api } = makeApi({ value: null });
    expect(api.getHiddenInputProps("date").value).toBe("");
  });

  it("zero-pads month and day", () => {
    const { api } = makeApi({ value: JAN15 });
    expect(api.getHiddenInputProps("date").value).toBe("2024-01-15");
  });

  it("aria-hidden is true", () => {
    const { api } = makeApi();
    expect(api.getHiddenInputProps("date")["aria-hidden"]).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Computed properties
// ---------------------------------------------------------------------------

describe("connectDatePicker — computed properties", () => {
  it("isOpen is false when closed", () => {
    const { api } = makeApi({}, false);
    expect(api.isOpen).toBe(false);
  });

  it("isOpen is true when open", () => {
    const { api } = makeApi({}, true);
    expect(api.isOpen).toBe(true);
  });

  it("monthYearLabel is a non-empty string", () => {
    const { api } = makeApi({ focusedDate: JUNE15 });
    expect(api.monthYearLabel).toBeTruthy();
    expect(api.monthYearLabel).toMatch(/june/i);
  });

  it("weeks is a 2D array with 7 columns per row", () => {
    const { api } = makeApi({ focusedDate: JUNE15 });
    expect(Array.isArray(api.weeks)).toBe(true);
    for (const week of api.weeks) expect(week).toHaveLength(7);
  });

  it("weekdays has 7 entries", () => {
    const { api } = makeApi();
    expect(api.weekdays).toHaveLength(7);
  });

  it("weekdays first entry is Sunday when firstDayOfWeek=0", () => {
    const { api } = makeApi({ firstDayOfWeek: 0 });
    expect(api.weekdays[0].index).toBe(0);
  });

  it("weekdays first entry is Monday when firstDayOfWeek=1", () => {
    const { api } = makeApi({ firstDayOfWeek: 1 });
    expect(api.weekdays[0].index).toBe(1);
  });
});
