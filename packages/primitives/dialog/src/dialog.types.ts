/** Callbacks that Dialog.Content can override at the content level. */
export interface DialogContentCallbacks {
  onOpenAutoFocus?: ((e: Event) => void) | undefined;
  onCloseAutoFocus?: ((e: Event) => void) | undefined;
  onPointerDownOutside?: ((e: PointerEvent) => void) | undefined;
  onFocusOutside?: ((e: FocusEvent) => void) | undefined;
  onInteractOutside?: ((e: PointerEvent | FocusEvent) => void) | undefined;
  onEscapeKeyDown?: ((e: KeyboardEvent) => void) | undefined;
}

export interface DialogContext {
  id: string;
  /** "dialog" (default) or "alertdialog" — controls WAI-ARIA role + default behavior. */
  role: "dialog" | "alertdialog";
  modal: boolean;
  /** Trap keyboard focus inside content while open. Defaults to `modal`. */
  trapFocus: boolean;
  /** Lock body scroll while open. Defaults to `modal`. */
  preventScroll: boolean;
  /** Hide background from assistive technology (aria-hidden). Defaults to `modal`. */
  hideOthers: boolean;
  /** DOM refs — set by connectDialog ref callbacks, read by machine activities. */
  contentEl: HTMLElement | null;
  triggerEl: HTMLElement | null;
  /** IDs — auto-generated from `id`. */
  triggerId: string;
  contentId: string;
  titleId: string;
  descriptionId: string;
  /** Presence registration — set via machine.update() when Title/Description mount. */
  titleRegistered: boolean;
  descriptionRegistered: boolean;
  /** Custom initial focus target on open. */
  initialFocusEl?: () => HTMLElement | null;
  /** Custom final focus target on close (defaults to trigger). */
  finalFocusEl?: () => HTMLElement | null;
  /** Preventable callback — called before focusing first element on open. */
  onOpenAutoFocus?: (e: Event) => void;
  /** Preventable callback — called before restoring focus on close. */
  onCloseAutoFocus?: (e: Event) => void;
  /** Preventable callback — called on pointerdown outside content. */
  onPointerDownOutside?: (e: PointerEvent) => void;
  /** Preventable callback — called on focus moving outside content. */
  onFocusOutside?: (e: FocusEvent) => void;
  /** Preventable callback — called on any interaction outside (pointer OR focus). */
  onInteractOutside?: (e: PointerEvent | FocusEvent) => void;
  /** Preventable callback — called on Escape key press. */
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
  /**
   * Content-level callback overrides — set by Dialog.Content (via setContentCallbacks)
   * when it receives matching props. Take precedence over Root-level callbacks.
   * Cleared automatically when Content unmounts.
   */
  contentCallbacks?: DialogContentCallbacks;
  /** Unified open-state change callback. */
  onOpenChange?: (open: boolean) => void;
}

export type DialogState = "closed" | "open";

export type DialogEvent =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "TOGGLE" }
  | { type: "ESCAPE_KEY" }
  | { type: "INTERACT_OUTSIDE" }
  | { type: "@@INIT" };

export type DialogSend = (event: DialogEvent | DialogEvent["type"]) => void;
