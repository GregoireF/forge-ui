import type { CreateTimePickerOptions, TimeValue } from "@forge-ui/time-picker";
import type { InjectionKey, PropType } from "vue";
import { defineComponent, h, inject, nextTick, provide, watch } from "vue";
import type { UseTimePickerOptions, UseTimePickerReturn } from "./use-time-picker.js";
import { useTimePicker } from "./use-time-picker.js";

const timePickerKey: InjectionKey<UseTimePickerReturn> = Symbol("forge-time-picker");

function useCtx(): UseTimePickerReturn {
  const ctx = inject(timePickerKey);
  if (!ctx) throw new Error("TimePicker compound parts must be inside <TimePicker.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const TimePickerRoot = defineComponent({
  name: "ForgeTimePickerRoot",
  props: {
    id: { type: String, default: undefined },
    value: { type: Object as PropType<TimeValue | null>, default: undefined },
    defaultValue: { type: Object as PropType<TimeValue | null>, default: undefined },
    hourCycle: { type: Number as PropType<12 | 24>, default: undefined },
    showSeconds: { type: Boolean, default: undefined },
    minuteStep: { type: Number, default: undefined },
    secondStep: { type: Number, default: undefined },
    locale: { type: String, default: undefined },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    onValueChange: { type: Function as PropType<CreateTimePickerOptions["onValueChange"]>, default: undefined },
  },
  emits: {
    "update:value": (_v: TimeValue | null) => true,
  },
  setup(props, { slots, emit }) {
    const api = useTimePicker({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.value !== undefined && { value: props.value }),
      ...(props.defaultValue !== undefined && { defaultValue: props.defaultValue }),
      ...(props.hourCycle !== undefined && { hourCycle: props.hourCycle }),
      ...(props.showSeconds !== undefined && { showSeconds: props.showSeconds }),
      ...(props.minuteStep !== undefined && { minuteStep: props.minuteStep }),
      ...(props.secondStep !== undefined && { secondStep: props.secondStep }),
      ...(props.locale !== undefined && { locale: props.locale }),
      ...(props.disabled !== undefined && { disabled: props.disabled }),
      ...(props.readOnly !== undefined && { readOnly: props.readOnly }),
      ...(props.onValueChange !== undefined && { onValueChange: props.onValueChange }),
    } as UseTimePickerOptions);

    watch(
      () => props.value,
      (v) => {
        if (v !== undefined) {
          if (v === null) {
            api.machine.update({ hoursValue: null, minutesValue: null, secondsValue: null });
          } else {
            api.machine.update({
              hoursValue: v.hours,
              minutesValue: v.minutes,
              secondsValue: v.seconds,
              period: v.hours >= 12 ? "PM" : "AM",
            });
          }
        }
      },
    );

    watch(api.assembledTime, (v) => emit("update:value", v));

    watch(api.focusedSegment, async (seg) => {
      if (!seg) return;
      const groupId = api.getGroupProps().id;
      await nextTick();
      const groupEl = document.getElementById(groupId);
      if (!groupEl) return;
      const el = groupEl.querySelector<HTMLElement>(`[data-forge-part="segment-${seg}"]`);
      if (el && document.activeElement !== el) el.focus();
    });

    provide(timePickerKey, api);
    return () => slots['default']?.();
  },
});

// ---------------------------------------------------------------------------
// Segment helper â€” remaps onKeyDown â†’ onKeydown for Vue
// ---------------------------------------------------------------------------

function remapKeyDown(props: Record<string, unknown>): Record<string, unknown> {
  const { onKeyDown, ...rest } = props as { onKeyDown?: (e: KeyboardEvent) => void; [k: string]: unknown };
  return { ...rest, ...(onKeyDown && { onKeydown: onKeyDown }) };
}

// ---------------------------------------------------------------------------
// Group
// ---------------------------------------------------------------------------

const TimePickerGroup = defineComponent({
  name: "ForgeTimePickerGroup",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => h("div", { ...api.getGroupProps(), ...attrs }, slots['default']?.());
  },
});

// ---------------------------------------------------------------------------
// Segments
// ---------------------------------------------------------------------------

const TimePickerHoursSegment = defineComponent({
  name: "ForgeTimePickerHoursSegment",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const merged = { ...remapKeyDown(api.getHoursSegmentProps()), ...attrs };
      return h("div", merged, slots['default']?.() ?? [api.displayValues.value.hours ?? "HH"]);
    };
  },
});

const TimePickerMinutesSegment = defineComponent({
  name: "ForgeTimePickerMinutesSegment",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const merged = { ...remapKeyDown(api.getMinutesSegmentProps()), ...attrs };
      return h("div", merged, slots['default']?.() ?? [api.displayValues.value.minutes ?? "MM"]);
    };
  },
});

const TimePickerSecondsSegment = defineComponent({
  name: "ForgeTimePickerSecondsSegment",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const merged = { ...remapKeyDown(api.getSecondsSegmentProps()), ...attrs };
      return h("div", merged, slots['default']?.() ?? [api.displayValues.value.seconds ?? "SS"]);
    };
  },
});

const TimePickerPeriodSegment = defineComponent({
  name: "ForgeTimePickerPeriodSegment",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const merged = { ...remapKeyDown(api.getPeriodSegmentProps()), ...attrs };
      return h("div", merged, slots['default']?.() ?? [api.displayValues.value.period ?? "AM"]);
    };
  },
});

// ---------------------------------------------------------------------------
// Separator
// ---------------------------------------------------------------------------

const TimePickerSeparator = defineComponent({
  name: "ForgeTimePickerSeparator",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => h("span", { ...api.getSeparatorProps(), ...attrs }, slots['default']?.());
  },
});

// ---------------------------------------------------------------------------
// HiddenInput
// ---------------------------------------------------------------------------

const TimePickerHiddenInput = defineComponent({
  name: "ForgeTimePickerHiddenInput",
  props: { name: { type: String, required: true } },
  setup(props) {
    const api = useCtx();
    return () => h("input", api.getHiddenInputProps(props.name));
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const TimePicker = {
  Root: TimePickerRoot,
  Group: TimePickerGroup,
  HoursSegment: TimePickerHoursSegment,
  MinutesSegment: TimePickerMinutesSegment,
  SecondsSegment: TimePickerSecondsSegment,
  PeriodSegment: TimePickerPeriodSegment,
  Separator: TimePickerSeparator,
  HiddenInput: TimePickerHiddenInput,
} as const;

export {
  TimePickerRoot,
  TimePickerGroup,
  TimePickerHoursSegment,
  TimePickerMinutesSegment,
  TimePickerSecondsSegment,
  TimePickerPeriodSegment,
  TimePickerSeparator,
  TimePickerHiddenInput,
};
