import { describe, expect, it, vi } from "vitest";
import { connectDateRangePicker } from "../src/date-range-picker.connect.js";
import type {
  DateRangePickerContext,
  DateRangePickerState,
} from "../src/date-range-picker.types.js";
import type { MachineSnapshot } from "@forge-ui/core";
import type { CalendarDate } from "@forge-ui/date-picker";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TODAY: CalendarDate = { year: 2024, month: 6, day: 1 };
const JUNE15: CalendarDate = { year: 2024, month: 6, day: 15 };
const JUNE20: CalendarDate = { year: 2024, month: 6, day: 20 };

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeCtx(overrides: Partial<DateRangePickerContext> = {}): DateRangePickerContext {
  return {
    id: "test",
    startDate: null,
    endDate: null,
    selectionPhase: "start",
    hoveredDate: null,
    focusedDate: JUNE15,
    today: TODAY,
    locale: "en",
    firstDayOfWeek: 0,
    numberOfMonths: 2,
    disabled: false,
    readOnly: false,
    contentEl: null,
    triggerEl: null,
    ...overrides,
  };
}

function makeApi(
  ctxOverrides: Partial<DateRangePickerContext> = {},
  state: DateRangePickerState = "closed",
) {
  const ctx = makeCtx(ctxOverrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn<(updates: Partial<DateRangePickerContext>) => void>() };
  const snapshot: MachineSnapshot<DateRangePickerContext, DateRangePickerState> = {
    value: state,
    context: ctx,
    matches: (...values) => values.includes(state),
    tags: state === "open" ? ["open"] : ["closed"],
    hasTag: (t: string) => (state === "open" ? t === "open" : t === "closed"),
  };
  const api = connectDateRangePicker(snapshot, send, machine);
  return { api, send, machine };
}

// ---------------------------------------------------------------------------
// isOpen / view state
// ---------------------------------------------------------------------------

describe("connectDateRangePicker — state", () => {
  it("isOpen is false when closed", () => {
    const { api } = makeApi({}, "closed");
    expect(api.isOpen).toBe(false);
  });

  it("isOpen is true when open", () => {
    const { api } = makeApi({}, "open");
    expect(api.isOpen).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getTriggerProps
// ---------------------------------------------------------------------------

describe("connectDateRangePicker — getTriggerProps", () => {
  it("onClick sends TOGGLE", () => {
    const { api, send } = makeApi();
    api.getTriggerProps().onClick();
    expect(send).toHaveBeenCalledWith("TOGGLE");
  });

  it("aria-expanded is false when closed", () => {
    const { api } = makeApi({}, "closed");
    expect(api.getTriggerProps()["aria-expanded"]).toBe(false);
  });

  it("aria-expanded is true when open", () => {
    const { api } = makeApi({}, "open");
    expect(api.getTriggerProps()["aria-expanded"]).toBe(true);
  });

  it("aria-label reflects selected range (abbreviated month names)", () => {
    const { api } = makeApi({ startDate: JUNE15, endDate: JUNE20 });
    const label = api.getTriggerProps()["aria-label"];
    expect(label).toContain("Jun");
    expect(label).toContain("2024");
  });

  it("disabled prevents click", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getTriggerProps().onClick();
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getCalendarGridProps (WAI-ARIA multi-select)
// ---------------------------------------------------------------------------

describe("connectDateRangePicker — getCalendarGridProps", () => {
  it("role is 'grid'", () => {
    const { api } = makeApi({}, "open");
    expect(api.getCalendarGridProps(0).role).toBe("grid");
  });

  it("aria-multiselectable is true", () => {
    const { api } = makeApi({}, "open");
    expect(api.getCalendarGridProps(0)["aria-multiselectable"]).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getCalendarCellProps — range data attributes
// ---------------------------------------------------------------------------

describe("connectDateRangePicker — range data attributes on cells", () => {
  const start: CalendarDate = { year: 2024, month: 6, day: 10 };
  const end: CalendarDate = { year: 2024, month: 6, day: 20 };

  it("data-range-start on the start date", () => {
    const { api } = makeApi({ startDate: start, endDate: end }, "open");
    const props = api.getCalendarCellProps(start, false);
    expect(props["data-range-start"]).toBe("");
  });

  it("data-range-end on the end date", () => {
    const { api } = makeApi({ startDate: start, endDate: end }, "open");
    const props = api.getCalendarCellProps(end, false);
    expect(props["data-range-end"]).toBe("");
  });

  it("data-in-range on a date between start and end", () => {
    const between: CalendarDate = { year: 2024, month: 6, day: 15 };
    const { api } = makeApi({ startDate: start, endDate: end }, "open");
    const props = api.getCalendarCellProps(between, false);
    expect(props["data-in-range"]).toBe("");
  });

  it("no data-in-range on a date outside range", () => {
    const outside: CalendarDate = { year: 2024, month: 6, day: 25 };
    const { api } = makeApi({ startDate: start, endDate: end }, "open");
    const props = api.getCalendarCellProps(outside, false);
    expect(props["data-in-range"]).toBeUndefined();
  });

  it("data-preview-end on hover target during end phase", () => {
    const hovered: CalendarDate = { year: 2024, month: 6, day: 18 };
    const { api } = makeApi(
      { startDate: start, endDate: null, hoveredDate: hovered, selectionPhase: "end" },
      "open",
    );
    const props = api.getCalendarCellProps(hovered, false);
    expect(props["data-preview-end"]).toBe("");
  });

  it("data-in-preview-range on cells between start and hover", () => {
    const hovered: CalendarDate = { year: 2024, month: 6, day: 18 };
    const mid: CalendarDate = { year: 2024, month: 6, day: 14 };
    const { api } = makeApi(
      { startDate: start, endDate: null, hoveredDate: hovered, selectionPhase: "end" },
      "open",
    );
    const props = api.getCalendarCellProps(mid, false);
    expect(props["data-in-preview-range"]).toBe("");
  });
});

// ---------------------------------------------------------------------------
// getCalendarCellProps — aria-label and aria-selected
// ---------------------------------------------------------------------------

describe("connectDateRangePicker — cell aria attributes", () => {
  it("aria-label includes date", () => {
    const { api } = makeApi({}, "open");
    const props = api.getCalendarCellProps(JUNE15, false);
    expect(props["aria-label"]).toContain("June");
  });

  it("aria-label includes 'start of range' on range start cell", () => {
    const { api } = makeApi({ startDate: JUNE15, endDate: JUNE20 }, "open");
    const props = api.getCalendarCellProps(JUNE15, false);
    expect(props["aria-label"]).toContain("start");
  });

  it("aria-label includes 'end of range' on range end cell", () => {
    const { api } = makeApi({ startDate: JUNE15, endDate: JUNE20 }, "open");
    const props = api.getCalendarCellProps(JUNE20, false);
    expect(props["aria-label"]).toContain("end");
  });

  it("aria-selected is true for selected range start", () => {
    const { api } = makeApi({ startDate: JUNE15, endDate: JUNE20 }, "open");
    const props = api.getCalendarCellProps(JUNE15, false);
    expect(props["aria-selected"]).toBe(true);
  });

  it("data-outside-month on outside cells", () => {
    const { api } = makeApi({}, "open");
    const props = api.getCalendarCellProps(JUNE15, true);
    expect(props["data-outside-month"]).toBe("");
  });

  it("onClick sends SELECT_DAY", () => {
    const { api, send } = makeApi({}, "open");
    api.getCalendarCellProps(JUNE15, false).onClick();
    expect(send).toHaveBeenCalledWith({ type: "SELECT_DAY", date: JUNE15 });
  });

  it("onMouseEnter sends HOVER_DAY", () => {
    const { api, send } = makeApi({}, "open");
    api.getCalendarCellProps(JUNE15, false).onMouseEnter();
    expect(send).toHaveBeenCalledWith({ type: "HOVER_DAY", date: JUNE15 });
  });

  it("onMouseLeave sends CLEAR_HOVER", () => {
    const { api, send } = makeApi({}, "open");
    api.getCalendarCellProps(JUNE15, false).onMouseLeave();
    expect(send).toHaveBeenCalledWith("CLEAR_HOVER");
  });
});

// ---------------------------------------------------------------------------
// getCalendarHeaderProps — aria-atomic
// ---------------------------------------------------------------------------

describe("connectDateRangePicker — getCalendarHeaderProps", () => {
  it("aria-live is polite", () => {
    const { api } = makeApi({}, "open");
    expect(api.getCalendarHeaderProps(0)["aria-live"]).toBe("polite");
  });

  it("aria-atomic is true (required for SR to read full header)", () => {
    const { api } = makeApi({}, "open");
    expect(api.getCalendarHeaderProps(0)["aria-atomic"]).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// weeksPerMonth / weekdays
// ---------------------------------------------------------------------------

describe("connectDateRangePicker — weeksPerMonth and weekdays", () => {
  it("weeksPerMonth has 4-6 rows for first month", () => {
    const { api } = makeApi({}, "open");
    const weeks = api.weeksPerMonth[0];
    expect(weeks.length).toBeGreaterThanOrEqual(4);
    expect(weeks.length).toBeLessThanOrEqual(6);
  });

  it("each week has 7 cells", () => {
    const { api } = makeApi({}, "open");
    for (const week of api.weeksPerMonth[0]) {
      expect(week.length).toBe(7);
    }
  });

  it("weekdays has 7 entries", () => {
    const { api } = makeApi({}, "open");
    expect(api.weekdays.length).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// formattedRange (string)
// ---------------------------------------------------------------------------

describe("connectDateRangePicker — formattedRange", () => {
  it("formattedRange is empty string when no selection", () => {
    const { api } = makeApi();
    expect(api.formattedRange).toBeFalsy();
  });

  it("formattedRange shows start date when only start set", () => {
    const { api } = makeApi({ startDate: JUNE15 });
    expect(api.formattedRange).toContain("Jun");
  });

  it("formattedRange shows both dates separated by em-dash when complete", () => {
    const { api } = makeApi({ startDate: JUNE15, endDate: JUNE20 });
    expect(api.formattedRange).toContain("–");
    expect(api.formattedRange).toContain("Jun");
  });
});

// ---------------------------------------------------------------------------
// Multiple months support
// ---------------------------------------------------------------------------

describe("connectDateRangePicker — multiple months", () => {
  it("weeksPerMonth length matches numberOfMonths", () => {
    const { api } = makeApi({ numberOfMonths: 2 }, "open");
    expect(api.weeksPerMonth.length).toBe(2);
  });

  it("second calendar grid label is one month after first", () => {
    const { api } = makeApi({ numberOfMonths: 2, focusedDate: { year: 2024, month: 6, day: 1 } }, "open");
    const label0 = api.getCalendarGridProps(0)["aria-label"];
    const label1 = api.getCalendarGridProps(1)["aria-label"];
    // First is June 2024, second should be July 2024
    expect(label0).toContain("June");
    expect(label1).toContain("July");
  });
});

// ---------------------------------------------------------------------------
// Preset support
// ---------------------------------------------------------------------------

describe("connectDateRangePicker — presets", () => {
  const presets = [
    {
      label: "Last 7 days",
      getValue: (today: CalendarDate) => ({
        start: { ...today, day: today.day - 7 },
        end: today,
      }),
    },
  ];

  it("getPresetProps sends SELECT_PRESET on click", () => {
    const { api, send } = makeApi({ presets }, "open");
    const props = api.getPresetProps(presets[0]);
    props.onClick();
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ type: "SELECT_PRESET" }),
    );
  });

  it("getPresetProps does nothing when disabled", () => {
    const { api, send } = makeApi({ presets, disabled: true }, "open");
    api.getPresetProps(presets[0]).onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("getPresetProps does nothing when readOnly", () => {
    const { api, send } = makeApi({ presets, readOnly: true }, "open");
    api.getPresetProps(presets[0]).onClick();
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// previewEnd — hoveredDate when selectionPhase=end
// ---------------------------------------------------------------------------

describe("connectDateRangePicker — previewEnd", () => {
  it("isPreviewEnd data attribute set when cell matches hoveredDate in end phase", () => {
    const hovered = { year: 2024, month: 6, day: 20 };
    const { api } = makeApi({
      selectionPhase: "end",
      startDate: JUNE15,
      endDate: null,
      hoveredDate: hovered,
    }, "open");
    const props = api.getCalendarCellProps(hovered);
    expect(props["data-preview-end"]).toBe("");
  });

  it("previewEnd falls back to endDate when hoveredDate is null in end phase", () => {
    const { api } = makeApi({
      selectionPhase: "end",
      startDate: JUNE15,
      endDate: JUNE20,
      hoveredDate: null,
    }, "open");
    const props = api.getCalendarCellProps(JUNE20);
    expect(props["data-range-end"]).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Trigger ref callback
// ---------------------------------------------------------------------------

describe("connectDateRangePicker — trigger ref callback", () => {
  it("ref callback sets triggerEl", () => {
    const { api, machine } = makeApi();
    const el = document.createElement("button");
    (api.getTriggerProps().ref as (el: unknown) => void)(el);
    expect(machine.setContext).toHaveBeenCalledWith({ triggerEl: el });
  });

  it("ref callback with null clears triggerEl", () => {
    const { api, machine } = makeApi();
    (api.getTriggerProps().ref as (el: unknown) => void)(null);
    expect(machine.setContext).toHaveBeenCalledWith({ triggerEl: null });
  });
});

// ---------------------------------------------------------------------------
// Content ref callback
// ---------------------------------------------------------------------------

describe("connectDateRangePicker — content ref callback", () => {
  it("ref callback sets contentEl", () => {
    const { api, machine } = makeApi();
    const el = document.createElement("div");
    (api.getContentProps().ref as (el: unknown) => void)(el);
    expect(machine.setContext).toHaveBeenCalledWith({ contentEl: el });
  });

  it("ref callback with null clears contentEl", () => {
    const { api, machine } = makeApi();
    (api.getContentProps().ref as (el: unknown) => void)(null);
    expect(machine.setContext).toHaveBeenCalledWith({ contentEl: null });
  });
});

// ---------------------------------------------------------------------------
// Navigation buttons
// ---------------------------------------------------------------------------

describe("connectDateRangePicker — navigation buttons", () => {
  it("getPrevMonthButtonProps sends NAVIGATE_PREV_MONTH on click", () => {
    const { api, send } = makeApi({ focusedDate: { year: 2024, month: 6, day: 1 } }, "open");
    api.getPrevMonthButtonProps().onClick();
    expect(send).toHaveBeenCalledWith("NAVIGATE_PREV_MONTH");
  });

  it("getPrevMonthButtonProps disabled when at min month", () => {
    const { api } = makeApi({
      focusedDate: { year: 2024, month: 3, day: 1 },
      min: { year: 2024, month: 3 },
    }, "open");
    const props = api.getPrevMonthButtonProps();
    expect(props.disabled).toBeTruthy();
    expect(props["aria-disabled"]).toBeTruthy();
  });

  it("getPrevMonthButtonProps click does nothing when at min", () => {
    const { api, send } = makeApi({
      focusedDate: { year: 2024, month: 3, day: 1 },
      min: { year: 2024, month: 3 },
    }, "open");
    api.getPrevMonthButtonProps().onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("getPrevMonthButtonProps click does nothing when disabled", () => {
    const { api, send } = makeApi({ disabled: true }, "open");
    api.getPrevMonthButtonProps().onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("getNextMonthButtonProps sends NAVIGATE_NEXT_MONTH on click", () => {
    const { api, send } = makeApi({ focusedDate: { year: 2024, month: 6, day: 1 } }, "open");
    api.getNextMonthButtonProps().onClick();
    expect(send).toHaveBeenCalledWith("NAVIGATE_NEXT_MONTH");
  });

  it("getNextMonthButtonProps disabled when at max month", () => {
    const { api } = makeApi({
      focusedDate: { year: 2024, month: 6, day: 1 },
      numberOfMonths: 2,
      max: { year: 2024, month: 7 },
    }, "open");
    const props = api.getNextMonthButtonProps();
    expect(props.disabled).toBeTruthy();
  });

  it("getNextMonthButtonProps click does nothing when at max", () => {
    const { api, send } = makeApi({
      focusedDate: { year: 2024, month: 6, day: 1 },
      numberOfMonths: 2,
      max: { year: 2024, month: 7 },
    }, "open");
    api.getNextMonthButtonProps().onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("getNextMonthButtonProps click does nothing when disabled", () => {
    const { api, send } = makeApi({ disabled: true }, "open");
    api.getNextMonthButtonProps().onClick();
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Calendar grid keyboard handler
// ---------------------------------------------------------------------------

describe("connectDateRangePicker — calendar grid keyboard", () => {
  function fireKey(api: ReturnType<typeof makeApi>["api"], key: string, extra: Partial<KeyboardEvent> = {}) {
    const event = { key, shiftKey: false, preventDefault: vi.fn(), ...extra } as unknown as KeyboardEvent;
    api.getCalendarGridProps().onKeyDown(event);
    return event;
  }

  it("ArrowLeft sends FOCUS_PREV_DAY", () => {
    const { api, send } = makeApi({}, "open");
    fireKey(api, "ArrowLeft");
    expect(send).toHaveBeenCalledWith("FOCUS_PREV_DAY");
  });

  it("ArrowRight sends FOCUS_NEXT_DAY", () => {
    const { api, send } = makeApi({}, "open");
    fireKey(api, "ArrowRight");
    expect(send).toHaveBeenCalledWith("FOCUS_NEXT_DAY");
  });

  it("ArrowUp sends FOCUS_PREV_WEEK", () => {
    const { api, send } = makeApi({}, "open");
    fireKey(api, "ArrowUp");
    expect(send).toHaveBeenCalledWith("FOCUS_PREV_WEEK");
  });

  it("ArrowDown sends FOCUS_NEXT_WEEK", () => {
    const { api, send } = makeApi({}, "open");
    fireKey(api, "ArrowDown");
    expect(send).toHaveBeenCalledWith("FOCUS_NEXT_WEEK");
  });

  it("PageUp sends FOCUS_PREV_MONTH", () => {
    const { api, send } = makeApi({}, "open");
    fireKey(api, "PageUp");
    expect(send).toHaveBeenCalledWith("FOCUS_PREV_MONTH");
  });

  it("PageDown sends FOCUS_NEXT_MONTH", () => {
    const { api, send } = makeApi({}, "open");
    fireKey(api, "PageDown");
    expect(send).toHaveBeenCalledWith("FOCUS_NEXT_MONTH");
  });

  it("Home sends FOCUS_WEEK_START", () => {
    const { api, send } = makeApi({}, "open");
    fireKey(api, "Home");
    expect(send).toHaveBeenCalledWith("FOCUS_WEEK_START");
  });

  it("End sends FOCUS_WEEK_END", () => {
    const { api, send } = makeApi({}, "open");
    fireKey(api, "End");
    expect(send).toHaveBeenCalledWith("FOCUS_WEEK_END");
  });

  it("Enter sends SELECT_DAY", () => {
    const { api, send } = makeApi({ focusedDate: JUNE15 }, "open");
    fireKey(api, "Enter");
    expect(send).toHaveBeenCalledWith({ type: "SELECT_DAY", date: JUNE15 });
  });

  it("Space sends SELECT_DAY", () => {
    const { api, send } = makeApi({ focusedDate: JUNE15 }, "open");
    fireKey(api, " ");
    expect(send).toHaveBeenCalledWith({ type: "SELECT_DAY", date: JUNE15 });
  });

  it("Enter does not send when readOnly", () => {
    const { api, send } = makeApi({ readOnly: true }, "open");
    fireKey(api, "Enter");
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Calendar row and weekday header
// ---------------------------------------------------------------------------

describe("connectDateRangePicker — calendar row and weekday header", () => {
  it("getCalendarRowProps has role=row", () => {
    const { api } = makeApi();
    expect(api.getCalendarRowProps(0).role).toBe("row");
  });

  it("getCalendarRowProps includes data-week", () => {
    const { api } = makeApi();
    expect(api.getCalendarRowProps(2)["data-week"]).toBe(2);
  });

  it("getWeekdayHeaderProps has role=columnheader", () => {
    const { api } = makeApi();
    expect(api.getWeekdayHeaderProps(0).role).toBe("columnheader");
  });

  it("getWeekdayHeaderProps has non-empty aria-label", () => {
    const { api } = makeApi();
    const props = api.getWeekdayHeaderProps(0);
    expect(props["aria-label"]).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Calendar cell — onFocus and onMouseLeave
// ---------------------------------------------------------------------------

describe("connectDateRangePicker — calendar cell additional events", () => {
  it("onFocus sends FOCUS_DAY", () => {
    const { api, send } = makeApi({}, "open");
    api.getCalendarCellProps(JUNE15).onFocus();
    expect(send).toHaveBeenCalledWith({ type: "FOCUS_DAY", date: JUNE15 });
  });

  it("onMouseEnter sends HOVER_DAY", () => {
    const { api, send } = makeApi({}, "open");
    api.getCalendarCellProps(JUNE15).onMouseEnter();
    expect(send).toHaveBeenCalledWith({ type: "HOVER_DAY", date: JUNE15 });
  });

  it("onMouseEnter does nothing when disabled", () => {
    const { api, send } = makeApi({ disabled: true }, "open");
    api.getCalendarCellProps(JUNE15).onMouseEnter();
    expect(send).not.toHaveBeenCalled();
  });

  it("onMouseLeave sends CLEAR_HOVER", () => {
    const { api, send } = makeApi({}, "open");
    api.getCalendarCellProps(JUNE15).onMouseLeave();
    expect(send).toHaveBeenCalledWith("CLEAR_HOVER");
  });
});

// ---------------------------------------------------------------------------
// Clear button
// ---------------------------------------------------------------------------

describe("connectDateRangePicker — clear button", () => {
  it("getClearButtonProps disabled when no dates selected", () => {
    const { api } = makeApi({ startDate: null, endDate: null });
    expect(api.getClearButtonProps().disabled).toBeTruthy();
  });

  it("getClearButtonProps enabled when startDate is set", () => {
    const { api } = makeApi({ startDate: JUNE15, endDate: null });
    expect(api.getClearButtonProps().disabled).toBeFalsy();
  });

  it("getClearButtonProps sends CLEAR on click", () => {
    const { api, send } = makeApi({ startDate: JUNE15, endDate: JUNE20 });
    api.getClearButtonProps().onClick();
    expect(send).toHaveBeenCalledWith("CLEAR");
  });

  it("getClearButtonProps does nothing when disabled", () => {
    const { api, send } = makeApi({ startDate: JUNE15, disabled: true });
    api.getClearButtonProps().onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("getClearButtonProps does nothing when readOnly", () => {
    const { api, send } = makeApi({ startDate: JUNE15, readOnly: true });
    api.getClearButtonProps().onClick();
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Hidden inputs
// ---------------------------------------------------------------------------

describe("connectDateRangePicker — hidden inputs", () => {
  it("getHiddenStartInputProps returns empty string when no startDate", () => {
    const { api } = makeApi({ startDate: null });
    expect(api.getHiddenStartInputProps("start").value).toBe("");
  });

  it("getHiddenStartInputProps returns ISO string when startDate is set", () => {
    const { api } = makeApi({ startDate: JUNE15 });
    expect(api.getHiddenStartInputProps("start").value).toBe("2024-06-15");
  });

  it("getHiddenEndInputProps returns empty string when no endDate", () => {
    const { api } = makeApi({ endDate: null });
    expect(api.getHiddenEndInputProps("end").value).toBe("");
  });

  it("getHiddenEndInputProps returns ISO string when endDate is set", () => {
    const { api } = makeApi({ endDate: JUNE20 });
    expect(api.getHiddenEndInputProps("end").value).toBe("2024-06-20");
  });

  it("getHiddenStartInputProps has type=hidden", () => {
    const { api } = makeApi();
    expect(api.getHiddenStartInputProps("start").type).toBe("hidden");
  });
});
