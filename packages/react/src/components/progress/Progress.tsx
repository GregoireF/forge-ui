import { connectProgress } from "@forge-ui/progress";
import type { HTMLAttributes, ReactNode } from "react";
import { createContext, useContext } from "react";
import { Slot } from "../shared/Slot.js";

// ---------------------------------------------------------------------------
// Context — shared by Root → Track / Fill / Label / ValueText
// ---------------------------------------------------------------------------

interface ProgressCtx {
  value: number | null;
  max: number;
  min: number;
}

const ProgressContext = createContext<ProgressCtx>({ value: null, max: 100, min: 0 });

function useProgressCtx(): ProgressCtx {
  return useContext(ProgressContext);
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface ProgressRootProps extends HTMLAttributes<HTMLDivElement> {
  /** Current value 0–max. null = indeterminate. */
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
  return (
    <ProgressContext.Provider value={{ value, max, min }}>
      {asChild ? <Slot {...props}>{children}</Slot> : <div {...props}>{children}</div>}
    </ProgressContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Track
// ---------------------------------------------------------------------------

export interface ProgressTrackProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  asChild?: boolean;
}

function Track({ children, asChild, ...rest }: ProgressTrackProps) {
  const { value, max, min } = useProgressCtx();
  const api = connectProgress({ value, max, min });
  const props = { ...api.getTrackProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <div {...props}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Fill
// ---------------------------------------------------------------------------

export interface ProgressFillProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

function Fill({ asChild, ...rest }: ProgressFillProps) {
  const { value, max, min } = useProgressCtx();
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
  asChild?: boolean;
}

function ValueText({ asChild, ...rest }: ProgressValueTextProps) {
  const { value, max, min } = useProgressCtx();
  const api = connectProgress({ value, max, min });
  const text = value !== null ? `${api.percent}%` : "loading";
  const props = { ...api.getValueTextProps(), ...rest };
  if (asChild) return <Slot {...props}>{text}</Slot>;
  return <span {...props}>{text}</span>;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

Root.displayName = "Progress.Root";
Track.displayName = "Progress.Track";
Fill.displayName = "Progress.Fill";
Label.displayName = "Progress.Label";
ValueText.displayName = "Progress.ValueText";

export const Progress = {
  Root,
  Track,
  Fill,
  Label,
  ValueText,
} as const;
