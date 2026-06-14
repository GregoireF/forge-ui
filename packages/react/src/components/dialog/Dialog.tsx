import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useEffect } from "react";
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
  // Pass openProp for initial machine state; subsequent changes are synced below.
  const api = useDialog({ ...opts, ...(openProp !== undefined && { open: openProp }) });

  // Controlled mode: external `open` prop drives the machine after mount.
  // biome-ignore lint/correctness/useExhaustiveDependencies: api.setOpen is recreated each render but is referentially stable in behaviour; adding it would cause infinite re-runs
  useEffect(() => {
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
}

function Portal({ children, container }: DialogPortalCompoundProps) {
  return <DialogPortal {...(container !== undefined && { container })}>{children}</DialogPortal>;
}

// ---------------------------------------------------------------------------
// Overlay (backdrop)
// ---------------------------------------------------------------------------

export interface DialogOverlayProps extends HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
}

function Overlay({ forceMount, ...rest }: DialogOverlayProps) {
  const api = useCtx();
  if (!forceMount && !api.isOpen) return null;
  return <div {...api.getBackdropProps()} {...rest} />;
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
}

function Content({ forceMount, children, ...rest }: DialogContentProps) {
  const api = useCtx();
  if (!forceMount && !api.isOpen) return null;
  return (
    <div {...api.getContentProps()} {...rest}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

export type DialogTitleProps = HTMLAttributes<HTMLHeadingElement>;

function Title({ children, ...rest }: DialogTitleProps) {
  const api = useCtx();
  return (
    <h2 {...api.getTitleProps()} {...rest}>
      {children}
    </h2>
  );
}

// ---------------------------------------------------------------------------
// Description
// ---------------------------------------------------------------------------

export type DialogDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

function Description({ children, ...rest }: DialogDescriptionProps) {
  const api = useCtx();
  return (
    <p {...api.getDescriptionProps()} {...rest}>
      {children}
    </p>
  );
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
// Namespace export — Dialog.Root, Dialog.Trigger, ...
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
