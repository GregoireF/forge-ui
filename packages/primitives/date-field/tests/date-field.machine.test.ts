import { afterEach, describe, expect, it, vi } from "vitest";
import { createDateFieldMachine } from "../src/date-field.machine.js";

let active: ReturnType<typeof createDateFieldMachine>[] = [];

function make(opts: Parameters<typeof createDateFieldMachine>[0] = {}) {
  const m = createDateFieldMachine({ id: "test", ...opts });
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

describe("createDateFieldMachine — initial state", () => {
  it("starts in idle state", () => expect(make().getSnapshot().matches("idle")).toBe(true));

  it("all segment values null by default", () => {
    const ctx = make().getSnapshot().context;
    expect(ctx.dayValue).toBeNull();
    expect(ctx.monthValue).toBeNull();
    expect(ctx.yearValue).toBeNull();
  });

  it("defaultValue sets segment values", () => {
    const m = make({ defaultValue: { year: 2024, month: 6, day: 15 } });
    const ctx = m.getSnapshot().context;
    expect(ctx.dayValue).toBe(15);
    expect(ctx.monthValue).toBe(6);
    expect(ctx.yearValue).toBe(2024);
  });

  it("no focused segment on init", () => {
    expect(make().getSnapshot().context.focusedSegment).toBeNull();
  });

  it("locale defaults to 'en'", () => {
    expect(make().getSnapshot().context.locale).toBe("en");
  });

  it("disabled defaults to false", () => {
    expect(make().getSnapshot().context.disabled).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// FOCUS_SEGMENT / BLUR_SEGMENT
// ---------------------------------------------------------------------------

describe("createDateFieldMachine — segment focus", () => {
  it("FOCUS_SEGMENT sets focusedSegment", () => {
    const m = make();
    m.send({ type: "FOCUS_SEGMENT", segment: "month" });
    expect(m.getSnapshot().context.focusedSegment).toBe("month");
  });

  it("FOCUS_SEGMENT clears typingBuffer", () => {
    const m = make();
    m.send({ type: "FOCUS_SEGMENT", segment: "day" });
    expect(m.getSnapshot().context.typingBuffer).toBe("");
  });

  it("BLUR_SEGMENT clears focusedSegment", () => {
    const m = make();
    m.send({ type: "FOCUS_SEGMENT", segment: "day" });
    m.send("BLUR_SEGMENT");
    expect(m.getSnapshot().context.focusedSegment).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// INCREMENT / DECREMENT
// ---------------------------------------------------------------------------

describe("createDateFieldMachine — increment/decrement", () => {
  it("INCREMENT month from null → 1", () => {
    const m = make();
    m.send({ type: "FOCUS_SEGMENT", segment: "month" });
    m.send("INCREMENT");
    expect(m.getSnapshot().context.monthValue).toBe(1);
  });

  it("INCREMENT month from 12 wraps to 1", () => {
    const m = make({ defaultValue: { year: 2024, month: 12, day: 1 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "month" });
    m.send("INCREMENT");
    expect(m.getSnapshot().context.monthValue).toBe(1);
  });

  it("DECREMENT month from 1 wraps to 12", () => {
    const m = make({ defaultValue: { year: 2024, month: 1, day: 1 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "month" });
    m.send("DECREMENT");
    expect(m.getSnapshot().context.monthValue).toBe(12);
  });

  it("INCREMENT day wraps at 31 → 1", () => {
    const m = make({ defaultValue: { year: 2024, month: 1, day: 31 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "day" });
    m.send("INCREMENT");
    expect(m.getSnapshot().context.dayValue).toBe(1);
  });

  it("INCREMENT does nothing when disabled", () => {
    const m = make({ disabled: true });
    m.send({ type: "FOCUS_SEGMENT", segment: "month" });
    m.send("INCREMENT");
    expect(m.getSnapshot().context.monthValue).toBeNull();
  });

  it("INCREMENT calls onValueChange when all segments filled", () => {
    const cb = vi.fn();
    const m = make({ defaultValue: { year: 2024, month: 6, day: 15 }, onValueChange: cb });
    m.send({ type: "FOCUS_SEGMENT", segment: "month" });
    m.send("INCREMENT");
    expect(cb).toHaveBeenCalled();
    expect(cb.mock.calls[0][0].month).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// TYPE_DIGIT — typing buffer
// ---------------------------------------------------------------------------

describe("createDateFieldMachine — TYPE_DIGIT", () => {
  it("typing '1' for month buffers it (can still form 10/11/12)", () => {
    const m = make();
    m.send({ type: "FOCUS_SEGMENT", segment: "month" });
    m.send({ type: "TYPE_DIGIT", digit: "1" });
    // 1 * 10 = 10 ≤ 12 → NOT committed yet, stays in buffer waiting for second digit
    expect(m.getSnapshot().context.monthValue).toBe(1);
    expect(m.getSnapshot().context.typingBuffer).toBe("1");
    expect(m.getSnapshot().context.focusedSegment).toBe("month");
  });

  it("typing '1' then '2' for month → month=12, advances to day", () => {
    const m = make();
    m.send({ type: "FOCUS_SEGMENT", segment: "month" });
    m.send({ type: "TYPE_DIGIT", digit: "1" });
    m.send({ type: "TYPE_DIGIT", digit: "2" });
    const ctx = m.getSnapshot().context;
    expect(ctx.monthValue).toBe(12);
    expect(ctx.typingBuffer).toBe("");
    expect(ctx.focusedSegment).toBe("day");
  });

  it("typing '7' for month — too large to have tens → commits immediately and advances", () => {
    // '7' * 10 = 70 > 12 (max month) → commits '7', moves to day
    const m = make();
    m.send({ type: "FOCUS_SEGMENT", segment: "month" });
    m.send({ type: "TYPE_DIGIT", digit: "7" });
    const ctx = m.getSnapshot().context;
    expect(ctx.monthValue).toBe(7);
    expect(ctx.focusedSegment).toBe("day");
  });

  it("typing year '2','0','2','4' → year=2024, advances to null", () => {
    const m = make();
    m.send({ type: "FOCUS_SEGMENT", segment: "year" });
    for (const d of ["2", "0", "2", "4"]) {
      m.send({ type: "TYPE_DIGIT", digit: d });
    }
    const ctx = m.getSnapshot().context;
    expect(ctx.yearValue).toBe(2024);
    expect(ctx.focusedSegment).toBeNull();
  });

  it("does nothing when disabled", () => {
    const m = make({ disabled: true });
    m.send({ type: "FOCUS_SEGMENT", segment: "month" });
    m.send({ type: "TYPE_DIGIT", digit: "6" });
    expect(m.getSnapshot().context.monthValue).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// CLEAR_SEGMENT
// ---------------------------------------------------------------------------

describe("createDateFieldMachine — CLEAR_SEGMENT", () => {
  it("clears the focused segment value", () => {
    const m = make({ defaultValue: { year: 2024, month: 6, day: 15 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "month" });
    m.send("CLEAR_SEGMENT");
    expect(m.getSnapshot().context.monthValue).toBeNull();
  });

  it("does nothing when no segment focused", () => {
    const m = make({ defaultValue: { year: 2024, month: 6, day: 15 } });
    m.send("CLEAR_SEGMENT");
    expect(m.getSnapshot().context.monthValue).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// SET_VALUE
// ---------------------------------------------------------------------------

describe("createDateFieldMachine — SET_VALUE", () => {
  it("sets all segments", () => {
    const m = make();
    m.send({ type: "SET_VALUE", date: { year: 2025, month: 3, day: 20 } });
    const ctx = m.getSnapshot().context;
    expect(ctx.yearValue).toBe(2025);
    expect(ctx.monthValue).toBe(3);
    expect(ctx.dayValue).toBe(20);
  });

  it("SET_VALUE with null clears all segments", () => {
    const m = make({ defaultValue: { year: 2024, month: 6, day: 15 } });
    m.send({ type: "SET_VALUE", date: null });
    const ctx = m.getSnapshot().context;
    expect(ctx.yearValue).toBeNull();
    expect(ctx.monthValue).toBeNull();
    expect(ctx.dayValue).toBeNull();
  });

  it("calls onValueChange with new date", () => {
    const cb = vi.fn();
    const m = make({ onValueChange: cb });
    m.send({ type: "SET_VALUE", date: { year: 2025, month: 3, day: 20 } });
    expect(cb).toHaveBeenCalledWith({ year: 2025, month: 3, day: 20 });
  });
});

// ---------------------------------------------------------------------------
// NEXT_SEGMENT / PREV_SEGMENT
// ---------------------------------------------------------------------------

describe("createDateFieldMachine — segment navigation", () => {
  it("NEXT_SEGMENT from month → day", () => {
    const m = make();
    m.send({ type: "FOCUS_SEGMENT", segment: "month" });
    m.send("NEXT_SEGMENT");
    expect(m.getSnapshot().context.focusedSegment).toBe("day");
  });

  it("NEXT_SEGMENT from year → null (last segment)", () => {
    const m = make();
    m.send({ type: "FOCUS_SEGMENT", segment: "year" });
    m.send("NEXT_SEGMENT");
    expect(m.getSnapshot().context.focusedSegment).toBeNull();
  });

  it("PREV_SEGMENT from day → month", () => {
    const m = make();
    m.send({ type: "FOCUS_SEGMENT", segment: "day" });
    m.send("PREV_SEGMENT");
    expect(m.getSnapshot().context.focusedSegment).toBe("month");
  });
});
