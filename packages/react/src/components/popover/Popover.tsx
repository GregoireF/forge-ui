import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useLayoutEffect } from "react";
import { DialogPortal } from "../dialog/DialogPortal.js";
import { Slot } from "../dialog/Slot.js";
import type { UsePopoverOptions } from "./use-popover.js";
import { usePopover } from "./use-popover.js";

type PopoverApiReturn = ReturnType<typeof usePopover>;

const PopoverCtx = createContext<PopoverApiReturn | null>(null);

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: setOpen is stable in behaviour
  useLayoutEffect(() => {
    if (openProp === undefined) return;
    api.setOpen(openProp);
  }, [openProp]);

  return <PopoverCtx.Provider value={api}>{children}</PopoverCtx.Provider>;
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
// Anchor — optional reference element override.
// Always asChild (renders no own DOM element).
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
  if (!forceMount && !api.isOpen) return null;
  return <DialogPortal {...(container !== undefined && { container })}>{children}</DialogPortal>;
}

// ---------------------------------------------------------------------------
// Content — wraps the hidden positioner internally.
// The positioner provides position: fixed + top/left computed by @floating-ui.
// The content div itself stays clean (no position style) for animation support.
// ---------------------------------------------------------------------------

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  forceMount?: boolean;
}

function Content({ asChild, forceMount, children, ...rest }: PopoverContentProps) {
  const api = useCtx();
  if (!forceMount && !api.isOpen) return null;

  const positionerProps = api.getPositionerProps();
  const contentProps = { ...api.getContentProps(), ...rest };

  if (asChild) {
    return (
      <div {...positionerProps}>
        <Slot {...contentProps}>{children}</Slot>
      </div>
    );
  }

  return (
    <div {...positionerProps}>
      <div {...contentProps}>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Arrow — renderless: always acts as Slot, merges getArrowProps onto child.
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
// Namespace export — Popover.Root, Popover.Trigger, ...
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
