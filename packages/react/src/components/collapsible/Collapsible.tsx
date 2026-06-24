import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { createContext, useContext } from "react";
import { usePresence } from "../../hooks/use-presence.js";
import { Slot } from "../shared/Slot.js";
import type { UseCollapsibleOptions } from "./use-collapsible.js";
import { useCollapsible } from "./use-collapsible.js";

type CollapsibleApiReturn = ReturnType<typeof useCollapsible>;

const CollapsibleCtx = createContext<CollapsibleApiReturn | null>(null);

function useCtx(): CollapsibleApiReturn {
  const ctx = useContext(CollapsibleCtx);
  if (!ctx) throw new Error("Collapsible compound parts must be used inside <Collapsible.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface CollapsibleRootProps extends UseCollapsibleOptions {
  children: ReactNode;
  asChild?: boolean;
}

function Root({ children, asChild, ...opts }: CollapsibleRootProps) {
  const api = useCollapsible(opts);
  const props = api.getRootProps();
  return (
    <CollapsibleCtx.Provider value={api}>
      {asChild ? <Slot {...props}>{children}</Slot> : <div {...props}>{children}</div>}
    </CollapsibleCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

export interface CollapsibleTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function Trigger({ asChild, children, ...rest }: CollapsibleTriggerProps) {
  const api = useCtx();
  // Strip Vue-only casing
  const { onKeydown: _kd, ...triggerProps } = api.getTriggerProps();
  const props = { ...triggerProps, ...rest } as ButtonHTMLAttributes<HTMLButtonElement>;
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// Content â€" Presence-aware, supports forceMount for CSS exit animations.
// ---------------------------------------------------------------------------

export interface CollapsibleContentProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  /** Keep in DOM when closed so exit animations can run via data-state="closed". */
  forceMount?: boolean;
}

function Content({ asChild, forceMount, children, ...rest }: CollapsibleContentProps) {
  const api = useCtx();
  const { isPresent } = usePresence(api.isOpen);

  if (!forceMount && !isPresent) return null;

  const props = { ...api.getContentProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <div {...props}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Collapsible = {
  Root,
  Trigger,
  Content,
} as const;
