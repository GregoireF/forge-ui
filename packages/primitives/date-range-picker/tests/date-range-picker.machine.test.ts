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
