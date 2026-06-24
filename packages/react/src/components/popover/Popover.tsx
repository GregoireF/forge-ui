import { mergeRefs } from "@forge-ui/core";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useLayoutEffect } from "react";
import { usePresence } from "../../hooks/use-presence.js";
import { DialogPortal } from "../dialog/DialogPortal.js";
import { Slot } from "../shared/Slot.js";
import type { UsePopoverOptions } from "./use-popover.js";
import { usePopover } from "./use-popover.js";

type PopoverApiReturn = ReturnType<typeof usePopover>;

const PopoverCtx = createContext<PopoverApiReturn | null>(null);

type PopoverPresenceContext = {
  isPresent: boolean;
  presenceRef: (el: HTMLElement | null) => void;
};
const PopoverPresenceCtx = createContext<PopoverPresenceContext | null>(null);

function useCtx(): PopoverApiReturn {
  const ctx = useContext(PopoverCtx);
  if (!ctx) throw new Error("Popover compound parts must be used inside <Popover.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface PopoverRootProps extends UsePopoverOptions {
  children: ReactNode;
}

function Root({ children, open: openProp, ...opts }: PopoverRootProps) {
  const api = usePopover({ ...opts, ...(openProp !== undefined && { open: openProp }) });

  // biome-ignore lint/correctness/useExhaustiveDependencies: setOpen is stable
  useLayoutEffect(() => {
    if (openProp === undefined) return;
    api.setOpen(openProp);
  }, [openProp]);

  const presence = usePresence(api.isOpen);

  return (
    <PopoverCtx.Provider value={api}>
      <PopoverPresenceCtx.Provider value={presence}>
        {children}
      </PopoverPresenceCtx.Provider>
    </PopoverCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

export interface PopoverTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function Trigger({ asChild, children, ...rest }: PopoverTriggerProps) {
  const api = useCtx();
  const props = { ...api.getTriggerProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// Anchor â€" always Slot, no own DOM element.
// ---------------------------------------------------------------------------

export interface PopoverAnchorProps {
  children: ReactNode;
}

function Anchor({ children }: PopoverAnchorProps) {
  const api = useCtx();
  return <Slot {...api.getAnchorProps()}>{children}</Slot>;
}

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

export interface PopoverPortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
  forceMount?: boolean;
}

function Portal({ children, container, forceMount }: PopoverPortalProps) {
  const api = useCtx();
  const presence = useContext(PopoverPresenceCtx);
  const isPresent = presence?.isPresent ?? api.isOpen;
  if (!forceMount && !isPresent) return null;
  return <DialogPortal {...(container !== undefined && { container })}>{children}</DialogPortal>;
}

// ---------------------------------------------------------------------------
// Content â€" Presence-aware.
// The positioner div provides position:fixed + top/left from @floating-ui.
// The content div stays clean for animation support.
// During exit: aria-hidden + pointer-events:none keep content inert.
// ---------------------------------------------------------------------------

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  forceMount?: boolean;
}

function Content({ asChild, forceMount, children, ...rest }: PopoverContentProps) {
  const api = useCtx();
  const injectedPresence = useContext(PopoverPresenceCtx);
  const ownPresence = usePresence(api.isOpen);
  const { isPresent, presenceRef } = injectedPresence ?? ownPresence;

  if (!forceMount && !isPresent) return null;

  const positionerProps = api.getPositionerProps();
  const contentProps = api.getContentProps();
  const { style: userStyle, ...restProps } = rest;

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

export interface PopoverArrowProps {
  children: ReactNode;
}

function Arrow({ children }: PopoverArrowProps) {
  const api = useCtx();
  return <Slot {...api.getArrowProps()}>{children}</Slot>;
}

// ---------------------------------------------------------------------------
// Close
// ---------------------------------------------------------------------------

export interface PopoverCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function Close({ asChild, children, ...rest }: PopoverCloseProps) {
  const api = useCtx();
  const props = { ...api.getCloseProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

export interface PopoverTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean;
}

function Title({ asChild, children, ...rest }: PopoverTitleProps) {
  const api = useCtx();

  useLayoutEffect(() => {
    api.send("REGISTER_TITLE");
    return () => api.send("UNREGISTER_TITLE");
  }, [api.send]);

  const props = { ...api.getTitleProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <h2 {...props}>{children}</h2>;
}

// ---------------------------------------------------------------------------
// Description
// ---------------------------------------------------------------------------

export interface PopoverDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean;
}

function Description({ asChild, children, ...rest }: PopoverDescriptionProps) {
  const api = useCtx();

  useLayoutEffect(() => {
    api.send("REGISTER_DESCRIPTION");
    return () => api.send("UNREGISTER_DESCRIPTION");
  }, [api.send]);

  const props = { ...api.getDescriptionProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <p {...props}>{children}</p>;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Popover = {
  Root,
  Trigger,
  Anchor,
  Portal,
  Content,
  Arrow,
  Close,
  Title,
  Description,
} as const;
