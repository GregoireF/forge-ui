import { mergeRefs } from "@forge-ui/core";
import type { HoverCardPositioning } from "@forge-ui/hover-card";
import type { HTMLAttributes, ReactNode } from "react";
import { createContext, useContext } from "react";
import { usePresence } from "../../hooks/use-presence.js";
import { DialogPortal } from "../dialog/DialogPortal.js";
import { Slot } from "../shared/Slot.js";
import type { UseHoverCardOptions } from "./use-hover-card.js";
import { useHoverCard } from "./use-hover-card.js";

type HoverCardApiReturn = ReturnType<typeof useHoverCard>;

const HoverCardCtx = createContext<HoverCardApiReturn | null>(null);

type HoverCardPresenceContext = {
  isPresent: boolean;
  presenceRef: (el: HTMLElement | null) => void;
};
const HoverCardPresenceCtx = createContext<HoverCardPresenceContext | null>(null);

function useCtx(): HoverCardApiReturn {
  const ctx = useContext(HoverCardCtx);
  if (!ctx) throw new Error("HoverCard compound parts must be used inside <HoverCard.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface HoverCardRootProps extends UseHoverCardOptions {
  children: ReactNode;
}

function Root({ children, ...opts }: HoverCardRootProps) {
  const api = useHoverCard(opts);
  const presence = usePresence(api.isOpen);
  return (
    <HoverCardCtx.Provider value={api}>
      <HoverCardPresenceCtx.Provider value={presence}>{children}</HoverCardPresenceCtx.Provider>
    </HoverCardCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

export interface HoverCardTriggerProps extends HTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
  href?: string;
}

function Trigger({ asChild, children, ...rest }: HoverCardTriggerProps) {
  const api = useCtx();
  const props = { ...api.getTriggerProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <a {...props}>{children}</a>;
}

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

export interface HoverCardPortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
  forceMount?: boolean;
}

function Portal({ children, container, forceMount }: HoverCardPortalProps) {
  const api = useCtx();
  const presence = useContext(HoverCardPresenceCtx);
  const isPresent = presence?.isPresent ?? api.isOpen;
  if (!forceMount && !isPresent) return null;
  return <DialogPortal {...(container !== undefined && { container })}>{children}</DialogPortal>;
}

// ---------------------------------------------------------------------------
// Content â€" Presence-aware.
// Positioner div (position:fixed) wraps the content div (role="dialog").
// During exit: aria-hidden + pointer-events:none keep content inert.
// Mouse events on content keep the card open (via connect).
// ---------------------------------------------------------------------------

export interface HoverCardContentProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  forceMount?: boolean;
  positioning?: HoverCardPositioning;
}

function Content({ asChild, forceMount, children, ...rest }: HoverCardContentProps) {
  const api = useCtx();
  const injectedPresence = useContext(HoverCardPresenceCtx);
  const ownPresence = usePresence(api.isOpen);
  const { isPresent, presenceRef } = injectedPresence ?? ownPresence;

  if (!forceMount && !isPresent) return null;

  const positionerProps = api.getPositionerProps();
  const contentProps = api.getContentProps();
  const {
    style: userStyle,
    positioning: _positioning,
    ...restProps
  } = rest as HoverCardContentProps;

  const mergedContentProps = {
    ...contentProps,
    ...(!api.isOpen && { "aria-hidden": true }),
    ...restProps,
    style: api.isOpen ? userStyle : { ...userStyle, pointerEvents: "none" as const },
    ref: mergeRefs(contentProps.ref, presenceRef),
  };

  if (asChild) {
    return (
      <div {...positionerProps}>
        <Slot {...mergedContentProps}>{children}</Slot>
      </div>
    );
  }

  return (
    <div {...positionerProps}>
      <div {...mergedContentProps}>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Arrow â€" renderless: always Slot, merges getArrowProps onto child.
// ---------------------------------------------------------------------------

export interface HoverCardArrowProps {
  children: ReactNode;
}

function Arrow({ children }: HoverCardArrowProps) {
  const api = useCtx();
  return <Slot {...api.getArrowProps()}>{children}</Slot>;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

Root.displayName = "HoverCard.Root";
Trigger.displayName = "HoverCard.Trigger";
Portal.displayName = "HoverCard.Portal";
Content.displayName = "HoverCard.Content";
Arrow.displayName = "HoverCard.Arrow";

export const HoverCard = {
  Root,
  Trigger,
  Portal,
  Content,
  Arrow,
} as const;
