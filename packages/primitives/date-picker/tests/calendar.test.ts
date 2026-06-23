import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  compareDate,
  getDayOfWeek,
  getDaysInMonth,
  getCalendarWeeks,
  isDateDisabled,
  isSameDate,
  isSameMonth,
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
// getDayOfWeek — Tomohiko Sakamoto algorithm
// Verified against known dates
// ---------------------------------------------------------------------------

describe("getDayOfWeek", () => {
  // 2024-01-01 is a Monday (1)
  it("2024-01-01 is Monday (1)", () => expect(getDayOfWeek(2024, 1, 1)).toBe(1));
  // 2024-01-07 is a Sunday (0)
  it("2024-01-07 is Sunday (0)", () => expect(getDayOfWeek(2024, 1, 7)).toBe(0));
  // 2024-02-29 is a Thursday (4) — leap day
  it("2024-02-29 is Thursday (4)", () => expect(getDayOfWeek(2024, 2, 29)).toBe(4));
  // 2024-12-25 is a Wednesday (3)
  it("2024-12-25 is Wednesday (3)", () => expect(getDayOfWeek(2024, 12, 25)).toBe(3));
  // 1900-01-01 is a Monday (1)
  it("1900-01-01 is Monday (1)", () => expect(getDayOfWeek(1900, 1, 1)).toBe(1));
  // 2000-01-01 is a Saturday (6)
  it("2000-01-01 is Saturday (6)", () => expect(getDayOfWeek(2000, 1, 1)).toBe(6));
});

// ---------------------------------------------------------------------------
// addDays
// ---------------------------------------------------------------------------

describe("addDays", () => {
  it("adds 1 day within a month", () => {
    expect(addDays({ year: 2024, month: 1, day: 14 }, 1)).toEqual({ year: 2024, month: 1, day: 15 });
  });

  it("crosses month boundary forward", () => {
    expect(addDays({ year: 2024, month: 1, day: 31 }, 1)).toEqual({ year: 2024, month: 2, day: 1 });
  });

  it("crosses year boundary forward", () => {
    expect(addDays({ year: 2024, month: 12, day: 31 }, 1)).toEqual({ year: 2025, month: 1, day: 1 });
  });

  it("subtracts 1 day within a month", () => {
    expect(addDays({ year: 2024, month: 1, day: 15 }, -1)).toEqual({ year: 2024, month: 1, day: 14 });
  });

  it("crosses month boundary backward", () => {
    expect(addDays({ year: 2024, month: 2, day: 1 }, -1)).toEqual({ year: 2024, month: 1, day: 31 });
  });

  it("crosses year boundary backward", () => {
    expect(addDays({ year: 2025, month: 1, day: 1 }, -1)).toEqual({ year: 2024, month: 12, day: 31 });
  });

  it("adds 0 days returns same date", () => {
    expect(addDays({ year: 2024, month: 6, day: 15 }, 0)).toEqual({ year: 2024, month: 6, day: 15 });
  });

  it("handles leap day addition (Feb 28 + 1 = Feb 29 in leap year)", () => {
    expect(addDays({ year: 2024, month: 2, day: 28 }, 1)).toEqual({ year: 2024, month: 2, day: 29 });
  });

  it("skips leap day in non-leap year (Feb 28 + 1 = Mar 1 in 2023)", () => {
    expect(addDays({ year: 2023, month: 2, day: 28 }, 1)).toEqual({ year: 2023, month: 3, day: 1 });
  });
});

// ---------------------------------------------------------------------------
// addMonths
// ---------------------------------------------------------------------------

describe("addMonths", () => {
  it("adds 1 month", () => {
    expect(addMonths({ year: 2024, month: 1, day: 15 }, 1)).toEqual({ year: 2024, month: 2, day: 15 });
  });

  it("crosses year boundary forward", () => {
    expect(addMonths({ year: 2024, month: 12, day: 1 }, 1)).toEqual({ year: 2025, month: 1, day: 1 });
  });

  it("subtracts 1 month", () => {
    expect(addMonths({ year: 2024, month: 3, day: 15 }, -1)).toEqual({ year: 2024, month: 2, day: 15 });
  });

  it("crosses year boundary backward", () => {
    expect(addMonths({ year: 2024, month: 1, day: 1 }, -1)).toEqual({ year: 2023, month: 12, day: 1 });
  });

  it("clamps day when shorter month (Jan 31 + 1 month = Feb 29 in leap year)", () => {
    expect(addMonths({ year: 2024, month: 1, day: 31 }, 1)).toEqual({ year: 2024, month: 2, day: 29 });
  });

  it("clamps day when shorter month (Jan 31 + 1 month = Feb 28 in non-leap)", () => {
    expect(addMonths({ year: 2023, month: 1, day: 31 }, 1)).toEqual({ year: 2023, month: 2, day: 28 });
  });
});

// ---------------------------------------------------------------------------
// isSameDate, isSameMonth, compareDate
// ---------------------------------------------------------------------------

describe("isSameDate", () => {
  it("returns true for identical dates", () =>
    expect(isSameDate({ year: 2024, month: 6, day: 15 }, { year: 2024, month: 6, day: 15 })).toBe(true));
  it("returns false for different day", () =>
    expect(isSameDate({ year: 2024, month: 6, day: 15 }, { year: 2024, month: 6, day: 16 })).toBe(false));
  it("returns false for different month", () =>
    expect(isSameDate({ year: 2024, month: 6, day: 15 }, { year: 2024, month: 7, day: 15 })).toBe(false));
  it("returns false for different year", () =>
    expect(isSameDate({ year: 2024, month: 6, day: 15 }, { year: 2025, month: 6, day: 15 })).toBe(false));
});

describe("isSameMonth", () => {
  it("returns true when same year+month", () =>
    expect(isSameMonth({ year: 2024, month: 6, day: 1 }, { year: 2024, month: 6, day: 30 })).toBe(true));
  it("returns false when different month", () =>
    expect(isSameMonth({ year: 2024, month: 6, day: 1 }, { year: 2024, month: 7, day: 1 })).toBe(false));
});

describe("compareDate", () => {
  it("returns 0 for equal dates", () =>
    expect(compareDate({ year: 2024, month: 6, day: 15 }, { year: 2024, month: 6, day: 15 })).toBe(0));
  it("returns negative when a < b (different year)", () =>
    expect(compareDate({ year: 2023, month: 6, day: 15 }, { year: 2024, month: 6, day: 15 })).toBeLessThan(0));
  it("returns positive when a > b (different month)", () =>
    expect(compareDate({ year: 2024, month: 7, day: 15 }, { year: 2024, month: 6, day: 15 })).toBeGreaterThan(0));
  it("compares by day when year+month equal", () =>
    expect(compareDate({ year: 2024, month: 6, day: 16 }, { year: 2024, month: 6, day: 15 })).toBeGreaterThan(0));
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

  it("enabled on min boundary", () =>
    expect(isDateDisabled(june1, june1)).toBe(false));

  it("disabled when after max", () =>
    expect(isDateDisabled({ year: 2024, month: 7, day: 1 }, undefined, june30)).toBe(true));

  it("enabled on max boundary", () =>
    expect(isDateDisabled(june30, undefined, june30)).toBe(false));

  it("disabled by isDateUnavailable callback", () =>
    expect(isDateDisabled(june15, undefined, undefined, (d) => d.day === 15)).toBe(true));

  it("enabled when isDateUnavailable returns false", () =>
    expect(isDateDisabled(june15, undefined, undefined, (d) => d.day === 16)).toBe(false));
});

// ---------------------------------------------------------------------------
// getCalendarWeeks
// ---------------------------------------------------------------------------

describe("getCalendarWeeks", () => {
  it("June 2024 starts on Saturday (6) with Sunday-first calendar", () => {
    const weeks = getCalendarWeeks(2024, 6, 0);
    // June 1, 2024 is a Saturday (6). With Sunday=0 as first day, there are 6 nulls before June 1.
    expect(weeks[0][0]).toBeNull();
    expect(weeks[0][5]).toBeNull();
    expect(weeks[0][6]).toEqual({ year: 2024, month: 6, day: 1 });
  });

  it("June 2024: last week ends on June 30", () => {
    const weeks = getCalendarWeeks(2024, 6, 0);
    const allCells = weeks.flat();
    const lastNonNull = allCells.filter(Boolean).at(-1);
    expect(lastNonNull).toEqual({ year: 2024, month: 6, day: 30 });
  });

  it("total days in month matches non-null cells", () => {
    const weeks = getCalendarWeeks(2024, 2, 0); // February 2024 = 29 days
    const count = weeks.flat().filter(Boolean).length;
    expect(count).toBe(29);
  });

  it("each row has exactly 7 cells", () => {
    const weeks = getCalendarWeeks(2024, 6, 0);
    for (const week of weeks) expect(week).toHaveLength(7);
  });

  it("Monday-first (firstDayOfWeek=1): June 2024 starts on row[0][5] (Saturday)", () => {
    // June 1, 2024 is Saturday. Monday=first → index in week = (6-1+7)%7 = 5
    const weeks = getCalendarWeeks(2024, 6, 1);
    expect(weeks[0][5]).toEqual({ year: 2024, month: 6, day: 1 });
  });

  it("returns 4 weeks for a month that fits in 4 rows", () => {
    // February 2015: starts on Sunday (0), 28 days → exactly 4 rows
    const weeks = getCalendarWeeks(2015, 2, 0);
    expect(weeks).toHaveLength(4);
  });

  it("returns 6 weeks for months that span 6 rows", () => {
    // June 2024: starts on Saturday (6), 30 days → 6 padding + 30 days = 36 → pads to 42 → 6 rows
    const weeks = getCalendarWeeks(2024, 6, 0);
    expect(weeks).toHaveLength(6);
  });
});
