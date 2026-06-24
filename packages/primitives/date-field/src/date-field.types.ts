import type { CalendarDate } from "@forge-ui/date-picker";

export type { CalendarDate };

export type DateSegmentType = "day" | "month" | "year";

export interface DateFieldContext {
  id: string;
  /** Individual segment values — null = empty/placeholder */
  dayValue: number | null;
  monthValue: number | null;
  yearValue: number | null;
  /** Which segment has focus */
  focusedSegment: DateSegmentType | null;
  /** Accumulated typed digits for the focused segment */
  typingBuffer: string;
  locale: string;
  disabled: boolean;
  readOnly: boolean;
  min?: CalendarDate;
  max?: CalendarDate;
  isDateUnavailable?: (date: CalendarDate) => boolean;
  onValueChange?: (date: CalendarDate | null) => void;
}

export interface CreateDateFieldOptions {
  id?: string;
  value?: CalendarDate;
  defaultValue?: CalendarDate;
  locale?: string;
  disabled?: boolean;
  readOnly?: boolean;
  min?: CalendarDate;
  max?: CalendarDate;
  isDateUnavailable?: (date: CalendarDate) => boolean;
  onValueChange?: (date: CalendarDate | null) => void;
}

export type DateFieldState = "idle";

export type DateFieldEvent =
  | { type: "FOCUS_SEGMENT"; segment: DateSegmentType }
  | { type: "BLUR_SEGMENT" }
  | { type: "TYPE_DIGIT"; digit: string }
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "CLEAR_SEGMENT" }
  | { type: "SET_VALUE"; date: CalendarDate | null }
  | { type: "NEXT_SEGMENT" }
  | { type: "PREV_SEGMENT" };
