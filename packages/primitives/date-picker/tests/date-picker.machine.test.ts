import { afterEach, describe, expect, it, vi } from "vitest";
import { getYearGridStart } from "../src/calendar.js";
import { createDatePickerMachine } from "../src/date-picker.machine.js";
import type { CalendarDate } from "../src/date-picker.types.js";

const jan15: CalendarDate = { year: 2024, month: 1, day: 15 };
const jan31: CalendarDate = { year: 2024, month: 1, day: 31 };
const jun15: CalendarDate = { year: 2024, month: 6, day: 15 };
const TODAY: CalendarDate = { year: 2024, month: 3, day: 1 };

let active: ReturnType<typeof createDatePickerMachine>[] = [];

function make(opts: Parameters<typeof createDatePickerMachine>[0] = {}) {
  const m = createDatePickerMachine({ id: "test", today: TODAY, ...opts });
  m.start();
  active.push(m);
  return m;
}

afterEach(() => {
  for (const m of active) m.stop();
  active = [];
});

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe("createDatePickerMachine — initial state", () => {
  it("starts in closed state", () => {
    expect(make().getSnapshot().matches("closed")).toBe(true);
  });

  it("value is null when no defaultValue/value given", () => {
    expect(make().getSnapshot().context.value).toBeNull();
  });

  it("defaultValue sets initial value and focusedDate", () => {
    const m = make({ defaultValue: jan15 });
    expect(m.getSnapshot().context.value).toEqual(jan15);
    expect(m.getSnapshot().context.focusedDate).toEqual(jan15);
  });

  it("value (controlled) sets initial value and focusedDate", () => {
    const m = make({ value: jun15 });
    expect(m.getSnapshot().context.value).toEqual(jun15);
    expect(m.getSnapshot().context.focusedDate).toEqual(jun15);
  });

  it("locale defaults to 'en'", () => {
    expect(make().getSnapshot().context.locale).toBe("en");
  });

  it("custom locale is stored", () => {
    expect(make({ locale: "fr" }).getSnapshot().context.locale).toBe("fr");
  });

  it("firstDayOfWeek defaults to 0 (Sunday)", () => {
    expect(make().getSnapshot().context.firstDayOfWeek).toBe(0);
  });

  it("disabled defaults to false", () => {
    expect(make().getSnapshot().context.disabled).toBe(false);
  });

  it("readOnly defaults to false", () => {
    expect(make().getSnapshot().context.readOnly).toBe(false);
  });

  it("numberOfMonths defaults to 1", () => {
    expect(make().getSnapshot().context.numberOfMonths).toBe(1);
  });

  it("numberOfMonths option stored", () => {
    expect(make({ numberOfMonths: 2 }).getSnapshot().context.numberOfMonths).toBe(2);
  });

  it("today stored from option", () => {
    expect(make().getSnapshot().context.today).toEqual(TODAY);
  });

  it("yearGridStart computed from focusedDate", () => {
    const m = make({ defaultValue: { year: 2024, month: 1, day: 1 } });
    expect(m.getSnapshot().context.yearGridStart).toBe(getYearGridStart(2024));
  });

  it("id fallback to 'root' when not provided", () => {
    const m = createDatePickerMachine({ today: TODAY });
    m.start();
    active.push(m);
    expect(m.id).toContain("root");
    expect(m.getSnapshot().context.id).toBe("root");
  });
});

// ---------------------------------------------------------------------------
// Open / Close transitions — now landing on open.day
// ---------------------------------------------------------------------------

describe("createDatePickerMachine — OPEN / CLOSE", () => {
  it("OPEN transitions to open.day", () => {
    const m = make();
    m.send("OPEN");
    expect(m.getSnapshot().matches("open.day")).toBe(true);
  });

  it("OPEN has tag 'open'", () => {
    const m = make();
    m.send("OPEN");
    expect(m.getSnapshot().hasTag("open")).toBe(true);
  });

  it("CLOSE transitions back to closed", () => {
    const m = make();
    m.send("OPEN");
    m.send("CLOSE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("TOGGLE opens when closed → open.day", () => {
    const m = make();
    m.send("TOGGLE");
    expect(m.getSnapshot().matches("open.day")).toBe(true);
  });

  it("TOGGLE closes when open", () => {
    const m = make();
    m.send("OPEN");
    m.send("TOGGLE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("ESCAPE_KEY closes when in open.day", () => {
    const m = make();
    m.send("OPEN");
    m.send("ESCAPE_KEY");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("INTERACT_OUTSIDE closes when in open.day", () => {
    const m = make();
    m.send("OPEN");
    m.send("INTERACT_OUTSIDE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("ESCAPE_KEY closes from open.month", () => {
    const m = make();
    m.send("OPEN");
    m.send("VIEW_MONTHS");
    m.send("ESCAPE_KEY");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("ESCAPE_KEY closes from open.year", () => {
    const m = make();
    m.send("OPEN");
    m.send("VIEW_MONTHS");
    m.send("VIEW_YEARS");
    m.send("ESCAPE_KEY");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("onOpenChange called with true on OPEN", () => {
    const cb = vi.fn();
    const m = make({ onOpenChange: cb });
    m.send("OPEN");
    expect(cb).toHaveBeenCalledWith(true);
  });

  it("onOpenChange called with false on CLOSE", () => {
    const cb = vi.fn();
    const m = make({ onOpenChange: cb });
    m.send("OPEN");
    m.send("CLOSE");
    expect(cb).toHaveBeenLastCalledWith(false);
  });

  it("onOpenChange NOT called on initial start", () => {
    const cb = vi.fn();
    make({ onOpenChange: cb });
    expect(cb).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// View switching (month / year picker)
// ---------------------------------------------------------------------------

describe("createDatePickerMachine — view switching", () => {
  it("VIEW_MONTHS from open.day → open.month", () => {
    const m = make();
    m.send("OPEN");
    m.send("VIEW_MONTHS");
    expect(m.getSnapshot().matches("open.month")).toBe(true);
  });

  it("open.month still has tag 'open'", () => {
    const m = make();
    m.send("OPEN");
    m.send("VIEW_MONTHS");
    expect(m.getSnapshot().hasTag("open")).toBe(true);
  });

  it("VIEW_YEARS from open.month → open.year", () => {
    const m = make();
    m.send("OPEN");
    m.send("VIEW_MONTHS");
    m.send("VIEW_YEARS");
    expect(m.getSnapshot().matches("open.year")).toBe(true);
  });

  it("VIEW_YEARS from open.day → open.year (direct shortcut)", () => {
    const m = make();
    m.send("OPEN");
    m.send("VIEW_YEARS");
    expect(m.getSnapshot().matches("open.year")).toBe(true);
  });

  it("VIEW_DAYS from open.month → open.day", () => {
    const m = make();
    m.send("OPEN");
    m.send("VIEW_MONTHS");
    m.send("VIEW_DAYS");
    expect(m.getSnapshot().matches("open.day")).toBe(true);
  });

  it("VIEW_MONTHS from open.year → open.month", () => {
    const m = make();
    m.send("OPEN");
    m.send("VIEW_YEARS");
    m.send("VIEW_MONTHS");
    expect(m.getSnapshot().matches("open.month")).toBe(true);
  });

  it("VIEW_DAYS from open.year → open.day", () => {
    const m = make();
    m.send("OPEN");
    m.send("VIEW_YEARS");
    m.send("VIEW_DAYS");
    expect(m.getSnapshot().matches("open.day")).toBe(true);
  });

  it("VIEW_YEARS sets yearGridStart from focusedDate", () => {
    const m = make({ defaultValue: { year: 2024, month: 6, day: 15 } });
    m.send("OPEN");
    m.send("VIEW_YEARS");
    expect(m.getSnapshot().context.yearGridStart).toBe(getYearGridStart(2024));
  });
});

// ---------------------------------------------------------------------------
// SELECT_MONTH / SELECT_YEAR
// ---------------------------------------------------------------------------

describe("createDatePickerMachine — SELECT_MONTH / SELECT_YEAR", () => {
  it("SELECT_MONTH from open.month sets focusedDate.month and goes to open.day", () => {
    const m = make({ defaultValue: jan15 });
    m.send("OPEN");
    m.send("VIEW_MONTHS");
    m.send({ type: "SELECT_MONTH", month: 6 });
    expect(m.getSnapshot().matches("open.day")).toBe(true);
    expect(m.getSnapshot().context.focusedDate.month).toBe(6);
  });

  it("SELECT_MONTH clamps day when shorter month (Jan31 → Feb28)", () => {
    const m = make({ defaultValue: jan31 });
    m.send("OPEN");
    m.send("VIEW_MONTHS");
    m.send({ type: "SELECT_MONTH", month: 2 });
    expect(m.getSnapshot().context.focusedDate.day).toBe(29); // 2024 is leap year
  });

  it("SELECT_YEAR from open.year sets focusedDate.year and goes to open.month", () => {
    const m = make({ defaultValue: jan15 });
    m.send("OPEN");
    m.send("VIEW_YEARS");
    m.send({ type: "SELECT_YEAR", year: 2025 });
    expect(m.getSnapshot().matches("open.month")).toBe(true);
    expect(m.getSnapshot().context.focusedDate.year).toBe(2025);
  });

  it("SELECT_YEAR clamps day in shorter month (Feb 29 → Feb 28 in non-leap)", () => {
    const m = make({ defaultValue: { year: 2024, month: 2, day: 29 } });
    m.send("OPEN");
    m.send("VIEW_YEARS");
    m.send({ type: "SELECT_YEAR", year: 2025 });
    expect(m.getSnapshot().context.focusedDate.day).toBe(28);
  });
});

// ---------------------------------------------------------------------------
// Year range navigation
// ---------------------------------------------------------------------------

describe("createDatePickerMachine — year range navigation", () => {
  it("NAVIGATE_PREV_YEAR_RANGE decrements yearGridStart by 12", () => {
    const m = make({ defaultValue: jan15 });
    m.send("OPEN");
    m.send("VIEW_YEARS");
    const before = m.getSnapshot().context.yearGridStart;
    m.send("NAVIGATE_PREV_YEAR_RANGE");
    expect(m.getSnapshot().context.yearGridStart).toBe(before - 12);
  });

  it("NAVIGATE_NEXT_YEAR_RANGE increments yearGridStart by 12", () => {
    const m = make({ defaultValue: jan15 });
    m.send("OPEN");
    m.send("VIEW_YEARS");
    const before = m.getSnapshot().context.yearGridStart;
    m.send("NAVIGATE_NEXT_YEAR_RANGE");
    expect(m.getSnapshot().context.yearGridStart).toBe(before + 12);
  });
});

// ---------------------------------------------------------------------------
// SELECT_DAY
// ---------------------------------------------------------------------------

describe("createDatePickerMachine — SELECT_DAY", () => {
  it("selects a date and updates focusedDate", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jun15 });
    expect(m.getSnapshot().context.value).toEqual(jun15);
    expect(m.getSnapshot().context.focusedDate).toEqual(jun15);
  });

  it("calls onValueChange with selected date", () => {
    const cb = vi.fn();
    const m = make({ onValueChange: cb });
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jun15 });
    expect(cb).toHaveBeenCalledWith(jun15);
  });

  it("does NOT select when disabled", () => {
    const m = make({ defaultValue: jan15, disabled: true });
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jun15 });
    expect(m.getSnapshot().context.value).toEqual(jan15);
  });

  it("does NOT select when readOnly", () => {
    const m = make({ defaultValue: jan15, readOnly: true });
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jun15 });
    expect(m.getSnapshot().context.value).toEqual(jan15);
  });

  it("does NOT select a date below min", () => {
    const m = make({ defaultValue: jun15, min: jun15 });
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jan15 });
    expect(m.getSnapshot().context.value).toEqual(jun15);
  });

  it("does NOT select a date above max", () => {
    const m = make({ defaultValue: jan15, max: jan15 });
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jun15 });
    expect(m.getSnapshot().context.value).toEqual(jan15);
  });

  it("does NOT select an unavailable date", () => {
    const m = make({ defaultValue: jan15, isDateUnavailable: (d) => d.month === 6 });
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jun15 });
    expect(m.getSnapshot().context.value).toEqual(jan15);
  });

  it("does NOT select a disabled weekday", () => {
    // jun15 is Saturday (6)
    const m = make({ defaultValue: jan15, disabledWeekdays: [6] });
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jun15 });
    expect(m.getSnapshot().context.value).toEqual(jan15);
  });
});

// ---------------------------------------------------------------------------
// SELECT_FOCUSED
// ---------------------------------------------------------------------------

describe("createDatePickerMachine — SELECT_FOCUSED", () => {
  it("selects focusedDate as value", () => {
    const m = make({ defaultValue: jan15 });
    m.send("OPEN");
    m.send({ type: "FOCUS_DAY", date: jun15 });
    m.send("SELECT_FOCUSED");
    expect(m.getSnapshot().context.value).toEqual(jun15);
  });

  it("does NOT select when disabled", () => {
    const m = make({ defaultValue: jan15, disabled: true });
    m.send("OPEN");
    m.send({ type: "FOCUS_DAY", date: jun15 });
    m.send("SELECT_FOCUSED");
    expect(m.getSnapshot().context.value).toEqual(jan15);
  });

  it("does NOT select when focusedDate is unavailable", () => {
    const m = make({ defaultValue: jan15, isDateUnavailable: (d) => d.month === 6 });
    m.send("OPEN");
    m.send({ type: "FOCUS_DAY", date: jun15 });
    m.send("SELECT_FOCUSED");
    expect(m.getSnapshot().context.value).toEqual(jan15);
  });
});

// ---------------------------------------------------------------------------
// SELECT_PRESET
// ---------------------------------------------------------------------------

describe("createDatePickerMachine — SELECT_PRESET", () => {
  it("SELECT_PRESET sets value and focusedDate to resolved date", () => {
    const m = make({ defaultValue: jan15 });
    m.send("OPEN");
    m.send({ type: "SELECT_PRESET", date: jun15 });
    expect(m.getSnapshot().context.value).toEqual(jun15);
    expect(m.getSnapshot().context.focusedDate).toEqual(jun15);
  });

  it("SELECT_PRESET calls onValueChange", () => {
    const cb = vi.fn();
    const m = make({ onValueChange: cb });
    m.send("OPEN");
    m.send({ type: "SELECT_PRESET", date: jun15 });
    expect(cb).toHaveBeenCalledWith(jun15);
  });

  it("SELECT_PRESET does NOT run when disabled", () => {
    const m = make({ defaultValue: jan15, disabled: true });
    m.send("OPEN");
    m.send({ type: "SELECT_PRESET", date: jun15 });
    expect(m.getSnapshot().context.value).toEqual(jan15);
  });

  it("SELECT_PRESET works in closed state too", () => {
    const m = make({ defaultValue: jan15 });
    m.send({ type: "SELECT_PRESET", date: jun15 });
    // closed state doesn't handle SELECT_PRESET — no change
    expect(m.getSnapshot().context.value).toEqual(jan15);
  });
});

// ---------------------------------------------------------------------------
// Month navigation
// ---------------------------------------------------------------------------

describe("createDatePickerMachine — month navigation", () => {
  it("NAVIGATE_PREV_MONTH moves focusedDate back one month", () => {
    const m = make({ defaultValue: { year: 2024, month: 3, day: 15 } });
    m.send("OPEN");
    m.send("NAVIGATE_PREV_MONTH");
    expect(m.getSnapshot().context.focusedDate.month).toBe(2);
  });

  it("NAVIGATE_NEXT_MONTH moves focusedDate forward one month", () => {
    const m = make({ defaultValue: { year: 2024, month: 11, day: 15 } });
    m.send("OPEN");
    m.send("NAVIGATE_NEXT_MONTH");
    expect(m.getSnapshot().context.focusedDate.month).toBe(12);
  });

  it("NAVIGATE_PREV_MONTH crosses year boundary", () => {
    const m = make({ defaultValue: { year: 2024, month: 1, day: 15 } });
    m.send("OPEN");
    m.send("NAVIGATE_PREV_MONTH");
    expect(m.getSnapshot().context.focusedDate).toEqual({ year: 2023, month: 12, day: 15 });
  });

  it("NAVIGATE_NEXT_MONTH crosses year boundary", () => {
    const m = make({ defaultValue: { year: 2024, month: 12, day: 15 } });
    m.send("OPEN");
    m.send("NAVIGATE_NEXT_MONTH");
    expect(m.getSnapshot().context.focusedDate).toEqual({ year: 2025, month: 1, day: 15 });
  });

  it("NAVIGATE_TO_MONTH sets specific month and year", () => {
    const m = make({ defaultValue: jan15 });
    m.send("OPEN");
    m.send({ type: "NAVIGATE_TO_MONTH", year: 2025, month: 3 });
    expect(m.getSnapshot().context.focusedDate.year).toBe(2025);
    expect(m.getSnapshot().context.focusedDate.month).toBe(3);
  });

  it("NAVIGATE_TO_MONTH clamps day when shorter month (31 → 28)", () => {
    const m = make({ defaultValue: jan31 });
    m.send("OPEN");
    m.send({ type: "NAVIGATE_TO_MONTH", year: 2023, month: 2 });
    expect(m.getSnapshot().context.focusedDate.day).toBe(28);
  });
});

// ---------------------------------------------------------------------------
// Focus navigation (keyboard)
// ---------------------------------------------------------------------------

describe("createDatePickerMachine — focus navigation", () => {
  it("FOCUS_DAY sets focusedDate", () => {
    const m = make({ defaultValue: jan15 });
    m.send("OPEN");
    m.send({ type: "FOCUS_DAY", date: jun15 });
    expect(m.getSnapshot().context.focusedDate).toEqual(jun15);
  });

  it("FOCUS_NEXT_DAY moves forward 1 day", () => {
    const m = make({ defaultValue: { year: 2024, month: 6, day: 14 } });
    m.send("OPEN");
    m.send("FOCUS_NEXT_DAY");
    expect(m.getSnapshot().context.focusedDate).toEqual(jun15);
  });

  it("FOCUS_PREV_DAY moves backward 1 day", () => {
    const m = make({ defaultValue: jun15 });
    m.send("OPEN");
    m.send("FOCUS_PREV_DAY");
    expect(m.getSnapshot().context.focusedDate).toEqual({ year: 2024, month: 6, day: 14 });
  });

  it("FOCUS_NEXT_WEEK moves forward 7 days", () => {
    const m = make({ defaultValue: jun15 });
    m.send("OPEN");
    m.send("FOCUS_NEXT_WEEK");
    expect(m.getSnapshot().context.focusedDate).toEqual({ year: 2024, month: 6, day: 22 });
  });

  it("FOCUS_PREV_WEEK moves backward 7 days", () => {
    const m = make({ defaultValue: jun15 });
    m.send("OPEN");
    m.send("FOCUS_PREV_WEEK");
    expect(m.getSnapshot().context.focusedDate).toEqual({ year: 2024, month: 6, day: 8 });
  });

  it("FOCUS_NEXT_MONTH moves forward 1 month", () => {
    const m = make({ defaultValue: jan15 });
    m.send("OPEN");
    m.send("FOCUS_NEXT_MONTH");
    expect(m.getSnapshot().context.focusedDate).toEqual({ year: 2024, month: 2, day: 15 });
  });

  it("FOCUS_PREV_MONTH moves backward 1 month", () => {
    const m = make({ defaultValue: { year: 2024, month: 2, day: 15 } });
    m.send("OPEN");
    m.send("FOCUS_PREV_MONTH");
    expect(m.getSnapshot().context.focusedDate).toEqual(jan15);
  });

  it("FOCUS_NEXT_YEAR moves forward 1 year", () => {
    const m = make({ defaultValue: jan15 });
    m.send("OPEN");
    m.send("FOCUS_NEXT_YEAR");
    expect(m.getSnapshot().context.focusedDate).toEqual({ year: 2025, month: 1, day: 15 });
  });

  it("FOCUS_PREV_YEAR moves backward 1 year", () => {
    const m = make({ defaultValue: jan15 });
    m.send("OPEN");
    m.send("FOCUS_PREV_YEAR");
    expect(m.getSnapshot().context.focusedDate).toEqual({ year: 2023, month: 1, day: 15 });
  });

  it("FOCUS_NEXT_DAY does not cross max boundary", () => {
    const m = make({ defaultValue: jan15, max: jan15 });
    m.send("OPEN");
    m.send("FOCUS_NEXT_DAY");
    expect(m.getSnapshot().context.focusedDate).toEqual(jan15);
  });

  it("FOCUS_PREV_DAY does not cross min boundary", () => {
    const m = make({ defaultValue: jan15, min: jan15 });
    m.send("OPEN");
    m.send("FOCUS_PREV_DAY");
    expect(m.getSnapshot().context.focusedDate).toEqual(jan15);
  });
});

// ---------------------------------------------------------------------------
// FOCUS_WEEK_START / FOCUS_WEEK_END
// ---------------------------------------------------------------------------

describe("createDatePickerMachine — week start/end focus", () => {
  it("FOCUS_WEEK_START moves to Sunday (Sunday-first, from Saturday)", () => {
    // june15 = Saturday. Sunday-first → back 6 days = June 9 (Sunday)
    const m = make({ defaultValue: jun15 });
    m.send("OPEN");
    m.send("FOCUS_WEEK_START");
    expect(m.getSnapshot().context.focusedDate).toEqual({ year: 2024, month: 6, day: 9 });
  });

  it("FOCUS_WEEK_END stays on Saturday (already end of week)", () => {
    const m = make({ defaultValue: jun15 });
    m.send("OPEN");
    m.send("FOCUS_WEEK_END");
    expect(m.getSnapshot().context.focusedDate).toEqual(jun15);
  });

  it("FOCUS_WEEK_START with Monday-first moves to Monday (from Saturday)", () => {
    // june15 = Saturday. Monday-first → back 5 days = June 10 (Monday)
    const m = make({ defaultValue: jun15, firstDayOfWeek: 1 });
    m.send("OPEN");
    m.send("FOCUS_WEEK_START");
    expect(m.getSnapshot().context.focusedDate).toEqual({ year: 2024, month: 6, day: 10 });
  });
});

// ---------------------------------------------------------------------------
// SET_VALUE — controlled update
// ---------------------------------------------------------------------------

describe("createDatePickerMachine — SET_VALUE", () => {
  it("updates value and focusedDate when date provided", () => {
    const m = make({ defaultValue: jan15 });
    m.send({ type: "SET_VALUE", date: jun15 });
    expect(m.getSnapshot().context.value).toEqual(jun15);
    expect(m.getSnapshot().context.focusedDate).toEqual(jun15);
  });

  it("clears value (sets to null) when date is undefined", () => {
    const m = make({ defaultValue: jan15 });
    m.send({ type: "SET_VALUE", date: undefined });
    expect(m.getSnapshot().context.value).toBeNull();
  });

  it("focusedDate unchanged when SET_VALUE with undefined", () => {
    const m = make({ defaultValue: jan15 });
    const initial = m.getSnapshot().context.focusedDate;
    m.send({ type: "SET_VALUE", date: undefined });
    expect(m.getSnapshot().context.focusedDate).toEqual(initial);
  });

  it("works in closed state (controlled update)", () => {
    const m = make({ defaultValue: jan15 });
    expect(m.getSnapshot().matches("closed")).toBe(true);
    m.send({ type: "SET_VALUE", date: jun15 });
    expect(m.getSnapshot().context.value).toEqual(jun15);
  });
});

// ---------------------------------------------------------------------------
// Optional context fields
// ---------------------------------------------------------------------------

describe("createDatePickerMachine — optional context fields", () => {
  it("min stored when provided", () => {
    expect(make({ min: jan15 }).getSnapshot().context.min).toEqual(jan15);
  });

  it("min absent when not provided", () => {
    expect(make().getSnapshot().context.min).toBeUndefined();
  });

  it("max stored when provided", () => {
    expect(make({ max: jun15 }).getSnapshot().context.max).toEqual(jun15);
  });

  it("disabledWeekdays stored when provided", () => {
    const m = make({ disabledWeekdays: [0, 6] });
    expect(m.getSnapshot().context.disabledWeekdays).toEqual([0, 6]);
  });

  it("isDateUnavailable stored when provided", () => {
    const fn = vi.fn();
    expect(make({ isDateUnavailable: fn }).getSnapshot().context.isDateUnavailable).toBe(fn);
  });

  it("onValueChange stored when provided", () => {
    const fn = vi.fn();
    expect(make({ onValueChange: fn }).getSnapshot().context.onValueChange).toBe(fn);
  });

  it("onOpenChange stored when provided", () => {
    const fn = vi.fn();
    expect(make({ onOpenChange: fn }).getSnapshot().context.onOpenChange).toBe(fn);
  });

  it("presets stored when provided", () => {
    const presets = [{ label: "Today", getValue: (t: CalendarDate) => t }];
    expect(make({ presets }).getSnapshot().context.presets).toBe(presets);
  });
});
