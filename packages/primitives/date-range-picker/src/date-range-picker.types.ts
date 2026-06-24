import type { CalendarDate, DatePreset } from "@forge-ui/date-picker";

export type { CalendarDate, DatePreset };

export interface DateRange {
  start: CalendarDate | null;
  end: CalendarDate | null;
}

export interface DateRangePickerContext {
  id: string;
  startDate: CalendarDate | null;
  endDate: CalendarDate | null;
  /**
   * Which endpoint the next click will select.
   * "start" = user picks the range start
   * "end" = start is fixed, user picks the end
   */
  selectionPhase: "start" | "end";
  /** Hovered date for range preview while user is picking the end */
  hoveredDate: CalendarDate | null;
  focusedDate: CalendarDate;
  today: CalendarDate;
  locale: string;
  firstDayOfWeek: number;
  /** Number of calendar months visible simultaneously — default 2 for range pickers */
  numberOfMonths: number;
  disabled: boolean;
  readOnly: boolean;
  min?: CalendarDate;
  max?: CalendarDate;
  isDateUnavailable?: (date: CalendarDate) => boolean;
  disabledWeekdays?: number[];
  presets?: DatePreset[];
  onValueChange?: (range: DateRange) => void;
  onOpenChange?: (open: boolean) => void;
  contentEl: HTMLElement | null;
  triggerEl: HTMLElement | null;
}

export interface CreateDateRangePickerOptions {
  id?: string;
  value?: DateRange;
  defaultValue?: DateRange;
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
  onValueChange?: (range: DateRange) => void;
  onOpenChange?: (open: boolean) => void;
}

export type DateRangePickerState = "closed" | "open";

export type DateRangePickerEvent =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "TOGGLE" }
  | { type: "ESCAPE_KEY" }
  | { type: "INTERACT_OUTSIDE" }
  // Selection
  | { type: "SELECT_DAY"; date: CalendarDate }
  | { type: "HOVER_DAY"; date: CalendarDate }
  | { type: "CLEAR_HOVER" }
  | { type: "SELECT_PRESET"; range: DateRange }
  | { type: "CLEAR" }
  // Navigation
  | { type: "NAVIGATE_PREV_MONTH" }
  | { type: "NAVIGATE_NEXT_MONTH" }
  | { type: "NAVIGATE_TO_MONTH"; year: number; month: number }
  // Focus
  | { type: "FOCUS_DAY"; date: CalendarDate }
  | { type: "FOCUS_PREV_DAY" }
  | { type: "FOCUS_NEXT_DAY" }
  | { type: "FOCUS_PREV_WEEK" }
  | { type: "FOCUS_NEXT_WEEK" }
  | { type: "FOCUS_PREV_MONTH" }
  | { type: "FOCUS_NEXT_MONTH" }
  | { type: "FOCUS_WEEK_START" }
  | { type: "FOCUS_WEEK_END" }
  // Controlled / internal
  | { type: "SET_VALUE"; range?: DateRange }
  | { type: "SET_CONTENT_EL"; el: HTMLElement | null }
  | { type: "SET_TRIGGER_EL"; el: HTMLElement | null };
