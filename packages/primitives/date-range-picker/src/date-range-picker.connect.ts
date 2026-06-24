/**
 * Date Range Picker connect layer.
 *
 * WHY a separate package from date-picker:
 * Range selection logic (selectionPhase, hoveredDate, range highlighting)
 * is fundamentally different from single-date selection. Merging them into
 * one package forces consumers who only need single dates to carry dead code,
 * and vice versa. Competitors that combine them (e.g. react-day-picker) end up
 * with complex conditional APIs that are hard to tree-shake.
 *
 * Key WAI-ARIA additions over date-picker:
 * - aria-label on cells includes range role: "start of range", "end of range", "in range"
 * - data-range-start / data-range-end / data-in-range for CSS hook-in
 * - data-preview-end / data-in-preview-range for hover preview before end is confirmed
 * - Trigger aria-label reflects the current range ("June 15 – July 1, 2024")
 */

import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import {
  addMonths,
  compareDate,
  formatDateLabel,
  formatDateMedium,
  formatMonthYear,
  getCalendarWeeks,
  getWeekdayHeaders,
  isBetween,
  isDateDisabled,
  isSameDate,
} from "@forge-ui/date-picker";
import type {
  CalendarDate,
  DateRange,
  DateRangePickerContext,
  DateRangePickerEvent,
  DateRangePickerState,
} from "./date-range-picker.types.js";

export type DateRangePickerSend = (event: DateRangePickerEvent | DateRangePickerEvent["type"]) => void;
export type DateRangePickerApi = ReturnType<typeof connectDateRangePicker>;

export function connectDateRangePicker(
  snapshot: MachineSnapshot<DateRangePickerContext, DateRangePickerState>,
  send: DateRangePickerSend,
  machine: Pick<MachineInstance<DateRangePickerContext, DateRangePickerState, DateRangePickerEvent>, "setContext">,
) {
  const { context } = snapshot;
  const isOpen = snapshot.hasTag("open");
  const {
    id,
    locale,
    focusedDate,
    startDate,
    endDate,
    hoveredDate,
    selectionPhase,
    firstDayOfWeek,
    disabled,
    readOnly,
    min,
    max,
    isDateUnavailable,
    disabledWeekdays,
    today,
    presets,
    numberOfMonths,
  } = context;

  const contentId = `${id}-content`;
  const triggerId = `${id}-trigger`;

  const isDisabledDate = (date: CalendarDate) =>
    isDateDisabled(date, min, max, isDateUnavailable, disabledWeekdays);

  /** Effective end for preview (hovered when picking end, otherwise confirmed end) */
  const previewEnd = selectionPhase === "end" && hoveredDate ? hoveredDate : endDate;
  const effectiveStart = startDate;
  const effectiveEnd = previewEnd;

  function isRangeStart(date: CalendarDate) {
    return startDate !== null && isSameDate(date, startDate);
  }

  function isRangeEnd(date: CalendarDate) {
    return endDate !== null && isSameDate(date, endDate);
  }

  function isInRange(date: CalendarDate) {
    if (!effectiveStart || !effectiveEnd) return false;
    const s = compareDate(effectiveStart, effectiveEnd) <= 0 ? effectiveStart : effectiveEnd;
    const e = compareDate(effectiveStart, effectiveEnd) <= 0 ? effectiveEnd : effectiveStart;
    return isBetween(date, s, e);
  }

  function isPreviewEnd(date: CalendarDate) {
    return hoveredDate !== null && selectionPhase === "end" && isSameDate(date, hoveredDate);
  }

  function isInPreviewRange(date: CalendarDate) {
    if (!startDate || !hoveredDate || selectionPhase !== "end") return false;
    const s = compareDate(startDate, hoveredDate) <= 0 ? startDate : hoveredDate;
    const e = compareDate(startDate, hoveredDate) <= 0 ? hoveredDate : startDate;
    return isBetween(date, s, e);
  }

  function getCellRangeLabel(date: CalendarDate): string {
    if (isRangeStart(date)) return ", start of range";
    if (isRangeEnd(date)) return ", end of range";
    if (isInRange(date)) return ", in range";
    return "";
  }

  const formattedStart = startDate ? formatDateMedium(startDate, locale) : "";
  const formattedEnd = endDate ? formatDateMedium(endDate, locale) : "";

  return {
    isOpen,
    selectionPhase,
    startDate,
    endDate,
    hoveredDate,
    today,
    formattedStart,
    formattedEnd,
    formattedRange: formattedStart && formattedEnd ? `${formattedStart} – ${formattedEnd}` : formattedStart,

    /** Calendar weeks for each visible month */
    weeksPerMonth: Array.from({ length: numberOfMonths }, (_, i) => {
      const d = addMonths(focusedDate, i);
      return getCalendarWeeks(d.year, d.month, firstDayOfWeek);
    }),

    weekdays: getWeekdayHeaders(firstDayOfWeek, locale),
    presets: presets ?? [],

    // -------------------------------------------------------------------------
    // Trigger
    // -------------------------------------------------------------------------

    getTriggerProps() {
      const rangeLabel =
        formattedStart && formattedEnd
          ? `${formattedStart} to ${formattedEnd}`
          : formattedStart
            ? `From ${formattedStart}`
            : "Select date range";

      return {
        id: triggerId,
        type: "button" as const,
        "aria-haspopup": "dialog" as const,
        "aria-expanded": isOpen,
        "aria-controls": contentId,
        "aria-label": rangeLabel,
        "aria-disabled": disabled || undefined,
        "data-state": isOpen ? "open" : "closed",
        "data-forge-scope": "date-range-picker",
        "data-forge-part": "trigger",
        disabled: disabled || undefined,
        ref: (el: unknown) => machine.setContext({ triggerEl: el as HTMLElement | null }),
        onClick() {
          if (disabled) return;
          send("TOGGLE");
        },
      };
    },

    // -------------------------------------------------------------------------
    // Content
    // -------------------------------------------------------------------------

    getContentProps() {
      return {
        id: contentId,
        role: "dialog" as const,
        "aria-modal": true as const,
        "aria-label": selectionPhase === "end" ? "Select end date" : "Select date range",
        "data-state": isOpen ? "open" : "closed",
        "data-selection-phase": selectionPhase,
        "data-forge-scope": "date-range-picker",
        "data-forge-part": "content",
        ref: (el: unknown) => machine.setContext({ contentEl: el as HTMLElement | null }),
      };
    },

    // -------------------------------------------------------------------------
    // Calendar header
    // -------------------------------------------------------------------------

    getCalendarHeaderProps(monthOffset = 0) {
      const d = addMonths(focusedDate, monthOffset);
      return {
        "aria-live": "polite" as const,
        "aria-atomic": true as const,
        "data-forge-scope": "date-range-picker",
        "data-forge-part": "calendar-header",
        "data-month-offset": monthOffset,
        label: formatMonthYear(d.year, d.month, locale),
      };
    },

    // -------------------------------------------------------------------------
    // Navigation
    // -------------------------------------------------------------------------

    getPrevMonthButtonProps() {
      const prevY = focusedDate.month === 1 ? focusedDate.year - 1 : focusedDate.year;
      const prevM = focusedDate.month === 1 ? 12 : focusedDate.month - 1;
      const isAtMin = min ? prevY < min.year || (prevY === min.year && prevM < min.month) : false;

      return {
        type: "button" as const,
        "aria-label": "Go to previous month",
        "aria-disabled": isAtMin || undefined,
        disabled: isAtMin || undefined,
        "data-forge-scope": "date-range-picker",
        "data-forge-part": "prev-month-button",
        onClick() {
          if (isAtMin || disabled) return;
          send("NAVIGATE_PREV_MONTH");
        },
      };
    },

    getNextMonthButtonProps() {
      const offset = numberOfMonths - 1;
      const lastVisible = addMonths(focusedDate, offset);
      const nextY = lastVisible.month === 12 ? lastVisible.year + 1 : lastVisible.year;
      const nextM = lastVisible.month === 12 ? 1 : lastVisible.month + 1;
      const isAtMax = max ? nextY > max.year || (nextY === max.year && nextM > max.month) : false;

      return {
        type: "button" as const,
        "aria-label": "Go to next month",
        "aria-disabled": isAtMax || undefined,
        disabled: isAtMax || undefined,
        "data-forge-scope": "date-range-picker",
        "data-forge-part": "next-month-button",
        onClick() {
          if (isAtMax || disabled) return;
          send("NAVIGATE_NEXT_MONTH");
        },
      };
    },

    // -------------------------------------------------------------------------
    // Calendar grid
    // -------------------------------------------------------------------------

    getCalendarGridProps(monthOffset = 0) {
      const d = addMonths(focusedDate, monthOffset);
      return {
        role: "grid" as const,
        "aria-label": formatMonthYear(d.year, d.month, locale),
        "aria-disabled": disabled || undefined,
        "aria-multiselectable": true as const,
        "data-forge-scope": "date-range-picker",
        "data-forge-part": "calendar-grid",
        onKeyDown(e: KeyboardEvent) {
          switch (e.key) {
            case "ArrowLeft": e.preventDefault(); send("FOCUS_PREV_DAY"); break;
            case "ArrowRight": e.preventDefault(); send("FOCUS_NEXT_DAY"); break;
            case "ArrowUp": e.preventDefault(); send("FOCUS_PREV_WEEK"); break;
            case "ArrowDown": e.preventDefault(); send("FOCUS_NEXT_WEEK"); break;
            case "PageUp": e.preventDefault(); send(e.shiftKey ? "FOCUS_PREV_MONTH" : "FOCUS_PREV_MONTH"); break;
            case "PageDown": e.preventDefault(); send(e.shiftKey ? "FOCUS_NEXT_MONTH" : "FOCUS_NEXT_MONTH"); break;
            case "Home": e.preventDefault(); send("FOCUS_WEEK_START"); break;
            case "End": e.preventDefault(); send("FOCUS_WEEK_END"); break;
            case "Enter":
            case " ":
              e.preventDefault();
              if (!readOnly) send({ type: "SELECT_DAY", date: focusedDate });
              break;
          }
        },
      };
    },

    getCalendarRowProps(weekIndex: number) {
      return {
        role: "row" as const,
        "data-forge-scope": "date-range-picker",
        "data-forge-part": "calendar-row",
        "data-week": weekIndex,
      };
    },

    getWeekdayHeaderProps(dayIndex: number) {
      const headers = getWeekdayHeaders(firstDayOfWeek, locale);
      const header = headers[dayIndex % 7];
      return {
        role: "columnheader" as const,
        abbr: header?.long ?? "",
        "aria-label": header?.long ?? "",
        "data-forge-scope": "date-range-picker",
        "data-forge-part": "weekday-header",
      };
    },

    /**
     * Props for each day cell in the range picker.
     *
     * Extra data attributes vs date-picker:
     * - data-range-start: cell is the confirmed range start
     * - data-range-end: cell is the confirmed range end
     * - data-in-range: cell is between confirmed start and end
     * - data-preview-end: cell is the hovered end (before confirmation)
     * - data-in-preview-range: cell is in the hover preview range
     */
    getCalendarCellProps(date: CalendarDate, isOutsideMonth = false) {
      const isFocused = isSameDate(date, focusedDate);
      const isUnavailable = isDisabledDate(date);
      const rangeStart = isRangeStart(date);
      const rangeEnd = isRangeEnd(date);
      const inRange = isInRange(date);
      const previewEndDate = isPreviewEnd(date);
      const inPreviewRange = isInPreviewRange(date);
      const isSelected = rangeStart || rangeEnd;
      const isToday = isSameDate(date, today);

      return {
        role: "gridcell" as const,
        "aria-selected": isSelected || inRange,
        "aria-disabled": isUnavailable || disabled || undefined,
        "aria-label": `${formatDateLabel(date, locale)}${getCellRangeLabel(date)}`,
        tabIndex: isFocused ? 0 : -1,
        "data-state": isSelected ? "selected" : inRange ? "in-range" : "idle",
        "data-range-start": rangeStart ? "" : undefined,
        "data-range-end": rangeEnd ? "" : undefined,
        "data-in-range": inRange ? "" : undefined,
        "data-preview-end": previewEndDate ? "" : undefined,
        "data-in-preview-range": inPreviewRange ? "" : undefined,
        "data-today": isToday ? "" : undefined,
        "data-focused": isFocused ? "" : undefined,
        "data-disabled": isUnavailable || disabled ? "" : undefined,
        "data-outside-month": isOutsideMonth ? "" : undefined,
        "data-forge-scope": "date-range-picker",
        "data-forge-part": "calendar-cell",
        onClick() {
          if (isUnavailable || disabled || readOnly) return;
          send({ type: "SELECT_DAY", date });
        },
        onMouseEnter() {
          if (disabled) return;
          send({ type: "HOVER_DAY", date });
        },
        onMouseLeave() {
          send("CLEAR_HOVER");
        },
        onFocus() {
          send({ type: "FOCUS_DAY", date });
        },
      };
    },

    // -------------------------------------------------------------------------
    // Clear button
    // -------------------------------------------------------------------------

    getClearButtonProps() {
      return {
        type: "button" as const,
        "aria-label": "Clear selected date range",
        disabled: (!startDate && !endDate) || disabled || undefined,
        "data-forge-scope": "date-range-picker",
        "data-forge-part": "clear-button",
        onClick() {
          if (disabled || readOnly) return;
          send("CLEAR");
        },
      };
    },

    // -------------------------------------------------------------------------
    // Presets
    // -------------------------------------------------------------------------

    getPresetProps(preset: { label: string; getValue: (today: CalendarDate) => DateRange }) {
      return {
        type: "button" as const,
        "aria-label": preset.label,
        "data-forge-scope": "date-range-picker",
        "data-forge-part": "preset",
        onClick() {
          if (disabled || readOnly) return;
          const range = preset.getValue(today);
          send({ type: "SELECT_PRESET", range });
        },
      };
    },

    // -------------------------------------------------------------------------
    // Hidden inputs for form integration
    // -------------------------------------------------------------------------

    getHiddenStartInputProps(name: string) {
      const iso = startDate
        ? `${startDate.year}-${String(startDate.month).padStart(2, "0")}-${String(startDate.day).padStart(2, "0")}`
        : "";
      return { type: "hidden" as const, name, value: iso, "aria-hidden": true as const };
    },

    getHiddenEndInputProps(name: string) {
      const iso = endDate
        ? `${endDate.year}-${String(endDate.month).padStart(2, "0")}-${String(endDate.day).padStart(2, "0")}`
        : "";
      return { type: "hidden" as const, name, value: iso, "aria-hidden": true as const };
    },
  };
}
