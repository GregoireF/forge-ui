/**
 * Date Picker connect layer — machine snapshot → framework-agnostic DOM props.
 *
 * WAI-ARIA references:
 * - §3.4  Date Picker Dialog Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/
 * - §3.15 Grid Pattern: role=grid, role=row, role=gridcell, role=columnheader
 * - Keyboard: ArrowKeys=day nav, PageUp/Down=month nav, Shift+Page=year nav, Home/End=week bounds
 *
 * Design decisions:
 * - The calendar is a true grid (role=grid), not a list. This matches the WAI-ARIA APG
 *   reference implementation and gives AT users proper grid navigation semantics.
 * - Each day cell has tabindex="0" only for the focused date; all others are tabindex="-1".
 *   This implements roving tabindex — standard for grid navigation.
 * - aria-selected is on the gridcell, NOT a child button. The WAI-ARIA APG spec says
 *   gridcell is the interaction target; putting a button inside adds extra tab stops.
 * - getCalendarCellProps() accepts a CalendarDate object so the consumer can pass the
 *   cells returned by getCalendarWeeks() directly.
 */

import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import {
  formatDateLabel,
  formatMonthYear,
  getCalendarWeeks,
  getWeekdayHeaders,
  isDateDisabled,
  isSameDate,
} from "./calendar.js";
import type {
  CalendarDate,
  DatePickerContext,
  DatePickerEvent,
  DatePickerState,
} from "./date-picker.types.js";

export type DatePickerSend = (event: DatePickerEvent | DatePickerEvent["type"]) => void;
export type DatePickerApi = ReturnType<typeof connectDatePicker>;

export function connectDatePicker(
  snapshot: MachineSnapshot<DatePickerContext, DatePickerState>,
  send: DatePickerSend,
  machine: Pick<MachineInstance<DatePickerContext, DatePickerState, DatePickerEvent>, "setContext">,
) {
  const { context } = snapshot;
  const isOpen = snapshot.matches("open");
  const { id, locale, focusedDate, value, firstDayOfWeek, disabled, readOnly, min, max, isDateUnavailable } = context;

  const contentId = `${id}-content`;
  const triggerId = `${id}-trigger`;
  const gridId = `${id}-grid`;
  const headerId = `${id}-header`;

  const isDisabledDate = (date: CalendarDate) =>
    isDateDisabled(date, min, max, isDateUnavailable);

  return {
    isOpen,
    focusedDate,
    value,

    /** Calendar grid weeks, ready to render */
    weeks: getCalendarWeeks(focusedDate.year, focusedDate.month, firstDayOfWeek),

    /** Ordered weekday headers (Sunday-first or Monday-first per firstDayOfWeek) */
    weekdays: getWeekdayHeaders(firstDayOfWeek, locale),

    /** Formatted month/year string for the calendar header aria-label */
    monthYearLabel: formatMonthYear(focusedDate.year, focusedDate.month, locale),

    /** Trigger button that opens the date picker dialog */
    getTriggerProps() {
      return {
        id: triggerId,
        type: "button" as const,
        "aria-haspopup": "dialog" as const,
        "aria-expanded": isOpen,
        "aria-controls": contentId,
        "aria-disabled": disabled || undefined,
        "data-state": isOpen ? "open" : "closed",
        "data-forge-scope": "date-picker",
        "data-forge-part": "trigger",
        disabled: disabled || undefined,
        ref: (el: unknown) => {
          machine.setContext({ triggerEl: el as HTMLElement | null });
        },
        onClick() {
          if (disabled) return;
          send("TOGGLE");
        },
      };
    },

    /**
     * Content / popover container.
     * role="dialog" + aria-modal="true" — the calendar is a modal dialog per WAI-ARIA §3.4.
     * This means keyboard and AT focus is trapped within the dialog until dismissed.
     */
    getContentProps() {
      return {
        id: contentId,
        role: "dialog" as const,
        "aria-modal": true as const,
        "aria-label": formatMonthYear(focusedDate.year, focusedDate.month, locale),
        "data-state": isOpen ? "open" : "closed",
        "data-forge-scope": "date-picker",
        "data-forge-part": "content",
        ref: (el: unknown) => {
          machine.setContext({ contentEl: el as HTMLElement | null });
        },
      };
    },

    /** Header showing the current month/year with navigation buttons */
    getCalendarHeaderProps() {
      return {
        id: headerId,
        "aria-live": "polite" as const,
        "data-forge-scope": "date-picker",
        "data-forge-part": "calendar-header",
      };
    },

    /** "Previous month" navigation button */
    getPrevMonthButtonProps() {
      const prevMonth = (() => {
        let m = focusedDate.month - 1;
        let y = focusedDate.year;
        if (m < 1) { m = 12; y--; }
        return { y, m };
      })();
      const isAtMin = min
        ? prevMonth.y < min.year || (prevMonth.y === min.year && prevMonth.m < min.month)
        : false;

      return {
        type: "button" as const,
        "aria-label": `Go to previous month`,
        "aria-disabled": isAtMin || undefined,
        disabled: isAtMin || undefined,
        "data-forge-scope": "date-picker",
        "data-forge-part": "prev-month-button",
        onClick() {
          if (isAtMin || disabled) return;
          send("NAVIGATE_PREV_MONTH");
        },
      };
    },

    /** "Next month" navigation button */
    getNextMonthButtonProps() {
      const nextMonth = (() => {
        let m = focusedDate.month + 1;
        let y = focusedDate.year;
        if (m > 12) { m = 1; y++; }
        return { y, m };
      })();
      const isAtMax = max
        ? nextMonth.y > max.year || (nextMonth.y === max.year && nextMonth.m > max.month)
        : false;

      return {
        type: "button" as const,
        "aria-label": `Go to next month`,
        "aria-disabled": isAtMax || undefined,
        disabled: isAtMax || undefined,
        "data-forge-scope": "date-picker",
        "data-forge-part": "next-month-button",
        onClick() {
          if (isAtMax || disabled) return;
          send("NAVIGATE_NEXT_MONTH");
        },
      };
    },

    /**
     * The calendar grid container.
     * role="grid" — the calendar is a 7-column grid per WAI-ARIA §3.15.
     * Grid keyboard navigation is handled here (roving tabindex per cell via tabIndex prop).
     */
    getCalendarGridProps() {
      return {
        id: gridId,
        role: "grid" as const,
        "aria-label": formatMonthYear(focusedDate.year, focusedDate.month, locale),
        "aria-disabled": disabled || undefined,
        "aria-readonly": readOnly || undefined,
        "data-forge-scope": "date-picker",
        "data-forge-part": "calendar-grid",
        onKeyDown(e: KeyboardEvent) {
          if (disabled || readOnly && e.key !== "Tab") {
            // In readOnly, allow Tab but block selection/navigation keys
          }
          switch (e.key) {
            case "ArrowLeft":
              e.preventDefault();
              send("FOCUS_PREV_DAY");
              break;
            case "ArrowRight":
              e.preventDefault();
              send("FOCUS_NEXT_DAY");
              break;
            case "ArrowUp":
              e.preventDefault();
              send("FOCUS_PREV_WEEK");
              break;
            case "ArrowDown":
              e.preventDefault();
              send("FOCUS_NEXT_WEEK");
              break;
            case "PageUp":
              e.preventDefault();
              send(e.shiftKey ? "FOCUS_PREV_YEAR" : "FOCUS_PREV_MONTH");
              break;
            case "PageDown":
              e.preventDefault();
              send(e.shiftKey ? "FOCUS_NEXT_YEAR" : "FOCUS_NEXT_MONTH");
              break;
            case "Home":
              e.preventDefault();
              send("FOCUS_WEEK_START");
              break;
            case "End":
              e.preventDefault();
              send("FOCUS_WEEK_END");
              break;
            case "Enter":
            case " ":
              e.preventDefault();
              if (!readOnly) send("SELECT_FOCUSED");
              break;
          }
        },
      };
    },

    /**
     * Props for each week row.
     * role="row" is required inside role="grid" for proper grid semantics.
     */
    getCalendarRowProps(weekIndex: number) {
      return {
        role: "row" as const,
        "data-forge-scope": "date-picker",
        "data-forge-part": "calendar-row",
        "data-week": weekIndex,
      };
    },

    /**
     * Props for weekday column header cells.
     * role="columnheader" + abbr attribute per ARIA grid spec.
     */
    getWeekdayHeaderProps(dayIndex: number) {
      const headers = getWeekdayHeaders(firstDayOfWeek, locale);
      const header = headers[dayIndex % 7];
      return {
        role: "columnheader" as const,
        abbr: header?.long ?? "",
        "aria-label": header?.long ?? "",
        "data-forge-scope": "date-picker",
        "data-forge-part": "weekday-header",
      };
    },

    /**
     * Props for each calendar day cell.
     * - role="gridcell": the cell is an interactive grid item
     * - aria-selected: true when this day is the selected value
     * - aria-disabled: true for out-of-range or unavailable dates
     * - tabIndex: 0 for focused date (roving tabindex), -1 for all others
     * - aria-label: full date in user's locale (e.g. "Monday, June 10, 2024")
     * - data-today / data-selected / data-disabled / data-focused: for CSS styling
     */
    getCalendarCellProps(date: CalendarDate) {
      const isSelected = value ? isSameDate(date, value) : false;
      const isFocused = isSameDate(date, focusedDate);
      const isUnavailable = isDisabledDate(date);
      const today = new Date();
      const isToday =
        date.year === today.getFullYear() &&
        date.month === today.getMonth() + 1 &&
        date.day === today.getDate();

      return {
        role: "gridcell" as const,
        "aria-selected": isSelected,
        "aria-disabled": (isUnavailable || disabled) || undefined,
        "aria-label": formatDateLabel(date, locale),
        tabIndex: isFocused ? 0 : -1,
        "data-state": isSelected ? "selected" : "idle",
        "data-today": isToday ? "" : undefined,
        "data-selected": isSelected ? "" : undefined,
        "data-focused": isFocused ? "" : undefined,
        "data-disabled": (isUnavailable || disabled) ? "" : undefined,
        "data-forge-scope": "date-picker",
        "data-forge-part": "calendar-cell",
        onClick() {
          if (isUnavailable || disabled || readOnly) return;
          send({ type: "SELECT_DAY", date });
          send({ type: "FOCUS_DAY", date });
        },
        onFocus() {
          send({ type: "FOCUS_DAY", date });
        },
      };
    },

    /**
     * Hidden input for form integration.
     * Value is an ISO date string (YYYY-MM-DD) for form submission compatibility.
     */
    getHiddenInputProps(name: string) {
      const isoValue = value
        ? `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`
        : "";
      return {
        type: "hidden" as const,
        name,
        value: isoValue,
        "aria-hidden": true as const,
      };
    },
  };
}
