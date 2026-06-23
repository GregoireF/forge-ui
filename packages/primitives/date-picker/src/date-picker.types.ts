import type { CalendarDate } from "./calendar.js";

export type { CalendarDate };

export interface DatePickerContext {
  id: string;
  value: CalendarDate | null;
  focusedDate: CalendarDate;
  locale: string;
  firstDayOfWeek: 0 | 1 | 6;
  disabled: boolean;
  readOnly: boolean;
  min?: CalendarDate;
  max?: CalendarDate;
  isDateUnavailable?: (date: CalendarDate) => boolean;
  onValueChange?: (date: CalendarDate | null) => void;
  onOpenChange?: (open: boolean) => void;
  // Internal DOM refs (set by framework layer via ref callbacks)
  contentEl: HTMLElement | null;
  triggerEl: HTMLElement | null;
}

export interface CreateDatePickerOptions {
  id?: string;
  value?: CalendarDate;
  defaultValue?: CalendarDate;
  locale?: string;
  firstDayOfWeek?: 0 | 1 | 6;
  disabled?: boolean;
  readOnly?: boolean;
  min?: CalendarDate;
  max?: CalendarDate;
  isDateUnavailable?: (date: CalendarDate) => boolean;
  onValueChange?: (date: CalendarDate | null) => void;
  onOpenChange?: (open: boolean) => void;
}

export type DatePickerState = "closed" | "open";

export type DatePickerEvent =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "TOGGLE" }
  | { type: "ESCAPE_KEY" }
  | { type: "INTERACT_OUTSIDE" }
  | { type: "SELECT_DAY"; date: CalendarDate }
  | { type: "SELECT_FOCUSED" }
  | { type: "NAVIGATE_PREV_MONTH" }
  | { type: "NAVIGATE_NEXT_MONTH" }
  | { type: "NAVIGATE_TO_MONTH"; year: number; month: number }
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
  | { type: "SET_VALUE"; date?: CalendarDate }
  | { type: "SET_CONTENT_EL"; el: HTMLElement | null }
  | { type: "SET_TRIGGER_EL"; el: HTMLElement | null };
