import type { MenuPositioning } from "@forge-ui/menu";
import type { InjectionKey, PropType, Ref } from "vue";
import {
  defineComponent,
  h,
  inject,
  nextTick,
  onMounted,
  onScopeDispose,
  provide,
  ref,
  watch,
} from "vue";
import { usePresence } from "../../hooks/use-presence.js";
import { DialogPortal } from "../dialog/DialogPortal.js";
import { Slot } from "../shared/Slot.js";
import type { UseMenuReturn } from "./use-menu.js";
import { useMenu } from "./use-menu.js";

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------

type ContextMenuApi = UseMenuReturn;
type ContextMenuPresenceCtx = { isPresent: Ref<boolean>; presenceRef: Ref<HTMLElement | null> };

const contextMenuKey: InjectionKey<ContextMenuApi> = Symbol("forge-context-menu");
const contextMenuPresenceKey: InjectionKey<ContextMenuPresenceCtx> = Symbol("forge-context-menu-presence");
const contextMenuRadioGroupKey: InjectionKey<{
  groupId: string;
  value: Ref<string>;
  onValueChange: (v: string) => void;
}> = Symbol("forge-context-menu-radio-group");
const contextMenuItemCheckedKey: InjectionKey<Ref<boolean | "indeterminate">> = Symbol("forge-context-menu-item-checked");

function useCtx(): ContextMenuApi {
  const ctx = inject(contextMenuKey);
  if (!ctx) throw new Error("ContextMenu parts must be inside <ContextMenu.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const ContextMenuRoot = defineComponent({
  name: "ForgeContextMenuRoot",
  props: {
    id: { type: String, default: undefined },
    loop: { type: Boolean, default: undefined },
    positioning: { type: Object as PropType<MenuPositioning>, default: undefined },
    onOpenChange: { type: Function as PropType<(open: boolean) => void>, default: undefined },
    onSelect: { type: Function as PropType<(value: string) => void>, default: undefined },
    onHighlightChange: {
      type: Function as PropType<(value: string | null) => void>,
      default: undefined,
    },
    onInteractOutside: {
      type: Function as PropType<(e: PointerEvent | FocusEvent) => void>,
      default: undefined,
    },
    onPointerDownOutside: {
      type: Function as PropType<(e: PointerEvent) => void>,
      default: undefined,
    },
    onFocusOutside: {
      type: Function as PropType<(e: FocusEvent) => void>,
      default: undefined,
    },
    onEscapeKeyDown: {
      type: Function as PropType<(e: { key: string; preventDefault(): void }) => void>,
      default: undefined,
    },
  },
  emits: {
    "update:open": (_v: boolean) => true,
  },
  setup(props, { slots, emit }) {
    const api = useMenu({
      isContextMenu: true,
      ...(props.id !== undefined && { id: props.id }),
      ...(props.loop !== undefined && { loop: props.loop }),
      ...(props.positioning !== undefined && { positioning: props.positioning }),
      onOpenChange: (open: boolean) => {
        emit("update:open", open);
        props.onOpenChange?.(open);
      },
      ...(props.onSelect !== undefined && { onSelect: props.onSelect }),
      ...(props.onHighlightChange !== undefined && { onHighlightChange: props.onHighlightChange }),
      ...(props.onInteractOutside !== undefined && { onInteractOutside: props.onInteractOutside }),
      ...(props.onPointerDownOutside !== undefined && { onPointerDownOutside: props.onPointerDownOutside }),
      ...(props.onFocusOutside !== undefined && { onFocusOutside: props.onFocusOutside }),
      ...(props.onEscapeKeyDown !== undefined && { onEscapeKeyDown: props.onEscapeKeyDown }),
    });

    provide(contextMenuKey, api);

    const presence = usePresence(api.isOpen);
    provide(contextMenuPresenceKey, presence);

    return () => slots['default']?.();
  },
});

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

const ContextMenuTrigger = defineComponent({
  name: "ForgeContextMenuTrigger",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const { onContextMenu, ref: _ref, ...rest } = api.getContextMenuTriggerProps() as ReturnType<typeof api.getContextMenuTriggerProps> & { ref?: unknown };
      const triggerProps = { ...rest, ...attrs, onContextmenu: onContextMenu };
      if (props.asChild) return h(Slot, triggerProps, slots['default']);
      return h("div", triggerProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

const ContextMenuPortal = defineComponent({
  name: "ForgeContextMenuPortal",
  props: {
    forceMount: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const api = useCtx();
    const presence = inject(contextMenuPresenceKey);
    return () => {
      const isPresent = presence?.isPresent.value ?? api.isOpen.value;
      if (!props.forceMount && !isPresent) return null;
      return h(DialogPortal, {}, slots['default']);
    };
  },
});

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const ContextMenuContent = defineComponent({
  name: "ForgeContextMenuContent",
  props: {
    asChild: { type: Boolean, default: false },
    forceMount: { type: Boolean, default: false },
    /** Custom portal container. Defaults to document.body (context menus always portal). */
    container: { type: Object as PropType<HTMLElement | null>, default: undefined },
    onOpenAutoFocus: {
      type: Function as PropType<(e: Event) => void>,
      default: undefined,
    },
    onCloseAutoFocus: {
      type: Function as PropType<(e: Event) => void>,
      default: undefined,
    },
    onEscapeKeyDown: {
      type: Function as PropType<(e: KeyboardEvent) => void>,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    const injectedPresence = inject(contextMenuPresenceKey);
    const ownPresence = usePresence(api.isOpen);
    const { isPresent, presenceRef } = injectedPresence ?? ownPresence;

    let prevOpen = api.isOpen.value;
    watch(api.isOpen, (open) => {
      if (open && !prevOpen) {
        if (api.highlighted.value === null) api.send("FIRST_ITEM");
        const openEvent = new Event("openfocus", { bubbles: false, cancelable: true });
        props.onOpenAutoFocus?.(openEvent);
        if (!openEvent.defaultPrevented) api.focusContent();
      }
      if (!open && prevOpen) {
        const closeEvent = new Event("closefocus", { bubbles: false, cancelable: true });
        props.onCloseAutoFocus?.(closeEvent);
        // Context menu: no trigger element to return focus to by default.
      }
      prevOpen = open;
    });

    // ARIA roving tabindex: keyboard highlight moves real focus to the item.
    watch(api.highlighted, () => {
      if (api.isOpen.value && api.highlighted.value !== null && api.highlightSource.value === "keyboard") {
        nextTick(() => api.focusHighlightedItem());
      }
    });

    return () => {
      if (!props.forceMount && !isPresent.value) return null;

      const { ref: _ref, onKeydown: baseKeydown, onKeyDown: _kD, ...contentRest } = api.getContentProps() as ReturnType<typeof api.getContentProps> & { onKeyDown?: unknown };
      const positionerProps = api.getPositionerProps();

      const closingAttrs = !api.isOpen.value
        ? { "aria-hidden": true, style: { pointerEvents: "none" as const } }
        : {};

      const contentProps = {
        ...contentRest,
        ...closingAttrs,
        ...attrs,
        ref: (el: unknown) => {
          presenceRef.value = el as HTMLElement | null;
          if (typeof _ref === "function") (_ref as (el: unknown) => void)(el);
        },
        onKeydown(e: KeyboardEvent) {
          if (e.key === "Escape" && props.onEscapeKeyDown) {
            props.onEscapeKeyDown(e);
            if (e.defaultPrevented) return;
          }
          (baseKeydown as unknown as (e: KeyboardEvent) => void)(e);
        },
      };

      const inner = props.asChild
        ? h(Slot, contentProps, slots['default'])
        : h("div", contentProps, slots['default']?.());

      const overlay = api.modal.value && api.isOpen.value
        ? h("div", {
            "data-forge-part": "modal-overlay",
            "aria-hidden": "true",
            style: { position: "fixed", inset: 0, zIndex: 49 },
          })
        : null;

      // ContextMenu always portals to body — context menus appear at cursor position
      // and must escape any overflow:hidden ancestor. Use `container` to override.
      const portalProps = props.container != null ? { to: props.container } : {};
      return h(DialogPortal, portalProps, () => [overlay, h("div", positionerProps, [inner])]);
    };
  },
});

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

const ContextMenuItemComp = defineComponent({
  name: "ForgeContextMenuItem",
  props: {
    value: { type: String, required: true },
    label: { type: String, default: undefined },
    textValue: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    asChild: { type: Boolean, default: false },
    closeOnSelect: { type: Boolean, default: true },
    navigate: { type: Function as PropType<() => void>, default: undefined },
  },
  emits: {
    select: (_value: string) => true,
  },
  setup(props, { slots, attrs, emit }) {
    const api = useCtx();

    onMounted(() => api.registerItem({ value: props.value, label: props.label ?? props.value, ...(props.textValue !== undefined && { textValue: props.textValue }), disabled: props.disabled }));
    onScopeDispose(() => api.unregisterItem(props.value));

    return () => {
      const { onMousemove: _mm, onMouseleave: _ml, onClick: baseClick, ...itemRest } = api.getItemProps(props.value, props.disabled) as ReturnType<typeof api.getItemProps> & { onMousemove?: unknown; onMouseleave?: unknown };
      const itemProps = {
        ...itemRest,
        ...attrs,
        onClick() {
          if (!props.disabled) {
            emit("select", props.value);
            if (props.closeOnSelect) baseClick?.();
            props.navigate?.();
          }
        },
      };
      if (props.asChild) return h(Slot, itemProps, slots['default']);
      return h("div", itemProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

const ContextMenuLabel = defineComponent({
  name: "ForgeContextMenuLabel",
  setup(_props, { slots, attrs }) {
    const api = useCtx();
    return () => h("div", { ...api.getLabelProps(), ...attrs }, slots['default']?.());
  },
});

// ---------------------------------------------------------------------------
// Separator
// ---------------------------------------------------------------------------

const ContextMenuSeparator = defineComponent({
  name: "ForgeContextMenuSeparator",
  setup(_props, { attrs }) {
    const api = useCtx();
    return () => h("div", { ...api.getSeparatorProps(), ...attrs });
  },
});

// ---------------------------------------------------------------------------
// Group + GroupLabel
// ---------------------------------------------------------------------------

const ContextMenuGroup = defineComponent({
  name: "ForgeContextMenuGroup",
  props: { id: { type: String, required: true } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => h("div", { ...api.getGroupProps(props.id), ...attrs }, slots['default']?.());
  },
});

const ContextMenuGroupLabel = defineComponent({
  name: "ForgeContextMenuGroupLabel",
  props: { groupId: { type: String, required: true } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => h("div", { ...api.getGroupLabelProps(props.groupId), ...attrs }, slots['default']?.());
  },
});

// ---------------------------------------------------------------------------
// RadioGroup
// ---------------------------------------------------------------------------

const ContextMenuRadioGroup = defineComponent({
  name: "ForgeContextMenuRadioGroup",
  props: {
    groupId: { type: String, required: true },
    value: { type: String, required: true },
  },
  emits: {
    "update:value": (_v: string) => true,
  },
  setup(props, { slots, attrs, emit }) {
    const api = useCtx();
    const valueRef = ref(props.value);
    watch(() => props.value, (v) => { valueRef.value = v; });

    provide(contextMenuRadioGroupKey, {
      groupId: props.groupId,
      value: valueRef,
      onValueChange: (v: string) => {
        valueRef.value = v;
        emit("update:value", v);
      },
    });

    return () => h("div", { ...api.getRadioGroupProps(props.groupId), ...attrs }, slots['default']?.());
  },
});

const ContextMenuRadioGroupLabel = defineComponent({
  name: "ForgeContextMenuRadioGroupLabel",
  props: { groupId: { type: String, required: true } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => h("div", { ...api.getRadioGroupLabelProps(props.groupId), ...attrs }, slots['default']?.());
  },
});

// ---------------------------------------------------------------------------
// RadioItem
// ---------------------------------------------------------------------------

const ContextMenuRadioItem = defineComponent({
  name: "ForgeContextMenuRadioItem",
  props: {
    value: { type: String, required: true },
    label: { type: String, default: undefined },
    textValue: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    asChild: { type: Boolean, default: false },
    closeOnSelect: { type: Boolean, default: true },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    const radioCtx = inject(contextMenuRadioGroupKey);
    if (!radioCtx) throw new Error("ContextMenu.RadioItem must be inside <ContextMenu.RadioGroup>");

    onMounted(() => api.registerItem({ value: props.value, label: props.label ?? props.value, ...(props.textValue !== undefined && { textValue: props.textValue }), disabled: props.disabled }));
    onScopeDispose(() => api.unregisterItem(props.value));

    const isChecked = ref(radioCtx.value.value === props.value);
    watch(radioCtx.value, (v) => { isChecked.value = v === props.value; });

    provide(contextMenuItemCheckedKey, isChecked as Ref<boolean | "indeterminate">);

    return () => {
      const { onMousemove: _mm, onMouseleave: _ml, onClick: baseClick, ...itemRest } = api.getRadioItemProps({
        value: props.value,
        checked: isChecked.value,
        disabled: props.disabled,
        closeOnSelect: props.closeOnSelect,
      }) as ReturnType<typeof api.getRadioItemProps> & { onMousemove?: unknown; onMouseleave?: unknown };

      const itemProps = {
        ...itemRest,
        ...attrs,
        onClick() {
          if (!props.disabled) {
            radioCtx.onValueChange(props.value);
            if (props.closeOnSelect) baseClick?.();
          }
        },
      };
      if (props.asChild) return h(Slot, itemProps, slots['default']);
      return h("div", itemProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// CheckboxItem
// ---------------------------------------------------------------------------

const ContextMenuCheckboxItem = defineComponent({
  name: "ForgeContextMenuCheckboxItem",
  props: {
    value: { type: String, required: true },
    label: { type: String, default: undefined },
    textValue: { type: String, default: undefined },
    checked: { type: [Boolean, String] as PropType<boolean | "indeterminate">, required: true },
    disabled: { type: Boolean, default: false },
    asChild: { type: Boolean, default: false },
    closeOnSelect: { type: Boolean, default: false },
  },
  emits: {
    "update:checked": (_v: boolean) => true,
  },
  setup(props, { slots, attrs, emit }) {
    const api = useCtx();

    onMounted(() => api.registerItem({ value: props.value, label: props.label ?? props.value, ...(props.textValue !== undefined && { textValue: props.textValue }), disabled: props.disabled }));
    onScopeDispose(() => api.unregisterItem(props.value));

    const checkedRef = ref(props.checked);
    watch(() => props.checked, (v) => { checkedRef.value = v; });
    provide(contextMenuItemCheckedKey, checkedRef as Ref<boolean | "indeterminate">);

    return () => {
      const { onMousemove: _mm, onMouseleave: _ml, onClick: baseClick, ...itemRest } = api.getCheckboxItemProps({
        value: props.value,
        checked: checkedRef.value,
        disabled: props.disabled,
        closeOnSelect: props.closeOnSelect,
      }) as ReturnType<typeof api.getCheckboxItemProps> & { onMousemove?: unknown; onMouseleave?: unknown };

      const itemProps = {
        ...itemRest,
        ...attrs,
        onClick() {
          if (!props.disabled) {
            const next = checkedRef.value === "indeterminate" ? true : !checkedRef.value;
            emit("update:checked", next as boolean);
            if (props.closeOnSelect) baseClick?.();
          }
        },
      };
      if (props.asChild) return h(Slot, itemProps, slots['default']);
      return h("div", itemProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// ItemIndicator
// ---------------------------------------------------------------------------

const ContextMenuItemIndicator = defineComponent({
  name: "ForgeContextMenuItemIndicator",
  props: {
    forceMount: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const api = useCtx();
    const checkedCtx = inject(contextMenuItemCheckedKey);

    return () => {
      const isChecked = checkedCtx?.value ?? false;
      if (!props.forceMount && !isChecked) return null;
      return h("span", api.getItemIndicatorProps(isChecked), slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Sub
// ---------------------------------------------------------------------------

type ContextMenuSubApi = ContextMenuApi;
const contextMenuSubKey: InjectionKey<{
  childApi: ContextMenuSubApi;
  childPresence: { isPresent: Ref<boolean>; presenceRef: Ref<HTMLElement | null> };
  subMenuId: string;
  openDelay: number;
  closeDelay: number;
  parentTriggers: Map<string, () => void> | undefined;
}> = Symbol("forge-context-menu-sub");
const contextMenuSubTriggersKey: InjectionKey<Map<string, () => void>> = Symbol("forge-context-menu-sub-triggers");

const ContextMenuSub = defineComponent({
  name: "ForgeContextMenuSub",
  props: {
    openDelay: { type: Number, default: 200 },
    closeDelay: { type: Number, default: 300 },
    onSelect: { type: Function as PropType<(value: string) => void>, default: undefined },
  },
  setup(props, { slots }) {
    const parentTriggers = inject(contextMenuSubTriggersKey);
    const ownTriggers = new Map<string, () => void>();
    const childApi = useMenu({ isContextMenu: false, positioning: { placement: "right-start" }, ...(props.onSelect !== undefined && { onSelect: props.onSelect }) });
    const childPresence = usePresence(childApi.isOpen);
    provide(contextMenuSubKey, { childApi, childPresence, subMenuId: childApi.id, openDelay: props.openDelay, closeDelay: props.closeDelay, parentTriggers });
    provide(contextMenuSubTriggersKey, ownTriggers);
    return () => slots['default']?.();
  },
});

const ContextMenuSubTrigger = defineComponent({
  name: "ForgeContextMenuSubTrigger",
  props: {
    value: { type: String, required: true },
    label: { type: String, default: undefined },
    textValue: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    asChild: { type: Boolean, default: false },
    /** When false, the sub-menu only opens on click — hover has no effect. @default true */
    openOnHover: { type: Boolean, default: true },
  },
  setup(props, { slots, attrs }) {
    const parentApi = useCtx();
    const sub = inject(contextMenuSubKey);
    if (!sub) throw new Error("ContextMenu.SubTrigger must be inside <ContextMenu.Sub>");
    const { childApi, subMenuId, openDelay, closeDelay, parentTriggers } = sub;
    const openTimer = ref<ReturnType<typeof setTimeout> | undefined>(undefined);
    const closeTimer = ref<ReturnType<typeof setTimeout> | undefined>(undefined);

    function openSubmenu() {
      clearTimeout(closeTimer.value);
      childApi.setOpen(true);
      setTimeout(() => { childApi.focusContent(); childApi.send("FIRST_ITEM"); }, 10);
    }

    onMounted(() => parentTriggers?.set(props.value, openSubmenu));
    onScopeDispose(() => parentTriggers?.delete(props.value));
    onMounted(() => parentApi.registerItem({ value: props.value, label: props.label ?? props.value, ...(props.textValue !== undefined && { textValue: props.textValue }), disabled: props.disabled }));
    onScopeDispose(() => parentApi.unregisterItem(props.value));

    return () => {
      const { onMouseEnter: _pme, onMouseLeave: _pml, onMousemove: _mm, onMouseleave: _ml, ...baseTriggerProps } = parentApi.getSubTriggerProps(subMenuId, childApi.isOpen.value, props.disabled) as ReturnType<typeof parentApi.getSubTriggerProps> & { onMousemove?: unknown; onMouseleave?: unknown };
      const subTriggerProps = {
        ...baseTriggerProps, ...attrs,
        onMouseenter() {
          parentApi.send({ type: "HIGHLIGHT_ITEM", value: props.value });
          if (props.openOnHover) { clearTimeout(closeTimer.value); openTimer.value = setTimeout(() => childApi.setOpen(true), openDelay); }
        },
        onMouseleave() {
          if (props.openOnHover) { clearTimeout(openTimer.value); closeTimer.value = setTimeout(() => { if (childApi.isOpen.value) childApi.setOpen(false); }, closeDelay); }
        },
        onClick() { if (!props.disabled) { clearTimeout(openTimer.value); openSubmenu(); } },
      };
      if (props.asChild) return h(Slot, subTriggerProps, slots['default']);
      return h("div", subTriggerProps, slots['default']?.());
    };
  },
});

const ContextMenuSubContent = defineComponent({
  name: "ForgeContextMenuSubContent",
  props: {
    asChild: { type: Boolean, default: false },
    forceMount: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const parentApi = useCtx();
    const sub = inject(contextMenuSubKey);
    if (!sub) throw new Error("ContextMenu.SubContent must be inside <ContextMenu.Sub>");
    const { childApi, childPresence, closeDelay } = sub;
    const ownTriggers = inject(contextMenuSubTriggersKey);
    const ownPresence = usePresence(childApi.isOpen);
    const { isPresent, presenceRef } = childPresence ?? ownPresence;
    const subCloseTimer = ref<ReturnType<typeof setTimeout> | undefined>(undefined);

    watch(childApi.highlighted, () => {
      if (childApi.isOpen.value && childApi.highlighted.value !== null && childApi.highlightSource.value === "keyboard") {
        nextTick(() => childApi.focusHighlightedItem());
      }
    });

    return () => {
      if (!props.forceMount && !isPresent.value) return null;
      const { ref: _ref, onKeydown: baseKeydown, onKeyDown: _kD, ...contentRest } = childApi.getContentProps() as ReturnType<typeof childApi.getContentProps> & { onKeyDown?: unknown };
      const positionerProps = childApi.getPositionerProps();
      const closingAttrs = !childApi.isOpen.value ? { "aria-hidden": true, style: { pointerEvents: "none" as const } } : {};
      const contentProps = {
        ...contentRest, ...closingAttrs, ...attrs,
        ref: (el: unknown) => {
          presenceRef.value = el as HTMLElement | null;
          if (typeof _ref === "function") (_ref as (el: unknown) => void)(el);
        },
        onMouseenter() { clearTimeout(subCloseTimer.value); },
        onMouseleave() { subCloseTimer.value = setTimeout(() => childApi.setOpen(false), closeDelay); },
        onKeydown(e: KeyboardEvent) {
          const isRTL = getComputedStyle(e.currentTarget as HTMLElement).direction === "rtl";
          const closeKey = isRTL ? "ArrowRight" : "ArrowLeft";
          const openKey = isRTL ? "ArrowLeft" : "ArrowRight";
          if (e.key === closeKey) {
            e.preventDefault(); e.stopPropagation();
            childApi.send("CLOSE");
            setTimeout(() => parentApi.focusContent(), 0);
            return;
          }
          if (e.key === openKey && childApi.highlighted.value !== null) {
            const openNestedSub = ownTriggers?.get(childApi.highlighted.value);
            if (openNestedSub) { e.preventDefault(); e.stopPropagation(); openNestedSub(); return; }
          }
          (baseKeydown as unknown as (e: KeyboardEvent) => void)(e);
        },
      };
      const inner = props.asChild ? h(Slot, contentProps, slots['default']) : h("div", contentProps, slots['default']?.());
      return h(DialogPortal, {}, () => h("div", positionerProps, [inner]));
    };
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const ContextMenu = {
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  Portal: ContextMenuPortal,
  Content: ContextMenuContent,
  Item: ContextMenuItemComp,
  Label: ContextMenuLabel,
  Separator: ContextMenuSeparator,
  Group: ContextMenuGroup,
  GroupLabel: ContextMenuGroupLabel,
  RadioGroup: ContextMenuRadioGroup,
  RadioGroupLabel: ContextMenuRadioGroupLabel,
  RadioItem: ContextMenuRadioItem,
  CheckboxItem: ContextMenuCheckboxItem,
  ItemIndicator: ContextMenuItemIndicator,
  Sub: ContextMenuSub,
  SubTrigger: ContextMenuSubTrigger,
  SubContent: ContextMenuSubContent,
} as const;

export {
  ContextMenuRoot,
  ContextMenuTrigger,
  ContextMenuPortal,
  ContextMenuContent,
  ContextMenuItemComp as ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioGroupLabel,
  ContextMenuRadioItem,
  ContextMenuCheckboxItem,
  ContextMenuItemIndicator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
};
