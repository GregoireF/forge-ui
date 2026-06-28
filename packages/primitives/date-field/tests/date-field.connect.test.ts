import type { MachineSnapshot } from "@forge-ui/core";
import { describe, expect, it, vi } from "vitest";
import { connectDateField } from "../src/date-field.connect.js";
import type { DateFieldContext, DateFieldState } from "../src/date-field.types.js";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeCtx(overrides: Partial<DateFieldContext> = {}): DateFieldContext {
  return {
    id: "test",
    dayValue: null,
    monthValue: null,
    yearValue: null,
    focusedSegment: null,
    typingBuffer: "",
    locale: "en",
    disabled: false,
    readOnly: false,
    ...overrides,
  };
}

function makeApi(ctxOverrides: Partial<DateFieldContext> = {}, state: DateFieldState = "idle") {
  const ctx = makeCtx(ctxOverrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn<(updates: Partial<DateFieldContext>) => void>() };
  const snapshot: MachineSnapshot<DateFieldContext, DateFieldState> = {
    value: state,
    context: ctx,
    matches: (...values) => values.includes(state),
    tags: [],
    hasTag: () => false,
  };
  const api = connectDateField(snapshot, send, machine);
  return { api, send, machine, ctx };
}

// ---------------------------------------------------------------------------
// getGroupProps
// ---------------------------------------------------------------------------

describe("connectDateField — getGroupProps", () => {
  it("returns role='group'", () => {
    const { api } = makeApi();
    expect(api.getGroupProps().role).toBe("group");
  });

  it("has aria-label", () => {
    const { api } = makeApi();
    expect(api.getGroupProps()["aria-label"]).toBeTruthy();
  });

  it("disabled sets aria-disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getGroupProps()["aria-disabled"]).toBe(true);
  });

  it("not disabled omits aria-disabled", () => {
    const { api } = makeApi({ disabled: false });
    expect(api.getGroupProps()["aria-disabled"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getMonthSegmentProps (spinbutton, WAI-ARIA 1.2)
// ---------------------------------------------------------------------------

describe("connectDateField — getMonthSegmentProps", () => {
  it("role is spinbutton", () => {
    const { api } = makeApi();
    expect(api.getMonthSegmentProps().role).toBe("spinbutton");
  });

  it("aria-label is 'Month'", () => {
    const { api } = makeApi();
    expect(api.getMonthSegmentProps()["aria-label"]).toBe("Month");
  });

  it("aria-valuemin is 1", () => {
    const { api } = makeApi();
    expect(api.getMonthSegmentProps()["aria-valuemin"]).toBe(1);
  });

  it("aria-valuemax is 12", () => {
    const { api } = makeApi();
    expect(api.getMonthSegmentProps()["aria-valuemax"]).toBe(12);
  });

  it("aria-valuenow reflects monthValue", () => {
    const { api } = makeApi({ monthValue: 6 });
    expect(api.getMonthSegmentProps()["aria-valuenow"]).toBe(6);
  });

  it("aria-valuenow is undefined when monthValue is null", () => {
    const { api } = makeApi({ monthValue: null });
    expect(api.getMonthSegmentProps()["aria-valuenow"]).toBeUndefined();
  });

  it("aria-valuetext is 'blank' when no value", () => {
    const { api } = makeApi({ monthValue: null });
    expect(api.getMonthSegmentProps()["aria-valuetext"]).toBe("blank");
  });

  it("aria-valuetext is locale-aware month name when set", () => {
    const { api } = makeApi({ monthValue: 6, locale: "en" });
    const text = api.getMonthSegmentProps()["aria-valuetext"];
    expect(text).toMatch(/june/i);
  });

  it("data-focused when focusedSegment matches", () => {
    const { api } = makeApi({ focusedSegment: "month" });
    expect(api.getMonthSegmentProps()["data-focused"]).toBe("");
  });

  it("no data-focused when segment is not focused", () => {
    const { api } = makeApi({ focusedSegment: null });
    expect(api.getMonthSegmentProps()["data-focused"]).toBeUndefined();
  });

  it("onFocus sends FOCUS_SEGMENT month", () => {
    const { api, send } = makeApi();
    api.getMonthSegmentProps().onFocus();
    expect(send).toHaveBeenCalledWith({ type: "FOCUS_SEGMENT", segment: "month" });
  });

  it("onBlur sends BLUR_SEGMENT", () => {
    const { api, send } = makeApi();
    api.getMonthSegmentProps().onBlur();
    expect(send).toHaveBeenCalledWith("BLUR_SEGMENT");
  });
});

// ---------------------------------------------------------------------------
// getDaySegmentProps
// ---------------------------------------------------------------------------

describe("connectDateField — getDaySegmentProps", () => {
  it("role is spinbutton", () => {
    const { api } = makeApi();
    expect(api.getDaySegmentProps().role).toBe("spinbutton");
  });

  it("aria-label is 'Day'", () => {
    const { api } = makeApi();
    expect(api.getDaySegmentProps()["aria-label"]).toBe("Day");
  });

  it("aria-valuemin is 1", () => {
    const { api } = makeApi();
    expect(api.getDaySegmentProps()["aria-valuemin"]).toBe(1);
  });

  it("aria-valuemax is 31", () => {
    const { api } = makeApi();
    expect(api.getDaySegmentProps()["aria-valuemax"]).toBe(31);
  });

  it("aria-valuetext is the numeric value as string (no padding — SR reads naturally)", () => {
    const { api } = makeApi({ dayValue: 5 });
    expect(api.getDaySegmentProps()["aria-valuetext"]).toBe("5");
  });

  it("aria-valuetext is 'blank' when null", () => {
    const { api } = makeApi({ dayValue: null });
    expect(api.getDaySegmentProps()["aria-valuetext"]).toBe("blank");
  });
});

// ---------------------------------------------------------------------------
// getYearSegmentProps
// ---------------------------------------------------------------------------

describe("connectDateField — getYearSegmentProps", () => {
  it("role is spinbutton", () => {
    const { api } = makeApi();
    expect(api.getYearSegmentProps().role).toBe("spinbutton");
  });

  it("aria-label is 'Year'", () => {
    const { api } = makeApi();
    expect(api.getYearSegmentProps()["aria-label"]).toBe("Year");
  });

  it("aria-valuenow reflects yearValue", () => {
    const { api } = makeApi({ yearValue: 2024 });
    expect(api.getYearSegmentProps()["aria-valuenow"]).toBe(2024);
  });
});

// ---------------------------------------------------------------------------
// Keyboard handlers
// ---------------------------------------------------------------------------

describe("connectDateField — keyboard handling", () => {
  function fireKey(
    props: { onKeyDown?: (e: KeyboardEvent) => void } & Record<string, unknown>,
    key: string,
    extra: Partial<KeyboardEvent> = {},
  ) {
    const event = { key, preventDefault: vi.fn(), ...extra } as unknown as KeyboardEvent;
    props.onKeyDown?.(event);
    return event;
  }

  it("ArrowUp sends INCREMENT", () => {
    const { api, send } = makeApi({ focusedSegment: "month" });
    fireKey(api.getMonthSegmentProps(), "ArrowUp");
    expect(send).toHaveBeenCalledWith("INCREMENT");
  });

  it("ArrowDown sends DECREMENT", () => {
    const { api, send } = makeApi({ focusedSegment: "month" });
    fireKey(api.getMonthSegmentProps(), "ArrowDown");
    expect(send).toHaveBeenCalledWith("DECREMENT");
  });

  it("ArrowRight sends NEXT_SEGMENT", () => {
    const { api, send } = makeApi({ focusedSegment: "month" });
    fireKey(api.getMonthSegmentProps(), "ArrowRight");
    expect(send).toHaveBeenCalledWith("NEXT_SEGMENT");
  });

  it("ArrowLeft sends PREV_SEGMENT", () => {
    const { api, send } = makeApi({ focusedSegment: "month" });
    fireKey(api.getMonthSegmentProps(), "ArrowLeft");
    expect(send).toHaveBeenCalledWith("PREV_SEGMENT");
  });

  it("digit key sends TYPE_DIGIT", () => {
    const { api, send } = makeApi({ focusedSegment: "month" });
    fireKey(api.getMonthSegmentProps(), "3");
    expect(send).toHaveBeenCalledWith({ type: "TYPE_DIGIT", digit: "3" });
  });

  it("Backspace sends CLEAR_SEGMENT", () => {
    const { api, send } = makeApi({ focusedSegment: "month" });
    fireKey(api.getMonthSegmentProps(), "Backspace");
    expect(send).toHaveBeenCalledWith("CLEAR_SEGMENT");
  });

  it("Delete sends CLEAR_SEGMENT", () => {
    const { api, send } = makeApi({ focusedSegment: "month" });
    fireKey(api.getMonthSegmentProps(), "Delete");
    expect(send).toHaveBeenCalledWith("CLEAR_SEGMENT");
  });
});

// ---------------------------------------------------------------------------
// displayValues
// ---------------------------------------------------------------------------

describe("connectDateField — displayValues", () => {
  it("all undefined when no values", () => {
    const { api } = makeApi();
    expect(api.displayValues.month).toBeUndefined();
    expect(api.displayValues.day).toBeUndefined();
    expect(api.displayValues.year).toBeUndefined();
  });

  it("month display is locale-aware month name", () => {
    const { api } = makeApi({ monthValue: 6, dayValue: 5, yearValue: 2024, locale: "en" });
    // connect uses formatMonth() → localized name, not padded number
    expect(api.displayValues.month).toMatch(/june/i);
  });

  it("day is padded to 2 digits", () => {
    const { api } = makeApi({ dayValue: 5 });
    expect(api.displayValues.day).toBe("05");
  });

  it("year is a string", () => {
    const { api } = makeApi({ yearValue: 2024 });
    expect(api.displayValues.year).toBe("2024");
  });
});

// ---------------------------------------------------------------------------
// assembledDate / getHiddenInputProps
// ---------------------------------------------------------------------------

describe("connectDateField — assembled date", () => {
  it("assembledDate is null when any segment missing", () => {
    const { api } = makeApi({ monthValue: 6, dayValue: null, yearValue: 2024 });
    expect(api.assembledDate).toBeNull();
  });

  it("assembledDate has all fields when complete", () => {
    const { api } = makeApi({ monthValue: 6, dayValue: 15, yearValue: 2024 });
    expect(api.assembledDate).toEqual({ year: 2024, month: 6, day: 15 });
  });

  it("getHiddenInputProps has empty value when incomplete", () => {
    const { api } = makeApi({ monthValue: null });
    expect(api.getHiddenInputProps("date").value).toBe("");
  });

  it("getHiddenInputProps has ISO-ish value when complete", () => {
    const { api } = makeApi({ monthValue: 6, dayValue: 15, yearValue: 2024 });
    const val = api.getHiddenInputProps("date").value;
    expect(val).toContain("2024");
    expect(val).toContain("06");
    expect(val).toContain("15");
  });

  it("getHiddenInputProps is aria-hidden", () => {
    const { api } = makeApi();
    expect(api.getHiddenInputProps("date")["aria-hidden"]).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Disabled / readOnly
// ---------------------------------------------------------------------------

describe("connectDateField — disabled/readOnly", () => {
  it("tabIndex is -1 when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getMonthSegmentProps().tabIndex).toBe(-1);
  });

  it("tabIndex is 0 when enabled", () => {
    const { api } = makeApi({ disabled: false });
    expect(api.getMonthSegmentProps().tabIndex).toBe(0);
  });

  it("aria-readonly is set when readOnly", () => {
    const { api } = makeApi({ readOnly: true });
    expect(api.getMonthSegmentProps()["aria-readonly"]).toBe(true);
  });
});
