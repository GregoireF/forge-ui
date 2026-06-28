import type {
  CreateMenuMachineOptions,
  MenuApi,
  MenuContext,
  MenuItem,
  MenuSend,
} from "@forge-ui/menu";
import { connectMenu, createMenuMachine } from "@forge-ui/menu";
import { useEffect, useId, useRef, useState } from "react";
import { useMachine } from "../../use-machine.js";

export interface UseMenuOptions extends Omit<CreateMenuMachineOptions, "id"> {
  id?: string;
}

export interface UseMenuReturn {
  id: string;
  isOpen: boolean;
  highlighted: string | null;
  /** Whether the last highlight was from keyboard or pointer. Frameworks use this to move real DOM focus. */
  highlightSource: "pointer" | "keyboard";
  /** Whether the menu was created with modal=true (default). Read by Content for overlay + aria-modal. */
  modal: boolean;
  send: MenuSend;
  setOpen: (open: boolean) => void;
  focusContent(): void;
  focusTrigger(): void;
  focusHighlightedItem(): void;
  setContext(u: Partial<MenuContext>): void;
  getTriggerProps(opts?: { disabled?: boolean }): ReturnType<MenuApi["getTriggerProps"]>;
  getContextMenuTriggerProps(): ReturnType<MenuApi["getContextMenuTriggerProps"]>;
  getPositionerProps(): ReturnType<MenuApi["getPositionerProps"]>;
  getContentProps(): ReturnType<MenuApi["getContentProps"]>;
  getArrowProps(): ReturnType<MenuApi["getArrowProps"]>;
  getArrowTipProps(): ReturnType<MenuApi["getArrowTipProps"]>;
  getAnchorProps(): ReturnType<MenuApi["getAnchorProps"]>;
  getItemProps(value: string, disabled?: boolean): ReturnType<MenuApi["getItemProps"]>;
  getRadioGroupProps(groupId: string): ReturnType<MenuApi["getRadioGroupProps"]>;
  getRadioGroupLabelProps(groupId: string): ReturnType<MenuApi["getRadioGroupLabelProps"]>;
  getRadioItemProps(
    opts: Parameters<MenuApi["getRadioItemProps"]>[0],
  ): ReturnType<MenuApi["getRadioItemProps"]>;
  getCheckboxItemProps(
    opts: Parameters<MenuApi["getCheckboxItemProps"]>[0],
  ): ReturnType<MenuApi["getCheckboxItemProps"]>;
  getItemIndicatorProps(
    checked: boolean | "indeterminate",
  ): ReturnType<MenuApi["getItemIndicatorProps"]>;
  getSubTriggerProps(
    subMenuId: string,
    subIsOpen: boolean,
    disabled?: boolean,
  ): ReturnType<MenuApi["getSubTriggerProps"]>;
  getLabelProps(): ReturnType<MenuApi["getLabelProps"]>;
  getSeparatorProps(): ReturnType<MenuApi["getSeparatorProps"]>;
  getGroupProps(groupId: string): ReturnType<MenuApi["getGroupProps"]>;
  getGroupLabelProps(groupId: string): ReturnType<MenuApi["getGroupLabelProps"]>;
  registerItem(item: MenuItem): void;
  unregisterItem(value: string): void;
}

export function useMenu(options: UseMenuOptions = {}): UseMenuReturn {
  const reactId = useId();
  const id = options.id ?? reactId.replace(/:/g, "");

  const [machine] = useState(() => createMenuMachine({ id, ...options }));
  const [snapshot, send] = useMachine(machine);

  // ── Controlled open sync ──────────────────────────────────────────────────
  // Justification: the machine reads `open` only once at creation (initial state).
  // When the parent updates `open` after mount (controlled usage), we must mirror
  // it via OPEN/CLOSE events. We skip the first render to avoid overriding `defaultOpen`.
  const openProp = options.open;
  const isMountedRef = useRef(false);
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (openProp !== undefined) {
      send(openProp ? "OPEN" : "CLOSE");
    }
  }, [openProp]); // eslint-disable-line react-hooks/exhaustive-deps

  const api = connectMenu(snapshot, send, machine);

  return {
    id,
    isOpen: api.isOpen,
    highlighted: snapshot.context.highlighted,
    highlightSource: snapshot.context.highlightSource,
    modal: snapshot.context.modal,
    send,
    setOpen: (open: boolean) => send(open ? "OPEN" : "CLOSE"),
    focusContent: () => api.focusContent(),
    focusTrigger: () => api.focusTrigger(),
    focusHighlightedItem: () => api.focusHighlightedItem(),
    setContext: (u) => machine.setContext(u),
    getTriggerProps: (opts) => api.getTriggerProps(opts),
    getContextMenuTriggerProps: () => api.getContextMenuTriggerProps(),
    getPositionerProps: () => api.getPositionerProps(),
    getContentProps: () => api.getContentProps(),
    getArrowProps: () => api.getArrowProps(),
    getArrowTipProps: () => api.getArrowTipProps(),
    getAnchorProps: () => api.getAnchorProps(),
    getItemProps: (value, disabled) => api.getItemProps(value, disabled),
    getRadioGroupProps: (groupId) => api.getRadioGroupProps(groupId),
    getRadioGroupLabelProps: (groupId) => api.getRadioGroupLabelProps(groupId),
    getRadioItemProps: (opts) => api.getRadioItemProps(opts),
    getCheckboxItemProps: (opts) => api.getCheckboxItemProps(opts),
    getItemIndicatorProps: (checked) => api.getItemIndicatorProps(checked),
    getSubTriggerProps: (subMenuId, subIsOpen, disabled) =>
      api.getSubTriggerProps(subMenuId, subIsOpen, disabled),
    getLabelProps: () => api.getLabelProps(),
    getSeparatorProps: () => api.getSeparatorProps(),
    getGroupProps: (groupId) => api.getGroupProps(groupId),
    getGroupLabelProps: (groupId) => api.getGroupLabelProps(groupId),
    registerItem: (item) => send({ type: "REGISTER_ITEM", item }),
    unregisterItem: (value) => send({ type: "UNREGISTER_ITEM", value }),
  };
}
