import { mergeRefs } from "@forge-ui/core";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useLayoutEffect } from "react";
import { usePresence } from "../../hooks/use-presence.js";
import { DialogPortal } from "./DialogPortal.js";
import { Slot } from "./Slot.js";
import type { UseDialogOptions } from "./use-dialog.js";
import { useDialog } from "./use-dialog.js";

type DialogApi = ReturnType<typeof useDialog>;

const DialogCtx = createContext<DialogApi | null>(null);

function useCtx(): DialogApi {
  const ctx = useContext(DialogCtx);
  if (!ctx) throw new Error("Dialog compound parts must be used inside <Dialog.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface DialogRootProps extends UseDialogOptions {
  children: ReactNode;
}

function Root({ children, open: openProp, ...opts }: DialogRootProps) {
  const api = useDialog({ ...opts, ...(openProp !== undefined && { open: openProp }) });

  // biome-ignore lint/correctness/useExhaustiveDependencies: setOpen is stable
  useLayoutEffect(() => {
    if (openProp === undefined) return;
    api.setOpen(openProp);
  }, [openProp]);

  return <DialogCtx.Provider value={api}>{children}</DialogCtx.Provider>;
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

export interface DialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function Trigger({ asChild, children, ...rest }: DialogTriggerProps) {
  const api = useCtx();
  const props = { ...api.getTriggerProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

export interface DialogPortalCompoundProps {
  children: ReactNode;
  container?: HTMLElement | null;
  forceMount?: boolean;
}

function Portal({ children, container, forceMount }: DialogPortalCompoundProps) {
  const api = useCtx();
  if (!forceMount && !api.isOpen) return null;
  return <DialogPortal {...(container !== undefined && { container })}>{children}</DialogPortal>;
}

// ---------------------------------------------------------------------------
// Overlay
// Presence-aware: stays in DOM while exit animation runs (data-state="closed").
// During exit: aria-hidden + pointer-events:none prevent interaction.
// ---------------------------------------------------------------------------

export interface DialogOverlayProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  forceMount?: boolean;
}

function Overlay({ asChild, forceMount, children, ...rest }: DialogOverlayProps) {
  const api = useCtx();
  const { isPresent, presenceRef } = usePresence(api.isOpen);

  if (!forceMount && !isPresent) return null;

  const overlayProps = api.getOverlayProps();
  const closingProps = !api.isOpen
    ? ({ "aria-hidden": true, style: { pointerEvents: "none" } } as const)
    : {};

  const props = {
    ...overlayProps,
    ...closingProps,
    ...rest,
    ref: presenceRef,
  };

  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <div {...props} />;
}

// ---------------------------------------------------------------------------
// Content
// Presence-aware: stays in DOM while exit animation runs.
// During exit: aria-hidden + pointer-events:none keep content inert.
// ---------------------------------------------------------------------------

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  forceMount?: boolean;
}

function Content({ asChild, forceMount, children, ...rest }: DialogContentProps) {
  const api = useCtx();
  const { isPresent, presenceRef } = usePresence(api.isOpen);

  if (!forceMount && !isPresent) return null;

  const contentProps = api.getContentProps();

  const closingProps = !api.isOpen
    ? ({
        "aria-hidden": true,
        style: { pointerEvents: "none" },
      } as const)
    : {};

  const props = {
    ...contentProps,
    ...closingProps,
    ...rest,
    ref: mergeRefs(contentProps.ref, presenceRef),
  };

  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <div {...props}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean;
}

function Title({ asChild, children, ...rest }: DialogTitleProps) {
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

export interface DialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean;
}

function Description({ asChild, children, ...rest }: DialogDescriptionProps) {
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
// Close
// ---------------------------------------------------------------------------

export interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function Close({ asChild, children, ...rest }: DialogCloseProps) {
  const api = useCtx();
  const props = { ...api.getCloseProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Dialog = {
  Root,
  Trigger,
  Portal,
  Overlay,
  Content,
  Title,
  Description,
  Close,
} as const;
