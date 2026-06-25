import type { CalendarDate, CreateDateRangePickerOptions, DateRange } from "@forge-ui/date-range-picker";
import { connectDateRangePicker, createDateRangePickerMachine } from "@forge-ui/date-range-picker";
import { computed, useId, watch } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseDateRangePickerOptions extends Omit<CreateDateRangePickerOptions, "id"> {
  id?: string;
}

export function useDateRangePicker(options: UseDateRangePickerOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createDateRangePickerMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  const api = computed(() => connectDateRangePicker(snapshot.value, send, machine));

  return {
    isOpen: computed(() => api.value.isOpen),
    selectionPhase: computed(() => api.value.selectionPhase),
    startDate: computed(() => api.value.startDate),
    endDate: computed(() => api.value.endDate),
    hoveredDate: computed(() => api.value.hoveredDate),
    today: computed(() => api.value.today),
    formattedStart: computed(() => api.value.formattedStart),
    formattedEnd: computed(() => api.value.formattedEnd),
    formattedRange: computed(() => api.value.formattedRange),
    weeksPerMonth: computed(() => api.value.weeksPerMonth),
    weekdays: computed(() => api.value.weekdays),
    presets: computed(() => api.value.presets),
    machine,
    send,
    getTriggerProps: () => api.value.getTriggerProps(),
    getContentProps: () => api.value.getContentProps(),
    getCalendarHeaderProps: (monthOffset?: number) => api.value.getCalendarHeaderProps(monthOffset),
    getPrevMonthButtonProps: () => api.value.getPrevMonthButtonProps(),
    getNextMonthButtonProps: () => api.value.getNextMonthButtonProps(),
    getCalendarGridProps: (monthOffset?: number) => api.value.getCalendarGridProps(monthOffset),
    getCalendarRowProps: (weekIndex: number) => api.value.getCalendarRowProps(weekIndex),
    getWeekdayHeaderProps: (dayIndex: number) => api.value.getWeekdayHeaderProps(dayIndex),
    getCalendarCellProps: (date: CalendarDate, isOutsideMonth?: boolean) => api.value.getCalendarCellProps(date, isOutsideMonth),
    getClearButtonProps: () => api.value.getClearButtonProps(),
    getPresetProps: (preset: { label: string; getValue: (today: CalendarDate) => DateRange }) => api.value.getPresetProps(preset),
    getHiddenStartInputProps: (name: string) => api.value.getHiddenStartInputProps(name),
    getHiddenEndInputProps: (name: string) => api.value.getHiddenEndInputProps(name),
  };
}

export type UseDateRangePickerReturn = ReturnType<typeof useDateRangePicker>;

export function useDateRangePickerControlled(
  propsValue: () => DateRange | null | undefined,
  options: UseDateRangePickerOptions = {},
) {
  const rangeApi = useDateRangePicker(options);
  watch(propsValue, (v) => {
    if (v !== undefined) {
      rangeApi.machine.update({
        startDate: v?.start ?? null,
        endDate: v?.end ?? null,
      });
    }
  });
  return rangeApi;
}
