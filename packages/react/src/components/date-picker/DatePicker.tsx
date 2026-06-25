import { mergeRefs } from "@forge-ui/core";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { createContext, useContext } from "react";
import { usePresence } from "../../hooks/use-presence.js";
import { DialogPortal } from "../dialog/DialogPortal.js";
import type { UseDatePickerOptions } from "./use-date-picker.js";
import { useDatePicker } from "./use-date-picker.js";

type DatePickerApi = ReturnType<typeof useDatePicker>;

const DatePickerCtx = createContext<DatePickerApi | null>(null);
const DatePickerPresenceCtx = createContext<ReturnType<typeof usePresence> | null>(null);

function useCtx(): DatePickerApi {
  const ctx = useContext(DatePickerCtx);
  if (!ctx) throw new Error("DatePicker compound parts must be inside <DatePicker.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface DatePickerRootProps extends UseDatePickerOptions {
  children: ReactNode;
}

function Root({ children, ...opts }: DatePickerRootProps) {
  const api = useDatePicker(opts);
  const presence = usePresence(api.isOpen);
  return (
    <DatePickerCtx.Provider value={api}>
      <DatePickerPresenceCtx.Provider value={presence}>
        {children}
      </DatePickerPresenceCtx.Provider>
    </DatePickerCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

export interface DatePickerTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

function Trigger({ children, ...rest }: DatePickerTriggerProps) {
  const api = useCtx();
  const props = { ...api.getTriggerProps(), ...rest };
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// Portal — optional, wraps content in a React portal (default: document.body)
// ---------------------------------------------------------------------------

export interface DatePickerPortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
  forceMount?: boolean;
}

function Portal({ children, container, forceMount }: DatePickerPortalProps) {
  const api = useCtx();
  const presence = useContext(DatePickerPresenceCtx);
  const isPresent = presence?.isPresent ?? api.isOpen;
  if (!forceMount && !isPresent) return null;
  return <DialogPortal {...(container !== undefined && { container })}>{children}</DialogPortal>;
}

// ---------------------------------------------------------------------------
// Content — dialog container for the calendar
// ---------------------------------------------------------------------------

export interface DatePickerContentProps extends HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
}

function Content({ forceMount, children, ...rest }: DatePickerContentProps) {
  const api = useCtx();
  const injectedPresence = useContext(DatePickerPresenceCtx);
  const ownPresence = usePresence(api.isOpen);
  const { isPresent, presenceRef } = injectedPresence ?? ownPresence;

  if (!forceMount && !isPresent) return null;

  const contentProps = api.getContentProps();
  const { style: userStyle, ...restProps } = rest;

  const props = {
    ...contentProps,
    ...(!api.isOpen && { "aria-hidden": true }),
    ...restProps,
    style: api.isOpen ? userStyle : { ...userStyle, pointerEvents: "none" as const },
    ref: mergeRefs(contentProps.ref, presenceRef),
  };

  return <div {...props}>{children}</div>;
}

// ---------------------------------------------------------------------------
// CalendarHeader — live region + month/year label
// ---------------------------------------------------------------------------

export interface DatePickerCalendarHeaderProps extends HTMLAttributes<HTMLDivElement> {}

function CalendarHeader({ children, ...rest }: DatePickerCalendarHeaderProps) {
  const api = useCtx();
  return <div {...api.getCalendarHeaderProps()} {...rest}>{children ?? api.monthYearLabel}</div>;
}

// ---------------------------------------------------------------------------
// Navigation buttons
// ---------------------------------------------------------------------------

export interface DatePickerNavButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

function PrevMonthButton({ children, ...rest }: DatePickerNavButtonProps) {
  const api = useCtx();
  return <button {...api.getPrevMonthButtonProps()} {...rest}>{children}</button>;
}

function NextMonthButton({ children, ...rest }: DatePickerNavButtonProps) {
  const api = useCtx();
  return <button {...api.getNextMonthButtonProps()} {...rest}>{children}</button>;
}

function ViewSwitchButton({ children, ...rest }: DatePickerNavButtonProps) {
  const api = useCtx();
  return <button {...api.getViewSwitchButtonProps()} {...rest}>{children}</button>;
}

function PrevYearRangeButton({ children, ...rest }: DatePickerNavButtonProps) {
  const api = useCtx();
  return <button {...api.getPrevYearRangeButtonProps()} {...rest}>{children}</button>;
}

function NextYearRangeButton({ children, ...rest }: DatePickerNavButtonProps) {
  const api = useCtx();
  return <button {...api.getNextYearRangeButtonProps()} {...rest}>{children}</button>;
}

// ---------------------------------------------------------------------------
// CalendarGrid — role="grid" with keyboard navigation
// ---------------------------------------------------------------------------

export interface DatePickerCalendarGridProps extends HTMLAttributes<HTMLDivElement> {}

function CalendarGrid({ children, ...rest }: DatePickerCalendarGridProps) {
  const api = useCtx();
  return <div {...(api.getCalendarGridProps() as unknown as HTMLAttributes<HTMLDivElement>)} {...rest}>{children}</div>;
}

// ---------------------------------------------------------------------------
// CalendarRow, WeekdayHeader
// ---------------------------------------------------------------------------

export interface DatePickerCalendarRowProps extends HTMLAttributes<HTMLDivElement> {
  weekIndex: number;
}

function CalendarRow({ weekIndex, children, ...rest }: DatePickerCalendarRowProps) {
  const api = useCtx();
  return <div {...api.getCalendarRowProps(weekIndex)} {...rest}>{children}</div>;
}

export interface DatePickerWeekdayHeaderProps extends HTMLAttributes<HTMLDivElement> {
  dayIndex: number;
}

function WeekdayHeader({ dayIndex, children, ...rest }: DatePickerWeekdayHeaderProps) {
  const api = useCtx();
  return <div {...api.getWeekdayHeaderProps(dayIndex)} {...rest}>{children ?? api.weekdays[dayIndex]?.narrow}</div>;
}

// ---------------------------------------------------------------------------
// CalendarCell — day cell with selection and focus handling
// ---------------------------------------------------------------------------

import type { CalendarDate } from "@forge-ui/date-picker";

export interface DatePickerCalendarCellProps extends HTMLAttributes<HTMLDivElement> {
  date: CalendarDate;
  isOutsideMonth?: boolean;
}

function CalendarCell({ date, isOutsideMonth, children, ...rest }: DatePickerCalendarCellProps) {
  const api = useCtx();
  return (
    <div {...api.getCalendarCellProps(date, isOutsideMonth)} {...rest}>
      {children ?? date.day}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Month grid (month picker view)
// ---------------------------------------------------------------------------

export interface DatePickerMonthGridProps extends HTMLAttributes<HTMLDivElement> {}

function MonthGrid({ children, ...rest }: DatePickerMonthGridProps) {
  const api = useCtx();
  return <div {...api.getMonthGridProps()} {...rest}>{children}</div>;
}

export interface DatePickerMonthCellProps extends HTMLAttributes<HTMLDivElement> {
  month: number;
}

function MonthCell({ month, children, ...rest }: DatePickerMonthCellProps) {
  const api = useCtx();
  return (
    <div {...api.getMonthCellProps(month)} {...rest}>
      {children ?? api.months[month - 1]?.label}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Year grid (year picker view)
// ---------------------------------------------------------------------------

export interface DatePickerYearGridProps extends HTMLAttributes<HTMLDivElement> {}

function YearGrid({ children, ...rest }: DatePickerYearGridProps) {
  const api = useCtx();
  return <div {...api.getYearGridProps()} {...rest}>{children}</div>;
}

export interface DatePickerYearCellProps extends HTMLAttributes<HTMLDivElement> {
  year: number;
}

function YearCell({ year, children, ...rest }: DatePickerYearCellProps) {
  const api = useCtx();
  return (
    <div {...api.getYearCellProps(year)} {...rest}>
      {children ?? year}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preset button
// ---------------------------------------------------------------------------

import type { DatePreset } from "@forge-ui/date-picker";

export interface DatePickerPresetProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  preset: DatePreset;
}

function Preset({ preset, children, ...rest }: DatePickerPresetProps) {
  const api = useCtx();
  return <button {...api.getPresetProps(preset)} {...rest}>{children ?? preset.label}</button>;
}

// ---------------------------------------------------------------------------
// HiddenInput — for form submission
// ---------------------------------------------------------------------------

export interface DatePickerHiddenInputProps {
  name: string;
}

function HiddenInput({ name }: DatePickerHiddenInputProps) {
  const api = useCtx();
  return <input {...api.getHiddenInputProps(name)} />;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Context hook — for consumers who need to access api data inside the tree
// ---------------------------------------------------------------------------

export function useDatePickerContext(): DatePickerApi {
  return useCtx();
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const DatePicker = {
  Root,
  Trigger,
  Portal,
  Content,
  CalendarHeader,
  ViewSwitchButton,
  PrevMonthButton,
  NextMonthButton,
  PrevYearRangeButton,
  NextYearRangeButton,
  CalendarGrid,
  CalendarRow,
  WeekdayHeader,
  CalendarCell,
  MonthGrid,
  MonthCell,
  YearGrid,
  YearCell,
  Preset,
  HiddenInput,
} as const;
