import type { CalendarDate, CreateDatePickerOptions, DatePreset } from "@forge-ui/date-picker";
import type { ComponentPublicInstance, InjectionKey, PropType, Ref } from "vue";
import { defineComponent, h, inject, provide, watch } from "vue";
import { usePresence } from "../../hooks/use-presence.js";
import type { UseDatePickerOptions, UseDatePickerReturn } from "./use-date-picker.js";
import { useDatePicker } from "./use-date-picker.js";

const datePickerKey: InjectionKey<UseDatePickerReturn> = Symbol("forge-date-picker");

type DatePickerPresenceContext = { isPresent: Ref<boolean>; presenceRef: Ref<HTMLElement | null> };
const datePickerPresenceKey: InjectionKey<DatePickerPresenceContext> = Symbol("forge-date-picker-presence");

function useCtx(): UseDatePickerReturn {
  const ctx = inject(datePickerKey);
  if (!ctx) throw new Error("DatePicker compound parts must be inside <DatePicker.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const DatePickerRoot = defineComponent({
  name: "ForgeDatePickerRoot",
  props: {
    id: { type: String, default: undefined },
    value: { type: Object as PropType<CalendarDate | null>, default: undefined },
    defaultValue: { type: Object as PropType<CalendarDate | null>, default: undefined },
    locale: { type: String, default: undefined },
    firstDayOfWeek: { type: Number, default: undefined },
    numberOfMonths: { type: Number, default: undefined },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    presets: { type: Array as PropType<DatePreset[]>, default: undefined },
    onValueChange: { type: Function as PropType<CreateDatePickerOptions["onValueChange"]>, default: undefined },
    onOpenChange: { type: Function as PropType<CreateDatePickerOptions["onOpenChange"]>, default: undefined },
  },
  emits: {
    "update:value": (_v: CalendarDate | null) => true,
  },
  setup(props, { slots, emit }) {
    const api = useDatePicker({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.value !== undefined && { value: props.value }),
      ...(props.defaultValue !== undefined && { defaultValue: props.defaultValue }),
      ...(props.locale !== undefined && { locale: props.locale }),
      ...(props.firstDayOfWeek !== undefined && { firstDayOfWeek: props.firstDayOfWeek }),
      ...(props.numberOfMonths !== undefined && { numberOfMonths: props.numberOfMonths }),
      ...(props.disabled !== undefined && { disabled: props.disabled }),
      ...(props.readOnly !== undefined && { readOnly: props.readOnly }),
      ...(props.presets !== undefined && { presets: props.presets }),
      ...(props.onValueChange !== undefined && { onValueChange: props.onValueChange }),
      ...(props.onOpenChange !== undefined && { onOpenChange: props.onOpenChange }),
    } as UseDatePickerOptions);

    watch(
      () => props.value,
      (v) => { if (v !== undefined) api.machine.update({ value: v ?? null }); },
    );

    watch(api.value, (v) => emit("update:value", v));

    const presence = usePresence(api.isOpen);
    provide(datePickerPresenceKey, presence);
    provide(datePickerKey, api);
    return () => slots['default']?.();
  },
});

// ---------------------------------------------------------------------------
// onKeyDown â†’ onKeydown remap helper
// ---------------------------------------------------------------------------

function remapKeyDown(props: Record<string, unknown>): Record<string, unknown> {
  const { onKeyDown, ...rest } = props as { onKeyDown?: (e: KeyboardEvent) => void; [k: string]: unknown };
  return { ...rest, ...(onKeyDown && { onKeydown: onKeyDown }) };
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

const DatePickerTrigger = defineComponent({
  name: "ForgeDatePickerTrigger",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => h("button", { ...api.getTriggerProps(), ...attrs }, slots['default']?.());
  },
});

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const DatePickerContent = defineComponent({
  name: "ForgeDatePickerContent",
  props: {
    forceMount: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    const sharedPresence = inject(datePickerPresenceKey, null);
    const ownPresence = usePresence(api.isOpen);
    const { isPresent, presenceRef } = sharedPresence ?? ownPresence;

    return () => {
      if (!props.forceMount && !isPresent.value) return null;
      const contentProps = api.getContentProps();
      const closingProps = !api.isOpen.value
        ? ({ "aria-hidden": true, style: { pointerEvents: "none" } } as const)
        : {};
      return h("div", {
        ...contentProps,
        ...closingProps,
        ...attrs,
        ref(el: Element | ComponentPublicInstance | null) { presenceRef.value = el as HTMLElement | null; },
      }, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// CalendarHeader
// ---------------------------------------------------------------------------

const DatePickerCalendarHeader = defineComponent({
  name: "ForgeDatePickerCalendarHeader",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => h("div", { ...api.getCalendarHeaderProps(), ...attrs }, slots['default']?.() ?? [api.monthYearLabel.value]);
  },
});

// ---------------------------------------------------------------------------
// Navigation buttons
// ---------------------------------------------------------------------------

const DatePickerViewSwitchButton = defineComponent({
  name: "ForgeDatePickerViewSwitchButton",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => h("button", { ...api.getViewSwitchButtonProps(), ...attrs }, slots['default']?.());
  },
});

const DatePickerPrevMonthButton = defineComponent({
  name: "ForgeDatePickerPrevMonthButton",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => h("button", { ...api.getPrevMonthButtonProps(), ...attrs }, slots['default']?.());
  },
});

const DatePickerNextMonthButton = defineComponent({
  name: "ForgeDatePickerNextMonthButton",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => h("button", { ...api.getNextMonthButtonProps(), ...attrs }, slots['default']?.());
  },
});

const DatePickerPrevYearRangeButton = defineComponent({
  name: "ForgeDatePickerPrevYearRangeButton",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => h("button", { ...api.getPrevYearRangeButtonProps(), ...attrs }, slots['default']?.());
  },
});

const DatePickerNextYearRangeButton = defineComponent({
  name: "ForgeDatePickerNextYearRangeButton",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => h("button", { ...api.getNextYearRangeButtonProps(), ...attrs }, slots['default']?.());
  },
});

// ---------------------------------------------------------------------------
// CalendarGrid â€” onKeyDown must be remapped to onKeydown for Vue
// ---------------------------------------------------------------------------

const DatePickerCalendarGrid = defineComponent({
  name: "ForgeDatePickerCalendarGrid",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const merged = { ...remapKeyDown(api.getCalendarGridProps()), ...attrs };
      return h("div", merged, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// CalendarRow
// ---------------------------------------------------------------------------

const DatePickerCalendarRow = defineComponent({
  name: "ForgeDatePickerCalendarRow",
  props: { weekIndex: { type: Number, required: true } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => h("div", { ...api.getCalendarRowProps(props.weekIndex), ...attrs }, slots['default']?.());
  },
});

// ---------------------------------------------------------------------------
// WeekdayHeader
// ---------------------------------------------------------------------------

const DatePickerWeekdayHeader = defineComponent({
  name: "ForgeDatePickerWeekdayHeader",
  props: { dayIndex: { type: Number, required: true } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => h("div", { ...api.getWeekdayHeaderProps(props.dayIndex), ...attrs }, slots['default']?.() ?? [api.weekdays.value[props.dayIndex]?.narrow]);
  },
});

// ---------------------------------------------------------------------------
// CalendarCell
// ---------------------------------------------------------------------------

const DatePickerCalendarCell = defineComponent({
  name: "ForgeDatePickerCalendarCell",
  props: {
    date: { type: Object as PropType<CalendarDate>, required: true },
    isOutsideMonth: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const cellProps = api.getCalendarCellProps(props.date, props.isOutsideMonth);
      return h("div", { ...cellProps, ...attrs }, slots['default']?.() ?? [props.date.day]);
    };
  },
});

// ---------------------------------------------------------------------------
// Month grid
// ---------------------------------------------------------------------------

const DatePickerMonthGrid = defineComponent({
  name: "ForgeDatePickerMonthGrid",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => h("div", { ...api.getMonthGridProps(), ...attrs }, slots['default']?.());
  },
});

const DatePickerMonthCell = defineComponent({
  name: "ForgeDatePickerMonthCell",
  props: { month: { type: Number, required: true } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const label = api.months.value[props.month - 1]?.label;
      return h("div", { ...api.getMonthCellProps(props.month), ...attrs }, slots['default']?.() ?? [label]);
    };
  },
});

// ---------------------------------------------------------------------------
// Year grid
// ---------------------------------------------------------------------------

const DatePickerYearGrid = defineComponent({
  name: "ForgeDatePickerYearGrid",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => h("div", { ...api.getYearGridProps(), ...attrs }, slots['default']?.());
  },
});

const DatePickerYearCell = defineComponent({
  name: "ForgeDatePickerYearCell",
  props: { year: { type: Number, required: true } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => h("div", { ...api.getYearCellProps(props.year), ...attrs }, slots['default']?.() ?? [props.year]);
  },
});

// ---------------------------------------------------------------------------
// Preset
// ---------------------------------------------------------------------------

const DatePickerPreset = defineComponent({
  name: "ForgeDatePickerPreset",
  props: { preset: { type: Object as PropType<DatePreset>, required: true } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => h("button", { ...api.getPresetProps(props.preset), ...attrs }, slots['default']?.() ?? [props.preset.label]);
  },
});

// ---------------------------------------------------------------------------
// HiddenInput
// ---------------------------------------------------------------------------

const DatePickerHiddenInput = defineComponent({
  name: "ForgeDatePickerHiddenInput",
  props: { name: { type: String, required: true } },
  setup(props) {
    const api = useCtx();
    return () => h("input", api.getHiddenInputProps(props.name));
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Context composable â€” for consumers who need api data (weeks, weekdays, etc.)
// ---------------------------------------------------------------------------

export function useDatePickerContext(): UseDatePickerReturn {
  return useCtx();
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const DatePicker = {
  Root: DatePickerRoot,
  Trigger: DatePickerTrigger,
  Content: DatePickerContent,
  CalendarHeader: DatePickerCalendarHeader,
  ViewSwitchButton: DatePickerViewSwitchButton,
  PrevMonthButton: DatePickerPrevMonthButton,
  NextMonthButton: DatePickerNextMonthButton,
  PrevYearRangeButton: DatePickerPrevYearRangeButton,
  NextYearRangeButton: DatePickerNextYearRangeButton,
  CalendarGrid: DatePickerCalendarGrid,
  CalendarRow: DatePickerCalendarRow,
  WeekdayHeader: DatePickerWeekdayHeader,
  CalendarCell: DatePickerCalendarCell,
  MonthGrid: DatePickerMonthGrid,
  MonthCell: DatePickerMonthCell,
  YearGrid: DatePickerYearGrid,
  YearCell: DatePickerYearCell,
  Preset: DatePickerPreset,
  HiddenInput: DatePickerHiddenInput,
} as const;

export {
  DatePickerRoot,
  DatePickerTrigger,
  DatePickerContent,
  DatePickerCalendarHeader,
  DatePickerViewSwitchButton,
  DatePickerPrevMonthButton,
  DatePickerNextMonthButton,
  DatePickerPrevYearRangeButton,
  DatePickerNextYearRangeButton,
  DatePickerCalendarGrid,
  DatePickerCalendarRow,
  DatePickerWeekdayHeader,
  DatePickerCalendarCell,
  DatePickerMonthGrid,
  DatePickerMonthCell,
  DatePickerYearGrid,
  DatePickerYearCell,
  DatePickerPreset,
  DatePickerHiddenInput,
};
