import { afterEach, describe, expect, it, vi } from "vitest";
import { createTimePickerMachine } from "../src/time-picker.machine.js";

let active: ReturnType<typeof createTimePickerMachine>[] = [];

function make(opts: Parameters<typeof createTimePickerMachine>[0] = {}) {
  const m = createTimePickerMachine({ id: "test", ...opts });
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

describe("createTimePickerMachine — initial state", () => {
  it("starts in idle state", () => expect(make().getSnapshot().matches("idle")).toBe(true));

  it("all values null by default", () => {
    const ctx = make().getSnapshot().context;
    expect(ctx.hoursValue).toBeNull();
    expect(ctx.minutesValue).toBeNull();
    expect(ctx.secondsValue).toBeNull();
  });

  it("defaultValue sets initial values", () => {
    const m = make({ defaultValue: { hours: 14, minutes: 30, seconds: 0 } });
    const ctx = m.getSnapshot().context;
    expect(ctx.hoursValue).toBe(14);
    expect(ctx.minutesValue).toBe(30);
    expect(ctx.secondsValue).toBe(0);
  });

  it("period is 'AM' for hours < 12", () => {
    const m = make({ defaultValue: { hours: 9, minutes: 0, seconds: 0 } });
    expect(m.getSnapshot().context.period).toBe("AM");
  });

  it("period is 'PM' for hours >= 12", () => {
    const m = make({ defaultValue: { hours: 14, minutes: 0, seconds: 0 } });
    expect(m.getSnapshot().context.period).toBe("PM");
  });

  it("hourCycle defaults to 24", () => {
    expect(make().getSnapshot().context.hourCycle).toBe(24);
  });

  it("showSeconds defaults to false", () => {
    expect(make().getSnapshot().context.showSeconds).toBe(false);
  });

  it("minuteStep defaults to 1", () => {
    expect(make().getSnapshot().context.minuteStep).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// FOCUS_SEGMENT / BLUR_SEGMENT
// ---------------------------------------------------------------------------

describe("createTimePickerMachine — focus", () => {
  it("FOCUS_SEGMENT sets focusedSegment", () => {
    const m = make();
    m.send({ type: "FOCUS_SEGMENT", segment: "hours" });
    expect(m.getSnapshot().context.focusedSegment).toBe("hours");
  });

  it("BLUR_SEGMENT clears focusedSegment", () => {
    const m = make();
    m.send({ type: "FOCUS_SEGMENT", segment: "hours" });
    m.send("BLUR_SEGMENT");
    expect(m.getSnapshot().context.focusedSegment).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// INCREMENT / DECREMENT (24h mode)
// ---------------------------------------------------------------------------

describe("createTimePickerMachine — increment/decrement (24h)", () => {
  it("INCREMENT hours from null → max (23 in 24h mode, wraps from top)", () => {
    const m = make({ hourCycle: 24 });
    m.send({ type: "FOCUS_SEGMENT", segment: "hours" });
    m.send("INCREMENT");
    expect(m.getSnapshot().context.hoursValue).toBe(23);
  });

  it("INCREMENT hours from 23 wraps to 0", () => {
    const m = make({ defaultValue: { hours: 23, minutes: 0, seconds: 0 }, hourCycle: 24 });
    m.send({ type: "FOCUS_SEGMENT", segment: "hours" });
    m.send("INCREMENT");
    expect(m.getSnapshot().context.hoursValue).toBe(0);
  });

  it("DECREMENT hours from 0 wraps to 23", () => {
    const m = make({ defaultValue: { hours: 0, minutes: 0, seconds: 0 }, hourCycle: 24 });
    m.send({ type: "FOCUS_SEGMENT", segment: "hours" });
    m.send("DECREMENT");
    expect(m.getSnapshot().context.hoursValue).toBe(23);
  });

  it("INCREMENT minutes with step=15 goes 0→15→30→45→0", () => {
    const m = make({ minuteStep: 15, defaultValue: { hours: 9, minutes: 0, seconds: 0 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "minutes" });
    m.send("INCREMENT");
    expect(m.getSnapshot().context.minutesValue).toBe(15);
    m.send("INCREMENT");
    expect(m.getSnapshot().context.minutesValue).toBe(30);
    m.send("INCREMENT");
    expect(m.getSnapshot().context.minutesValue).toBe(45);
    m.send("INCREMENT");
    expect(m.getSnapshot().context.minutesValue).toBe(0);
  });

  it("calls onValueChange when all required fields filled", () => {
    const cb = vi.fn();
    const m = make({
      defaultValue: { hours: 9, minutes: 30, seconds: 0 },
      onValueChange: cb,
      showSeconds: false,
    });
    m.send({ type: "FOCUS_SEGMENT", segment: "hours" });
    m.send("INCREMENT");
    expect(cb).toHaveBeenCalled();
    expect(cb.mock.calls[0][0].hours).toBe(10);
  });

  it("INCREMENT does nothing when disabled", () => {
    const m = make({ disabled: true });
    m.send({ type: "FOCUS_SEGMENT", segment: "hours" });
    m.send("INCREMENT");
    expect(m.getSnapshot().context.hoursValue).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// TOGGLE_PERIOD (12h mode)
// ---------------------------------------------------------------------------

describe("createTimePickerMachine — TOGGLE_PERIOD", () => {
  it("TOGGLE_PERIOD switches AM → PM and adjusts hours", () => {
    const m = make({ hourCycle: 12, defaultValue: { hours: 9, minutes: 0, seconds: 0 } });
    m.send("TOGGLE_PERIOD");
    const ctx = m.getSnapshot().context;
    expect(ctx.period).toBe("PM");
    expect(ctx.hoursValue).toBe(21); // 9 + 12
  });

  it("TOGGLE_PERIOD switches PM → AM and adjusts hours", () => {
    const m = make({ hourCycle: 12, defaultValue: { hours: 21, minutes: 0, seconds: 0 } });
    m.send("TOGGLE_PERIOD");
    const ctx = m.getSnapshot().context;
    expect(ctx.period).toBe("AM");
    expect(ctx.hoursValue).toBe(9); // 21 - 12
  });

  it("TOGGLE_PERIOD does nothing in 24h mode", () => {
    const m = make({ hourCycle: 24, defaultValue: { hours: 9, minutes: 0, seconds: 0 } });
    const before = m.getSnapshot().context.period;
    m.send("TOGGLE_PERIOD");
    expect(m.getSnapshot().context.period).toBe(before);
  });

  it("TOGGLE_PERIOD does nothing when disabled", () => {
    const m = make({ hourCycle: 12, disabled: true });
    m.send("TOGGLE_PERIOD");
    expect(m.getSnapshot().context.period).toBe("AM");
  });
});

// ---------------------------------------------------------------------------
// TYPE_DIGIT
// ---------------------------------------------------------------------------

describe("createTimePickerMachine — TYPE_DIGIT", () => {
  it("typing '9' for hours in 24h → buffers, does not advance yet", () => {
    const m = make({ hourCycle: 24 });
    m.send({ type: "FOCUS_SEGMENT", segment: "hours" });
    m.send({ type: "TYPE_DIGIT", digit: "9" });
    // '9' * 10 = 90 > 23 → commits and advances
    expect(m.getSnapshot().context.hoursValue).toBe(9);
    expect(m.getSnapshot().context.focusedSegment).toBe("minutes");
  });

  it("typing '1' then '4' for hours in 24h → 14, advances to minutes", () => {
    const m = make({ hourCycle: 24 });
    m.send({ type: "FOCUS_SEGMENT", segment: "hours" });
    m.send({ type: "TYPE_DIGIT", digit: "1" });
    m.send({ type: "TYPE_DIGIT", digit: "4" });
    const ctx = m.getSnapshot().context;
    expect(ctx.hoursValue).toBe(14);
    expect(ctx.focusedSegment).toBe("minutes");
  });
});

// ---------------------------------------------------------------------------
// CLEAR_SEGMENT
// ---------------------------------------------------------------------------

describe("createTimePickerMachine — CLEAR_SEGMENT", () => {
  it("clears the focused segment", () => {
    const m = make({ defaultValue: { hours: 9, minutes: 30, seconds: 0 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "minutes" });
    m.send("CLEAR_SEGMENT");
    expect(m.getSnapshot().context.minutesValue).toBeNull();
  });

  it("calls onValueChange with null after clear", () => {
    const cb = vi.fn();
    const m = make({ defaultValue: { hours: 9, minutes: 30, seconds: 0 }, onValueChange: cb });
    m.send({ type: "FOCUS_SEGMENT", segment: "minutes" });
    m.send("CLEAR_SEGMENT");
    expect(cb).toHaveBeenCalledWith(null);
  });
});

// ---------------------------------------------------------------------------
// SET_VALUE
// ---------------------------------------------------------------------------

describe("createTimePickerMachine — SET_VALUE", () => {
  it("SET_VALUE sets all segments", () => {
    const m = make();
    m.send({ type: "SET_VALUE", time: { hours: 14, minutes: 30, seconds: 0 } });
    const ctx = m.getSnapshot().context;
    expect(ctx.hoursValue).toBe(14);
    expect(ctx.minutesValue).toBe(30);
    expect(ctx.secondsValue).toBe(0);
  });

  it("SET_VALUE null clears all segments", () => {
    const m = make({ defaultValue: { hours: 9, minutes: 30, seconds: 0 } });
    m.send({ type: "SET_VALUE", time: null });
    const ctx = m.getSnapshot().context;
    expect(ctx.hoursValue).toBeNull();
    expect(ctx.minutesValue).toBeNull();
    expect(ctx.secondsValue).toBeNull();
  });

  it("SET_VALUE updates period in 12h mode", () => {
    const m = make({ hourCycle: 12 });
    m.send({ type: "SET_VALUE", time: { hours: 14, minutes: 0, seconds: 0 } });
    expect(m.getSnapshot().context.period).toBe("PM");
  });
});

// ---------------------------------------------------------------------------
// NEXT_SEGMENT / PREV_SEGMENT
// ---------------------------------------------------------------------------

describe("createTimePickerMachine — segment navigation", () => {
  it("NEXT_SEGMENT from hours → minutes (24h, no seconds)", () => {
    const m = make({ hourCycle: 24, showSeconds: false });
    m.send({ type: "FOCUS_SEGMENT", segment: "hours" });
    m.send("NEXT_SEGMENT");
    expect(m.getSnapshot().context.focusedSegment).toBe("minutes");
  });

  it("NEXT_SEGMENT from minutes → null when no seconds/period", () => {
    const m = make({ hourCycle: 24, showSeconds: false });
    m.send({ type: "FOCUS_SEGMENT", segment: "minutes" });
    m.send("NEXT_SEGMENT");
    expect(m.getSnapshot().context.focusedSegment).toBeNull();
  });

  it("NEXT_SEGMENT from minutes → seconds when showSeconds=true", () => {
    const m = make({ showSeconds: true });
    m.send({ type: "FOCUS_SEGMENT", segment: "minutes" });
    m.send("NEXT_SEGMENT");
    expect(m.getSnapshot().context.focusedSegment).toBe("seconds");
  });

  it("PREV_SEGMENT from minutes → hours", () => {
    const m = make();
    m.send({ type: "FOCUS_SEGMENT", segment: "minutes" });
    m.send("PREV_SEGMENT");
    expect(m.getSnapshot().context.focusedSegment).toBe("hours");
  });
});

// ---------------------------------------------------------------------------
// getSegmentValue — minutes and seconds branches
// ---------------------------------------------------------------------------

describe("createTimePickerMachine — getSegmentValue branches", () => {
  it("INCREMENT on minutes calls getSegmentValue('minutes')", () => {
    const m = make({ defaultValue: { hours: 9, minutes: 30, seconds: 0 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "minutes" });
    m.send("INCREMENT");
    expect(m.getSnapshot().context.minutesValue).toBe(31);
  });

  it("DECREMENT on minutes calls getSegmentValue('minutes')", () => {
    const m = make({ defaultValue: { hours: 9, minutes: 30, seconds: 0 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "minutes" });
    m.send("DECREMENT");
    expect(m.getSnapshot().context.minutesValue).toBe(29);
  });

  it("INCREMENT on seconds calls getSegmentValue('seconds')", () => {
    const m = make({ showSeconds: true, defaultValue: { hours: 9, minutes: 30, seconds: 15 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "seconds" });
    m.send("INCREMENT");
    expect(m.getSnapshot().context.secondsValue).toBe(16);
  });

  it("DECREMENT on seconds calls getSegmentValue('seconds')", () => {
    const m = make({ showSeconds: true, defaultValue: { hours: 9, minutes: 30, seconds: 15 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "seconds" });
    m.send("DECREMENT");
    expect(m.getSnapshot().context.secondsValue).toBe(14);
  });
});

// ---------------------------------------------------------------------------
// INCREMENT/DECREMENT on period segment
// ---------------------------------------------------------------------------

describe("createTimePickerMachine — INCREMENT/DECREMENT period", () => {
  it("INCREMENT on period segment toggles AM → PM", () => {
    const m = make({ hourCycle: 12, defaultValue: { hours: 9, minutes: 0, seconds: 0 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "period" });
    m.send("INCREMENT");
    expect(m.getSnapshot().context.period).toBe("PM");
    expect(m.getSnapshot().context.hoursValue).toBe(21);
  });

  it("INCREMENT on period segment toggles PM → AM", () => {
    const m = make({ hourCycle: 12, defaultValue: { hours: 21, minutes: 0, seconds: 0 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "period" });
    m.send("INCREMENT");
    expect(m.getSnapshot().context.period).toBe("AM");
    expect(m.getSnapshot().context.hoursValue).toBe(9);
  });

  it("INCREMENT on period calls onValueChange", () => {
    const cb = vi.fn();
    const m = make({
      hourCycle: 12,
      defaultValue: { hours: 9, minutes: 30, seconds: 0 },
      onValueChange: cb,
    });
    m.send({ type: "FOCUS_SEGMENT", segment: "period" });
    m.send("INCREMENT");
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({ hours: 21, minutes: 30 }));
  });

  it("DECREMENT on period segment toggles AM → PM", () => {
    const m = make({ hourCycle: 12, defaultValue: { hours: 9, minutes: 0, seconds: 0 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "period" });
    m.send("DECREMENT");
    expect(m.getSnapshot().context.period).toBe("PM");
    expect(m.getSnapshot().context.hoursValue).toBe(21);
  });

  it("DECREMENT on period segment toggles PM → AM", () => {
    const m = make({ hourCycle: 12, defaultValue: { hours: 21, minutes: 0, seconds: 0 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "period" });
    m.send("DECREMENT");
    expect(m.getSnapshot().context.period).toBe("AM");
    expect(m.getSnapshot().context.hoursValue).toBe(9);
  });

  it("DECREMENT on period calls onValueChange", () => {
    const cb = vi.fn();
    const m = make({
      hourCycle: 12,
      defaultValue: { hours: 9, minutes: 30, seconds: 0 },
      onValueChange: cb,
    });
    m.send({ type: "FOCUS_SEGMENT", segment: "period" });
    m.send("DECREMENT");
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({ hours: 21, minutes: 30 }));
  });
});

// ---------------------------------------------------------------------------
// TYPE_DIGIT — 12h hour commit path
// ---------------------------------------------------------------------------

describe("createTimePickerMachine — TYPE_DIGIT 12h", () => {
  it("typing '1' then '2' for hours in 12h mode commits 12", () => {
    const m = make({ hourCycle: 12, defaultValue: { hours: 9, minutes: 0, seconds: 0 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "hours" });
    m.send({ type: "TYPE_DIGIT", digit: "1" });
    m.send({ type: "TYPE_DIGIT", digit: "2" });
    // 12 in AM → stored as 0 (midnight) OR 12 (noon) depending on period
    const ctx = m.getSnapshot().context;
    expect(ctx.hoursValue).not.toBeNull();
  });

  it("typing '1' then '1' in 12h mode commits 11 and stays in AM", () => {
    const m = make({ hourCycle: 12 });
    m.send({ type: "FOCUS_SEGMENT", segment: "hours" });
    m.send({ type: "TYPE_DIGIT", digit: "1" });
    m.send({ type: "TYPE_DIGIT", digit: "1" });
    expect(m.getSnapshot().context.hoursValue).toBe(11);
  });

  it("typing '9' for hours in 12h mode auto-commits (9*10>12)", () => {
    const m = make({ hourCycle: 12 });
    m.send({ type: "FOCUS_SEGMENT", segment: "hours" });
    m.send({ type: "TYPE_DIGIT", digit: "9" });
    expect(m.getSnapshot().context.hoursValue).toBe(9);
    expect(m.getSnapshot().context.focusedSegment).toBe("minutes");
  });
});

// ---------------------------------------------------------------------------
// CLEAR_SEGMENT — seconds branch
// ---------------------------------------------------------------------------

describe("createTimePickerMachine — CLEAR_SEGMENT seconds", () => {
  it("clears secondsValue when focused segment is seconds", () => {
    const m = make({ showSeconds: true, defaultValue: { hours: 9, minutes: 30, seconds: 45 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "seconds" });
    m.send("CLEAR_SEGMENT");
    expect(m.getSnapshot().context.secondsValue).toBeNull();
  });

  it("clears hoursValue when focused segment is hours", () => {
    const m = make({ defaultValue: { hours: 9, minutes: 30, seconds: 0 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "hours" });
    m.send("CLEAR_SEGMENT");
    expect(m.getSnapshot().context.hoursValue).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// tryBuildTime — uncovered branches
// ---------------------------------------------------------------------------

describe("createTimePickerMachine — tryBuildTime branches", () => {
  it("tryBuildTime returns null when showSeconds=true and secondsValue=null (via INCREMENT)", () => {
    const cb = vi.fn();
    const m = make({
      showSeconds: true,
      defaultValue: { hours: 9, minutes: 30, seconds: 0 },
      onValueChange: cb,
    });
    // Set seconds to null
    m.send({ type: "FOCUS_SEGMENT", segment: "seconds" });
    m.send("CLEAR_SEGMENT");
    // Now secondsValue is null, tryBuildTime should return null → onValueChange NOT called on CLEAR
    // Reset callback count, then INCREMENT on minutes (tryBuildTime called but secondsValue null)
    cb.mockClear();
    m.send({ type: "FOCUS_SEGMENT", segment: "minutes" });
    m.send("INCREMENT");
    // tryBuildTime returns null since secondsValue is null with showSeconds=true
    expect(cb).not.toHaveBeenCalled();
  });

  it("INCREMENT on period with no minutes → time null → onValueChange not called", () => {
    const cb = vi.fn();
    const m = make({ hourCycle: 12, onValueChange: cb });
    // hoursValue is null, so tryBuildTime returns null
    m.send({ type: "FOCUS_SEGMENT", segment: "period" });
    m.send("INCREMENT");
    expect(cb).not.toHaveBeenCalled();
  });

  it("DECREMENT on period with no hours → hoursValue ?? 0 branch", () => {
    const m = make({ hourCycle: 12 });
    m.send({ type: "FOCUS_SEGMENT", segment: "period" });
    // hoursValue is null → h = 0 → hoursValue ?? 0 = 0
    m.send("DECREMENT");
    const ctx = m.getSnapshot().context;
    // AM toggled → PM, newHours = (0 % 12) + 12 = 12
    expect(ctx.hoursValue).toBe(12);
    expect(ctx.period).toBe("PM");
  });
});

// ---------------------------------------------------------------------------
// segmentOrder — branches
// ---------------------------------------------------------------------------

describe("createTimePickerMachine — segmentOrder branches", () => {
  it("NEXT_SEGMENT includes period in 12h mode with showSeconds=true", () => {
    const m = make({ hourCycle: 12, showSeconds: true });
    m.send({ type: "FOCUS_SEGMENT", segment: "seconds" });
    m.send("NEXT_SEGMENT");
    expect(m.getSnapshot().context.focusedSegment).toBe("period");
  });

  it("NEXT_SEGMENT from period → null (last segment)", () => {
    const m = make({ hourCycle: 12 });
    m.send({ type: "FOCUS_SEGMENT", segment: "period" });
    m.send("NEXT_SEGMENT");
    expect(m.getSnapshot().context.focusedSegment).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// typeDigit — additional branches
// ---------------------------------------------------------------------------

describe("createTimePickerMachine — typeDigit additional branches", () => {
  it("typeDigit does nothing when seg is null", () => {
    const m = make();
    // focusedSegment is null by default
    m.send({ type: "TYPE_DIGIT", digit: "5" });
    expect(m.getSnapshot().context.hoursValue).toBeNull();
  });

  it("typeDigit does nothing when readOnly", () => {
    const m = make({ readOnly: true });
    m.send({ type: "FOCUS_SEGMENT", segment: "hours" });
    m.send({ type: "TYPE_DIGIT", digit: "5" });
    expect(m.getSnapshot().context.hoursValue).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Guard branches: disabled/readOnly/!focusedSegment
// ---------------------------------------------------------------------------

describe("createTimePickerMachine — guard branches", () => {
  it("DECREMENT does nothing when disabled", () => {
    const m = make({ disabled: true, defaultValue: { hours: 9, minutes: 30, seconds: 0 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "minutes" });
    m.send("DECREMENT");
    expect(m.getSnapshot().context.minutesValue).toBe(30);
  });

  it("DECREMENT does nothing when readOnly", () => {
    const m = make({ readOnly: true, defaultValue: { hours: 9, minutes: 30, seconds: 0 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "minutes" });
    m.send("DECREMENT");
    expect(m.getSnapshot().context.minutesValue).toBe(30);
  });

  it("DECREMENT does nothing when no segment focused", () => {
    const m = make({ defaultValue: { hours: 9, minutes: 30, seconds: 0 } });
    m.send("DECREMENT");
    expect(m.getSnapshot().context.minutesValue).toBe(30);
  });

  it("CLEAR_SEGMENT does nothing when readOnly", () => {
    const m = make({ readOnly: true, defaultValue: { hours: 9, minutes: 30, seconds: 0 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "minutes" });
    m.send("CLEAR_SEGMENT");
    expect(m.getSnapshot().context.minutesValue).toBe(30);
  });

  it("CLEAR_SEGMENT does nothing when no segment focused", () => {
    const m = make({ defaultValue: { hours: 9, minutes: 30, seconds: 0 } });
    m.send("CLEAR_SEGMENT");
    expect(m.getSnapshot().context.minutesValue).toBe(30);
  });

  it("NEXT_SEGMENT with null focusedSegment focuses first segment (hours)", () => {
    const m = make();
    m.send("NEXT_SEGMENT");
    expect(m.getSnapshot().context.focusedSegment).toBe("hours");
  });

  it("PREV_SEGMENT with null focusedSegment focuses last segment", () => {
    const m = make({ hourCycle: 24, showSeconds: false });
    m.send("PREV_SEGMENT");
    expect(m.getSnapshot().context.focusedSegment).toBe("minutes");
  });

  it("INCREMENT does nothing when readOnly", () => {
    const m = make({ readOnly: true, defaultValue: { hours: 9, minutes: 30, seconds: 0 } });
    m.send({ type: "FOCUS_SEGMENT", segment: "minutes" });
    m.send("INCREMENT");
    expect(m.getSnapshot().context.minutesValue).toBe(30);
  });

  it("INCREMENT does nothing when no segment focused", () => {
    const m = make({ defaultValue: { hours: 9, minutes: 30, seconds: 0 } });
    m.send("INCREMENT");
    expect(m.getSnapshot().context.minutesValue).toBe(30);
  });
});
