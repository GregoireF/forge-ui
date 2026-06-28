import type { HTMLAttributes, ReactNode } from "react";
import { createContext, useContext } from "react";
import type { UseDateFieldOptions } from "./use-date-field.js";
import { useDateField } from "./use-date-field.js";

type DateFieldApi = ReturnType<typeof useDateField>;

const DateFieldCtx = createContext<DateFieldApi | null>(null);

function useCtx(): DateFieldApi {
  const ctx = useContext(DateFieldCtx);
  if (!ctx) throw new Error("DateField compound parts must be inside <DateField.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface DateFieldRootProps extends UseDateFieldOptions {
  children: ReactNode;
}

function Root({ children, ...opts }: DateFieldRootProps) {
  const api = useDateField(opts);
  return <DateFieldCtx.Provider value={api}>{children}</DateFieldCtx.Provider>;
}

// ---------------------------------------------------------------------------
// Group — role="group" container for all segments
// ---------------------------------------------------------------------------

export interface DateFieldGroupProps extends HTMLAttributes<HTMLDivElement> {}

function Group({ children, ...rest }: DateFieldGroupProps) {
  const api = useCtx();
  return (
    <div {...api.getGroupProps()} {...rest}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Segments — role="spinbutton" for each date part
// ---------------------------------------------------------------------------

export interface DateFieldMonthSegmentProps extends HTMLAttributes<HTMLDivElement> {}

function MonthSegment({ children, ...rest }: DateFieldMonthSegmentProps) {
  const api = useCtx();
  return (
    <div {...(api.getMonthSegmentProps() as unknown as HTMLAttributes<HTMLDivElement>)} {...rest}>
      {children ?? api.displayValues.month ?? "MM"}
    </div>
  );
}

export interface DateFieldDaySegmentProps extends HTMLAttributes<HTMLDivElement> {}

function DaySegment({ children, ...rest }: DateFieldDaySegmentProps) {
  const api = useCtx();
  return (
    <div {...(api.getDaySegmentProps() as unknown as HTMLAttributes<HTMLDivElement>)} {...rest}>
      {children ?? api.displayValues.day ?? "DD"}
    </div>
  );
}

export interface DateFieldYearSegmentProps extends HTMLAttributes<HTMLDivElement> {}

function YearSegment({ children, ...rest }: DateFieldYearSegmentProps) {
  const api = useCtx();
  return (
    <div {...(api.getYearSegmentProps() as unknown as HTMLAttributes<HTMLDivElement>)} {...rest}>
      {children ?? api.displayValues.year ?? "YYYY"}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Separator — decorative, hidden from AT
// ---------------------------------------------------------------------------

export interface DateFieldSeparatorProps extends HTMLAttributes<HTMLSpanElement> {}

function Separator({ children, ...rest }: DateFieldSeparatorProps) {
  const api = useCtx();
  return (
    <span {...api.getSeparatorProps()} {...rest}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// HiddenInput — for form submission
// ---------------------------------------------------------------------------

export interface DateFieldHiddenInputProps {
  name: string;
}

function HiddenInput({ name }: DateFieldHiddenInputProps) {
  const api = useCtx();
  return <input {...api.getHiddenInputProps(name)} />;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

Root.displayName = "DateField.Root";
Group.displayName = "DateField.Group";
MonthSegment.displayName = "DateField.MonthSegment";
DaySegment.displayName = "DateField.DaySegment";
YearSegment.displayName = "DateField.YearSegment";
Separator.displayName = "DateField.Separator";
HiddenInput.displayName = "DateField.HiddenInput";

export const DateField = {
  Root,
  Group,
  MonthSegment,
  DaySegment,
  YearSegment,
  Separator,
  HiddenInput,
} as const;
