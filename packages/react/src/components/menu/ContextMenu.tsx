import { mergeRefs } from "@forge-ui/core";
import type { HTMLAttributes, ReactNode, RefCallback } from "react";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { usePresence } from "../../hooks/use-presence.js";
import { DialogPortal } from "../dialog/DialogPortal.js";
import { Slot } from "../shared/Slot.js";
import type { UseMenuOptions, UseMenuReturn } from "./use-menu.js";
import { useMenu } from "./use-menu.js";

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------

type ContextMenuApi = UseMenuReturn;

const ContextMenuCtx = createContext<ContextMenuApi | null>(null);
const ContextMenuPresenceCtx = createContext<ReturnType<typeof usePresence> | null>(null);
const ContextMenuRadioGroupCtx = createContext<{
  groupId: string;
  value: string;
  onValueChange: (v: string) => void;
} | null>(null);
const ContextMenuItemCheckedCtx = createContext<{ checked: boolean | "indeterminate" } | null>(null);

function useCtx(): ContextMenuApi {
  const ctx = useContext(ContextMenuCtx);
  if (!ctx) throw new Error("ContextMenu parts must be inside <ContextMenu.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface ContextMenuRootProps extends Omit<UseMenuOptions, "isContextMenu"> {
  children: ReactNode;
}

function Root({ children, ...opts }: ContextMenuRootProps) {
  const api = useMenu({ ...opts, isContextMenu: true });
  const presence = usePresence(api.isOpen);
  return (
    <ContextMenuCtx.Provider value={api}>
      <ContextMenuPresenceCtx.Provider value={presence}>
        {children}
      </ContextMenuPresenceCtx.Provider>
    </ContextMenuCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

export interface ContextMenuTriggerProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  children?: ReactNode;
}

function Trigger({ asChild, children, ...rest }: ContextMenuTriggerProps) {
  const api = useCtx();
  const { ref, onContextMenu, ...triggerRest } = api.getContextMenuTriggerProps() as ReturnType<typeof api.getContextMenuTriggerProps> & { ref?: RefCallback<HTMLDivElement> };
  const props = { ...triggerRest, onContextMenu, ...rest, ref };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <div {...props}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

export interface ContextMenuPortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
  forceMount?: boolean;
}

function Portal({ children, container, forceMount }: ContextMenuPortalProps) {
  const api = useCtx();
  const presence = useContext(ContextMenuPresenceCtx);
  const isPresent = presence?.isPresent ?? api.isOpen;
  if (!forceMount && !isPresent) return null;
  return <DialogPortal {...(container !== undefined && { container })}>{children}</DialogPortal>;
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export interface ContextMenuContentProps extends Omit<HTMLAttributes<HTMLDivElement>, "onKeyDown"> {
  asChild?: boolean;
  forceMount?: boolean;
  /** Custom portal container. Defaults to document.body (context menus always portal). */
  container?: HTMLElement | null;
  onOpenAutoFocus?: (e: Event) => void;
  onCloseAutoFocus?: (e: Event) => void;
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

function Content({
  asChild,
  forceMount,
  container,
  children,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onKeyDown: restKeyDown,
  ...rest
}: ContextMenuContentProps) {
  const api = useCtx();
  const injectedPresence = useContext(ContextMenuPresenceCtx);
  const ownPresence = usePresence(api.isOpen);
  const { isPresent, presenceRef } = injectedPresence ?? ownPresence;

  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (api.isOpen && !wasOpenRef.current) {
      if (api.highlighted === null) api.send("FIRST_ITEM");
      const openEvent = new Event("openfocus", { bubbles: false, cancelable: true });
      onOpenAutoFocus?.(openEvent);
      if (!openEvent.defaultPrevented) api.focusContent();
    }
    if (!api.isOpen && wasOpenRef.current) {
      const closeEvent = new Event("closefocus", { bubbles: false, cancelable: true });
      onCloseAutoFocus?.(closeEvent);
      // Context menu: no trigger element to return focus to by default.
    }
    wasOpenRef.current = api.isOpen;
  }, [api.isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ARIA roving tabindex: keyboard highlight moves real focus to the item.
  useEffect(() => {
    if (api.isOpen && api.highlighted !== null && api.highlightSource === "keyboard") {
      api.focusHighlightedItem();
    }
  }, [api.highlighted, api.isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!forceMount && !isPresent) return null;

  const { ref: contentRef, onKeyDown: baseKeyDown, onKeydown: _kd, ...contentRest } = api.getContentProps() as ReturnType<typeof api.getContentProps> & { onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void; onKeydown?: unknown };
  const positionerProps = api.getPositionerProps();

  const mergedRef = mergeRefs(
    contentRef as RefCallback<HTMLDivElement>,
    presenceRef as RefCallback<HTMLDivElement>,
  );

  const closingProps = !api.isOpen
    ? ({ "aria-hidden": true, style: { pointerEvents: "none" as const } } as const)
    : {};

  const mergedContentProps = {
    ...contentRest,
    ...closingProps,
    ...rest,
    onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
      if (e.key === "Escape" && onEscapeKeyDown) {
        onEscapeKeyDown(e.nativeEvent);
        if (e.isDefaultPrevented()) return;
      }
      baseKeyDown?.(e);
      restKeyDown?.(e);
    },
    ref: mergedRef,
  };

  const innerEl = asChild
    ? <Slot {...mergedContentProps}>{children}</Slot>
    : <div {...mergedContentProps}>{children}</div>;

  // ContextMenu always portals to body (context menus appear at cursor position — they
  // must escape any overflow:hidden ancestor). Pass `container` to override the target.
  return (
    <DialogPortal {...(container !== undefined && { container })}>
      {api.modal && api.isOpen && (
        <div
          data-forge-part="modal-overlay"
          aria-hidden="true"
          style={{ position: "fixed", inset: 0, zIndex: 49 }}
        />
      )}
      <div {...positionerProps}>
        {innerEl}
      </div>
    </DialogPortal>
  );
}

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

export interface ContextMenuItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  value: string;
  label?: string;
  textValue?: string;
  disabled?: boolean;
  asChild?: boolean;
  children?: ReactNode;
  onMenuSelect?: (value: string) => void;
  navigate?: () => void;
  closeOnSelect?: boolean;
}

function Item({
  value, label, textValue, disabled = false, asChild, children, onMenuSelect, navigate, closeOnSelect = true, ...rest
}: ContextMenuItemProps) {
  const api = useCtx();

  useLayoutEffect(() => {
    api.registerItem({ value, label: label ?? value, ...(textValue !== undefined && { textValue }), disabled });
    return () => api.unregisterItem(value);
  }, [value, label, textValue, disabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const { onMouseEnter, onMouseLeave, onMousemove: _mm, onMouseleave: _ml, onClick: baseClick, ...itemRest } = api.getItemProps(value, disabled) as ReturnType<typeof api.getItemProps> & { onMousemove?: unknown; onMouseleave?: unknown };

  const props = {
    ...itemRest, onMouseEnter, onMouseLeave, ...rest,
    onClick(e: React.MouseEvent<HTMLDivElement>) {
      (rest as HTMLAttributes<HTMLDivElement>).onClick?.(e);
      if (!disabled) {
        onMenuSelect?.(value);
        if (closeOnSelect) baseClick?.();
        navigate?.();
      }
    },
  };

  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <div {...props}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

export interface ContextMenuLabelProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

function Label({ children, ...rest }: ContextMenuLabelProps) {
  const api = useCtx();
  return <div {...api.getLabelProps()} {...rest}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Separator
// ---------------------------------------------------------------------------

export interface ContextMenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

function Separator({ ...rest }: ContextMenuSeparatorProps) {
  const api = useCtx();
  return <div {...api.getSeparatorProps()} {...rest} />;
}

// ---------------------------------------------------------------------------
// Group + GroupLabel
// ---------------------------------------------------------------------------

export interface ContextMenuGroupProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
  children: ReactNode;
}

function Group({ id, children, ...rest }: ContextMenuGroupProps) {
  const api = useCtx();
  return <div {...api.getGroupProps(id)} {...rest}>{children}</div>;
}

export interface ContextMenuGroupLabelProps extends HTMLAttributes<HTMLDivElement> {
  groupId: string;
  children: ReactNode;
}

function GroupLabel({ groupId, children, ...rest }: ContextMenuGroupLabelProps) {
  const api = useCtx();
  return <div {...api.getGroupLabelProps(groupId)} {...rest}>{children}</div>;
}

// ---------------------------------------------------------------------------
// RadioGroup
// ---------------------------------------------------------------------------

export interface ContextMenuRadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  groupId: string;
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

function RadioGroup({ groupId, value, onValueChange, children, ...rest }: ContextMenuRadioGroupProps) {
  const api = useCtx();
  return (
    <ContextMenuRadioGroupCtx.Provider value={{ groupId, value, onValueChange }}>
      <div {...api.getRadioGroupProps(groupId)} {...rest}>{children}</div>
    </ContextMenuRadioGroupCtx.Provider>
  );
}

export interface ContextMenuRadioGroupLabelProps extends HTMLAttributes<HTMLDivElement> {
  groupId: string;
  children: ReactNode;
}

function RadioGroupLabel({ groupId, children, ...rest }: ContextMenuRadioGroupLabelProps) {
  const api = useCtx();
  return <div {...api.getRadioGroupLabelProps(groupId)} {...rest}>{children}</div>;
}

// ---------------------------------------------------------------------------
// RadioItem
// ---------------------------------------------------------------------------

export interface ContextMenuRadioItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  value: string;
  label?: string;
  textValue?: string;
  disabled?: boolean;
  asChild?: boolean;
  children?: ReactNode;
  closeOnSelect?: boolean;
}

function RadioItem({ value, label, textValue, disabled = false, asChild, children, closeOnSelect = true, ...rest }: ContextMenuRadioItemProps) {
  const api = useCtx();
  const radioCtx = useContext(ContextMenuRadioGroupCtx);
  if (!radioCtx) throw new Error("ContextMenu.RadioItem must be inside <ContextMenu.RadioGroup>");

  const checked = radioCtx.value === value;

  useLayoutEffect(() => {
    api.registerItem({ value, label: label ?? value, ...(textValue !== undefined && { textValue }), disabled });
    return () => api.unregisterItem(value);
  }, [value, label, textValue, disabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const { onMouseEnter, onMouseLeave, onMousemove: _mm, onMouseleave: _ml, onClick: baseClick, ...itemRest } = api.getRadioItemProps({ value, checked, disabled, closeOnSelect }) as ReturnType<typeof api.getRadioItemProps> & { onMousemove?: unknown; onMouseleave?: unknown };

  const props = {
    ...itemRest, onMouseEnter, onMouseLeave, ...rest,
    onClick(e: React.MouseEvent<HTMLDivElement>) {
      (rest as HTMLAttributes<HTMLDivElement>).onClick?.(e);
      if (!disabled) { radioCtx.onValueChange(value); baseClick?.(); }
    },
  };

  return (
    <ContextMenuItemCheckedCtx.Provider value={{ checked }}>
      {asChild ? <Slot {...props}>{children}</Slot> : <div {...props}>{children}</div>}
    </ContextMenuItemCheckedCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// CheckboxItem
// ---------------------------------------------------------------------------

export interface ContextMenuCheckboxItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  value: string;
  label?: string;
  textValue?: string;
  checked: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  asChild?: boolean;
  children?: ReactNode;
  closeOnSelect?: boolean;
}

function CheckboxItem({
  value, label, textValue, checked, onCheckedChange, disabled = false, asChild, children, closeOnSelect = false, ...rest
}: ContextMenuCheckboxItemProps) {
  const api = useCtx();

  useLayoutEffect(() => {
    api.registerItem({ value, label: label ?? value, ...(textValue !== undefined && { textValue }), disabled });
    return () => api.unregisterItem(value);
  }, [value, label, textValue, disabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const { onMouseEnter, onMouseLeave, onMousemove: _mm, onMouseleave: _ml, onClick: baseClick, ...itemRest } = api.getCheckboxItemProps({ value, checked, disabled, closeOnSelect }) as ReturnType<typeof api.getCheckboxItemProps> & { onMousemove?: unknown; onMouseleave?: unknown };

  const props = {
    ...itemRest, onMouseEnter, onMouseLeave, ...rest,
    onClick(e: React.MouseEvent<HTMLDivElement>) {
      (rest as HTMLAttributes<HTMLDivElement>).onClick?.(e);
      if (!disabled) {
        const next = checked === "indeterminate" ? true : !checked;
        onCheckedChange?.(next);
        if (closeOnSelect) baseClick?.();
      }
    },
  };

  return (
    <ContextMenuItemCheckedCtx.Provider value={{ checked }}>
      {asChild ? <Slot {...props}>{children}</Slot> : <div {...props}>{children}</div>}
    </ContextMenuItemCheckedCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// ItemIndicator
// ---------------------------------------------------------------------------

export interface ContextMenuItemIndicatorProps {
  children: ReactNode;
  forceMount?: boolean;
}

function ItemIndicator({ children, forceMount }: ContextMenuItemIndicatorProps) {
  const api = useCtx();
  const itemCtx = useContext(ContextMenuItemCheckedCtx);
  const isChecked = itemCtx?.checked;
  if (!forceMount && !isChecked) return null;
  return <span {...api.getItemIndicatorProps(isChecked ?? false)}>{children}</span>;
}

// ---------------------------------------------------------------------------
// Sub
// ---------------------------------------------------------------------------

// Sub contexts — scoped to ContextMenu to avoid conflicts with Menu sub contexts.
const ContextMenuSubCtx = createContext<{
  childApi: ContextMenuApi;
  childPresence: ReturnType<typeof usePresence>;
  subMenuId: string;
  openDelay: number;
  closeDelay: number;
  parentTriggersRef: React.MutableRefObject<Map<string, () => void>> | null;
} | null>(null);

const ContextMenuSubTriggersCtx = createContext<React.MutableRefObject<Map<string, () => void>> | null>(null);

export interface ContextMenuSubProps {
  children: ReactNode;
  openDelay?: number;
  closeDelay?: number;
  onSelect?: (value: string) => void;
}

function Sub({ children, openDelay = 200, closeDelay = 300, onSelect }: ContextMenuSubProps) {
  const parentTriggersRef = useContext(ContextMenuSubTriggersCtx);
  const ownTriggersRef = useRef(new Map<string, () => void>());
  const childApi = useMenu({ isContextMenu: false, positioning: { placement: "right-start" }, ...(onSelect !== undefined && { onSelect }) });
  const childPresence = usePresence(childApi.isOpen);
  return (
    <ContextMenuSubCtx.Provider value={{ childApi, childPresence, subMenuId: childApi.id, openDelay, closeDelay, parentTriggersRef }}>
      <ContextMenuSubTriggersCtx.Provider value={ownTriggersRef}>
        {children}
      </ContextMenuSubTriggersCtx.Provider>
    </ContextMenuSubCtx.Provider>
  );
}

export interface ContextMenuSubTriggerProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  value: string;
  label?: string;
  textValue?: string;
  disabled?: boolean;
  asChild?: boolean;
  children?: ReactNode;
  /** When false, the sub-menu only opens on click — hover has no effect. @default true */
  openOnHover?: boolean;
}

function SubTrigger({ value, label, textValue, disabled = false, asChild, children, openOnHover = true, ...rest }: ContextMenuSubTriggerProps) {
  const parentApi = useCtx();
  const sub = useContext(ContextMenuSubCtx);
  if (!sub) throw new Error("ContextMenu.SubTrigger must be inside <ContextMenu.Sub>");

  const { childApi, subMenuId, openDelay, closeDelay, parentTriggersRef } = sub;
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function openSubmenu() {
    clearTimeout(closeTimerRef.current);
    childApi.setOpen(true);
    setTimeout(() => { childApi.focusContent(); childApi.send("FIRST_ITEM"); }, 10);
  }

  useLayoutEffect(() => {
    parentTriggersRef?.current.set(value, openSubmenu);
    return () => { parentTriggersRef?.current.delete(value); };
  }); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    parentApi.registerItem({ value, label: label ?? value, ...(textValue !== undefined && { textValue }), disabled });
    return () => parentApi.unregisterItem(value);
  }, [value, label, textValue, disabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const { onMouseEnter: _pme, onMouseLeave: _pml, onMousemove: _mm, onMouseleave: _ml, ...baseTriggerProps } = parentApi.getSubTriggerProps(subMenuId, childApi.isOpen, disabled) as ReturnType<typeof parentApi.getSubTriggerProps> & { onMousemove?: unknown; onMouseleave?: unknown };

  const props = {
    ...baseTriggerProps, ...rest,
    onMouseEnter() {
      parentApi.send({ type: "HIGHLIGHT_ITEM", value });
      if (openOnHover) {
        clearTimeout(closeTimerRef.current);
        openTimerRef.current = setTimeout(() => childApi.setOpen(true), openDelay);
      }
    },
    onMouseLeave() {
      if (openOnHover) {
        clearTimeout(openTimerRef.current);
        closeTimerRef.current = setTimeout(() => { if (childApi.isOpen) childApi.setOpen(false); }, closeDelay);
      }
    },
    onClick() {
      if (!disabled) {
        clearTimeout(openTimerRef.current);
        openSubmenu();
      }
    },
  };

  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <div {...props}>{children}</div>;
}

export interface ContextMenuSubContentProps extends Omit<HTMLAttributes<HTMLDivElement>, "onKeyDown"> {
  asChild?: boolean;
  forceMount?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

function SubContent({ asChild, forceMount, children, onKeyDown: restKeyDown, ...rest }: ContextMenuSubContentProps) {
  const parentApi = useCtx();
  const sub = useContext(ContextMenuSubCtx);
  if (!sub) throw new Error("ContextMenu.SubContent must be inside <ContextMenu.Sub>");

  const ownTriggersRef = useContext(ContextMenuSubTriggersCtx);
  const { childApi, childPresence, closeDelay } = sub;
  const ownPresence = usePresence(childApi.isOpen);
  const { isPresent, presenceRef } = childPresence ?? ownPresence;
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (childApi.isOpen && childApi.highlighted !== null && childApi.highlightSource === "keyboard") {
      childApi.focusHighlightedItem();
    }
  }, [childApi.highlighted, childApi.isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!forceMount && !isPresent) return null;

  const { ref: contentRef, onKeyDown: baseKeyDown, onKeydown: _kd, ...contentRest } = childApi.getContentProps() as ReturnType<typeof childApi.getContentProps> & { onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void; onKeydown?: unknown };
  const positionerProps = childApi.getPositionerProps();
  const mergedRef = mergeRefs(contentRef as RefCallback<HTMLDivElement>, presenceRef as RefCallback<HTMLDivElement>);

  const closingProps = !childApi.isOpen ? ({ "aria-hidden": true, style: { pointerEvents: "none" as const } } as const) : {};

  const mergedProps = {
    ...contentRest, ...closingProps, ...rest,
    onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
      const isRTL = getComputedStyle(e.currentTarget).direction === "rtl";
      const closeKey = isRTL ? "ArrowRight" : "ArrowLeft";
      const openKey = isRTL ? "ArrowLeft" : "ArrowRight";
      if (e.key === closeKey) {
        e.preventDefault(); e.stopPropagation();
        childApi.send("CLOSE");
        setTimeout(() => parentApi.focusContent(), 0);
        return;
      }
      if (e.key === openKey && childApi.highlighted !== null) {
        const openNestedSub = ownTriggersRef?.current.get(childApi.highlighted);
        if (openNestedSub) { e.preventDefault(); e.stopPropagation(); openNestedSub(); return; }
      }
      baseKeyDown?.(e); restKeyDown?.(e);
    },
    onMouseEnter() { clearTimeout(closeTimerRef.current); },
    onMouseLeave() { closeTimerRef.current = setTimeout(() => childApi.setOpen(false), closeDelay); },
    ref: mergedRef,
  };

  return (
    <DialogPortal>
      <div {...positionerProps}>
        {asChild ? <Slot {...mergedProps}>{children}</Slot> : <div {...mergedProps}>{children}</div>}
      </div>
    </DialogPortal>
  );
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

Root.displayName = "ContextMenu.Root";
Trigger.displayName = "ContextMenu.Trigger";
Portal.displayName = "ContextMenu.Portal";
Content.displayName = "ContextMenu.Content";
Item.displayName = "ContextMenu.Item";
Label.displayName = "ContextMenu.Label";
Separator.displayName = "ContextMenu.Separator";
Group.displayName = "ContextMenu.Group";
GroupLabel.displayName = "ContextMenu.GroupLabel";
RadioGroup.displayName = "ContextMenu.RadioGroup";
RadioGroupLabel.displayName = "ContextMenu.RadioGroupLabel";
RadioItem.displayName = "ContextMenu.RadioItem";
CheckboxItem.displayName = "ContextMenu.CheckboxItem";
ItemIndicator.displayName = "ContextMenu.ItemIndicator";
Sub.displayName = "ContextMenu.Sub";
SubTrigger.displayName = "ContextMenu.SubTrigger";
SubContent.displayName = "ContextMenu.SubContent";

export const ContextMenu = {
  Root, Trigger, Portal, Content,
  Item, Label, Separator, Group, GroupLabel,
  RadioGroup, RadioGroupLabel, RadioItem, CheckboxItem, ItemIndicator,
  Sub, SubTrigger, SubContent,
} as const;

export {
  Root as ContextMenuRoot,
  Trigger as ContextMenuTrigger,
  Portal as ContextMenuPortal,
  Content as ContextMenuContent,
  Item as ContextMenuItem,
  Label as ContextMenuLabel,
  Separator as ContextMenuSeparator,
  Group as ContextMenuGroup,
  GroupLabel as ContextMenuGroupLabel,
  RadioGroup as ContextMenuRadioGroup,
  RadioGroupLabel as ContextMenuRadioGroupLabel,
  RadioItem as ContextMenuRadioItem,
  CheckboxItem as ContextMenuCheckboxItem,
  ItemIndicator as ContextMenuItemIndicator,
  Sub as ContextMenuSub,
  SubTrigger as ContextMenuSubTrigger,
  SubContent as ContextMenuSubContent,
};
