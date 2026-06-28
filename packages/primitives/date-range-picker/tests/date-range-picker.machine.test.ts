import { afterEach, describe, expect, it, vi } from "vitest";
import { createDateRangePickerMachine } from "../src/date-range-picker.machine.js";
import type { CalendarDate } from "../src/date-range-picker.types.js";

const TODAY: CalendarDate = { year: 2024, month: 3, day: 1 };
const jan15: CalendarDate = { year: 2024, month: 1, day: 15 };
const jan20: CalendarDate = { year: 2024, month: 1, day: 20 };
const jun15: CalendarDate = { year: 2024, month: 6, day: 15 };
const jun20: CalendarDate = { year: 2024, month: 6, day: 20 };

let active: ReturnType<typeof createDateRangePickerMachine>[] = [];

function make(opts: Parameters<typeof createDateRangePickerMachine>[0] = {}) {
  const m = createDateRangePickerMachine({ id: "test", today: TODAY, ...opts });
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

describe("createDateRangePickerMachine — initial state", () => {
  it("starts closed", () => expect(make().getSnapshot().matches("closed")).toBe(true));

  it("startDate and endDate are null by default", () => {
    const ctx = make().getSnapshot().context;
    expect(ctx.startDate).toBeNull();
    expect(ctx.endDate).toBeNull();
  });

  it("selectionPhase defaults to 'start'", () => {
    expect(make().getSnapshot().context.selectionPhase).toBe("start");
  });

  it("numberOfMonths defaults to 2", () => {
    expect(make().getSnapshot().context.numberOfMonths).toBe(2);
  });

  it("today is stored from option", () => {
    expect(make().getSnapshot().context.today).toEqual(TODAY);
  });

  it("defaultValue sets initial range", () => {
    const m = make({ defaultValue: { start: jan15, end: jan20 } });
    const ctx = m.getSnapshot().context;
    expect(ctx.startDate).toEqual(jan15);
    expect(ctx.endDate).toEqual(jan20);
  });

  it("selectionPhase is 'end' when defaultValue has start but no end", () => {
    const m = make({ defaultValue: { start: jan15, end: null } });
    expect(m.getSnapshot().context.selectionPhase).toBe("end");
  });

  it("selectionPhase is 'start' when defaultValue has both dates", () => {
    const m = make({ defaultValue: { start: jan15, end: jan20 } });
    expect(m.getSnapshot().context.selectionPhase).toBe("start");
  });
});

// ---------------------------------------------------------------------------
// Open / Close
// ---------------------------------------------------------------------------

describe("createDateRangePickerMachine — open/close", () => {
  it("OPEN transitions to open", () => {
    const m = make();
    m.send("OPEN");
    expect(m.getSnapshot().hasTag("open")).toBe(true);
  });

  it("CLOSE transitions to closed", () => {
    const m = make();
    m.send("OPEN");
    m.send("CLOSE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("TOGGLE opens when closed", () => {
    const m = make();
    m.send("TOGGLE");
    expect(m.getSnapshot().hasTag("open")).toBe(true);
  });

  it("TOGGLE closes when open", () => {
    const m = make();
    m.send("OPEN");
    m.send("TOGGLE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("ESCAPE_KEY closes", () => {
    const m = make();
    m.send("OPEN");
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

  it("OPEN resumes from 'end' phase when start is set but no end", () => {
    const m = make({ defaultValue: { start: jan15, end: null } });
    m.send("OPEN");
    expect(m.getSnapshot().context.selectionPhase).toBe("end");
  });

  it("OPEN resets to 'start' phase when both dates set", () => {
    const m = make({ defaultValue: { start: jan15, end: jan20 } });
    m.send("OPEN");
    expect(m.getSnapshot().context.selectionPhase).toBe("start");
  });
});

// ---------------------------------------------------------------------------
// SELECT_DAY — two-phase range selection
// ---------------------------------------------------------------------------

describe("createDateRangePickerMachine — SELECT_DAY", () => {
  it("first click sets startDate and moves to 'end' phase", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jan15 });
    const ctx = m.getSnapshot().context;
    expect(ctx.startDate).toEqual(jan15);
    expect(ctx.endDate).toBeNull();
    expect(ctx.selectionPhase).toBe("end");
  });

  it("second click sets endDate, resets to 'start' phase", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jan15 });
    m.send({ type: "SELECT_DAY", date: jan20 });
    const ctx = m.getSnapshot().context;
    expect(ctx.startDate).toEqual(jan15);
    expect(ctx.endDate).toEqual(jan20);
    expect(ctx.selectionPhase).toBe("start");
  });

  it("second click before start swaps start and end", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jan20 });
    m.send({ type: "SELECT_DAY", date: jan15 }); // clicked before start
    const ctx = m.getSnapshot().context;
    expect(ctx.startDate).toEqual(jan15);
    expect(ctx.endDate).toEqual(jan20);
  });

  it("calls onValueChange after end is selected", () => {
    const cb = vi.fn();
    const m = make({ onValueChange: cb });
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jan15 });
    m.send({ type: "SELECT_DAY", date: jan20 });
    expect(cb).toHaveBeenCalledWith({ start: jan15, end: jan20 });
  });

  it("onValueChange NOT called after first click (only start set)", () => {
    const cb = vi.fn();
    const m = make({ onValueChange: cb });
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jan15 });
    expect(cb).not.toHaveBeenCalled();
  });

  it("does NOT select when disabled", () => {
    const m = make({ disabled: true });
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jan15 });
    expect(m.getSnapshot().context.startDate).toBeNull();
  });

  it("does NOT select when readOnly", () => {
    const m = make({ readOnly: true });
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jan15 });
    expect(m.getSnapshot().context.startDate).toBeNull();
  });

  it("does NOT select unavailable date", () => {
    const m = make({ isDateUnavailable: (d) => d.month === 1 });
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jan15 });
    expect(m.getSnapshot().context.startDate).toBeNull();
  });

  it("does NOT select disabled weekday", () => {
    // jan15 2024 is a Monday (1)
    const m = make({ disabledWeekdays: [1] });
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jan15 });
    expect(m.getSnapshot().context.startDate).toBeNull();
  });

  it("third click resets range and starts fresh", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jan15 });
    m.send({ type: "SELECT_DAY", date: jan20 });
    // phase back to "start" — third click starts new range
    m.send({ type: "SELECT_DAY", date: jun15 });
    const ctx = m.getSnapshot().context;
    expect(ctx.startDate).toEqual(jun15);
    expect(ctx.endDate).toBeNull();
    expect(ctx.selectionPhase).toBe("end");
  });
});

// ---------------------------------------------------------------------------
// HOVER_DAY / CLEAR_HOVER
// ---------------------------------------------------------------------------

describe("createDateRangePickerMachine — hover preview", () => {
  it("HOVER_DAY sets hoveredDate when in 'end' phase", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jan15 });
    m.send({ type: "HOVER_DAY", date: jan20 });
    expect(m.getSnapshot().context.hoveredDate).toEqual(jan20);
  });

  it("HOVER_DAY does NOT set hoveredDate when in 'start' phase", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "HOVER_DAY", date: jan20 });
    expect(m.getSnapshot().context.hoveredDate).toBeNull();
  });

  it("CLEAR_HOVER clears hoveredDate", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jan15 });
    m.send({ type: "HOVER_DAY", date: jan20 });
    m.send("CLEAR_HOVER");
    expect(m.getSnapshot().context.hoveredDate).toBeNull();
  });

  it("hoveredDate cleared when end is selected", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "SELECT_DAY", date: jan15 });
    m.send({ type: "HOVER_DAY", date: jan20 });
    m.send({ type: "SELECT_DAY", date: jan20 });
    expect(m.getSnapshot().context.hoveredDate).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// CLEAR
// ---------------------------------------------------------------------------

describe("createDateRangePickerMachine — CLEAR", () => {
  it("CLEAR clears both dates", () => {
    const m = make({ defaultValue: { start: jan15, end: jan20 } });
    m.send("OPEN");
    m.send("CLEAR");
    const ctx = m.getSnapshot().context;
    expect(ctx.startDate).toBeNull();
    expect(ctx.endDate).toBeNull();
  });

  it("CLEAR resets selectionPhase to 'start'", () => {
    const m = make({ defaultValue: { start: jan15, end: null } });
    m.send("OPEN");
    m.send("CLEAR");
    expect(m.getSnapshot().context.selectionPhase).toBe("start");
  });

  it("CLEAR calls onValueChange with null/null", () => {
    const cb = vi.fn();
    const m = make({ defaultValue: { start: jan15, end: jan20 }, onValueChange: cb });
    m.send("OPEN");
    m.send("CLEAR");
    expect(cb).toHaveBeenCalledWith({ start: null, end: null });
  });
});

// ---------------------------------------------------------------------------
// SELECT_PRESET
// ---------------------------------------------------------------------------

describe("createDateRangePickerMachine — SELECT_PRESET", () => {
  it("sets start and end from preset range", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "SELECT_PRESET", range: { start: jan15, end: jan20 } });
    const ctx = m.getSnapshot().context;
    expect(ctx.startDate).toEqual(jan15);
    expect(ctx.endDate).toEqual(jan20);
  });

  it("calls onValueChange with preset range", () => {
    const cb = vi.fn();
    const m = make({ onValueChange: cb });
    m.send("OPEN");
    m.send({ type: "SELECT_PRESET", range: { start: jan15, end: jan20 } });
    expect(cb).toHaveBeenCalledWith({ start: jan15, end: jan20 });
  });
});

// ---------------------------------------------------------------------------
// Month navigation
// ---------------------------------------------------------------------------

describe("createDateRangePickerMachine — navigation", () => {
  it("NAVIGATE_PREV_MONTH moves focusedDate back", () => {
    const m = make({ defaultValue: { start: jun15, end: jun20 } });
    m.send("OPEN");
    m.send("NAVIGATE_PREV_MONTH");
    expect(m.getSnapshot().context.focusedDate.month).toBe(5);
  });

  it("NAVIGATE_NEXT_MONTH moves focusedDate forward", () => {
    const m = make({ defaultValue: { start: jan15, end: jan20 } });
    m.send("OPEN");
    m.send("NAVIGATE_NEXT_MONTH");
    expect(m.getSnapshot().context.focusedDate.month).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// SET_VALUE — controlled update
// ---------------------------------------------------------------------------

describe("createDateRangePickerMachine — SET_VALUE", () => {
  it("updates range from outside", () => {
    const m = make();
    m.send({ type: "SET_VALUE", range: { start: jan15, end: jan20 } });
    const ctx = m.getSnapshot().context;
    expect(ctx.startDate).toEqual(jan15);
    expect(ctx.endDate).toEqual(jan20);
  });

  it("clears range when SET_VALUE with no range", () => {
    const m = make({ defaultValue: { start: jan15, end: jan20 } });
    m.send({ type: "SET_VALUE", range: undefined });
    const ctx = m.getSnapshot().context;
    expect(ctx.startDate).toBeNull();
    expect(ctx.endDate).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// openCalendar — selectionPhase branch when partial range
// ---------------------------------------------------------------------------

describe("createDateRangePickerMachine — openCalendar phase", () => {
  it("resumes 'end' phase when opening with start set but no end", () => {
    const m = make({ defaultValue: { start: jan15, end: null } });
    m.send("OPEN");
    expect(m.getSnapshot().context.selectionPhase).toBe("end");
  });

  it("resets to 'start' phase when opening with full range set", () => {
    const m = make({ defaultValue: { start: jan15, end: jan20 } });
    m.send("OPEN");
    expect(m.getSnapshot().context.selectionPhase).toBe("start");
  });

  it("clears hoveredDate when opening", () => {
    const m = make({ defaultValue: { start: jan15, end: null } });
    m.send("OPEN");
    expect(m.getSnapshot().context.hoveredDate).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// NAVIGATE_TO_MONTH
// ---------------------------------------------------------------------------

describe("createDateRangePickerMachine — NAVIGATE_TO_MONTH", () => {
  it("sets focusedDate to the given year/month (preserving day)", () => {
    const m = make({ defaultValue: { start: jan15, end: jan20 } });
    m.send("OPEN");
    m.send({ type: "NAVIGATE_TO_MONTH", year: 2024, month: 9 });
    const ctx = m.getSnapshot().context;
    expect(ctx.focusedDate.year).toBe(2024);
    expect(ctx.focusedDate.month).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// Focus day navigation (FOCUS_PREV_DAY, FOCUS_NEXT_DAY, etc.)
// ---------------------------------------------------------------------------

describe("createDateRangePickerMachine — focus day navigation", () => {
  it("FOCUS_NEXT_DAY advances focusedDate by 1 day", () => {
    const m = make({ defaultValue: { start: jan15, end: jan20 } });
    m.send("OPEN");
    m.send("FOCUS_NEXT_DAY");
    expect(m.getSnapshot().context.focusedDate.day).toBe(jan15.day + 1);
  });

  it("FOCUS_PREV_DAY goes back 1 day", () => {
    const m = make({ defaultValue: { start: jan15, end: jan20 } });
    m.send("OPEN");
    m.send("FOCUS_PREV_DAY");
    expect(m.getSnapshot().context.focusedDate.day).toBe(jan15.day - 1);
  });

  it("FOCUS_NEXT_WEEK advances focusedDate by 7 days", () => {
    const m = make({ defaultValue: { start: jan15, end: jan20 } });
    m.send("OPEN");
    m.send("FOCUS_NEXT_WEEK");
    expect(m.getSnapshot().context.focusedDate.day).toBe(jan15.day + 7);
  });

  it("FOCUS_PREV_WEEK goes back 7 days", () => {
    const m = make({ defaultValue: { start: jan15, end: jan20 } });
    m.send("OPEN");
    m.send("FOCUS_PREV_WEEK");
    expect(m.getSnapshot().context.focusedDate.day).toBe(jan15.day - 7);
  });

  it("FOCUS_NEXT_DAY does not move past max", () => {
    const jan16: CalendarDate = { year: 2024, month: 1, day: 16 };
    const m = make({
      defaultValue: { start: jan15, end: null },
      max: { year: 2024, month: 1, day: 16 },
    });
    m.send("OPEN");
    m.send("FOCUS_NEXT_DAY");
    expect(m.getSnapshot().context.focusedDate).toEqual(jan16);
    m.send("FOCUS_NEXT_DAY");
    expect(m.getSnapshot().context.focusedDate).toEqual(jan16);
  });
});

// ---------------------------------------------------------------------------
// Focus month navigation (FOCUS_PREV_MONTH, FOCUS_NEXT_MONTH)
// ---------------------------------------------------------------------------

describe("createDateRangePickerMachine — focus month navigation", () => {
  it("FOCUS_NEXT_MONTH advances focusedDate by 1 month", () => {
    const m = make({ defaultValue: { start: jan15, end: jan20 } });
    m.send("OPEN");
    m.send("FOCUS_NEXT_MONTH");
    expect(m.getSnapshot().context.focusedDate.month).toBe(2);
  });

  it("FOCUS_PREV_MONTH goes back 1 month", () => {
    const m = make({ defaultValue: { start: jun15, end: jun20 } });
    m.send("OPEN");
    m.send("FOCUS_PREV_MONTH");
    expect(m.getSnapshot().context.focusedDate.month).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// FOCUS_DAY
// ---------------------------------------------------------------------------

describe("createDateRangePickerMachine — FOCUS_DAY", () => {
  it("sets focusedDate to the given date", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "FOCUS_DAY", date: jun20 });
    expect(m.getSnapshot().context.focusedDate).toEqual(jun20);
  });
});

// ---------------------------------------------------------------------------
// FOCUS_WEEK_START and FOCUS_WEEK_END
// ---------------------------------------------------------------------------

describe("createDateRangePickerMachine — week boundary focus", () => {
  it("FOCUS_WEEK_START moves to Sunday when firstDayOfWeek=0", () => {
    // jan15 2024 is a Monday. Week start (Sunday) = jan14.
    const m = make({ defaultValue: { start: jan15, end: jan20 }, firstDayOfWeek: 0 });
    m.send("OPEN");
    m.send("FOCUS_WEEK_START");
    expect(m.getSnapshot().context.focusedDate.day).toBe(14);
  });

  it("FOCUS_WEEK_END moves to Saturday when firstDayOfWeek=0", () => {
    // jan15 2024 is a Monday. Week end (Saturday) = jan20.
    const m = make({ defaultValue: { start: jan15, end: jan20 }, firstDayOfWeek: 0 });
    m.send("OPEN");
    m.send("FOCUS_WEEK_END");
    expect(m.getSnapshot().context.focusedDate.day).toBe(20);
  });

  it("FOCUS_WEEK_START stays put when already at week start", () => {
    const jan14: CalendarDate = { year: 2024, month: 1, day: 14 };
    const m = make({ defaultValue: { start: jan14, end: jan20 }, firstDayOfWeek: 0 });
    m.send("OPEN");
    m.send("FOCUS_WEEK_START");
    expect(m.getSnapshot().context.focusedDate).toEqual(jan14);
  });
});

// ---------------------------------------------------------------------------
// SET_CONTENT_EL and SET_TRIGGER_EL
// ---------------------------------------------------------------------------

describe("createDateRangePickerMachine — element refs", () => {
  it("SET_CONTENT_EL updates contentEl in closed state", () => {
    const m = make();
    const el = {} as HTMLElement;
    m.send({ type: "SET_CONTENT_EL", el });
    expect(m.getSnapshot().context.contentEl).toBe(el);
  });

  it("SET_TRIGGER_EL updates triggerEl in closed state", () => {
    const m = make();
    const el = {} as HTMLElement;
    m.send({ type: "SET_TRIGGER_EL", el });
    expect(m.getSnapshot().context.triggerEl).toBe(el);
  });

  it("SET_CONTENT_EL updates contentEl in open state", () => {
    const m = make();
    m.send("OPEN");
    const el = document.createElement("div");
    m.send({ type: "SET_CONTENT_EL", el });
    expect(m.getSnapshot().context.contentEl).toBe(el);
  });

  it("SET_TRIGGER_EL updates triggerEl in open state", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    const m = make();
    m.send("OPEN");
    m.send({ type: "SET_TRIGGER_EL", el: trigger });
    expect(m.getSnapshot().context.triggerEl).toBe(trigger);
    document.body.removeChild(trigger);
  });
});
