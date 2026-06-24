import type { HTMLAttributes, ReactNode } from "react";
import { createContext, useContext } from "react";
import { Slot } from "../shared/Slot.js";
import type { UseTabsOptions } from "./use-tabs.js";
import { useTabs } from "./use-tabs.js";

type TabsApi = ReturnType<typeof useTabs>;

const TabsCtx = createContext<TabsApi | null>(null);

function useCtx(): TabsApi {
  const ctx = useContext(TabsCtx);
  if (!ctx) throw new Error("Tabs compound parts must be used inside <Tabs.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface TabsRootProps extends UseTabsOptions {
  children: ReactNode;
  asChild?: boolean;
}

function Root({ children, asChild, ...opts }: TabsRootProps) {
  const api = useTabs(opts);
  const props = api.getRootProps();
  return (
    <TabsCtx.Provider value={api}>
      {asChild ? <Slot {...props}>{children}</Slot> : <div {...props}>{children}</div>}
    </TabsCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// List â€" the tablist container
// ---------------------------------------------------------------------------

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  asChild?: boolean;
}

function List({ children, asChild, ...rest }: TabsListProps) {
  const api = useCtx();
  const props = { ...api.getListProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <div {...props}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Trigger â€" a tab button
// ---------------------------------------------------------------------------

export interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  children: ReactNode;
  asChild?: boolean;
}

function Trigger({ value, children, asChild, ...rest }: TabsTriggerProps) {
  const api = useCtx();
  // Strip Vue-only event handlers
  const { onKeydown: _kd, onFocusin: _fi, ...triggerProps } = api.getTriggerProps(value);
  const props = { ...triggerProps, ...rest } as HTMLAttributes<HTMLButtonElement>;
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// Panel â€" the tab content panel
// ---------------------------------------------------------------------------

export interface TabsPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
  asChild?: boolean;
  /** Keep in DOM when inactive (enables exit animations). */
  forceMount?: boolean;
}

function Panel({ value, children, asChild, forceMount, ...rest }: TabsPanelProps) {
  const api = useCtx();
  const isActive = api.value === value;

  if (!forceMount && !isActive) return null;

  const props = { ...api.getPanelProps(value), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <div {...props}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Tabs = {
  Root,
  List,
  Trigger,
  Panel,
} as const;
