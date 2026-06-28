/**
 * Date Field connect layer.
 *
 * WAI-ARIA: "Spinbutton Design Pattern"
 * - The group container has role="group" + aria-label describing the field.
 * - Each segment has role="spinbutton" + aria-label ("Day", "Month", "Year").
 * - aria-valuenow, aria-valuemin, aria-valuemax on each spinbutton.
 * - aria-valuetext is the formatted value (e.g. "June" not "6" for month).
 * - Keyboard: ArrowUp/Down = increment/decrement, Left/Right = prev/next segment,
 *   Backspace = clear, digits = type into buffer.
 *
 * WHY group + spinbuttons instead of a single input:
 * - Allows independent tab/arrow focus on each part (month, day, year).
 * - Accessible month labels ("June") not raw numbers.
 * - Consistent across browsers — no browser-native date input inconsistencies.
 */

import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import { getDaysInMonth } from "@forge-ui/date-picker";
import type {
  DateFieldContext,
  DateFieldEvent,
  DateFieldState,
  DateSegmentType,
} from "./date-field.types.js";

export type DateFieldSend = (event: DateFieldEvent | DateFieldEvent["type"]) => void;
export type DateFieldApi = ReturnType<typeof connectDateField>;

const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatMonth(month: number | null, locale: string): string | undefined {
  if (month === null) return undefined;
  try {
    return new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(2024, month - 1, 1));
  } catch {
    return MONTH_NAMES_EN[month - 1];
  }
}

function pad(val: number, digits: number): string {
  return String(val).padStart(digits, "0");
}

export function connectDateField(
  snapshot: MachineSnapshot<DateFieldContext, DateFieldState>,
  send: DateFieldSend,
  _machine: Pick<MachineInstance<DateFieldContext, DateFieldState, DateFieldEvent>, "setContext">,
) {
  const { context } = snapshot;
  const { id, locale, focusedSegment, dayValue, monthValue, yearValue, disabled, readOnly } = context;

  const groupId = `${id}-group`;

  const maxDay = monthValue && yearValue ? getDaysInMonth(yearValue, monthValue) : 31;

  // Compute the assembled date if all segments filled
  const assembledDate =
    dayValue !== null && monthValue !== null && yearValue !== null
      ? { year: yearValue, month: monthValue, day: Math.min(dayValue, maxDay) }
      : null;

  const isoValue = assembledDate
    ? `${assembledDate.year}-${String(assembledDate.month).padStart(2, "0")}-${String(assembledDate.day).padStart(2, "0")}`
    : "";

  function segmentProps(segment: DateSegmentType) {
    const isFocused = focusedSegment === segment;
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          send("INCREMENT");
          break;
        case "ArrowDown":
          e.preventDefault();
          send("DECREMENT");
          break;
        case "ArrowRight":
        case "Tab":
          if (!e.shiftKey) { e.preventDefault(); send("NEXT_SEGMENT"); }
          break;
        case "ArrowLeft":
          if (e.shiftKey) { e.preventDefault(); send("PREV_SEGMENT"); }
          else { e.preventDefault(); send("PREV_SEGMENT"); }
          break;
        case "Backspace":
        case "Delete":
          e.preventDefault();
          send("CLEAR_SEGMENT");
          break;
        default:
          if (/^\d$/.test(e.key)) {
            e.preventDefault();
            send({ type: "TYPE_DIGIT", digit: e.key });
          }
      }
    };

    return {
      role: "spinbutton" as const,
      "aria-disabled": disabled || undefined,
      "aria-readonly": readOnly || undefined,
      "data-forge-scope": "date-field",
      "data-forge-part": `segment-${segment}`,
      "data-focused": isFocused ? "" : undefined,
      tabIndex: disabled ? -1 : 0,
      onFocus() {
        send({ type: "FOCUS_SEGMENT", segment });
      },
      onBlur() {
        send("BLUR_SEGMENT");
      },
      onKeyDown,
    };
  }

  return {
    assembledDate,
    isoValue,
    focusedSegment,

    /** The container for all three segments */
    getGroupProps() {
      return {
        id: groupId,
        role: "group" as const,
        "aria-label": "Date",
        "aria-disabled": disabled || undefined,
        "data-forge-scope": "date-field",
        "data-forge-part": "group",
      };
    },

    /** Month segment */
    getMonthSegmentProps() {
      return {
        ...segmentProps("month"),
        "aria-label": "Month",
        "aria-valuemin": 1,
        "aria-valuemax": 12,
        "aria-valuenow": monthValue ?? undefined,
        "aria-valuetext": monthValue !== null ? formatMonth(monthValue, locale) : "blank",
        "data-placeholder": monthValue === null ? "" : undefined,
      };
    },

    /** Day segment */
    getDaySegmentProps() {
      return {
        ...segmentProps("day"),
        "aria-label": "Day",
        "aria-valuemin": 1,
        "aria-valuemax": maxDay,
        "aria-valuenow": dayValue ?? undefined,
        "aria-valuetext": dayValue !== null ? String(dayValue) : "blank",
        "data-placeholder": dayValue === null ? "" : undefined,
      };
    },

    /** Year segment */
    getYearSegmentProps() {
      return {
        ...segmentProps("year"),
        "aria-label": "Year",
        "aria-valuemin": 1,
        "aria-valuemax": 9999,
        "aria-valuenow": yearValue ?? undefined,
        "aria-valuetext": yearValue !== null ? String(yearValue) : "blank",
        "data-placeholder": yearValue === null ? "" : undefined,
      };
    },

    /** Visual separator between segments (decorative, hidden from AT) */
    getSeparatorProps() {
      return {
        "aria-hidden": true as const,
        "data-forge-scope": "date-field",
        "data-forge-part": "separator",
      };
    },

    /** Formatted display values for each segment */
    displayValues: {
      month: monthValue !== null ? formatMonth(monthValue, locale) : undefined,
      day: dayValue !== null ? pad(dayValue, 2) : undefined,
      year: yearValue !== null ? String(yearValue) : undefined,
    },

    /** Hidden input for form submission */
    getHiddenInputProps(name: string) {
      return {
        type: "hidden" as const,
        name,
        value: isoValue,
        "aria-hidden": true as const,
      };
    },
  };
}
