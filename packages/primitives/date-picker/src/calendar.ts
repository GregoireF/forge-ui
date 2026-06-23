/**
 * Pure calendar math utilities — no Date() in computation paths.
 *
 * WHY no `new Date()` for core logic:
 * `new Date(year, month, day)` uses the LOCAL timezone of the runtime.
 * In SSR (Node), the server timezone may differ from the browser timezone,
 * producing different `getDay()` / `getDate()` results and causing Vue
 * hydration mismatches. All calendar arithmetic here is timezone-free.
 * `new Date()` is only used in formatting helpers (Intl.DateTimeFormat)
 * where the timezone difference has no effect on the displayed calendar grid.
 */

export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function getDaysInMonth(year: number, month: number): number {
  const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return DAYS[month - 1];
}

/**
 * Tomohiko Sakamoto's algorithm for day-of-week — fully timezone-free.
 * Returns 0=Sunday, 1=Monday, ..., 6=Saturday.
 */
export function getDayOfWeek(year: number, month: number, day: number): number {
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4] as const;
  let y = year;
  if (month < 3) y--;
  return (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + t[month - 1] + day) % 7;
}

export function addMonths(date: CalendarDate, delta: number): CalendarDate {
  let { year, month, day } = date;
  month += delta;
  while (month > 12) { month -= 12; year++; }
  while (month < 1) { month += 12; year--; }
  return { year, month, day: Math.min(day, getDaysInMonth(year, month)) };
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

export function isDateDisabled(
  date: CalendarDate,
  min?: CalendarDate,
  max?: CalendarDate,
  isDateUnavailable?: (date: CalendarDate) => boolean,
): boolean {
  if (min && compareDate(date, min) < 0) return true;
  if (max && compareDate(date, max) > 0) return true;
  return isDateUnavailable ? isDateUnavailable(date) : false;
}

/**
 * Returns the calendar grid for a given month as an array of weeks.
 * Each week is an array of 7 entries: CalendarDate for in-month days, null
 * for padding cells before the first and after the last day of the month.
 */
export function getCalendarWeeks(
  year: number,
  month: number,
  firstDayOfWeek: 0 | 1 | 6 = 0,
): (CalendarDate | null)[][] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getDayOfWeek(year, month, 1);
  const leadingNulls = (firstDayIndex - firstDayOfWeek + 7) % 7;

  const cells: (CalendarDate | null)[] = [
    ...Array<null>(leadingNulls).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => ({ year, month, day: i + 1 })),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (CalendarDate | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

/**
 * Returns day-of-week headers ordered by firstDayOfWeek.
 * Each entry: { index: 0-6 (Sun=0), short: "Mon", long: "Monday", narrow: "M" }
 */
export function getWeekdayHeaders(
  firstDayOfWeek: 0 | 1 | 6 = 0,
  locale = "en",
): { index: number; short: string; long: string; narrow: string }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const dayIndex = (firstDayOfWeek + i) % 7;
    // 2024-01-07 is a known Sunday (index 0)
    const date = new Date(2024, 0, 7 + dayIndex);
    return {
      index: dayIndex,
      short: new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date),
      long: new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date),
      narrow: new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(date),
    };
  });
}

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

export function todayAsCalendarDate(): CalendarDate {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}
