import { describe, expect, it, vi } from "vitest";
import { connectDateRangePicker } from "../src/date-range-picker.connect.js";
import type {
  DateRangePickerContext,
  DateRangePickerEvent,
  DateRangePickerState,
} from "../src/date-range-picker.types.js";
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
  const machine = { setContext: vi.fn() };
  const snapshot = {
    value: state,
    context: ctx,
    matches: (s: string) => s === state,
    tags: state === "open" ? ["open"] : ["closed"],
    hasTag: (t: string) => (state === "open" ? t === "open" : t === "closed"),
  };
  const api = connectDateRangePicker(snapshot as any, send, machine as any);
  return { api, send };
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
});
