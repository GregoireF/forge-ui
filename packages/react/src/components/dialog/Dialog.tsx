import { mergeRefs } from "@forge-ui/core";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useEffect, useLayoutEffect } from "react";
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

function Root({ children, open: openProp, defaultOpen, ...opts }: DialogRootProps) {
  const api = useDialog({
    ...(defaultOpen !== undefined && { defaultOpen }),
    ...opts,
    ...(openProp !== undefined && { open: openProp }),
  });

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
  const { "aria-haspopup": hasPopup, ...triggerRest } = api.getTriggerProps();
  // React's aria-haspopup type set omits "alertdialog" — cast to widen for WAI-ARIA compliance.
  const props = { ...triggerRest, "aria-haspopup": hasPopup as ButtonHTMLAttributes<HTMLButtonElement>["aria-haspopup"], ...rest };
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
// Accepts event callbacks that override Root-level ones when provided.
// ---------------------------------------------------------------------------

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  forceMount?: boolean;
  /** Override Root-level callback. Called before focusing first element on open. */
  onOpenAutoFocus?: (e: Event) => void;
  /** Override Root-level callback. Called before restoring focus on close. */
  onCloseAutoFocus?: (e: Event) => void;
  /** Override Root-level callback. Called on pointerdown outside content. */
  onPointerDownOutside?: (e: PointerEvent) => void;
  /** Override Root-level callback. Called on focus moving outside content. */
  onFocusOutside?: (e: FocusEvent) => void;
  /** Override Root-level callback. Called on any interaction outside (pointer OR focus). */
  onInteractOutside?: (e: PointerEvent | FocusEvent) => void;
  /** Override Root-level callback. Called on Escape key press. */
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
}

function Content({
  asChild,
  forceMount,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onPointerDownOutside,
  onFocusOutside,
  onInteractOutside,
  onEscapeKeyDown,
  children,
  ...rest
}: DialogContentProps) {
  const api = useCtx();
  const { isPresent, presenceRef } = usePresence(api.isOpen);

  // Dev-only: warn when the dialog opens and no accessible title is registered.
  // Fires via rAF so Dialog.Title has had a chance to mount and send REGISTER_TITLE.
  // The rAF delay avoids a false positive when Title and Content mount in the same tick.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (!api.isOpen) return;
    const raf = requestAnimationFrame(() => {
      if (!api.titleRegistered && !rest["aria-label"] && !rest["aria-labelledby"]) {
        console.warn(
          "[forge-ui/dialog] Missing accessible name: mount <Dialog.Title> inside <Dialog.Content>, or pass aria-label / aria-labelledby to <Dialog.Content>.",
        );
      }
      if (!api.descriptionRegistered && !rest["aria-describedby"]) {
        console.warn(
          "[forge-ui/dialog] Missing description: add <Dialog.Description> inside <Dialog.Content>, or pass aria-describedby. Descriptions help users understand the dialog's purpose.",
        );
      }
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.isOpen, api.titleRegistered, api.descriptionRegistered]);

  // Sync content-level event callbacks into the machine so activities pick them up.
  // Content-level callbacks take precedence over Root-level ones.
  useLayoutEffect(() => {
    api.setContentCallbacks({
      onOpenAutoFocus,
      onCloseAutoFocus,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onEscapeKeyDown,
    });
    return () => api.setContentCallbacks({});
    // biome-ignore lint/correctness/useExhaustiveDependencies: api is stable; callbacks compared by identity
  }, [api, onOpenAutoFocus, onCloseAutoFocus, onPointerDownOutside, onFocusOutside, onInteractOutside, onEscapeKeyDown]);

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
