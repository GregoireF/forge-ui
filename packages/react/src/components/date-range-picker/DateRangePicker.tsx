import { mergeRefs } from "@forge-ui/core";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { createContext, useContext } from "react";
import { usePresence } from "../../hooks/use-presence.js";
import { DialogPortal } from "../dialog/DialogPortal.js";
import type { UseDateRangePickerOptions } from "./use-date-range-picker.js";
import { useDateRangePicker } from "./use-date-range-picker.js";

type DateRangePickerApi = ReturnType<typeof useDateRangePicker>;

const DateRangePickerCtx = createContext<DateRangePickerApi | null>(null);
const DateRangePickerPresenceCtx = createContext<ReturnType<typeof usePresence> | null>(null);

function useCtx(): DateRangePickerApi {
  const ctx = useContext(DateRangePickerCtx);
  if (!ctx) throw new Error("DateRangePicker compound parts must be inside <DateRangePicker.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface DateRangePickerRootProps extends UseDateRangePickerOptions {
  children: ReactNode;
}

function Root({ children, ...opts }: DateRangePickerRootProps) {
  const api = useDateRangePicker(opts);
  const presence = usePresence(api.isOpen);
  return (
    <DateRangePickerCtx.Provider value={api}>
      <DateRangePickerPresenceCtx.Provider value={presence}>
        {children}
      </DateRangePickerPresenceCtx.Provider>
    </DateRangePickerCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

export interface DateRangePickerTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

function Trigger({ children, ...rest }: DateRangePickerTriggerProps) {
  const api = useCtx();
  const props = { ...api.getTriggerProps(), ...rest };
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

export interface DateRangePickerPortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
  forceMount?: boolean;
}

function Portal({ children, container, forceMount }: DateRangePickerPortalProps) {
  const api = useCtx();
  const presence = useContext(DateRangePickerPresenceCtx);
  const isPresent = presence?.isPresent ?? api.isOpen;
  if (!forceMount && !isPresent) return null;
  return <DialogPortal {...(container !== undefined && { container })}>{children}</DialogPortal>;
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export interface DateRangePickerContentProps extends HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
}

function Content({ forceMount, children, ...rest }: DateRangePickerContentProps) {
  const api = useCtx();
  const injectedPresence = useContext(DateRangePickerPresenceCtx);
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
// CalendarHeader — supports monthOffset for multi-month layouts
// ---------------------------------------------------------------------------

export interface DateRangePickerCalendarHeaderProps extends HTMLAttributes<HTMLDivElement> {
  monthOffset?: number;
}

function CalendarHeader({ monthOffset = 0, children, ...rest }: DateRangePickerCalendarHeaderProps) {
  const api = useCtx();
  const { label, ...headerProps } = api.getCalendarHeaderProps(monthOffset);
  return <div {...headerProps} {...rest}>{children ?? label}</div>;
}

// ---------------------------------------------------------------------------
// Navigation buttons
// ---------------------------------------------------------------------------

export interface DateRangePickerNavButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

function PrevMonthButton({ children, ...rest }: DateRangePickerNavButtonProps) {
  const api = useCtx();
  return <button {...api.getPrevMonthButtonProps()} {...rest}>{children}</button>;
}

function NextMonthButton({ children, ...rest }: DateRangePickerNavButtonProps) {
  const api = useCtx();
  return <button {...api.getNextMonthButtonProps()} {...rest}>{children}</button>;
}

// ---------------------------------------------------------------------------
// CalendarGrid — supports monthOffset for multi-month layouts
// ---------------------------------------------------------------------------

export interface DateRangePickerCalendarGridProps extends HTMLAttributes<HTMLDivElement> {
  monthOffset?: number;
}

function CalendarGrid({ monthOffset = 0, children, ...rest }: DateRangePickerCalendarGridProps) {
  const api = useCtx();
  return <div {...api.getCalendarGridProps(monthOffset)} {...rest}>{children}</div>;
}

// ---------------------------------------------------------------------------
// CalendarRow, WeekdayHeader
// ---------------------------------------------------------------------------

export interface DateRangePickerCalendarRowProps extends HTMLAttributes<HTMLDivElement> {
  weekIndex: number;
}

function CalendarRow({ weekIndex, children, ...rest }: DateRangePickerCalendarRowProps) {
  const api = useCtx();
  return <div {...api.getCalendarRowProps(weekIndex)} {...rest}>{children}</div>;
}

export interface DateRangePickerWeekdayHeaderProps extends HTMLAttributes<HTMLDivElement> {
  dayIndex: number;
}

function WeekdayHeader({ dayIndex, children, ...rest }: DateRangePickerWeekdayHeaderProps) {
  const api = useCtx();
  return <div {...api.getWeekdayHeaderProps(dayIndex)} {...rest}>{children}</div>;
}

// ---------------------------------------------------------------------------
// CalendarCell
// ---------------------------------------------------------------------------

import type { CalendarDate } from "@forge-ui/date-range-picker";

export interface DateRangePickerCalendarCellProps extends HTMLAttributes<HTMLDivElement> {
  date: CalendarDate;
  isOutsideMonth?: boolean;
}

function CalendarCell({ date, isOutsideMonth, children, ...rest }: DateRangePickerCalendarCellProps) {
  const api = useCtx();
  return (
    <div {...api.getCalendarCellProps(date, isOutsideMonth)} {...rest}>
      {children ?? date.day}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ClearButton
// ---------------------------------------------------------------------------

function ClearButton({ children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const api = useCtx();
  return <button {...api.getClearButtonProps()} {...rest}>{children ?? "Clear"}</button>;
}

// ---------------------------------------------------------------------------
// Preset button
// ---------------------------------------------------------------------------

import type { DateRange } from "@forge-ui/date-range-picker";

export interface DateRangePickerPresetProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  preset: { label: string; getValue: (today: CalendarDate) => DateRange };
}

function Preset({ preset, children, ...rest }: DateRangePickerPresetProps) {
  const api = useCtx();
  return <button {...api.getPresetProps(preset)} {...rest}>{children ?? preset.label}</button>;
}

// ---------------------------------------------------------------------------
// Hidden inputs — start and end for form submission
// ---------------------------------------------------------------------------

export interface DateRangePickerHiddenInputsProps {
  startName: string;
  endName: string;
}

function HiddenInputs({ startName, endName }: DateRangePickerHiddenInputsProps) {
  const api = useCtx();
  return (
    <>
      <input {...api.getHiddenStartInputProps(startName)} />
      <input {...api.getHiddenEndInputProps(endName)} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const DateRangePicker = {
  Root,
  Trigger,
  Portal,
  Content,
  CalendarHeader,
  PrevMonthButton,
  NextMonthButton,
  CalendarGrid,
  CalendarRow,
  WeekdayHeader,
  CalendarCell,
  ClearButton,
  Preset,
  HiddenInputs,
} as const;
