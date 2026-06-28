import { mergeRefs } from "@forge-ui/core";
import type { HTMLAttributes, ReactNode, RefCallback } from "react";
import { createContext, useContext, useEffect, useLayoutEffect, useRef } from "react";
import { usePresence } from "../../hooks/use-presence.js";
import { DialogPortal } from "../dialog/DialogPortal.js";
import { Slot } from "../shared/Slot.js";
import type { UseMenuOptions, UseMenuReturn } from "./use-menu.js";
import { useMenu } from "./use-menu.js";

// ---------------------------------------------------------------------------
// Root contexts
// ---------------------------------------------------------------------------

type MenuApi = UseMenuReturn;

const MenuCtx = createContext<MenuApi | null>(null);
const MenuPresenceCtx = createContext<ReturnType<typeof usePresence> | null>(null);
const MenuSubTriggersCtx = createContext<React.MutableRefObject<Map<string, () => void>> | null>(
  null,
);

function useCtx(): MenuApi {
  const ctx = useContext(MenuCtx);
  if (!ctx) throw new Error("Menu compound parts must be inside <Menu.Root>");
  return ctx;
}

// Sub context — extended with hover delays and the parent-level sub-triggers map.
// parentTriggersRef: map owned by the GRANDPARENT level (Root or outer Sub).
// SubTrigger registers itself into parentTriggersRef so the outer Content can open it via ArrowRight.
// SubContent reads from MenuSubTriggersCtx (= ownTriggersRef provided by the current Sub)
// to open nested subs via ArrowRight. This isolates each nesting level.
const MenuSubCtx = createContext<{
  childApi: MenuApi;
  childPresence: ReturnType<typeof usePresence>;
  subMenuId: string;
  openDelay: number;
  closeDelay: number;
  parentTriggersRef: React.MutableRefObject<Map<string, () => void>> | null;
} | null>(null);

// RadioGroup context
const MenuRadioGroupCtx = createContext<{
  groupId: string;
  value: string;
  onValueChange: (v: string) => void;
} | null>(null);

// Checked state context — for ItemIndicator
const MenuItemCheckedCtx = createContext<{ checked: boolean | "indeterminate" } | null>(null);

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface MenuRootProps extends UseMenuOptions {
  children: ReactNode;
}

function Root({ children, ...opts }: MenuRootProps) {
  const api = useMenu({ ...opts, isContextMenu: false });
  const presence = usePresence(api.isOpen);
  const subTriggersRef = useRef(new Map<string, () => void>());

  return (
    <MenuCtx.Provider value={api}>
      <MenuPresenceCtx.Provider value={presence}>
        <MenuSubTriggersCtx.Provider value={subTriggersRef}>{children}</MenuSubTriggersCtx.Provider>
      </MenuPresenceCtx.Provider>
    </MenuCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

export interface MenuTriggerProps extends Omit<HTMLAttributes<HTMLButtonElement>, "children"> {
  asChild?: boolean;
  children?: ReactNode;
  disabled?: boolean;
}

function Trigger({ asChild, children, disabled, ...rest }: MenuTriggerProps) {
  const api = useCtx();
  const {
    onKeyDown,
    onKeydown: _kd,
    ref,
    ...triggerRest
  } = api.getTriggerProps(disabled !== undefined ? { disabled } : undefined) as ReturnType<
    typeof api.getTriggerProps
  > & { onKeydown?: unknown };
  const props = { ...triggerRest, onKeyDown, ...rest, ref };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

export interface MenuPortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
  forceMount?: boolean;
}

function Portal({ children, container, forceMount }: MenuPortalProps) {
  const api = useCtx();
  const presence = useContext(MenuPresenceCtx);
  const isPresent = presence?.isPresent ?? api.isOpen;
  if (!forceMount && !isPresent) return null;
  return <DialogPortal {...(container !== undefined && { container })}>{children}</DialogPortal>;
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export interface MenuContentProps extends Omit<HTMLAttributes<HTMLDivElement>, "onKeyDown"> {
  asChild?: boolean;
  forceMount?: boolean;
  /**
   * Called when the menu opens, before the default focus behaviour (focusContent).
   * Call `e.preventDefault()` to override focus (e.g. focus a specific item).
   */
  onOpenAutoFocus?: (e: Event) => void;
  /**
   * Called when the menu closes, before focus returns to the trigger.
   * Call `e.preventDefault()` to redirect focus elsewhere.
   */
  onCloseAutoFocus?: (e: Event) => void;
  /**
   * Called when Escape is pressed before the machine processes it.
   * Call `e.preventDefault()` to block close.
   */
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

function Content({
  asChild,
  forceMount,
  children,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onKeyDown: restKeyDown,
  ...rest
}: MenuContentProps) {
  const api = useCtx();
  const subTriggersRef = useContext(MenuSubTriggersCtx);
  const injectedPresence = useContext(MenuPresenceCtx);
  const ownPresence = usePresence(api.isOpen);
  const { isPresent, presenceRef } = injectedPresence ?? ownPresence;

  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (api.isOpen && !wasOpenRef.current) {
      // FIRST_ITEM fallback: the machine no longer calls setHighlightFirst on OPEN
      // because items may not be registered yet (Portal renders after state change).
      // By the time this useEffect fires, children's useLayoutEffect has already run,
      // so items are registered. We only send FIRST_ITEM if nothing is highlighted
      // (avoids overriding ArrowUp's pending LAST_ITEM setTimeout).
      if (api.highlighted === null) {
        api.send("FIRST_ITEM");
      }
      const openEvent = new Event("openfocus", { bubbles: false, cancelable: true });
      onOpenAutoFocus?.(openEvent);
      if (!openEvent.defaultPrevented) api.focusContent();
    }
    if (!api.isOpen && wasOpenRef.current) {
      const closeEvent = new Event("closefocus", { bubbles: false, cancelable: true });
      onCloseAutoFocus?.(closeEvent);
      if (!closeEvent.defaultPrevented) api.focusTrigger();
    }
    wasOpenRef.current = api.isOpen;
  }, [api.isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ARIA roving tabindex / real focus: move DOM focus to the highlighted item on keyboard nav.
  // Pointer hover only updates data-highlighted visually — no focus move.
  useEffect(() => {
    if (api.isOpen && api.highlighted !== null && api.highlightSource === "keyboard") {
      api.focusHighlightedItem();
    }
  }, [api.highlighted, api.isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!forceMount && !isPresent) return null;

  const {
    ref: contentRef,
    onKeyDown: baseKeyDown,
    onKeydown: _kd,
    ...contentRest
  } = api.getContentProps() as ReturnType<typeof api.getContentProps> & {
    onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    onKeydown?: unknown;
  };
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
      // RTL: the key that opens a sub-menu is ArrowLeft in RTL, ArrowRight in LTR.
      const isRTL = getComputedStyle(e.currentTarget).direction === "rtl";
      const openSubKey = isRTL ? "ArrowLeft" : "ArrowRight";
      if (e.key === openSubKey && api.highlighted !== null) {
        const openSub = subTriggersRef?.current.get(api.highlighted);
        if (openSub) {
          e.preventDefault();
          e.stopPropagation();
          openSub();
          return;
        }
      }
      baseKeyDown?.(e);
      restKeyDown?.(e);
    },
    ref: mergedRef,
  };

  const innerEl = asChild ? (
    <Slot {...mergedContentProps}>{children}</Slot>
  ) : (
    <div {...mergedContentProps}>{children}</div>
  );

  return (
    <>
      {/* Modal overlay — blocks pointer events on the rest of the page (modal=true, default).
          z-index 49 keeps it below the positioner (z-index 50).
          Clicking the overlay fires watchOutside → INTERACT_OUTSIDE → close.
          aria-hidden keeps it transparent to screen readers. */}
      {api.modal && api.isOpen && (
        <div
          data-forge-part="modal-overlay"
          aria-hidden="true"
          style={{ position: "fixed", inset: 0, zIndex: 49 }}
        />
      )}
      <div {...positionerProps}>{innerEl}</div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Arrow
// ---------------------------------------------------------------------------

export interface MenuArrowProps extends HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

function Arrow({ asChild, ...rest }: MenuArrowProps) {
  const api = useCtx();
  const { ref, ...arrowRest } = api.getArrowProps() as ReturnType<typeof api.getArrowProps> & {
    ref?: RefCallback<HTMLSpanElement>;
  };
  const props = { ...arrowRest, ...rest, ref };
  if (asChild) return <Slot {...props} />;
  return (
    <span {...props}>
      <svg
        {...api.getArrowTipProps()}
        width="10"
        height="5"
        viewBox="0 0 10 5"
        aria-hidden="true"
        style={{ display: "block" }}
      >
        <path d="M0 0L5 5L10 0" fill="currentColor" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Anchor
// ---------------------------------------------------------------------------

export interface MenuAnchorProps extends HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
  children?: ReactNode;
}

function Anchor({ asChild, children, ...rest }: MenuAnchorProps) {
  const api = useCtx();
  const { ref, ...anchorRest } = api.getAnchorProps() as ReturnType<typeof api.getAnchorProps> & {
    ref?: RefCallback<HTMLSpanElement>;
  };
  const props = { ...anchorRest, ...rest, ref };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <span {...props}>{children}</span>;
}

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

export interface MenuItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  value: string;
  label?: string;
  /**
   * Text used for typeahead matching. Falls back to `label` then `value`.
   * Provide when children contain non-text nodes (icons, badges, shortcuts).
   */
  textValue?: string;
  disabled?: boolean;
  asChild?: boolean;
  children?: ReactNode;
  onMenuSelect?: (value: string) => void;
  /** Called after the item triggers navigation (e.g. router push). Runs after menu closes. */
  navigate?: () => void;
  /** @default true */
  closeOnSelect?: boolean;
}

function Item({
  value,
  label,
  textValue,
  disabled = false,
  asChild,
  children,
  onMenuSelect,
  navigate,
  closeOnSelect = true,
  ...rest
}: MenuItemProps) {
  const api = useCtx();

  // Registration is required for keyboard navigation (NEXT/PREV/FIRST/LAST) and typeahead.
  // useLayoutEffect fires before the parent Content's useEffect, ensuring items are
  // in context.items before Content dispatches FIRST_ITEM.
  useLayoutEffect(() => {
    api.registerItem({
      value,
      label: label ?? value,
      ...(textValue !== undefined && { textValue }),
      disabled,
    });
    return () => api.unregisterItem(value);
  }, [value, label, textValue, disabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    onMouseEnter,
    onMouseLeave,
    onMousemove: _mm,
    onMouseleave: _ml,
    onClick: baseClick,
    ...itemRest
  } = api.getItemProps(value, disabled) as ReturnType<typeof api.getItemProps> & {
    onMousemove?: unknown;
    onMouseleave?: unknown;
  };

  const props = {
    ...itemRest,
    onMouseEnter,
    onMouseLeave,
    ...rest,
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

export interface MenuLabelProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

function Label({ children, ...rest }: MenuLabelProps) {
  const api = useCtx();
  return (
    <div {...api.getLabelProps()} {...rest}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Separator
// ---------------------------------------------------------------------------

export interface MenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

function Separator({ ...rest }: MenuSeparatorProps) {
  const api = useCtx();
  return <div {...api.getSeparatorProps()} {...rest} />;
}

// ---------------------------------------------------------------------------
// Group + GroupLabel
// ---------------------------------------------------------------------------

export interface MenuGroupProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
  children: ReactNode;
}

function Group({ id, children, ...rest }: MenuGroupProps) {
  const api = useCtx();
  return (
    <div {...api.getGroupProps(id)} {...rest}>
      {children}
    </div>
  );
}

export interface MenuGroupLabelProps extends HTMLAttributes<HTMLDivElement> {
  groupId: string;
  children: ReactNode;
}

function GroupLabel({ groupId, children, ...rest }: MenuGroupLabelProps) {
  const api = useCtx();
  return (
    <div {...api.getGroupLabelProps(groupId)} {...rest}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RadioGroup
// ---------------------------------------------------------------------------

export interface MenuRadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  groupId: string;
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

function RadioGroup({ groupId, value, onValueChange, children, ...rest }: MenuRadioGroupProps) {
  const api = useCtx();
  return (
    <MenuRadioGroupCtx.Provider value={{ groupId, value, onValueChange }}>
      <div {...api.getRadioGroupProps(groupId)} {...rest}>
        {children}
      </div>
    </MenuRadioGroupCtx.Provider>
  );
}

export interface MenuRadioGroupLabelProps extends HTMLAttributes<HTMLDivElement> {
  groupId: string;
  children: ReactNode;
}

function RadioGroupLabel({ groupId, children, ...rest }: MenuRadioGroupLabelProps) {
  const api = useCtx();
  return (
    <div {...api.getRadioGroupLabelProps(groupId)} {...rest}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RadioItem
// ---------------------------------------------------------------------------

export interface MenuRadioItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  value: string;
  label?: string;
  textValue?: string;
  disabled?: boolean;
  asChild?: boolean;
  children?: ReactNode;
  /** @default true */
  closeOnSelect?: boolean;
}

function RadioItem({
  value,
  label,
  textValue,
  disabled = false,
  asChild,
  children,
  closeOnSelect = true,
  ...rest
}: MenuRadioItemProps) {
  const api = useCtx();
  const radioCtx = useContext(MenuRadioGroupCtx);
  if (!radioCtx) throw new Error("Menu.RadioItem must be inside <Menu.RadioGroup>");

  const checked = radioCtx.value === value;

  useLayoutEffect(() => {
    api.registerItem({
      value,
      label: label ?? value,
      ...(textValue !== undefined && { textValue }),
      disabled,
    });
    return () => api.unregisterItem(value);
  }, [value, label, textValue, disabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    onMouseEnter,
    onMouseLeave,
    onMousemove: _mm,
    onMouseleave: _ml,
    onClick: baseClick,
    ...itemRest
  } = api.getRadioItemProps({ value, checked, disabled, closeOnSelect }) as ReturnType<
    typeof api.getRadioItemProps
  > & { onMousemove?: unknown; onMouseleave?: unknown };

  const props = {
    ...itemRest,
    onMouseEnter,
    onMouseLeave,
    ...rest,
    onClick(e: React.MouseEvent<HTMLDivElement>) {
      (rest as HTMLAttributes<HTMLDivElement>).onClick?.(e);
      if (!disabled) {
        radioCtx.onValueChange(value);
        baseClick?.();
      }
    },
  };

  return (
    <MenuItemCheckedCtx.Provider value={{ checked }}>
      {asChild ? <Slot {...props}>{children}</Slot> : <div {...props}>{children}</div>}
    </MenuItemCheckedCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// CheckboxItem
// ---------------------------------------------------------------------------

export interface MenuCheckboxItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  value: string;
  label?: string;
  textValue?: string;
  checked: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  asChild?: boolean;
  children?: ReactNode;
  /** @default false — keeps menu open for multi-pick; set true for single-action toggles */
  closeOnSelect?: boolean;
}

function CheckboxItem({
  value,
  label,
  textValue,
  checked,
  onCheckedChange,
  disabled = false,
  asChild,
  children,
  closeOnSelect = false,
  ...rest
}: MenuCheckboxItemProps) {
  const api = useCtx();

  useLayoutEffect(() => {
    api.registerItem({
      value,
      label: label ?? value,
      ...(textValue !== undefined && { textValue }),
      disabled,
    });
    return () => api.unregisterItem(value);
  }, [value, label, textValue, disabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    onMouseEnter,
    onMouseLeave,
    onMousemove: _mm,
    onMouseleave: _ml,
    onClick: baseClick,
    ...itemRest
  } = api.getCheckboxItemProps({ value, checked, disabled, closeOnSelect }) as ReturnType<
    typeof api.getCheckboxItemProps
  > & { onMousemove?: unknown; onMouseleave?: unknown };

  const props = {
    ...itemRest,
    onMouseEnter,
    onMouseLeave,
    ...rest,
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
    <MenuItemCheckedCtx.Provider value={{ checked }}>
      {asChild ? <Slot {...props}>{children}</Slot> : <div {...props}>{children}</div>}
    </MenuItemCheckedCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// ItemIndicator
// ---------------------------------------------------------------------------

export interface MenuItemIndicatorProps {
  children: ReactNode;
  forceMount?: boolean;
}

function ItemIndicator({ children, forceMount }: MenuItemIndicatorProps) {
  const api = useCtx();
  const itemCtx = useContext(MenuItemCheckedCtx);
  const isChecked = itemCtx?.checked;
  if (!forceMount && !isChecked) return null;
  return <span {...api.getItemIndicatorProps(isChecked ?? false)}>{children}</span>;
}

// ---------------------------------------------------------------------------
// Sub
// ---------------------------------------------------------------------------

export interface MenuSubProps {
  children: ReactNode;
  onMenuSelect?: (value: string) => void;
  /** Delay (ms) before opening on hover. @default 200 */
  openDelay?: number;
  /** Delay (ms) before closing when cursor leaves. @default 300 */
  closeDelay?: number;
}

function Sub({ children, onMenuSelect, openDelay = 200, closeDelay = 300 }: MenuSubProps) {
  // Capture the PARENT's triggers map before we override the context.
  // SubTrigger registers into parentTriggersRef so the outer Content/SubContent
  // can open this sub via ArrowRight. This is the key to N-level nesting isolation:
  // each Sub level owns its own ownTriggersRef for its children's subs.
  const parentTriggersRef = useContext(MenuSubTriggersCtx);
  const ownTriggersRef = useRef(new Map<string, () => void>());

  const childApi = useMenu({
    isContextMenu: false,
    positioning: { placement: "right-start" },
    ...(onMenuSelect !== undefined && { onSelect: onMenuSelect }),
  });
  const childPresence = usePresence(childApi.isOpen);

  return (
    <MenuSubCtx.Provider
      value={{
        childApi,
        childPresence,
        subMenuId: childApi.id,
        openDelay,
        closeDelay,
        parentTriggersRef,
      }}
    >
      {/* Override MenuSubTriggersCtx with ownTriggersRef so SubContent and deeper
          SubTriggers read from this level's map, not the grandparent's. */}
      <MenuSubTriggersCtx.Provider value={ownTriggersRef}>{children}</MenuSubTriggersCtx.Provider>
    </MenuSubCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// SubTrigger
// ---------------------------------------------------------------------------

export interface MenuSubTriggerProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  disabled?: boolean;
  children?: ReactNode;
  value: string;
  label?: string;
  textValue?: string;
  asChild?: boolean;
  /** When false, the sub-menu only opens on click — hover has no effect. @default true */
  openOnHover?: boolean;
}

function SubTrigger({
  disabled = false,
  children,
  value,
  label,
  textValue,
  asChild,
  openOnHover = true,
  ...rest
}: MenuSubTriggerProps) {
  const parentApi = useCtx();
  const sub = useContext(MenuSubCtx);
  if (!sub) throw new Error("Menu.SubTrigger must be inside <Menu.Sub>");

  const { childApi, subMenuId, openDelay, closeDelay, parentTriggersRef } = sub;
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useLayoutEffect(() => {
    const openSubmenu = () => {
      clearTimeout(closeTimerRef.current);
      childApi.setOpen(true);
      setTimeout(() => {
        childApi.focusContent();
        childApi.send("FIRST_ITEM");
      }, 10);
    };
    // Register in the PARENT's triggers map, not the own map.
    // The outer Content/SubContent reads from its direct Sub's ownTriggersRef (= parentTriggersRef here).
    parentTriggersRef?.current.set(value, openSubmenu);
    return () => {
      parentTriggersRef?.current.delete(value);
    };
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    parentApi.registerItem({
      value,
      label: label ?? value,
      ...(textValue !== undefined && { textValue }),
      disabled,
    });
    return () => parentApi.unregisterItem(value);
  }, [value, label, textValue, disabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    onMouseEnter: _pme,
    onMouseLeave: _pml,
    onMousemove: _mm,
    onMouseleave: _ml,
    ...subTriggerBaseProps
  } = parentApi.getSubTriggerProps(subMenuId, childApi.isOpen, disabled) as ReturnType<
    typeof parentApi.getSubTriggerProps
  > & { onMousemove?: unknown; onMouseleave?: unknown };

  const props = {
    ...subTriggerBaseProps,
    ...rest,
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
        closeTimerRef.current = setTimeout(() => {
          if (!childApi.isOpen) return;
          childApi.setOpen(false);
        }, closeDelay);
      }
    },
    onClick() {
      if (!disabled) {
        clearTimeout(openTimerRef.current);
        clearTimeout(closeTimerRef.current);
        childApi.send("TOGGLE");
        if (!childApi.isOpen) {
          setTimeout(() => {
            childApi.focusContent();
            childApi.send("FIRST_ITEM");
          }, 10);
        }
      }
    },
  };

  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <div {...props}>{children}</div>;
}

// ---------------------------------------------------------------------------
// SubContent
// ---------------------------------------------------------------------------

export interface MenuSubContentProps extends Omit<HTMLAttributes<HTMLDivElement>, "onKeyDown"> {
  asChild?: boolean;
  forceMount?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

function SubContent({
  asChild,
  forceMount,
  children,
  onKeyDown: restKeyDown,
  ...rest
}: MenuSubContentProps) {
  const parentApi = useCtx();
  const sub = useContext(MenuSubCtx);
  if (!sub) throw new Error("Menu.SubContent must be inside <Menu.Sub>");

  // ownTriggersRef: the triggers map provided by OUR MenuSub (via MenuSubTriggersCtx.Provider).
  // Used to open deeper nested sub-menus via ArrowRight.
  const ownTriggersRef = useContext(MenuSubTriggersCtx);

  const { childApi, childPresence, closeDelay } = sub;
  const ownPresence = usePresence(childApi.isOpen);
  const { isPresent, presenceRef } = childPresence ?? ownPresence;
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ARIA roving tabindex: keyboard highlight moves real focus to the sub-menu item.
  useEffect(() => {
    if (
      childApi.isOpen &&
      childApi.highlighted !== null &&
      childApi.highlightSource === "keyboard"
    ) {
      childApi.focusHighlightedItem();
    }
  }, [childApi.highlighted, childApi.isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!forceMount && !isPresent) return null;

  const {
    ref: contentRef,
    onKeyDown: baseKeyDown,
    onKeydown: _kd,
    ...contentRest
  } = childApi.getContentProps() as ReturnType<typeof childApi.getContentProps> & {
    onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    onKeydown?: unknown;
  };
  const positionerProps = childApi.getPositionerProps();

  const mergedRef = mergeRefs(
    contentRef as RefCallback<HTMLDivElement>,
    presenceRef as RefCallback<HTMLDivElement>,
  );

  const closingProps = !childApi.isOpen
    ? ({ "aria-hidden": true, style: { pointerEvents: "none" as const } } as const)
    : {};

  const mergedProps = {
    ...contentRest,
    ...closingProps,
    ...rest,
    onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
      // RTL-aware: ArrowLeft closes in LTR, ArrowRight closes in RTL.
      const isRTL = getComputedStyle(e.currentTarget).direction === "rtl";
      const closeKey = isRTL ? "ArrowRight" : "ArrowLeft";
      const openKey = isRTL ? "ArrowLeft" : "ArrowRight";

      if (e.key === closeKey) {
        e.preventDefault();
        e.stopPropagation();
        childApi.send("CLOSE");
        setTimeout(() => parentApi.focusContent(), 0);
        return;
      }
      // N-level nesting: ArrowRight (or Left in RTL) opens a deeper sub-menu.
      if (e.key === openKey && childApi.highlighted !== null) {
        const openNestedSub = ownTriggersRef?.current.get(childApi.highlighted);
        if (openNestedSub) {
          e.preventDefault();
          e.stopPropagation();
          openNestedSub();
          return;
        }
      }
      baseKeyDown?.(e);
      restKeyDown?.(e);
    },
    onMouseEnter() {
      clearTimeout(closeTimerRef.current);
    },
    onMouseLeave() {
      closeTimerRef.current = setTimeout(() => childApi.setOpen(false), closeDelay);
    },
    ref: mergedRef,
  };

  const subPortalContent = asChild ? (
    <div {...positionerProps}>
      <Slot {...mergedProps}>{children}</Slot>
    </div>
  ) : (
    <div {...positionerProps}>
      <div {...mergedProps}>{children}</div>
    </div>
  );

  return <DialogPortal>{subPortalContent}</DialogPortal>;
}

// ---------------------------------------------------------------------------
// DisplayNames + export
// ---------------------------------------------------------------------------

Root.displayName = "Menu.Root";
Trigger.displayName = "Menu.Trigger";
Portal.displayName = "Menu.Portal";
Content.displayName = "Menu.Content";
Arrow.displayName = "Menu.Arrow";
Item.displayName = "Menu.Item";
Label.displayName = "Menu.Label";
Separator.displayName = "Menu.Separator";
Group.displayName = "Menu.Group";
GroupLabel.displayName = "Menu.GroupLabel";
RadioGroup.displayName = "Menu.RadioGroup";
RadioGroupLabel.displayName = "Menu.RadioGroupLabel";
RadioItem.displayName = "Menu.RadioItem";
CheckboxItem.displayName = "Menu.CheckboxItem";
ItemIndicator.displayName = "Menu.ItemIndicator";
Sub.displayName = "Menu.Sub";
Anchor.displayName = "Menu.Anchor";
SubTrigger.displayName = "Menu.SubTrigger";
SubContent.displayName = "Menu.SubContent";

export const Menu = {
  Root,
  Trigger,
  Portal,
  Content,
  Arrow,
  Anchor,
  Item,
  Label,
  Separator,
  Group,
  GroupLabel,
  RadioGroup,
  RadioGroupLabel,
  RadioItem,
  CheckboxItem,
  ItemIndicator,
  Sub,
  SubTrigger,
  SubContent,
} as const;

export {
  Anchor as MenuAnchor,
  Arrow as MenuArrow,
  CheckboxItem as MenuCheckboxItem,
  Content as MenuContent,
  Group as MenuGroup,
  GroupLabel as MenuGroupLabel,
  Item as MenuItem,
  ItemIndicator as MenuItemIndicator,
  Label as MenuLabel,
  Portal as MenuPortal,
  RadioGroup as MenuRadioGroup,
  RadioGroupLabel as MenuRadioGroupLabel,
  RadioItem as MenuRadioItem,
  Root as MenuRoot,
  Separator as MenuSeparator,
  Sub as MenuSub,
  SubContent as MenuSubContent,
  SubTrigger as MenuSubTrigger,
  Trigger as MenuTrigger,
};
