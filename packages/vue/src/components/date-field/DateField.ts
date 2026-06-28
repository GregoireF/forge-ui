import type { CalendarDate, CreateDateFieldOptions } from "@forge-ui/date-field";
import type { InjectionKey, PropType } from "vue";
import { defineComponent, h, inject, nextTick, provide, watch } from "vue";
import type { UseDateFieldOptions, UseDateFieldReturn } from "./use-date-field.js";
import { useDateField } from "./use-date-field.js";

const dateFieldKey: InjectionKey<UseDateFieldReturn> = Symbol("forge-date-field");

function useCtx(): UseDateFieldReturn {
  const ctx = inject(dateFieldKey);
  if (!ctx) throw new Error("DateField compound parts must be inside <DateField.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const DateFieldRoot = defineComponent({
  name: "ForgeDateFieldRoot",
  props: {
    id: { type: String, default: undefined },
    value: { type: Object as PropType<CalendarDate | null>, default: undefined },
    defaultValue: { type: Object as PropType<CalendarDate | null>, default: undefined },
    locale: { type: String, default: undefined },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    onValueChange: { type: Function as PropType<CreateDateFieldOptions["onValueChange"]>, default: undefined },
  },
  emits: {
    "update:value": (_v: CalendarDate | null) => true,
  },
  setup(props, { slots, emit }) {
    const api = useDateField({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.value !== undefined && { value: props.value }),
      ...(props.defaultValue !== undefined && { defaultValue: props.defaultValue }),
      ...(props.locale !== undefined && { locale: props.locale }),
      ...(props.disabled !== undefined && { disabled: props.disabled }),
      ...(props.readOnly !== undefined && { readOnly: props.readOnly }),
      ...(props.onValueChange !== undefined && { onValueChange: props.onValueChange }),
    } as UseDateFieldOptions);

    watch(
      () => props.value,
      (v) => {
        if (v !== undefined) {
          api.machine.update({
            dayValue: v?.day ?? null,
            monthValue: v?.month ?? null,
            yearValue: v?.year ?? null,
          });
        }
      },
    );

    watch(api.assembledDate, (v) => emit("update:value", v));

    watch(api.focusedSegment, async (seg) => {
      if (!seg) return;
      const groupId = api.getGroupProps().id;
      await nextTick();
      const groupEl = document.getElementById(groupId);
      if (!groupEl) return;
      const el = groupEl.querySelector<HTMLElement>(`[data-forge-part="segment-${seg}"]`);
      if (el && document.activeElement !== el) el.focus();
    });

    provide(dateFieldKey, api);
    return () => slots['default']?.();
  },
});

// ---------------------------------------------------------------------------
// Group
// ---------------------------------------------------------------------------

const DateFieldGroup = defineComponent({
  name: "ForgeDateFieldGroup",
  props: { asChild: { type: Boolean, default: false } },
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => h("div", { ...api.getGroupProps(), ...attrs }, slots['default']?.());
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
// MonthSegment
// ---------------------------------------------------------------------------

const DateFieldMonthSegment = defineComponent({
  name: "ForgeDateFieldMonthSegment",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const merged = { ...remapKeyDown(api.getMonthSegmentProps()), ...attrs };
      return h("div", merged, slots['default']?.() ?? [api.displayValues.value.month ?? "MM"]);
    };
  },
});

// ---------------------------------------------------------------------------
// DaySegment
// ---------------------------------------------------------------------------

const DateFieldDaySegment = defineComponent({
  name: "ForgeDateFieldDaySegment",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const merged = { ...remapKeyDown(api.getDaySegmentProps()), ...attrs };
      return h("div", merged, slots['default']?.() ?? [api.displayValues.value.day ?? "DD"]);
    };
  },
});

// ---------------------------------------------------------------------------
// YearSegment
// ---------------------------------------------------------------------------

const DateFieldYearSegment = defineComponent({
  name: "ForgeDateFieldYearSegment",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const merged = { ...remapKeyDown(api.getYearSegmentProps()), ...attrs };
      return h("div", merged, slots['default']?.() ?? [api.displayValues.value.year ?? "YYYY"]);
    };
  },
});

// ---------------------------------------------------------------------------
// Separator
// ---------------------------------------------------------------------------

const DateFieldSeparator = defineComponent({
  name: "ForgeDateFieldSeparator",
  setup(_, { slots, attrs }) {
    const api = useCtx();
    return () => h("span", { ...api.getSeparatorProps(), ...attrs }, slots['default']?.());
  },
});

// ---------------------------------------------------------------------------
// HiddenInput
// ---------------------------------------------------------------------------

const DateFieldHiddenInput = defineComponent({
  name: "ForgeDateFieldHiddenInput",
  props: { name: { type: String, required: true } },
  setup(props) {
    const api = useCtx();
    return () => h("input", api.getHiddenInputProps(props.name));
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const DateField = {
  Root: DateFieldRoot,
  Group: DateFieldGroup,
  MonthSegment: DateFieldMonthSegment,
  DaySegment: DateFieldDaySegment,
  YearSegment: DateFieldYearSegment,
  Separator: DateFieldSeparator,
  HiddenInput: DateFieldHiddenInput,
} as const;

export {
  DateFieldRoot,
  DateFieldGroup,
  DateFieldMonthSegment,
  DateFieldDaySegment,
  DateFieldYearSegment,
  DateFieldSeparator,
  DateFieldHiddenInput,
};
