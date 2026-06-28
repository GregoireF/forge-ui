/**
 * Date Picker connect layer — machine snapshot → framework-agnostic DOM props.
 *
 * WAI-ARIA references:
 * - §3.4  Date Picker Dialog Pattern
 * - §3.15 Grid Pattern: role=grid, role=row, role=gridcell, role=columnheader
 * - Keyboard: Arrow=day nav, PageUp/Down=month, Shift+Page=year, Home/End=week bounds
 *
 * Design decisions:
 * - role=grid on calendar (not list) — gives AT grid navigation semantics per WAI-ARIA APG
 * - Roving tabindex: tabIndex=0 on focused cell only, -1 on all others
 * - aria-selected on gridcell (not a child button) per WAI-ARIA APG reference
 * - aria-live="polite" + aria-atomic="true" on header so SR reads full "June 2024" on month change
 * - aria-haspopup="dialog" (not "listbox") on trigger — correct for date picker dialogs
 * - data-outside-month on adjacent-month cells (exposed, not hidden as null)
 * - "today" suffix in cell aria-label from context.today (SSR-safe, not new Date())
 * - formattedValue for trigger display text in consumer's locale
 * - View switching: day ↔ month ↔ year (drill-down; back with VIEW_DAYS/VIEW_MONTHS)
 */

import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import {
  addMonths,
  formatDateLabel,
  formatDateMedium,
  formatMonthYear,
  getCalendarWeeks,
  getMonthsOfYear,
  getTodayLabel,
  getWeekdayHeaders,
  getYearRange,
  isDateDisabled,
  isSameDate,
} from "./calendar.js";
import type {
  CalendarDate,
  DatePickerContext,
  DatePickerEvent,
  DatePickerState,
  DatePreset,
} from "./date-picker.types.js";

export type DatePickerSend = (event: DatePickerEvent | DatePickerEvent["type"]) => void;
export type DatePickerApi = ReturnType<typeof connectDatePicker>;

export function connectDatePicker(
  snapshot: MachineSnapshot<DatePickerContext, DatePickerState>,
  send: DatePickerSend,
  machine: Pick<MachineInstance<DatePickerContext, DatePickerState, DatePickerEvent>, "setContext">,
) {
  const { context } = snapshot;

  const isOpenDay = snapshot.matches("open.day");
  const isOpenMonth = snapshot.matches("open.month");
  const isOpenYear = snapshot.matches("open.year");
  const isOpen = isOpenDay || isOpenMonth || isOpenYear;
  const view = isOpenDay
    ? ("day" as const)
    : isOpenMonth
      ? ("month" as const)
      : isOpenYear
        ? ("year" as const)
        : null;

  const {
    id,
    locale,
    focusedDate,
    value,
    firstDayOfWeek,
    disabled,
    readOnly,
    min,
    max,
    isDateUnavailable,
    disabledWeekdays,
    today,
    yearGridStart,
    presets,
    numberOfMonths,
  } = context;

  const contentId = `${id}-content`;
  const triggerId = `${id}-trigger`;
  const gridId = `${id}-grid`;
  const headerId = `${id}-header`;

  const isDisabledDate = (date: CalendarDate) =>
    isDateDisabled(date, min, max, isDateUnavailable, disabledWeekdays);

  const todayLabel = getTodayLabel(locale);

  return {
    isOpen,
    view,
    focusedDate,
    value,
    today,

    /** Locale-formatted selected date for use in the trigger button label */
    formattedValue: value ? formatDateMedium(value, locale) : "",

    /** Calendar weeks for the primary (first) visible month */
    weeks: getCalendarWeeks(focusedDate.year, focusedDate.month, firstDayOfWeek),

    /**
     * One `CalendarCell[][]` per visible month.
     * When numberOfMonths=1 this is identical to `weeks`.
     * When numberOfMonths=2 consumers render a side-by-side dual-month layout.
     */
    weeksPerMonth: Array.from({ length: numberOfMonths }, (_, i) => {
      const d = addMonths(focusedDate, i);
      return getCalendarWeeks(d.year, d.month, firstDayOfWeek);
    }),

    /** Ordered weekday headers (Sunday-first or locale-first per firstDayOfWeek) */
    weekdays: getWeekdayHeaders(firstDayOfWeek, locale),

    /** Formatted month/year for the header and dialog aria-label */
    monthYearLabel: formatMonthYear(focusedDate.year, focusedDate.month, locale),

    /** All 12 months of the year for the month picker view */
    months: getMonthsOfYear(locale),

    /** 12 years starting at yearGridStart for the year picker view */
    yearRange: getYearRange(yearGridStart),

    /** Configured presets (empty array when none provided) */
    presets: presets ?? [],

    // -------------------------------------------------------------------------
    // Trigger
    // -------------------------------------------------------------------------

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

    // -------------------------------------------------------------------------
    // Content dialog
    // -------------------------------------------------------------------------

    getContentProps() {
      return {
        id: contentId,
        role: "dialog" as const,
        "aria-modal": true as const,
        "aria-label": formatMonthYear(focusedDate.year, focusedDate.month, locale),
        "data-state": isOpen ? "open" : "closed",
        "data-view": view ?? undefined,
        "data-forge-scope": "date-picker",
        "data-forge-part": "content",
        ref: (el: unknown) => {
          machine.setContext({ contentEl: el as HTMLElement | null });
        },
      };
    },

    // -------------------------------------------------------------------------
    // Calendar header (with live-region for SR month announcements)
    // -------------------------------------------------------------------------

    getCalendarHeaderProps() {
      return {
        id: headerId,
        "aria-live": "polite" as const,
        "aria-atomic": true as const,
        "data-forge-scope": "date-picker",
        "data-forge-part": "calendar-header",
      };
    },

    /**
     * The "June 2024" clickable button in the header.
     * Opens month picker; second click opens year picker.
     */
    getViewSwitchButtonProps() {
      return {
        type: "button" as const,
        "aria-label": `${formatMonthYear(focusedDate.year, focusedDate.month, locale)}, select month`,
        "aria-pressed": isOpenMonth || isOpenYear,
        "data-forge-scope": "date-picker",
        "data-forge-part": "view-switch-button",
        onClick() {
          if (disabled) return;
          if (isOpenDay) send("VIEW_MONTHS");
          else if (isOpenMonth) send("VIEW_YEARS");
          else send("VIEW_DAYS");
        },
      };
    },

    // -------------------------------------------------------------------------
    // Month navigation buttons
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
        "data-forge-scope": "date-picker",
        "data-forge-part": "prev-month-button",
        onClick() {
          if (isAtMin || disabled) return;
          send("NAVIGATE_PREV_MONTH");
        },
      };
    },

    getNextMonthButtonProps() {
      const nextY = focusedDate.month === 12 ? focusedDate.year + 1 : focusedDate.year;
      const nextM = focusedDate.month === 12 ? 1 : focusedDate.month + 1;
      const isAtMax = max ? nextY > max.year || (nextY === max.year && nextM > max.month) : false;

      return {
        type: "button" as const,
        "aria-label": "Go to next month",
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

    // -------------------------------------------------------------------------
    // Year range navigation (for year picker view)
    // -------------------------------------------------------------------------

    getPrevYearRangeButtonProps() {
      return {
        type: "button" as const,
        "aria-label": `Go to years ${yearGridStart - 12}–${yearGridStart - 1}`,
        "data-forge-scope": "date-picker",
        "data-forge-part": "prev-year-range-button",
        onClick() {
          if (disabled) return;
          send("NAVIGATE_PREV_YEAR_RANGE");
        },
      };
    },

    getNextYearRangeButtonProps() {
      return {
        type: "button" as const,
        "aria-label": `Go to years ${yearGridStart + 12}–${yearGridStart + 23}`,
        "data-forge-scope": "date-picker",
        "data-forge-part": "next-year-range-button",
        onClick() {
          if (disabled) return;
          send("NAVIGATE_NEXT_YEAR_RANGE");
        },
      };
    },

    // -------------------------------------------------------------------------
    // Day grid (main calendar view)
    // -------------------------------------------------------------------------

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

    getCalendarRowProps(weekIndex: number) {
      return {
        role: "row" as const,
        "data-forge-scope": "date-picker",
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
        "data-forge-scope": "date-picker",
        "data-forge-part": "weekday-header",
      };
    },

    /**
     * Props for each calendar day cell.
     *
     * @param date         The date for this cell.
     * @param isOutsideMonth  True for leading/trailing cells from adjacent months.
     *                     Pass `cell.isOutsideMonth` when iterating `api.weeks`.
     *
     * WAI-ARIA attributes:
     * - role="gridcell": interactive grid item
     * - aria-selected: true when this is the selected date
     * - aria-disabled: true for out-of-range / unavailable dates
     * - aria-label: full accessible date + ", today" suffix when applicable
     * - tabIndex: 0 for focused date (roving tabindex), -1 for all others
     * - data-outside-month: present for adjacent-month cells (style them faded)
     * - data-today: present for today's date (highlight ring)
     */
    getCalendarCellProps(date: CalendarDate, isOutsideMonth = false) {
      const isSelected = value !== null && isSameDate(date, value);
      const isFocused = isSameDate(date, focusedDate);
      const isUnavailable = isDisabledDate(date);
      const isToday = isSameDate(date, today);

      return {
        role: "gridcell" as const,
        "aria-selected": isSelected,
        "aria-disabled": isUnavailable || disabled || undefined,
        "aria-label": `${formatDateLabel(date, locale)}${isToday ? `, ${todayLabel}` : ""}`,
        tabIndex: isFocused ? 0 : -1,
        "data-state": isSelected ? "selected" : "idle",
        "data-today": isToday ? "" : undefined,
        "data-selected": isSelected ? "" : undefined,
        "data-focused": isFocused ? "" : undefined,
        "data-disabled": isUnavailable || disabled ? "" : undefined,
        "data-outside-month": isOutsideMonth ? "" : undefined,
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

    // -------------------------------------------------------------------------
    // Month picker grid
    // -------------------------------------------------------------------------

    getMonthGridProps() {
      return {
        role: "grid" as const,
        "aria-label": String(focusedDate.year),
        "data-forge-scope": "date-picker",
        "data-forge-part": "month-grid",
      };
    },

    /**
     * Props for each month cell in the month picker.
     * @param month  1-indexed (1=January … 12=December)
     */
    getMonthCellProps(month: number) {
      const isSelected =
        value !== null && value?.year === focusedDate.year && value?.month === month;
      const isFocused = focusedDate.month === month;
      const monthInfo = getMonthsOfYear(locale)[month - 1];
      const monthLabel = monthInfo?.label ?? "";

      return {
        role: "gridcell" as const,
        "aria-selected": isSelected === true,
        "aria-label": `${monthLabel} ${focusedDate.year}`,
        "data-state": isSelected ? "selected" : "idle",
        "data-focused": isFocused ? "" : undefined,
        "data-selected": isSelected ? "" : undefined,
        "data-forge-scope": "date-picker",
        "data-forge-part": "month-cell",
        onClick() {
          if (disabled || readOnly) return;
          send({ type: "SELECT_MONTH", month });
        },
      };
    },

    // -------------------------------------------------------------------------
    // Year picker grid
    // -------------------------------------------------------------------------

    getYearGridProps() {
      return {
        role: "grid" as const,
        "aria-label": `${yearGridStart}–${yearGridStart + 11}`,
        "data-forge-scope": "date-picker",
        "data-forge-part": "year-grid",
      };
    },

    getYearCellProps(year: number) {
      const isSelected = value !== null && value?.year === year;
      const isFocused = focusedDate.year === year;

      return {
        role: "gridcell" as const,
        "aria-selected": isSelected === true,
        "aria-label": String(year),
        "data-state": isSelected ? "selected" : "idle",
        "data-focused": isFocused ? "" : undefined,
        "data-selected": isSelected ? "" : undefined,
        "data-forge-scope": "date-picker",
        "data-forge-part": "year-cell",
        onClick() {
          if (disabled || readOnly) return;
          send({ type: "SELECT_YEAR", year });
        },
      };
    },

    // -------------------------------------------------------------------------
    // Presets
    // -------------------------------------------------------------------------

    /**
     * Props for a preset button (e.g. "Today", "Yesterday").
     * The date is resolved from `today` at click time — never stale.
     */
    getPresetProps(preset: DatePreset) {
      return {
        type: "button" as const,
        "aria-label": preset.label,
        "data-forge-scope": "date-picker",
        "data-forge-part": "preset",
        onClick() {
          if (disabled || readOnly) return;
          const date = preset.getValue(today);
          send({ type: "SELECT_PRESET", date });
        },
      };
    },

    // -------------------------------------------------------------------------
    // Hidden form input
    // -------------------------------------------------------------------------

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
