export interface DialogContext {
  id: string;
  open: boolean;
  modal: boolean;
  closeOnEscapeKey: boolean;
  closeOnInteractOutside: boolean;
  triggerId: string;
  contentId: string;
  titleId: string;
  descriptionId: string;
  // DOM refs — set by connectDialog ref callbacks, read by machine activities.
  contentEl: HTMLElement | null;
  triggerEl: HTMLElement | null;
  // User-provided lifecycle callbacks.
  onOpen?: () => void;
  onClose?: () => void;
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
