import { describe, expect, it, vi } from "vitest";
import { connectTimePicker } from "../src/time-picker.connect.js";
import type { TimePickerContext, TimePickerEvent, TimePickerState } from "../src/time-picker.types.js";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeCtx(overrides: Partial<TimePickerContext> = {}): TimePickerContext {
  return {
    id: "test",
    hoursValue: null,
    minutesValue: null,
    secondsValue: null,
    period: "AM",
    focusedSegment: null,
    typingBuffer: "",
    hourCycle: 24,
    showSeconds: false,
    minuteStep: 1,
    secondStep: 1,
    disabled: false,
    readOnly: false,
    ...overrides,
  };
}

function makeApi(ctxOverrides: Partial<TimePickerContext> = {}) {
  const ctx = makeCtx(ctxOverrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  const snapshot = {
    value: "idle" as TimePickerState,
    context: ctx,
    matches: (s: string) => s === "idle",
    tags: [],
    hasTag: () => false,
  };
  const api = connectTimePicker(snapshot as any, send, machine as any);
  return { api, send };
}

// ---------------------------------------------------------------------------
// getGroupProps
// ---------------------------------------------------------------------------

describe("connectTimePicker — getGroupProps", () => {
  it("role is 'group'", () => {
    const { api } = makeApi();
    expect(api.getGroupProps().role).toBe("group");
  });

  it("aria-label is 'Time'", () => {
    const { api } = makeApi();
    expect(api.getGroupProps()["aria-label"]).toBe("Time");
  });

  it("aria-disabled when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getGroupProps()["aria-disabled"]).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getHoursSegmentProps (WAI-ARIA spinbutton)
// ---------------------------------------------------------------------------

describe("connectTimePicker — getHoursSegmentProps (24h)", () => {
  it("role is spinbutton", () => {
    const { api } = makeApi();
    expect(api.getHoursSegmentProps().role).toBe("spinbutton");
  });

  it("aria-label is 'Hours'", () => {
    const { api } = makeApi();
    expect(api.getHoursSegmentProps()["aria-label"]).toBe("Hours");
  });

  it("aria-valuemin is 0 in 24h mode", () => {
    const { api } = makeApi({ hourCycle: 24 });
    expect(api.getHoursSegmentProps()["aria-valuemin"]).toBe(0);
  });

  it("aria-valuemax is 23 in 24h mode", () => {
    const { api } = makeApi({ hourCycle: 24 });
    expect(api.getHoursSegmentProps()["aria-valuemax"]).toBe(23);
  });

  it("aria-valuenow reflects display hours in 24h", () => {
    const { api } = makeApi({ hoursValue: 14, hourCycle: 24 });
    expect(api.getHoursSegmentProps()["aria-valuenow"]).toBe(14);
  });

  it("aria-valuetext is 'blank' when null", () => {
    const { api } = makeApi({ hoursValue: null });
    expect(api.getHoursSegmentProps()["aria-valuetext"]).toBe("blank");
  });

  it("aria-valuetext in 24h shows raw value", () => {
    const { api } = makeApi({ hoursValue: 14, hourCycle: 24 });
    expect(api.getHoursSegmentProps()["aria-valuetext"]).toBe("14");
  });

  it("aria-valuetext in 12h reads '2 PM' for 14:00", () => {
    const { api } = makeApi({ hoursValue: 14, hourCycle: 12, period: "PM" });
    expect(api.getHoursSegmentProps()["aria-valuetext"]).toBe("2 PM");
  });

  it("data-focused when focusedSegment is hours", () => {
    const { api } = makeApi({ focusedSegment: "hours" });
    expect(api.getHoursSegmentProps()["data-focused"]).toBe("");
  });
});

// ---------------------------------------------------------------------------
// getHoursSegmentProps (12h mode)
// ---------------------------------------------------------------------------

describe("connectTimePicker — getHoursSegmentProps (12h)", () => {
  it("aria-valuemin is 1 in 12h mode", () => {
    const { api } = makeApi({ hourCycle: 12 });
    expect(api.getHoursSegmentProps()["aria-valuemin"]).toBe(1);
  });

  it("aria-valuemax is 12 in 12h mode", () => {
    const { api } = makeApi({ hourCycle: 12 });
    expect(api.getHoursSegmentProps()["aria-valuemax"]).toBe(12);
  });

  it("midnight (0) displays as 12 in 12h", () => {
    const { api } = makeApi({ hoursValue: 0, hourCycle: 12, period: "AM" });
    expect(api.getHoursSegmentProps()["aria-valuenow"]).toBe(12);
    expect(api.getHoursSegmentProps()["aria-valuetext"]).toBe("12 AM");
  });

  it("noon (12) stays as 12 in 12h", () => {
    const { api } = makeApi({ hoursValue: 12, hourCycle: 12, period: "PM" });
    expect(api.getHoursSegmentProps()["aria-valuenow"]).toBe(12);
    expect(api.getHoursSegmentProps()["aria-valuetext"]).toBe("12 PM");
  });
});

// ---------------------------------------------------------------------------
// getMinutesSegmentProps
// ---------------------------------------------------------------------------

describe("connectTimePicker — getMinutesSegmentProps", () => {
  it("role is spinbutton", () => {
    const { api } = makeApi();
    expect(api.getMinutesSegmentProps().role).toBe("spinbutton");
  });

  it("aria-label is 'Minutes'", () => {
    const { api } = makeApi();
    expect(api.getMinutesSegmentProps()["aria-label"]).toBe("Minutes");
  });

  it("aria-valuemin is 0", () => {
    const { api } = makeApi();
    expect(api.getMinutesSegmentProps()["aria-valuemin"]).toBe(0);
  });

  it("aria-valuemax is 59", () => {
    const { api } = makeApi();
    expect(api.getMinutesSegmentProps()["aria-valuemax"]).toBe(59);
  });

  it("aria-valuetext is padded", () => {
    const { api } = makeApi({ minutesValue: 5 });
    expect(api.getMinutesSegmentProps()["aria-valuetext"]).toBe("05");
  });

  it("aria-valuetext is 'blank' when null", () => {
    const { api } = makeApi({ minutesValue: null });
    expect(api.getMinutesSegmentProps()["aria-valuetext"]).toBe("blank");
  });
});

// ---------------------------------------------------------------------------
// getSecondsSegmentProps
// ---------------------------------------------------------------------------

describe("connectTimePicker — getSecondsSegmentProps", () => {
  it("role is spinbutton", () => {
    const { api } = makeApi({ showSeconds: true });
    expect(api.getSecondsSegmentProps().role).toBe("spinbutton");
  });

  it("aria-label is 'Seconds'", () => {
    const { api } = makeApi({ showSeconds: true });
    expect(api.getSecondsSegmentProps()["aria-label"]).toBe("Seconds");
  });

  it("aria-valuemax is 59", () => {
    const { api } = makeApi({ showSeconds: true });
    expect(api.getSecondsSegmentProps()["aria-valuemax"]).toBe(59);
  });
});

// ---------------------------------------------------------------------------
// getPeriodSegmentProps
// ---------------------------------------------------------------------------

describe("connectTimePicker — getPeriodSegmentProps (12h)", () => {
  it("role is spinbutton", () => {
    const { api } = makeApi({ hourCycle: 12 });
    expect(api.getPeriodSegmentProps().role).toBe("spinbutton");
  });

  it("aria-label is 'AM/PM'", () => {
    const { api } = makeApi({ hourCycle: 12 });
    expect(api.getPeriodSegmentProps()["aria-label"]).toBe("AM/PM");
  });

  it("aria-valuetext reflects current period", () => {
    const { api } = makeApi({ hourCycle: 12, period: "PM" });
    expect(api.getPeriodSegmentProps()["aria-valuetext"]).toBe("PM");
  });

  it("sends TOGGLE_PERIOD on 'a' key", () => {
    const { api, send } = makeApi({ hourCycle: 12, period: "PM", focusedSegment: "period" });
    const event = { key: "a", preventDefault: vi.fn() } as unknown as KeyboardEvent;
    api.getPeriodSegmentProps().onKeyDown(event);
    expect(send).toHaveBeenCalledWith("TOGGLE_PERIOD");
  });

  it("sends TOGGLE_PERIOD on 'p' key when AM", () => {
    const { api, send } = makeApi({ hourCycle: 12, period: "AM", focusedSegment: "period" });
    const event = { key: "p", preventDefault: vi.fn() } as unknown as KeyboardEvent;
    api.getPeriodSegmentProps().onKeyDown(event);
    expect(send).toHaveBeenCalledWith("TOGGLE_PERIOD");
  });

  it("does NOT toggle period with 'a' when already AM", () => {
    const { api, send } = makeApi({ hourCycle: 12, period: "AM", focusedSegment: "period" });
    const event = { key: "a", preventDefault: vi.fn() } as unknown as KeyboardEvent;
    api.getPeriodSegmentProps().onKeyDown(event);
    expect(send).not.toHaveBeenCalledWith("TOGGLE_PERIOD");
  });
});

// ---------------------------------------------------------------------------
// getSeparatorProps
// ---------------------------------------------------------------------------

describe("connectTimePicker — getSeparatorProps", () => {
  it("is aria-hidden", () => {
    const { api } = makeApi();
    expect(api.getSeparatorProps()["aria-hidden"]).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Keyboard handling
// ---------------------------------------------------------------------------

describe("connectTimePicker — keyboard handling", () => {
  function fireKey(props: Record<string, unknown>, key: string) {
    const event = { key, preventDefault: vi.fn() } as unknown as KeyboardEvent;
    (props as any).onKeyDown(event);
    return event;
  }

  it("ArrowUp sends INCREMENT", () => {
    const { api, send } = makeApi({ focusedSegment: "hours" });
    fireKey(api.getHoursSegmentProps(), "ArrowUp");
    expect(send).toHaveBeenCalledWith("INCREMENT");
  });

  it("ArrowDown sends DECREMENT", () => {
    const { api, send } = makeApi({ focusedSegment: "minutes" });
    fireKey(api.getMinutesSegmentProps(), "ArrowDown");
    expect(send).toHaveBeenCalledWith("DECREMENT");
  });

  it("digit sends TYPE_DIGIT", () => {
    const { api, send } = makeApi({ focusedSegment: "hours" });
    fireKey(api.getHoursSegmentProps(), "5");
    expect(send).toHaveBeenCalledWith({ type: "TYPE_DIGIT", digit: "5" });
  });

  it("Backspace sends CLEAR_SEGMENT", () => {
    const { api, send } = makeApi({ focusedSegment: "minutes" });
    fireKey(api.getMinutesSegmentProps(), "Backspace");
    expect(send).toHaveBeenCalledWith("CLEAR_SEGMENT");
  });

  it("ArrowRight sends NEXT_SEGMENT", () => {
    const { api, send } = makeApi({ focusedSegment: "hours" });
    fireKey(api.getHoursSegmentProps(), "ArrowRight");
    expect(send).toHaveBeenCalledWith("NEXT_SEGMENT");
  });

  it("ArrowLeft sends PREV_SEGMENT", () => {
    const { api, send } = makeApi({ focusedSegment: "minutes" });
    fireKey(api.getMinutesSegmentProps(), "ArrowLeft");
    expect(send).toHaveBeenCalledWith("PREV_SEGMENT");
  });

  it("onFocus sends FOCUS_SEGMENT", () => {
    const { api, send } = makeApi();
    api.getHoursSegmentProps().onFocus();
    expect(send).toHaveBeenCalledWith({ type: "FOCUS_SEGMENT", segment: "hours" });
  });

  it("onBlur sends BLUR_SEGMENT", () => {
    const { api, send } = makeApi({ focusedSegment: "hours" });
    api.getHoursSegmentProps().onBlur();
    expect(send).toHaveBeenCalledWith("BLUR_SEGMENT");
  });
});

// ---------------------------------------------------------------------------
// displayValues
// ---------------------------------------------------------------------------

describe("connectTimePicker — displayValues", () => {
  it("all undefined when no values", () => {
    const { api } = makeApi();
    expect(api.displayValues.hours).toBeUndefined();
    expect(api.displayValues.minutes).toBeUndefined();
    expect(api.displayValues.seconds).toBeUndefined();
    expect(api.displayValues.period).toBeUndefined();
  });

  it("pads hours and minutes to 2 digits", () => {
    const { api } = makeApi({ hoursValue: 9, minutesValue: 5 });
    expect(api.displayValues.hours).toBe("09");
    expect(api.displayValues.minutes).toBe("05");
  });

  it("period displayed in 12h mode", () => {
    const { api } = makeApi({ hourCycle: 12, period: "PM" });
    expect(api.displayValues.period).toBe("PM");
  });

  it("period not displayed in 24h mode", () => {
    const { api } = makeApi({ hourCycle: 24 });
    expect(api.displayValues.period).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// assembledTime / getHiddenInputProps
// ---------------------------------------------------------------------------

describe("connectTimePicker — assembledTime and hidden input", () => {
  it("assembledTime null when hours missing (showSeconds:false)", () => {
    const { api } = makeApi({ hoursValue: null, minutesValue: 30, showSeconds: false });
    expect(api.assembledTime).toBeNull();
  });

  it("assembledTime present when hours and minutes set (showSeconds:false)", () => {
    const { api } = makeApi({ hoursValue: 14, minutesValue: 30, showSeconds: false });
    expect(api.assembledTime).toEqual({ hours: 14, minutes: 30, seconds: 0 });
  });

  it("assembledTime null when seconds missing (showSeconds:true)", () => {
    const { api } = makeApi({ hoursValue: 14, minutesValue: 30, secondsValue: null, showSeconds: true });
    expect(api.assembledTime).toBeNull();
  });

  it("isoValue is HH:MM:SS format", () => {
    const { api } = makeApi({ hoursValue: 9, minutesValue: 5, secondsValue: 0, showSeconds: false });
    expect(api.isoValue).toBe("09:05:00");
  });

  it("isoValue empty when incomplete", () => {
    const { api } = makeApi({ hoursValue: null });
    expect(api.isoValue).toBe("");
  });

  it("getHiddenInputProps has name and aria-hidden", () => {
    const { api } = makeApi();
    const props = api.getHiddenInputProps("time");
    expect(props.name).toBe("time");
    expect(props["aria-hidden"]).toBe(true);
    expect(props.type).toBe("hidden");
  });
});
