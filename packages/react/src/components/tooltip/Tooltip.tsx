import { mergeRefs } from "@forge-ui/core";
import type { TooltipPositioning, TooltipProviderContext } from "@forge-ui/tooltip";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useMemo, useRef } from "react";
import { usePresence } from "../../hooks/use-presence.js";
import { DialogPortal } from "../dialog/DialogPortal.js";
import { Slot } from "../dialog/Slot.js";
import { TooltipProviderCtx } from "./use-tooltip-provider.js";
import type { UseTooltipOptions } from "./use-tooltip.js";
import { useTooltip } from "./use-tooltip.js";

type TooltipApiReturn = ReturnType<typeof useTooltip>;

const TooltipCtx = createContext<TooltipApiReturn | null>(null);

function useCtx(): TooltipApiReturn {
  const ctx = useContext(TooltipCtx);
  if (!ctx) throw new Error("Tooltip compound parts must be used inside <Tooltip.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider — optional global delay management.
// Uses a per-instance ref (not module singleton) so multiple Provider groups
// and SSR are both safe.
// ---------------------------------------------------------------------------

export interface TooltipProviderProps {
  children: ReactNode;
  openDelay?: number;
  closeDelay?: number;
  /** Max ms between a tooltip closing and the next tooltip opening to skip openDelay. */
  skipDelay?: number;
  interactive?: boolean;
}

function Provider({
  children,
  openDelay = 700,
  closeDelay = 300,
  skipDelay = 300,
  interactive = false,
}: TooltipProviderProps) {
  const lastClosedAtRef = useRef(0);
  const value = useMemo<TooltipProviderContext>(
    () => ({
      openDelay,
      closeDelay,
      skipDelay,
      interactive,
      isInQuickSuccession: () => Date.now() - lastClosedAtRef.current < skipDelay,
      notifyOpen: () => {},
      notifyClose: () => {
        lastClosedAtRef.current = Date.now();
      },
    }),
    [openDelay, closeDelay, skipDelay, interactive],
  );
  return <TooltipProviderCtx.Provider value={value}>{children}</TooltipProviderCtx.Provider>;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface TooltipRootProps extends UseTooltipOptions {
  children: ReactNode;
}

function Root({ children, ...opts }: TooltipRootProps) {
  const api = useTooltip(opts);
  return <TooltipCtx.Provider value={api}>{children}</TooltipCtx.Provider>;
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

export interface TooltipTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function Trigger({ asChild, children, ...rest }: TooltipTriggerProps) {
  const api = useCtx();
  const props = { ...api.getTriggerProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

export interface TooltipPortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
  forceMount?: boolean;
}

function Portal({ children, container, forceMount }: TooltipPortalProps) {
  const api = useCtx();
  if (!forceMount && !api.isOpen) return null;
  return <DialogPortal {...(container !== undefined && { container })}>{children}</DialogPortal>;
}

// ---------------------------------------------------------------------------
// Content — Presence-aware.
// Positioner div (position:fixed) wraps the tooltip div (role="tooltip").
// During exit: aria-hidden + pointer-events:none keep content inert.
// ---------------------------------------------------------------------------

export interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  forceMount?: boolean;
  positioning?: TooltipPositioning;
}

function Content({ asChild, forceMount, children, ...rest }: TooltipContentProps) {
  const api = useCtx();
  const { isPresent, presenceRef } = usePresence(api.isOpen);

  if (!forceMount && !isPresent) return null;

  const positionerProps = api.getPositionerProps();
  const contentProps = api.getContentProps();
  const { style: userStyle, positioning: _positioning, ...restProps } = rest as TooltipContentProps;

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
// Anchor — makes computePosition use this element as reference instead of trigger.
// ---------------------------------------------------------------------------

export interface TooltipAnchorProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

function Anchor({ asChild, children, ...rest }: TooltipAnchorProps) {
  const api = useCtx();
  const props = { ...api.getAnchorProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <div {...props}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Arrow — renderless: always Slot, merges getArrowProps onto child.
// ---------------------------------------------------------------------------

export interface TooltipArrowProps {
  children: ReactNode;
}

function Arrow({ children }: TooltipArrowProps) {
  const api = useCtx();
  return <Slot {...api.getArrowProps()}>{children}</Slot>;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Tooltip = {
  Provider,
  Root,
  Trigger,
  Anchor,
  Portal,
  Content,
  Arrow,
} as const;
