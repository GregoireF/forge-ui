import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  addYears,
  compareDate,
  formatDateLabel,
  formatDateMedium,
  formatMonthYear,
  getDayOfWeek,
  getDaysInMonth,
  getCalendarWeeks,
  getMonthsOfYear,
  getTodayLabel,
  getWeekdayHeaders,
  getYearGridStart,
  getYearRange,
  isBetween,
  isDateDisabled,
  isSameDate,
  isSameMonth,
  isWeekend,
} from "../src/calendar.js";

// ---------------------------------------------------------------------------
// getDaysInMonth
// ---------------------------------------------------------------------------

describe("getDaysInMonth", () => {
  it("January has 31 days", () => expect(getDaysInMonth(2024, 1)).toBe(31));
  it("February has 28 days in non-leap year", () => expect(getDaysInMonth(2023, 2)).toBe(28));
  it("February has 29 days in leap year (2024)", () => expect(getDaysInMonth(2024, 2)).toBe(29));
  it("2000 is a leap year (div 400)", () => expect(getDaysInMonth(2000, 2)).toBe(29));
  it("1900 is NOT a leap year (div 100, not 400)", () => expect(getDaysInMonth(1900, 2)).toBe(28));
  it("April has 30 days", () => expect(getDaysInMonth(2024, 4)).toBe(30));
  it("December has 31 days", () => expect(getDaysInMonth(2024, 12)).toBe(31));
});

// ---------------------------------------------------------------------------
// getDayOfWeek — Tomohiko Sakamoto algorithm (verified against known dates)
// ---------------------------------------------------------------------------

describe("getDayOfWeek", () => {
  it("2024-01-01 is Monday (1)", () => expect(getDayOfWeek(2024, 1, 1)).toBe(1));
  it("2024-01-07 is Sunday (0)", () => expect(getDayOfWeek(2024, 1, 7)).toBe(0));
  it("2024-02-29 is Thursday (4) — leap day", () => expect(getDayOfWeek(2024, 2, 29)).toBe(4));
  it("2024-12-25 is Wednesday (3)", () => expect(getDayOfWeek(2024, 12, 25)).toBe(3));
  it("1900-01-01 is Monday (1)", () => expect(getDayOfWeek(1900, 1, 1)).toBe(1));
  it("2000-01-01 is Saturday (6)", () => expect(getDayOfWeek(2000, 1, 1)).toBe(6));
  it("2024-06-15 is Saturday (6)", () => expect(getDayOfWeek(2024, 6, 15)).toBe(6));
});

// ---------------------------------------------------------------------------
// addDays
// ---------------------------------------------------------------------------

describe("addDays", () => {
  it("adds 1 day within a month", () =>
    expect(addDays({ year: 2024, month: 1, day: 14 }, 1)).toEqual({ year: 2024, month: 1, day: 15 }));
  it("crosses month boundary forward", () =>
    expect(addDays({ year: 2024, month: 1, day: 31 }, 1)).toEqual({ year: 2024, month: 2, day: 1 }));
  it("crosses year boundary forward", () =>
    expect(addDays({ year: 2024, month: 12, day: 31 }, 1)).toEqual({ year: 2025, month: 1, day: 1 }));
  it("subtracts 1 day within a month", () =>
    expect(addDays({ year: 2024, month: 1, day: 15 }, -1)).toEqual({ year: 2024, month: 1, day: 14 }));
  it("crosses month boundary backward", () =>
    expect(addDays({ year: 2024, month: 2, day: 1 }, -1)).toEqual({ year: 2024, month: 1, day: 31 }));
  it("crosses year boundary backward", () =>
    expect(addDays({ year: 2025, month: 1, day: 1 }, -1)).toEqual({ year: 2024, month: 12, day: 31 }));
  it("adds 0 days returns same date", () =>
    expect(addDays({ year: 2024, month: 6, day: 15 }, 0)).toEqual({ year: 2024, month: 6, day: 15 }));
  it("handles leap day addition (Feb 28 + 1 = Feb 29 in leap year)", () =>
    expect(addDays({ year: 2024, month: 2, day: 28 }, 1)).toEqual({ year: 2024, month: 2, day: 29 }));
  it("skips leap day in non-leap year (Feb 28 + 1 = Mar 1 in 2023)", () =>
    expect(addDays({ year: 2023, month: 2, day: 28 }, 1)).toEqual({ year: 2023, month: 3, day: 1 }));
});

// ---------------------------------------------------------------------------
// addMonths
// ---------------------------------------------------------------------------

describe("addMonths", () => {
  it("adds 1 month", () =>
    expect(addMonths({ year: 2024, month: 1, day: 15 }, 1)).toEqual({ year: 2024, month: 2, day: 15 }));
  it("crosses year boundary forward", () =>
    expect(addMonths({ year: 2024, month: 12, day: 1 }, 1)).toEqual({ year: 2025, month: 1, day: 1 }));
  it("subtracts 1 month", () =>
    expect(addMonths({ year: 2024, month: 3, day: 15 }, -1)).toEqual({ year: 2024, month: 2, day: 15 }));
  it("crosses year boundary backward", () =>
    expect(addMonths({ year: 2024, month: 1, day: 1 }, -1)).toEqual({ year: 2023, month: 12, day: 1 }));
  it("clamps day when shorter month (Jan 31 + 1 month = Feb 29 in leap year)", () =>
    expect(addMonths({ year: 2024, month: 1, day: 31 }, 1)).toEqual({ year: 2024, month: 2, day: 29 }));
  it("clamps day when shorter month (Jan 31 + 1 month = Feb 28 in non-leap)", () =>
    expect(addMonths({ year: 2023, month: 1, day: 31 }, 1)).toEqual({ year: 2023, month: 2, day: 28 }));
});

// ---------------------------------------------------------------------------
// addYears
// ---------------------------------------------------------------------------

describe("addYears", () => {
  it("adds 1 year", () =>
    expect(addYears({ year: 2024, month: 6, day: 15 }, 1)).toEqual({ year: 2025, month: 6, day: 15 }));
  it("subtracts 1 year", () =>
    expect(addYears({ year: 2024, month: 6, day: 15 }, -1)).toEqual({ year: 2023, month: 6, day: 15 }));
  it("clamps Feb 29 to Feb 28 in non-leap year", () =>
    expect(addYears({ year: 2024, month: 2, day: 29 }, 1)).toEqual({ year: 2025, month: 2, day: 28 }));
});

// ---------------------------------------------------------------------------
// isSameDate, isSameMonth, compareDate, isBetween
// ---------------------------------------------------------------------------

describe("isSameDate", () => {
  it("true for identical dates", () =>
    expect(isSameDate({ year: 2024, month: 6, day: 15 }, { year: 2024, month: 6, day: 15 })).toBe(true));
  it("false for different day", () =>
    expect(isSameDate({ year: 2024, month: 6, day: 15 }, { year: 2024, month: 6, day: 16 })).toBe(false));
  it("false for different month", () =>
    expect(isSameDate({ year: 2024, month: 6, day: 15 }, { year: 2024, month: 7, day: 15 })).toBe(false));
  it("false for different year", () =>
    expect(isSameDate({ year: 2024, month: 6, day: 15 }, { year: 2025, month: 6, day: 15 })).toBe(false));
});

describe("isSameMonth", () => {
  it("true when same year+month", () =>
    expect(isSameMonth({ year: 2024, month: 6, day: 1 }, { year: 2024, month: 6, day: 30 })).toBe(true));
  it("false when different month", () =>
    expect(isSameMonth({ year: 2024, month: 6, day: 1 }, { year: 2024, month: 7, day: 1 })).toBe(false));
});

describe("compareDate", () => {
  it("returns 0 for equal dates", () =>
    expect(compareDate({ year: 2024, month: 6, day: 15 }, { year: 2024, month: 6, day: 15 })).toBe(0));
  it("returns negative when a < b", () =>
    expect(compareDate({ year: 2023, month: 6, day: 15 }, { year: 2024, month: 6, day: 15 })).toBeLessThan(0));
  it("returns positive when a > b", () =>
    expect(compareDate({ year: 2024, month: 7, day: 15 }, { year: 2024, month: 6, day: 15 })).toBeGreaterThan(0));
  it("compares by day when year+month equal", () =>
    expect(compareDate({ year: 2024, month: 6, day: 16 }, { year: 2024, month: 6, day: 15 })).toBeGreaterThan(0));
});

describe("isBetween", () => {
  const start = { year: 2024, month: 6, day: 10 };
  const end = { year: 2024, month: 6, day: 20 };
  it("true for date strictly between start and end", () =>
    expect(isBetween({ year: 2024, month: 6, day: 15 }, start, end)).toBe(true));
  it("false for start boundary (exclusive)", () =>
    expect(isBetween(start, start, end)).toBe(false));
  it("false for end boundary (exclusive)", () =>
    expect(isBetween(end, start, end)).toBe(false));
  it("false for date before range", () =>
    expect(isBetween({ year: 2024, month: 6, day: 1 }, start, end)).toBe(false));
});

// ---------------------------------------------------------------------------
// isWeekend
// ---------------------------------------------------------------------------

describe("isWeekend", () => {
  it("Saturday (6) is a weekend", () =>
    expect(isWeekend({ year: 2024, month: 6, day: 15 })).toBe(true));
  it("Sunday (0) is a weekend", () =>
    expect(isWeekend({ year: 2024, month: 6, day: 16 })).toBe(true));
  it("Monday (1) is not a weekend", () =>
    expect(isWeekend({ year: 2024, month: 6, day: 17 })).toBe(false));
  it("custom weekendDays=[5,6] includes Friday", () =>
    expect(isWeekend({ year: 2024, month: 6, day: 14 }, [5, 6])).toBe(true));
});

// ---------------------------------------------------------------------------
// isDateDisabled
// ---------------------------------------------------------------------------

describe("isDateDisabled", () => {
  const june15 = { year: 2024, month: 6, day: 15 };
  const june1 = { year: 2024, month: 6, day: 1 };
  const june30 = { year: 2024, month: 6, day: 30 };

  it("returns false when no constraints", () => expect(isDateDisabled(june15)).toBe(false));
  it("disabled when before min", () =>
    expect(isDateDisabled({ year: 2024, month: 5, day: 31 }, june1)).toBe(true));
  it("enabled on min boundary", () => expect(isDateDisabled(june1, june1)).toBe(false));
  it("disabled when after max", () =>
    expect(isDateDisabled({ year: 2024, month: 7, day: 1 }, undefined, june30)).toBe(true));
  it("enabled on max boundary", () => expect(isDateDisabled(june30, undefined, june30)).toBe(false));
  it("disabled by isDateUnavailable callback", () =>
    expect(isDateDisabled(june15, undefined, undefined, (d) => d.day === 15)).toBe(true));
  it("enabled when isDateUnavailable returns false", () =>
    expect(isDateDisabled(june15, undefined, undefined, (d) => d.day === 16)).toBe(false));

  describe("disabledWeekdays", () => {
    it("disables Saturday (6) when in disabledWeekdays", () =>
      // june15 is Saturday
      expect(isDateDisabled(june15, undefined, undefined, undefined, [6])).toBe(true));
    it("enables Saturday when 6 not in disabledWeekdays", () =>
      expect(isDateDisabled(june15, undefined, undefined, undefined, [0, 1])).toBe(false));
    it("disables Sunday (0) — june16 is Sunday", () =>
      expect(isDateDisabled({ year: 2024, month: 6, day: 16 }, undefined, undefined, undefined, [0])).toBe(true));
    it("empty disabledWeekdays array disables nothing", () =>
      expect(isDateDisabled(june15, undefined, undefined, undefined, [])).toBe(false));
  });
});

// ---------------------------------------------------------------------------
// getCalendarWeeks — CalendarCell[][] (no nulls, isOutsideMonth for padding)
// ---------------------------------------------------------------------------

describe("getCalendarWeeks", () => {
  it("each row has exactly 7 cells", () => {
    for (const week of getCalendarWeeks(2024, 6, 0)) expect(week).toHaveLength(7);
  });

  it("June 2024, Sunday-first: first cell is outside month (May 26)", () => {
    const weeks = getCalendarWeeks(2024, 6, 0);
    // June 1 is Saturday (6). With Sunday=first, 6 leading cells → May 26..31
    expect(weeks[0][0].isOutsideMonth).toBe(true);
    expect(weeks[0][0].date).toEqual({ year: 2024, month: 5, day: 26 });
  });

  it("June 2024, Sunday-first: 6th cell is outside month (May 31)", () => {
    const weeks = getCalendarWeeks(2024, 6, 0);
    expect(weeks[0][5].isOutsideMonth).toBe(true);
    expect(weeks[0][5].date).toEqual({ year: 2024, month: 5, day: 31 });
  });

  it("June 2024, Sunday-first: 7th cell is June 1 (in-month)", () => {
    const weeks = getCalendarWeeks(2024, 6, 0);
    expect(weeks[0][6].isOutsideMonth).toBe(false);
    expect(weeks[0][6].date).toEqual({ year: 2024, month: 6, day: 1 });
  });

  it("June 2024: last in-month cell is June 30", () => {
    const weeks = getCalendarWeeks(2024, 6, 0);
    const lastInMonth = weeks.flat().filter((c) => !c.isOutsideMonth).at(-1);
    expect(lastInMonth?.date).toEqual({ year: 2024, month: 6, day: 30 });
  });

  it("June 2024: trailing cells come from July", () => {
    const weeks = getCalendarWeeks(2024, 6, 0);
    const trailing = weeks.flat().filter((c) => c.isOutsideMonth && c.date.month === 7);
    expect(trailing.length).toBeGreaterThan(0);
    expect(trailing[0]?.date).toEqual({ year: 2024, month: 7, day: 1 });
  });

  it("total in-month cells equals daysInMonth (June = 30)", () => {
    const count = getCalendarWeeks(2024, 6, 0).flat().filter((c) => !c.isOutsideMonth).length;
    expect(count).toBe(30);
  });

  it("total in-month cells for February 2024 = 29 (leap year)", () => {
    const count = getCalendarWeeks(2024, 2, 0).flat().filter((c) => !c.isOutsideMonth).length;
    expect(count).toBe(29);
  });

  it("Monday-first (firstDayOfWeek=1): June 1 is at index 5 (Saturday)", () => {
    const weeks = getCalendarWeeks(2024, 6, 1);
    // June 1 = Saturday. Mon-first → (6-1+7)%7 = 5
    expect(weeks[0][5].isOutsideMonth).toBe(false);
    expect(weeks[0][5].date).toEqual({ year: 2024, month: 6, day: 1 });
  });

  it("returns 4 weeks for a month that fits exactly (Feb 2015, Sunday-first)", () => {
    // Feb 2015 starts on Sunday (0), 28 days → 28/7 = 4 rows, no leading/trailing
    const weeks = getCalendarWeeks(2015, 2, 0);
    expect(weeks).toHaveLength(4);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });

  it("returns 6 weeks for months spanning 6 rows (June 2024, Sunday-first)", () => {
    const weeks = getCalendarWeeks(2024, 6, 0);
    expect(weeks).toHaveLength(6);
  });

  it("January 2023, Sunday-first: starts on Sunday (no leading cells)", () => {
    // Jan 1 2023 = Sunday (0). Sunday-first → leadingCount = 0.
    const weeks = getCalendarWeeks(2023, 1, 0);
    expect(weeks[0][0].isOutsideMonth).toBe(false);
    expect(weeks[0][0].date).toEqual({ year: 2023, month: 1, day: 1 });
  });
});

// ---------------------------------------------------------------------------
// getMonthsOfYear
// ---------------------------------------------------------------------------

describe("getMonthsOfYear", () => {
  it("returns 12 entries", () => expect(getMonthsOfYear()).toHaveLength(12));
  it("first entry is January (month=1)", () => expect(getMonthsOfYear()[0]?.month).toBe(1));
  it("last entry is December (month=12)", () => expect(getMonthsOfYear()[11]?.month).toBe(12));
  it("January label in English", () => expect(getMonthsOfYear("en")[0]?.label).toMatch(/january/i));
  it("shortLabel is shorter than label", () => {
    const months = getMonthsOfYear("en");
    expect(months[0]!.shortLabel.length).toBeLessThan(months[0]!.label.length);
  });
});

// ---------------------------------------------------------------------------
// getYearRange, getYearGridStart
// ---------------------------------------------------------------------------

describe("getYearRange", () => {
  it("returns 12 years by default", () => expect(getYearRange(2020)).toHaveLength(12));
  it("starts at startYear", () => expect(getYearRange(2020)[0]).toBe(2020));
  it("ends at startYear + size - 1", () => expect(getYearRange(2020).at(-1)).toBe(2031));
  it("custom size=5 returns 5 years", () => expect(getYearRange(2020, 5)).toHaveLength(5));
});

describe("getYearGridStart", () => {
  it("2024 → start of 12-year block 2024 (2024 / 12 = 168.67 → floor = 168 → 2016)", () => {
    // Math.floor(2024 / 12) * 12 = 168 * 12 = 2016
    expect(getYearGridStart(2024)).toBe(2016);
  });
  it("2000 → 1992 (Math.floor(2000/12)*12 = 166*12 = 1992)", () => {
    expect(getYearGridStart(2000)).toBe(Math.floor(2000 / 12) * 12);
  });
  it("year at exact boundary starts new page", () => {
    const start = getYearGridStart(2016);
    expect(getYearRange(start)[0]).toBe(start);
    expect(getYearRange(start)).toContain(2016);
  });
});

// ---------------------------------------------------------------------------
// getWeekdayHeaders
// ---------------------------------------------------------------------------

describe("getWeekdayHeaders", () => {
  it("returns 7 entries", () => expect(getWeekdayHeaders()).toHaveLength(7));
  it("Sunday-first: first index is 0 (Sunday)", () => expect(getWeekdayHeaders(0)[0]?.index).toBe(0));
  it("Monday-first: first index is 1 (Monday)", () => expect(getWeekdayHeaders(1)[0]?.index).toBe(1));
  it("each entry has short, long, narrow fields", () => {
    const h = getWeekdayHeaders(0, "en")[0]!;
    expect(h.short).toBeTruthy();
    expect(h.long).toBeTruthy();
    expect(h.narrow).toBeTruthy();
  });
  it("Sunday long name matches", () => {
    expect(getWeekdayHeaders(0, "en")[0]?.long).toMatch(/sunday/i);
  });
});

// ---------------------------------------------------------------------------
// Formatting helpers (smoke tests — Intl.DateTimeFormat output is locale-dependent)
// ---------------------------------------------------------------------------

describe("formatMonthYear", () => {
  it("returns a non-empty string containing the year", () => {
    const s = formatMonthYear(2024, 6, "en");
    expect(s).toMatch(/2024/);
  });
  it("contains the month name", () => {
    expect(formatMonthYear(2024, 6, "en")).toMatch(/june/i);
  });
});

describe("formatDateMedium", () => {
  it("contains year and day", () => {
    const s = formatDateMedium({ year: 2024, month: 6, day: 15 }, "en");
    expect(s).toMatch(/2024/);
    expect(s).toMatch(/15/);
  });
});

describe("formatDateLabel", () => {
  it("contains weekday, month, and year", () => {
    const s = formatDateLabel({ year: 2024, month: 6, day: 15 }, "en");
    expect(s).toMatch(/2024/);
    expect(s).toMatch(/june/i);
    expect(s).toMatch(/saturday/i);
  });
});

describe("getTodayLabel", () => {
  it("returns a non-empty string", () => expect(getTodayLabel("en")).toBeTruthy());
  it("English returns 'today'", () => expect(getTodayLabel("en")).toBe("today"));
  it("returns non-empty string on unknown locale (runtime falls back to system locale)", () =>
    expect(getTodayLabel("xx-invalid")).toBeTruthy());
});
