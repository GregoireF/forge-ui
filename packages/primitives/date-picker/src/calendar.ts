/**
 * Pure calendar math utilities — timezone-free.
 *
 * WHY no `new Date()` for computation paths:
 * `new Date(year, month, day)` uses the LOCAL timezone of the runtime.
 * Server (Node UTC+0) vs browser (UTC+2) produce different `.getDay()` results
 * for dates near midnight → Vue/React hydration mismatches.
 * All arithmetic here is timezone-free. `new Date()` appears ONLY in
 * Intl.DateTimeFormat calls (formatting only — no arithmetic impact).
 *
 * WHY Tomohiko Sakamoto for day-of-week:
 * Zero-dependency, O(1), proven correct for any Gregorian date.
 * Unlike `new Date().getDay()`, it does not depend on timezone.
 */

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export interface CalendarDate {
  year: number;
  month: number; // 1-indexed (1=January)
  day: number;
}

/**
 * A cell in the rendered calendar grid.
 * `isOutsideMonth` is true for leading/trailing days from adjacent months.
 * These are exposed as real CalendarDate values (not null) so consumers can
 * render them styled differently — a common UX pattern competitors implement.
 */
export interface CalendarCell {
  date: CalendarDate;
  isOutsideMonth: boolean;
}

export interface DatePreset {
  label: string;
  /** Factory fn receives `today` so "Yesterday" always resolves correctly */
  getValue: (today: CalendarDate) => CalendarDate;
}

// ---------------------------------------------------------------------------
// Gregorian arithmetic
// ---------------------------------------------------------------------------

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function getDaysInMonth(year: number, month: number): number {
  const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return DAYS[month - 1] as number;
}

/**
 * Tomohiko Sakamoto's algorithm — fully timezone-free.
 * Returns 0=Sunday, 1=Monday, …, 6=Saturday.
 */
export function getDayOfWeek(year: number, month: number, day: number): number {
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4] as const;
  let y = year;
  if (month < 3) y--;
  return (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + t[month - 1] + day) % 7;
}

export function addDays(date: CalendarDate, delta: number): CalendarDate {
  let { year, month, day } = date;
  day += delta;
  while (day > getDaysInMonth(year, month)) {
    day -= getDaysInMonth(year, month);
    if (++month > 12) { month = 1; year++; }
  }
  while (day < 1) {
    if (--month < 1) { month = 12; year--; }
    day += getDaysInMonth(year, month);
  }
  return { year, month, day };
}

export function addMonths(date: CalendarDate, delta: number): CalendarDate {
  let { year, month, day } = date;
  month += delta;
  while (month > 12) { month -= 12; year++; }
  while (month < 1) { month += 12; year--; }
  return { year, month, day: Math.min(day, getDaysInMonth(year, month)) };
}

export function addYears(date: CalendarDate, delta: number): CalendarDate {
  return addMonths(date, delta * 12);
}

export function isSameDate(a: CalendarDate, b: CalendarDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function isSameMonth(a: CalendarDate, b: CalendarDate): boolean {
  return a.year === b.year && a.month === b.month;
}

export function compareDate(a: CalendarDate, b: CalendarDate): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

export function isBetween(date: CalendarDate, start: CalendarDate, end: CalendarDate): boolean {
  return compareDate(date, start) > 0 && compareDate(date, end) < 0;
}

export function isWeekend(date: CalendarDate, weekendDays: number[] = [0, 6]): boolean {
  return weekendDays.includes(getDayOfWeek(date.year, date.month, date.day));
}

// ---------------------------------------------------------------------------
// Date availability
// ---------------------------------------------------------------------------

export function isDateDisabled(
  date: CalendarDate,
  min?: CalendarDate,
  max?: CalendarDate,
  isDateUnavailable?: (date: CalendarDate) => boolean,
  disabledWeekdays?: number[],
): boolean {
  if (min && compareDate(date, min) < 0) return true;
  if (max && compareDate(date, max) > 0) return true;
  if (isDateUnavailable && isDateUnavailable(date)) return true;
  if (disabledWeekdays && disabledWeekdays.includes(getDayOfWeek(date.year, date.month, date.day))) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Calendar grid generation
//
// WHY CalendarCell instead of (CalendarDate | null):
// Returning real dates from adjacent months (with isOutsideMonth: true)
// lets consumers render faded leading/trailing days — a near-universal UX
// convention in date pickers (Airbnb, Google Calendar, iOS, etc.).
// Returning null forced consumers to render empty cells with no date info.
// ---------------------------------------------------------------------------

export function getCalendarWeeks(
  year: number,
  month: number,
  firstDayOfWeek = 0,
): CalendarCell[][] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getDayOfWeek(year, month, 1);
  const leadingCount = (firstDayIndex - firstDayOfWeek + 7) % 7;

  // Build leading cells from previous month
  const leading: CalendarCell[] = [];
  for (let i = leadingCount; i > 0; i--) {
    leading.push({ date: addDays({ year, month, day: 1 }, -i), isOutsideMonth: true });
  }

  // Current month days
  const current: CalendarCell[] = Array.from({ length: daysInMonth }, (_, i) => ({
    date: { year, month, day: i + 1 },
    isOutsideMonth: false,
  }));

  // Trailing cells to complete last week
  const totalSoFar = leading.length + current.length;
  const trailingCount = (7 - (totalSoFar % 7)) % 7;
  const lastDay = { year, month, day: daysInMonth };
  const trailing: CalendarCell[] = Array.from({ length: trailingCount }, (_, i) => ({
    date: addDays(lastDay, i + 1),
    isOutsideMonth: true,
  }));

  const cells = [...leading, ...current, ...trailing];
  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

// ---------------------------------------------------------------------------
// Month / Year display helpers
// ---------------------------------------------------------------------------

export interface MonthInfo {
  month: number; // 1-indexed
  label: string; // "January"
  shortLabel: string; // "Jan"
}

export function getMonthsOfYear(locale = "en"): MonthInfo[] {
  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const d = new Date(2024, i, 1);
    return {
      month: m,
      label: new Intl.DateTimeFormat(locale, { month: "long" }).format(d),
      shortLabel: new Intl.DateTimeFormat(locale, { month: "short" }).format(d),
    };
  });
}

/**
 * Returns a page of years for the year picker.
 * `size` years starting at `startYear`.
 * WHY startYear instead of centerYear: the year grid is page-based
 * (prev/next buttons shift the page), not re-centered on focus.
 * Zag.js and Mantine both use this page-based model.
 */
export function getYearRange(startYear: number, size = 12): number[] {
  return Array.from({ length: size }, (_, i) => startYear + i);
}

/** Compute the start of the year grid page for a given focusedYear */
export function getYearGridStart(focusedYear: number, size = 12): number {
  return Math.floor(focusedYear / size) * size;
}

// ---------------------------------------------------------------------------
// Weekday headers
// ---------------------------------------------------------------------------

export interface WeekdayHeader {
  index: number; // 0=Sun, 1=Mon, ..., 6=Sat
  short: string; // "Mon"
  long: string; // "Monday"
  narrow: string; // "M"
}

export function getWeekdayHeaders(firstDayOfWeek = 0, locale = "en"): WeekdayHeader[] {
  // 2024-01-07 is a known Sunday (index 0)
  return Array.from({ length: 7 }, (_, i) => {
    const dayIndex = (firstDayOfWeek + i) % 7;
    const date = new Date(2024, 0, 7 + dayIndex);
    return {
      index: dayIndex,
      short: new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date),
      long: new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date),
      narrow: new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(date),
    };
  });
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function formatMonthYear(year: number, month: number, locale = "en"): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1),
  );
}

export function formatDateLabel(date: CalendarDate, locale = "en"): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date.year, date.month - 1, date.day));
}

export function formatDateMedium(date: CalendarDate, locale = "en"): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(date.year, date.month - 1, date.day),
  );
}

/**
 * Locale-aware "today" string using RelativeTimeFormat.
 * "today" in en, "aujourd'hui" in fr, "今日" in ja, etc.
 */
export function getTodayLabel(locale = "en"): string {
  try {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(0, "day");
  } catch {
    return "today";
  }
}

export function todayAsCalendarDate(): CalendarDate {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}
