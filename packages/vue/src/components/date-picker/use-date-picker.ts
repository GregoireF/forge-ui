import type { CalendarDate, CreateDatePickerOptions, DatePreset } from "@forge-ui/date-picker";
import { connectDatePicker, createDatePickerMachine } from "@forge-ui/date-picker";
import { computed, useId, watch } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseDatePickerOptions extends Omit<CreateDatePickerOptions, "id"> {
  id?: string;
}

export function useDatePicker(options: UseDatePickerOptions = {}) {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createDatePickerMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  const api = computed(() => connectDatePicker(snapshot.value, send, machine));

  return {
    isOpen: computed(() => api.value.isOpen),
    view: computed(() => api.value.view),
    value: computed(() => api.value.value),
    focusedDate: computed(() => api.value.focusedDate),
    today: computed(() => api.value.today),
    formattedValue: computed(() => api.value.formattedValue),
    weeks: computed(() => api.value.weeks),
    weeksPerMonth: computed(() => api.value.weeksPerMonth),
    weekdays: computed(() => api.value.weekdays),
    monthYearLabel: computed(() => api.value.monthYearLabel),
    months: computed(() => api.value.months),
    yearRange: computed(() => api.value.yearRange),
    presets: computed(() => api.value.presets),
    machine,
    send,
    getTriggerProps: () => api.value.getTriggerProps(),
    getContentProps: () => api.value.getContentProps(),
    getCalendarHeaderProps: () => api.value.getCalendarHeaderProps(),
    getViewSwitchButtonProps: () => api.value.getViewSwitchButtonProps(),
    getPrevMonthButtonProps: () => api.value.getPrevMonthButtonProps(),
    getNextMonthButtonProps: () => api.value.getNextMonthButtonProps(),
    getPrevYearRangeButtonProps: () => api.value.getPrevYearRangeButtonProps(),
    getNextYearRangeButtonProps: () => api.value.getNextYearRangeButtonProps(),
    getCalendarGridProps: () => api.value.getCalendarGridProps(),
    getCalendarRowProps: (weekIndex: number) => api.value.getCalendarRowProps(weekIndex),
    getWeekdayHeaderProps: (dayIndex: number) => api.value.getWeekdayHeaderProps(dayIndex),
    getCalendarCellProps: (date: CalendarDate, isOutsideMonth?: boolean) => api.value.getCalendarCellProps(date, isOutsideMonth),
    getMonthGridProps: () => api.value.getMonthGridProps(),
    getMonthCellProps: (month: number) => api.value.getMonthCellProps(month),
    getYearGridProps: () => api.value.getYearGridProps(),
    getYearCellProps: (year: number) => api.value.getYearCellProps(year),
    getPresetProps: (preset: DatePreset) => api.value.getPresetProps(preset),
    getHiddenInputProps: (name: string) => api.value.getHiddenInputProps(name),
  };
}

export type UseDatePickerReturn = ReturnType<typeof useDatePicker>;

export function useDatePickerControlled(
  propsValue: () => CalendarDate | null | undefined,
  options: UseDatePickerOptions = {},
) {
  const pickerApi = useDatePicker(options);
  watch(propsValue, (v) => {
    if (v !== undefined) {
      pickerApi.machine.update({ value: v ?? null });
    }
  });
  return pickerApi;
}
