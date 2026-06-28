import type {
  CalendarCell,
  CalendarDate,
  DatePreset,
  MonthInfo,
  WeekdayHeader,
} from "./calendar.js";

export type { CalendarCell, CalendarDate, DatePreset, MonthInfo, WeekdayHeader };

export interface DatePickerContext {
  id: string;
  value: CalendarDate | null;
  focusedDate: CalendarDate;
  /**
   * SSR-safe "today". Always provide this from the server for hydration
   * safety (server TZ may differ from browser TZ). Defaults to
   * todayAsCalendarDate() at machine construction time when not provided.
   */
  today: CalendarDate;
  locale: string;
  /** Any value 0–6. Not restricted to 0|1|6 — covers all locale conventions. */
  firstDayOfWeek: number;
  numberOfMonths: number;
  disabled: boolean;
  readOnly: boolean;
  min?: CalendarDate;
  max?: CalendarDate;
  isDateUnavailable?: (date: CalendarDate) => boolean;
  disabledWeekdays?: number[];
  presets?: DatePreset[];
  onValueChange?: (date: CalendarDate | null) => void;
  onOpenChange?: (open: boolean) => void;
  /** First year displayed in year picker grid (page-based) */
  yearGridStart: number;
  contentEl: HTMLElement | null;
  triggerEl: HTMLElement | null;
}

export interface CreateDatePickerOptions {
  id?: string;
  value?: CalendarDate;
  defaultValue?: CalendarDate;
  /**
   * Pass `today` from the server for SSR safety.
   * Example (Nuxt): `today: useNuxtApp().$today` or compute server-side.
   */
  today?: CalendarDate;
  locale?: string;
  firstDayOfWeek?: number;
  numberOfMonths?: number;
  disabled?: boolean;
  readOnly?: boolean;
  min?: CalendarDate;
  max?: CalendarDate;
  isDateUnavailable?: (date: CalendarDate) => boolean;
  disabledWeekdays?: number[];
  presets?: DatePreset[];
  onValueChange?: (date: CalendarDate | null) => void;
  onOpenChange?: (open: boolean) => void;
}

/** Four flat states. Tags ["open"] on all three open variants. */
export type DatePickerState = "closed" | "open.day" | "open.month" | "open.year";

export type DatePickerEvent =
  // Open / close
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "TOGGLE" }
  | { type: "ESCAPE_KEY" }
  | { type: "INTERACT_OUTSIDE" }
  // View switching (month/year pickers)
  | { type: "VIEW_MONTHS" }
  | { type: "VIEW_YEARS" }
  | { type: "VIEW_DAYS" }
  // Selection
  | { type: "SELECT_DAY"; date: CalendarDate }
  | { type: "SELECT_FOCUSED" }
  | { type: "SELECT_MONTH"; month: number }
  | { type: "SELECT_YEAR"; year: number }
  // Calendar navigation (header buttons)
  | { type: "NAVIGATE_PREV_MONTH" }
  | { type: "NAVIGATE_NEXT_MONTH" }
  | { type: "NAVIGATE_TO_MONTH"; year: number; month: number }
  | { type: "NAVIGATE_PREV_YEAR_RANGE" }
  | { type: "NAVIGATE_NEXT_YEAR_RANGE" }
  // Keyboard focus movement in day grid (Arrow keys etc.)
  | { type: "FOCUS_DAY"; date: CalendarDate }
  | { type: "FOCUS_PREV_DAY" }
  | { type: "FOCUS_NEXT_DAY" }
  | { type: "FOCUS_PREV_WEEK" }
  | { type: "FOCUS_NEXT_WEEK" }
  | { type: "FOCUS_PREV_MONTH" }
  | { type: "FOCUS_NEXT_MONTH" }
  | { type: "FOCUS_PREV_YEAR" }
  | { type: "FOCUS_NEXT_YEAR" }
  | { type: "FOCUS_WEEK_START" }
  | { type: "FOCUS_WEEK_END" }
  // Preset selection
  | { type: "SELECT_PRESET"; date: CalendarDate }
  // Controlled / internal
  | { type: "SET_VALUE"; date?: CalendarDate }
  | { type: "SET_CONTENT_EL"; el: HTMLElement | null }
  | { type: "SET_TRIGGER_EL"; el: HTMLElement | null };
