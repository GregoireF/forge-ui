export type TimeSegmentType = "hours" | "minutes" | "seconds" | "period";

export interface TimeValue {
  hours: number; // 0-23 (always 24h internally)
  minutes: number;
  seconds: number;
}

export interface TimePickerContext {
  id: string;
  hoursValue: number | null; // 0-23 internally
  minutesValue: number | null;
  secondsValue: number | null;
  /** "AM" | "PM" only meaningful when hourCycle=12 */
  period: "AM" | "PM";
  focusedSegment: TimeSegmentType | null;
  typingBuffer: string;
  /** 12 or 24 */
  hourCycle: 12 | 24;
  showSeconds: boolean;
  minuteStep: number;
  secondStep: number;
  locale: string;
  disabled: boolean;
  readOnly: boolean;
  onValueChange?: (time: TimeValue | null) => void;
}

export interface CreateTimePickerOptions {
  id?: string;
  value?: TimeValue;
  defaultValue?: TimeValue;
  hourCycle?: 12 | 24;
  showSeconds?: boolean;
  minuteStep?: number;
  secondStep?: number;
  locale?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onValueChange?: (time: TimeValue | null) => void;
}

export type TimePickerState = "idle";

export type TimePickerEvent =
  | { type: "FOCUS_SEGMENT"; segment: TimeSegmentType }
  | { type: "BLUR_SEGMENT" }
  | { type: "TYPE_DIGIT"; digit: string }
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "TOGGLE_PERIOD" }
  | { type: "CLEAR_SEGMENT" }
  | { type: "SET_VALUE"; time: TimeValue | null }
  | { type: "NEXT_SEGMENT" }
  | { type: "PREV_SEGMENT" };
