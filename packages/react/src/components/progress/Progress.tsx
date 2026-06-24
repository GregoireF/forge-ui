import type { HTMLAttributes, ReactNode } from "react";
import { connectProgress } from "@forge-ui/progress";
import { Slot } from "../shared/Slot.js";

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface ProgressRootProps extends HTMLAttributes<HTMLDivElement> {
  /** Current value 0â€"max. null = indeterminate. */
  value?: number | null;
  /** @default 100 */
  max?: number;
  /** @default 0 */
  min?: number;
  children: ReactNode;
  asChild?: boolean;
}

function Root({ value = null, max = 100, min = 0, children, asChild, ...rest }: ProgressRootProps) {
  const api = connectProgress({ value, max, min });
  const props = { ...api.getRootProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <div {...props}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Track
// ---------------------------------------------------------------------------

export interface ProgressTrackProps extends HTMLAttributes<HTMLDivElement> {
  /** Current value (re-passed to render fill). Inherit from root. */
  value?: number | null;
  max?: number;
  min?: number;
  children: ReactNode;
  asChild?: boolean;
}

function Track({ value = null, max = 100, min = 0, children, asChild, ...rest }: ProgressTrackProps) {
  const api = connectProgress({ value, max, min });
  const props = { ...api.getTrackProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <div {...props}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Fill
// ---------------------------------------------------------------------------

export interface ProgressFillProps extends HTMLAttributes<HTMLDivElement> {
  value?: number | null;
  max?: number;
  min?: number;
  asChild?: boolean;
}

function Fill({ value = null, max = 100, min = 0, asChild, ...rest }: ProgressFillProps) {
  const api = connectProgress({ value, max, min });
  const props = { ...api.getFillProps(), ...rest };
  if (asChild) return <Slot {...props} />;
  return <div {...props} />;
}

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

export interface ProgressLabelProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  asChild?: boolean;
}

function Label({ children, asChild, ...rest }: ProgressLabelProps) {
  const props = { ...connectProgress({ value: null }).getLabelProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <span {...props}>{children}</span>;
}

// ---------------------------------------------------------------------------
// ValueText
// ---------------------------------------------------------------------------

export interface ProgressValueTextProps extends HTMLAttributes<HTMLSpanElement> {
  value?: number | null;
  max?: number;
  min?: number;
  asChild?: boolean;
}

function ValueText({ value = null, max = 100, min = 0, asChild, ...rest }: ProgressValueTextProps) {
  const api = connectProgress({ value, max, min });
  const text = value !== null ? `${api.percent}%` : "loading";
  const props = { ...api.getValueTextProps(), ...rest };
  if (asChild) return <Slot {...props}>{text}</Slot>;
  return <span {...props}>{text}</span>;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Progress = {
  Root,
  Track,
  Fill,
  Label,
  ValueText,
} as const;
