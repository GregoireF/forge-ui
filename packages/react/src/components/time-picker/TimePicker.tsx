import type { HTMLAttributes, ReactNode } from "react";
import { createContext, useContext } from "react";
import type { UseTimePickerOptions } from "./use-time-picker.js";
import { useTimePicker } from "./use-time-picker.js";

type TimePickerApi = ReturnType<typeof useTimePicker>;

const TimePickerCtx = createContext<TimePickerApi | null>(null);

function useCtx(): TimePickerApi {
  const ctx = useContext(TimePickerCtx);
  if (!ctx) throw new Error("TimePicker compound parts must be inside <TimePicker.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface TimePickerRootProps extends UseTimePickerOptions {
  children: ReactNode;
}

function Root({ children, ...opts }: TimePickerRootProps) {
  const api = useTimePicker(opts);
  return <TimePickerCtx.Provider value={api}>{children}</TimePickerCtx.Provider>;
}

// ---------------------------------------------------------------------------
// Group — role="group" container for all segments
// ---------------------------------------------------------------------------

export interface TimePickerGroupProps extends HTMLAttributes<HTMLDivElement> {}

function Group({ children, ...rest }: TimePickerGroupProps) {
  const api = useCtx();
  return <div {...api.getGroupProps()} {...rest}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Segments
// ---------------------------------------------------------------------------

export interface TimePickerHoursSegmentProps extends HTMLAttributes<HTMLDivElement> {}

function HoursSegment({ children, ...rest }: TimePickerHoursSegmentProps) {
  const api = useCtx();
  return (
    <div {...api.getHoursSegmentProps()} {...rest}>
      {children ?? api.displayValues.hours ?? "HH"}
    </div>
  );
}

export interface TimePickerMinutesSegmentProps extends HTMLAttributes<HTMLDivElement> {}

function MinutesSegment({ children, ...rest }: TimePickerMinutesSegmentProps) {
  const api = useCtx();
  return (
    <div {...api.getMinutesSegmentProps()} {...rest}>
      {children ?? api.displayValues.minutes ?? "MM"}
    </div>
  );
}

export interface TimePickerSecondsSegmentProps extends HTMLAttributes<HTMLDivElement> {}

function SecondsSegment({ children, ...rest }: TimePickerSecondsSegmentProps) {
  const api = useCtx();
  return (
    <div {...api.getSecondsSegmentProps()} {...rest}>
      {children ?? api.displayValues.seconds ?? "SS"}
    </div>
  );
}

export interface TimePickerPeriodSegmentProps extends HTMLAttributes<HTMLDivElement> {}

function PeriodSegment({ children, ...rest }: TimePickerPeriodSegmentProps) {
  const api = useCtx();
  return (
    <div {...api.getPeriodSegmentProps()} {...rest}>
      {children ?? api.displayValues.period ?? "AM"}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Separator — decorative, hidden from AT
// ---------------------------------------------------------------------------

export interface TimePickerSeparatorProps extends HTMLAttributes<HTMLSpanElement> {}

function Separator({ children, ...rest }: TimePickerSeparatorProps) {
  const api = useCtx();
  return <span {...api.getSeparatorProps()} {...rest}>{children}</span>;
}

// ---------------------------------------------------------------------------
// HiddenInput — for form submission
// ---------------------------------------------------------------------------

export interface TimePickerHiddenInputProps {
  name: string;
}

function HiddenInput({ name }: TimePickerHiddenInputProps) {
  const api = useCtx();
  return <input {...api.getHiddenInputProps(name)} />;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const TimePicker = {
  Root,
  Group,
  HoursSegment,
  MinutesSegment,
  SecondsSegment,
  PeriodSegment,
  Separator,
  HiddenInput,
} as const;
