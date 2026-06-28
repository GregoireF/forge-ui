import { createDialogMachine } from "@forge-ui/dialog";
import type { CreateAlertDialogMachineOptions } from "./alert-dialog.types.js";

// ---------------------------------------------------------------------------
// Prevention wrappers
// ---------------------------------------------------------------------------
// AlertDialog must never close on Escape or outside interaction per WAI-ARIA.
// The user callback is fired FIRST while e.defaultPrevented is still false —
// this lets callers react to the attempt (e.g. show a warning toast) without
// receiving a pre-prevented event. We then prevent unconditionally.

function wrapEscape(userCallback?: (e: KeyboardEvent) => void): (e: KeyboardEvent) => void {
  return (e) => {
    userCallback?.(e);
    e.preventDefault();
  };
}

function wrapInteract(
  userCallback?: (e: PointerEvent | FocusEvent) => void,
): (e: PointerEvent | FocusEvent) => void {
  return (e) => {
    userCallback?.(e);
    e.preventDefault();
  };
}

// ---------------------------------------------------------------------------
// Machine factory
// ---------------------------------------------------------------------------

export function createAlertDialogMachine(options: CreateAlertDialogMachineOptions) {
  return createDialogMachine({
    ...options,
    role: "alertdialog",
    // Always wrap both channels that can trigger close — the prevention is
    // unconditional so the dialog is immune to outside interaction and Escape.
    onEscapeKeyDown: wrapEscape(options.onEscapeKeyDown),
    onInteractOutside: wrapInteract(options.onInteractOutside),
  });
}
