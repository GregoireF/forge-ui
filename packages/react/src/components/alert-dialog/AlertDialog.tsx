import { mergeRefs } from "@forge-ui/core";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useEffect, useLayoutEffect } from "react";
import { usePresence } from "../../hooks/use-presence.js";
import { DialogPortal } from "../dialog/DialogPortal.js";
import { Slot } from "../shared/Slot.js";
import type { UseAlertDialogOptions } from "./use-alert-dialog.js";
import { useAlertDialog } from "./use-alert-dialog.js";

type AlertDialogApi = ReturnType<typeof useAlertDialog>;

const AlertDialogCtx = createContext<AlertDialogApi | null>(null);

function useCtx(): AlertDialogApi {
  const ctx = useContext(AlertDialogCtx);
  if (!ctx) throw new Error("AlertDialog compound parts must be used inside <AlertDialog.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface AlertDialogRootProps extends UseAlertDialogOptions {
  children: ReactNode;
}

function Root({ children, defaultOpen, ...opts }: AlertDialogRootProps) {
  const api = useAlertDialog({ ...(defaultOpen !== undefined && { defaultOpen }), ...opts });
  return <AlertDialogCtx.Provider value={api}>{children}</AlertDialogCtx.Provider>;
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

export interface AlertDialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function Trigger({ asChild, children, ...rest }: AlertDialogTriggerProps) {
  const api = useCtx();
  const { "aria-haspopup": hasPopup, ...triggerRest } = api.getTriggerProps();
  const props = {
    ...triggerRest,
    "aria-haspopup": hasPopup as ButtonHTMLAttributes<HTMLButtonElement>["aria-haspopup"],
    ...rest,
  };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

export interface AlertDialogPortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
  forceMount?: boolean;
}

function Portal({ children, container, forceMount }: AlertDialogPortalProps) {
  const api = useCtx();
  if (!forceMount && !api.isOpen) return null;
  return <DialogPortal {...(container !== undefined && { container })}>{children}</DialogPortal>;
}

// ---------------------------------------------------------------------------
// Overlay
// ---------------------------------------------------------------------------

export interface AlertDialogOverlayProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  forceMount?: boolean;
}

function Overlay({ asChild, forceMount, children, ...rest }: AlertDialogOverlayProps) {
  const api = useCtx();
  const { isPresent, presenceRef } = usePresence(api.isOpen);

  if (!forceMount && !isPresent) return null;

  const overlayProps = api.getOverlayProps();
  const { style: userStyle, ...restProps } = rest;

  const props = {
    ...overlayProps,
    ...(!api.isOpen && { "aria-hidden": true }),
    ...restProps,
    style: api.isOpen ? userStyle : { ...userStyle, pointerEvents: "none" as const },
    ref: presenceRef,
  };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <div {...props} />;
}

// ---------------------------------------------------------------------------
// Content
// Accepts onOpenAutoFocus / onCloseAutoFocus overrides only.
// Interaction-outside and Escape callbacks are NOT exposed on Content â€”
// alertdialog always blocks those, making per-content overrides meaningless.
// ---------------------------------------------------------------------------

export interface AlertDialogContentProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  forceMount?: boolean;
  onOpenAutoFocus?: (e: Event) => void;
  onCloseAutoFocus?: (e: Event) => void;
}

function Content({
  asChild,
  forceMount,
  onOpenAutoFocus,
  onCloseAutoFocus,
  children,
  ...rest
}: AlertDialogContentProps) {
  const api = useCtx();
  const { isPresent, presenceRef } = usePresence(api.isOpen);

  // Dev-only: a11y warnings (same pattern as Dialog.Content).
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (!api.isOpen) return;
    const raf = requestAnimationFrame(() => {
      if (!api.titleRegistered && !rest["aria-label"] && !rest["aria-labelledby"]) {
        console.warn(
          "[forge-ui/alert-dialog] Missing accessible name: mount <AlertDialog.Title> inside <AlertDialog.Content>, or pass aria-label / aria-labelledby.",
        );
      }
      if (!api.descriptionRegistered && !rest["aria-describedby"]) {
        console.warn(
          "[forge-ui/alert-dialog] Missing description: mount <AlertDialog.Description> inside <AlertDialog.Content>, or pass aria-describedby.",
        );
      }
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.isOpen, api.titleRegistered, api.descriptionRegistered]);

  // Sync focus callbacks into the machine.
  // biome-ignore lint/correctness/useExhaustiveDependencies: api is stable
  useLayoutEffect(() => {
    api.setContentCallbacks({ onOpenAutoFocus, onCloseAutoFocus });
    return () => api.setContentCallbacks({});
  }, [api, onOpenAutoFocus, onCloseAutoFocus]);

  if (!forceMount && !isPresent) return null;

  const contentProps = api.getContentProps();
  const { style: userStyle, ...restProps } = rest;

  const props = {
    ...contentProps,
    ...(!api.isOpen && { "aria-hidden": true }),
    ...restProps,
    style: api.isOpen ? userStyle : { ...userStyle, pointerEvents: "none" as const },
    ref: mergeRefs(contentProps.ref, presenceRef),
  };

  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <div {...props}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

export interface AlertDialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean;
}

function Title({ asChild, children, ...rest }: AlertDialogTitleProps) {
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

export interface AlertDialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean;
}

function Description({ asChild, children, ...rest }: AlertDialogDescriptionProps) {
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
// Cancel â€” dismisses the alert dialog without acting.
// ---------------------------------------------------------------------------

export interface AlertDialogCancelProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function Cancel({ asChild, children, ...rest }: AlertDialogCancelProps) {
  const api = useCtx();
  const props = { ...api.getCancelProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// Action â€” the destructive / confirm button. Does NOT auto-close.
// ---------------------------------------------------------------------------

export interface AlertDialogActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function Action({ asChild, children, ...rest }: AlertDialogActionProps) {
  const api = useCtx();
  const props = { ...api.getActionProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const AlertDialog = {
  Root,
  Trigger,
  Portal,
  Overlay,
  Content,
  Title,
  Description,
  Cancel,
  Action,
} as const;
