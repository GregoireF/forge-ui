import type {
  CreateMenuMachineOptions,
  MenuApi,
  MenuContext,
  MenuItem,
  MenuSend,
} from "@forge-ui/menu";
import { connectMenu, createMenuMachine } from "@forge-ui/menu";
import { type ComputedRef, computed, useId } from "vue";
import { useMachine } from "../../use-machine.js";

export interface UseMenuOptions extends Omit<CreateMenuMachineOptions, "id"> {
  id?: string;
}

export interface UseMenuReturn {
  id: string;
  isOpen: ComputedRef<boolean>;
  highlighted: ComputedRef<string | null>;
  /** Whether the last highlight was from keyboard or pointer. Frameworks use this to move real DOM focus. */
  highlightSource: ComputedRef<"pointer" | "keyboard">;
  /** Reflects `modal` option from machine context. Read by Content for overlay + aria-modal. */
  modal: ComputedRef<boolean>;
  send: MenuSend;
  setOpen: (open: boolean) => void;
  focusContent: () => void;
  focusTrigger: () => void;
  focusHighlightedItem: () => void;
  setContext: (u: Partial<MenuContext>) => void;
  getTriggerProps: (opts?: { disabled?: boolean }) => ReturnType<MenuApi["getTriggerProps"]>;
  getContextMenuTriggerProps: () => ReturnType<MenuApi["getContextMenuTriggerProps"]>;
  getPositionerProps: () => ReturnType<MenuApi["getPositionerProps"]>;
  getContentProps: () => ReturnType<MenuApi["getContentProps"]>;
  getArrowProps: () => ReturnType<MenuApi["getArrowProps"]>;
  getArrowTipProps: () => ReturnType<MenuApi["getArrowTipProps"]>;
  getAnchorProps: () => ReturnType<MenuApi["getAnchorProps"]>;
  getItemProps: (value: string, disabled?: boolean) => ReturnType<MenuApi["getItemProps"]>;
  getRadioGroupProps: (groupId: string) => ReturnType<MenuApi["getRadioGroupProps"]>;
  getRadioGroupLabelProps: (groupId: string) => ReturnType<MenuApi["getRadioGroupLabelProps"]>;
  getRadioItemProps: (
    opts: Parameters<MenuApi["getRadioItemProps"]>[0],
  ) => ReturnType<MenuApi["getRadioItemProps"]>;
  getCheckboxItemProps: (
    opts: Parameters<MenuApi["getCheckboxItemProps"]>[0],
  ) => ReturnType<MenuApi["getCheckboxItemProps"]>;
  getItemIndicatorProps: (
    checked: boolean | "indeterminate",
  ) => ReturnType<MenuApi["getItemIndicatorProps"]>;
  getSubTriggerProps: (
    subMenuId: string,
    subIsOpen: boolean,
    disabled?: boolean,
  ) => ReturnType<MenuApi["getSubTriggerProps"]>;
  getLabelProps: () => ReturnType<MenuApi["getLabelProps"]>;
  getSeparatorProps: () => ReturnType<MenuApi["getSeparatorProps"]>;
  getGroupProps: (groupId: string) => ReturnType<MenuApi["getGroupProps"]>;
  getGroupLabelProps: (groupId: string) => ReturnType<MenuApi["getGroupLabelProps"]>;
  registerItem: (item: MenuItem) => void;
  unregisterItem: (value: string) => void;
}

export function useMenu(options: UseMenuOptions = {}): UseMenuReturn {
  const vueId = useId();
  const id = options.id ?? vueId;

  const machine = createMenuMachine({ id, ...options });
  const { snapshot, send } = useMachine(machine);

  const isOpen = computed(() => snapshot.value.matches("open"));
  const highlighted = computed(() => snapshot.value.context.highlighted);
  const highlightSource = computed(() => snapshot.value.context.highlightSource);
  const modal = computed(() => snapshot.value.context.modal);
  const api = computed(() => connectMenu(snapshot.value, send, machine));

  return {
    id,
    isOpen,
    highlighted,
    highlightSource,
    modal,
    send,
    setOpen: (open: boolean) => send(open ? "OPEN" : "CLOSE"),
    focusContent: () => api.value.focusContent(),
    focusTrigger: () => api.value.focusTrigger(),
    focusHighlightedItem: () => api.value.focusHighlightedItem(),
    setContext: (u) => machine.setContext(u),
    getTriggerProps: (opts) => api.value.getTriggerProps(opts),
    getContextMenuTriggerProps: () => api.value.getContextMenuTriggerProps(),
    getPositionerProps: () => api.value.getPositionerProps(),
    getContentProps: () => api.value.getContentProps(),
    getArrowProps: () => api.value.getArrowProps(),
    getArrowTipProps: () => api.value.getArrowTipProps(),
    getAnchorProps: () => api.value.getAnchorProps(),
    getItemProps: (value, disabled) => api.value.getItemProps(value, disabled),
    getRadioGroupProps: (groupId) => api.value.getRadioGroupProps(groupId),
    getRadioGroupLabelProps: (groupId) => api.value.getRadioGroupLabelProps(groupId),
    getRadioItemProps: (opts) => api.value.getRadioItemProps(opts),
    getCheckboxItemProps: (opts) => api.value.getCheckboxItemProps(opts),
    getItemIndicatorProps: (checked) => api.value.getItemIndicatorProps(checked),
    getSubTriggerProps: (subMenuId, subIsOpen, disabled) =>
      api.value.getSubTriggerProps(subMenuId, subIsOpen, disabled),
    getLabelProps: () => api.value.getLabelProps(),
    getSeparatorProps: () => api.value.getSeparatorProps(),
    getGroupProps: (groupId) => api.value.getGroupProps(groupId),
    getGroupLabelProps: (groupId) => api.value.getGroupLabelProps(groupId),
    registerItem: (item) => send({ type: "REGISTER_ITEM", item }),
    unregisterItem: (value) => send({ type: "UNREGISTER_ITEM", value }),
  };
}
