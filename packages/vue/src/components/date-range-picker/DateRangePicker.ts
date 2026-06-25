import type { CalendarDate, CreateDateRangePickerOptions, DateRange } from "@forge-ui/date-range-picker";
import type { InjectionKey, PropType, Ref } from "vue";
import { defineComponent, h, inject, provide, watch } from "vue";
import { usePresence } from "../../hooks/use-presence.js";
import type { UseDateRangePickerReturn } from "./use-date-range-picker.js";
import { useDateRangePicker } from "./use-date-range-picker.js";

const dateRangePickerKey: InjectionKey<UseDateRangePickerReturn> = Symbol("forge-date-range-picker");

type DateRangePickerPresenceContext = { isPresent: Ref<boolean>; presenceRef: Ref<HTMLElement | null> };
const dateRangePickerPresenceKey: InjectionKey<DateRangePickerPresenceContext> = Symbol("forge-date-range-picker-presence");

function useCtx(): UseDateRangePickerReturn {
  const ctx = inject(dateRangePickerKey);
  if (!ctx) throw new Error("DateRangePicker compound parts must be inside <DateRangePicker.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const DateRangePickerRoot = defineComponent({
  name: "ForgeDateRangePickerRoot",
  props: {
    id: { type: String, default: undefined },
    value: { type: Object as PropType<DateRange | null>, default: undefined },
    defaultValue: { type: Object as PropType<DateRange | null>, default: undefined },
    locale: { type: String, default: undefined },
    firstDayOfWeek: { type: Number, default: undefined },
    numberOfMonths: { type: Number, default: undefined },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    onValueChange: { type: Function as PropType<CreateDateRangePickerOptions["onValueChange"]>, default: undefined },
    onOpenChange: { type: Function as PropType<CreateDateRangePickerOptions["onOpenChange"]>, default: undefined },
  },
  emits: ["update:value"],
  setup(props, { slots, emit }) {
    const api = useDateRangePicker({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.value !== undefined && { value: props.value }),
      ...(props.defaultValue !== undefined && { defaultValue: props.defaultValue }),
      ...(props.locale !== undefined && { locale: props.locale }),
      ...(props.firstDayOfWeek !== undefined && { firstDayOfWeek: props.firstDayOfWeek }),
      ...(props.numberOfMonths !== undefined && { numberOfMonths: props.numberOfMonths }),
      ...(props.disabled !== undefined && { disabled: props.disabled }),
      ...(props.readOnly !== undefined && { readOnly: props.readOnly }),
      ...(props.onValueChange !== undefined && { onValueChange: props.onValueChange }),
      ...(props.onOpenChange !== undefined && { onOpenChange: props.onOpenChange }),
    });

    watch(
      () => props.value,
      (v) => {
        if (v !== undefined) {
          api.machine.update({
            startDate: v?.start ?? null,
            endDate: v?.end ?? null,
          });
        }
      },
    );

    watch(
      () => ({ start: api.startDate.value, end: api.endDate.value }),
      (v) => emit("update:value", v),
    );

    const presence = usePresence(api.isOpen);
    provide(dateRangePickerPresenceKey, presence);
    provide(dateRangePickerKey, api);
    return () => slots.default?.();
  },
});

// ---------------------------------------------------------------------------
// onKeyDown → onKeydown remap helper
// ---------------------------------------------------------------------------

function remapKeyDown(props: Record<string, unknown>): Record<string, unknown> {
  const { onKeyDown, ...rest } = props as { onKeyDown?: (e: KeyboardEvent) => void; [k: string]: unknown };
  return { ...rest, ...(onKeyDown && { onKeydown: onKeyDown }) };
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

const DateRangePickerTrigger = defineComponent({
  name: "ForgeDateRangePickerTrigger",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => h("button", { ...api.getTriggerProps(), ...attrs }, slots.default?.());
  },
});

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const DateRangePickerContent = defineComponent({
  name: "ForgeDateRangePickerContent",
  props: {
    forceMount: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    const sharedPresence = inject(dateRangePickerPresenceKey, null);
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
        ref(el: HTMLElement | null) { presenceRef.value = el; },
      }, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// CalendarHeader
// ---------------------------------------------------------------------------

const DateRangePickerCalendarHeader = defineComponent({
  name: "ForgeDateRangePickerCalendarHeader",
  props: { monthOffset: { type: Number, default: 0 } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const { label, ...headerProps } = api.getCalendarHeaderProps(props.monthOffset);
      return h("div", { ...headerProps, ...attrs }, slots.default?.() ?? [label]);
    };
  },
});

// ---------------------------------------------------------------------------
// Navigation buttons
// ---------------------------------------------------------------------------

const DateRangePickerPrevMonthButton = defineComponent({
  name: "ForgeDateRangePickerPrevMonthButton",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => h("button", { ...api.getPrevMonthButtonProps(), ...attrs }, slots.default?.());
  },
});

const DateRangePickerNextMonthButton = defineComponent({
  name: "ForgeDateRangePickerNextMonthButton",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => h("button", { ...api.getNextMonthButtonProps(), ...attrs }, slots.default?.());
  },
});

// ---------------------------------------------------------------------------
// CalendarGrid — onKeyDown must be remapped to onKeydown for Vue
// ---------------------------------------------------------------------------

const DateRangePickerCalendarGrid = defineComponent({
  name: "ForgeDateRangePickerCalendarGrid",
  props: { monthOffset: { type: Number, default: 0 } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const merged = { ...remapKeyDown(api.getCalendarGridProps(props.monthOffset)), ...attrs };
      return h("div", merged, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// CalendarRow, WeekdayHeader
// ---------------------------------------------------------------------------

const DateRangePickerCalendarRow = defineComponent({
  name: "ForgeDateRangePickerCalendarRow",
  props: { weekIndex: { type: Number, required: true } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => h("div", { ...api.getCalendarRowProps(props.weekIndex), ...attrs }, slots.default?.());
  },
});

const DateRangePickerWeekdayHeader = defineComponent({
  name: "ForgeDateRangePickerWeekdayHeader",
  props: { dayIndex: { type: Number, required: true } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => h("div", { ...api.getWeekdayHeaderProps(props.dayIndex), ...attrs }, slots.default?.());
  },
});

// ---------------------------------------------------------------------------
// CalendarCell
// ---------------------------------------------------------------------------

const DateRangePickerCalendarCell = defineComponent({
  name: "ForgeDateRangePickerCalendarCell",
  props: {
    date: { type: Object as PropType<CalendarDate>, required: true },
    isOutsideMonth: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const cellProps = api.getCalendarCellProps(props.date, props.isOutsideMonth);
      return h("div", { ...cellProps, ...attrs }, slots.default?.() ?? [props.date.day]);
    };
  },
});

// ---------------------------------------------------------------------------
// ClearButton
// ---------------------------------------------------------------------------

const DateRangePickerClearButton = defineComponent({
  name: "ForgeDateRangePickerClearButton",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => h("button", { ...api.getClearButtonProps(), ...attrs }, slots.default?.() ?? ["Clear"]);
  },
});

// ---------------------------------------------------------------------------
// Preset
// ---------------------------------------------------------------------------

const DateRangePickerPreset = defineComponent({
  name: "ForgeDateRangePickerPreset",
  props: {
    preset: { type: Object as PropType<{ label: string; getValue: (today: CalendarDate) => DateRange }>, required: true },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => h("button", { ...api.getPresetProps(props.preset), ...attrs }, slots.default?.() ?? [props.preset.label]);
  },
});

// ---------------------------------------------------------------------------
// HiddenInputs — start + end for form submission
// ---------------------------------------------------------------------------

const DateRangePickerHiddenInputs = defineComponent({
  name: "ForgeDateRangePickerHiddenInputs",
  props: {
    startName: { type: String, required: true },
    endName: { type: String, required: true },
  },
  setup(props) {
    const api = useCtx();
    return () => [
      h("input", api.getHiddenStartInputProps(props.startName)),
      h("input", api.getHiddenEndInputProps(props.endName)),
    ];
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const DateRangePicker = {
  Root: DateRangePickerRoot,
  Trigger: DateRangePickerTrigger,
  Content: DateRangePickerContent,
  CalendarHeader: DateRangePickerCalendarHeader,
  PrevMonthButton: DateRangePickerPrevMonthButton,
  NextMonthButton: DateRangePickerNextMonthButton,
  CalendarGrid: DateRangePickerCalendarGrid,
  CalendarRow: DateRangePickerCalendarRow,
  WeekdayHeader: DateRangePickerWeekdayHeader,
  CalendarCell: DateRangePickerCalendarCell,
  ClearButton: DateRangePickerClearButton,
  Preset: DateRangePickerPreset,
  HiddenInputs: DateRangePickerHiddenInputs,
} as const;

export {
  DateRangePickerRoot,
  DateRangePickerTrigger,
  DateRangePickerContent,
  DateRangePickerCalendarHeader,
  DateRangePickerPrevMonthButton,
  DateRangePickerNextMonthButton,
  DateRangePickerCalendarGrid,
  DateRangePickerCalendarRow,
  DateRangePickerWeekdayHeader,
  DateRangePickerCalendarCell,
  DateRangePickerClearButton,
  DateRangePickerPreset,
  DateRangePickerHiddenInputs,
};
