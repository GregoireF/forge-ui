import type { HTMLAttributes, ReactNode } from "react";
import { createContext, useContext } from "react";
import { Slot } from "../shared/Slot.js";
import type { UseAccordionOptions } from "./use-accordion.js";
import { useAccordion } from "./use-accordion.js";

type AccordionApi = ReturnType<typeof useAccordion>;

const AccordionCtx = createContext<AccordionApi | null>(null);
const AccordionItemCtx = createContext<string | null>(null);

function useCtx(): AccordionApi {
  const ctx = useContext(AccordionCtx);
  if (!ctx) throw new Error("Accordion compound parts must be used inside <Accordion.Root>");
  return ctx;
}

function useItemValue(): string {
  const val = useContext(AccordionItemCtx);
  if (val === null) throw new Error("Accordion.Header/Trigger/Content must be inside <Accordion.Item>");
  return val;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface AccordionRootProps extends UseAccordionOptions {
  children: ReactNode;
  asChild?: boolean;
}

function Root({ children, asChild, ...opts }: AccordionRootProps) {
  const api = useAccordion(opts);
  const props = api.getRootProps();
  return (
    <AccordionCtx.Provider value={api}>
      {asChild ? <Slot {...props}>{children}</Slot> : <div {...props}>{children}</div>}
    </AccordionCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Item â€" provides item value context to its children
// ---------------------------------------------------------------------------

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
  asChild?: boolean;
}

function Item({ value, children, asChild, ...rest }: AccordionItemProps) {
  const api = useCtx();
  const props = { ...api.getItemProps(value), ...rest };
  return (
    <AccordionItemCtx.Provider value={value}>
      {asChild ? <Slot {...props}>{children}</Slot> : <div {...props}>{children}</div>}
    </AccordionItemCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Header â€" semantic heading wrapper
// ---------------------------------------------------------------------------

export interface AccordionHeaderProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  asChild?: boolean;
}

function Header({ children, asChild, ...rest }: AccordionHeaderProps) {
  const api = useCtx();
  const value = useItemValue();
  const props = { ...api.getHeaderProps(value), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <h3 {...props}>{children}</h3>;
}

// ---------------------------------------------------------------------------
// Trigger â€" the button that opens/closes the item
// ---------------------------------------------------------------------------

export interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  asChild?: boolean;
}

function Trigger({ children, asChild, ...rest }: AccordionTriggerProps) {
  const api = useCtx();
  const value = useItemValue();
  // Strip Vue-cased event handler â€" React uses onKeyDown only
  const { onKeydown: _kd, ...triggerProps } = api.getTriggerProps(value);
  const props = { ...triggerProps, ...rest } as HTMLAttributes<HTMLButtonElement>;
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// Content â€" the collapsible region
// ---------------------------------------------------------------------------

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  asChild?: boolean;
  /** Keep in DOM when closed (enables exit animations via data-state="closed"). */
  forceMount?: boolean;
}

function Content({ children, asChild, forceMount, ...rest }: AccordionContentProps) {
  const api = useCtx();
  const value = useItemValue();
  const isOpen = api.value.includes(value);

  if (!forceMount && !isOpen) return null;

  const props = { ...api.getContentProps(value), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <div {...props}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

Root.displayName = "Accordion.Root";
Item.displayName = "Accordion.Item";
Header.displayName = "Accordion.Header";
Trigger.displayName = "Accordion.Trigger";
Content.displayName = "Accordion.Content";

export const Accordion = {
  Root,
  Item,
  Header,
  Trigger,
  Content,
} as const;
