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

type MenuApi = UseMenuReturn;
type MenuPresenceCtxType = { isPresent: Ref<boolean>; presenceRef: Ref<HTMLElement | null> };

const menuKey: InjectionKey<MenuApi> = Symbol("forge-menu");
const menuPresenceKey: InjectionKey<MenuPresenceCtxType> = Symbol("forge-menu-presence");
/** Map of sub-trigger value → open callback, for ArrowRight coordination. */
const menuSubTriggersKey: InjectionKey<Map<string, () => void>> = Symbol("forge-menu-sub-triggers");
/** Child menu API — provided by MenuSub, consumed by MenuSubTrigger / MenuSubContent.
 *  parentTriggers: the triggers map of the GRANDPARENT level (Root or outer Sub).
 *  SubTrigger registers into parentTriggers; SubContent reads from menuSubTriggersKey (ownTriggers). */
const menuSubKey: InjectionKey<{
  childApi: MenuApi;
  childPresence: MenuPresenceCtxType;
  subMenuId: string;
  openDelay: number;
  closeDelay: number;
  parentTriggers: Map<string, () => void> | undefined;
}> = Symbol("forge-menu-sub");
/** RadioGroup context — value + onValueChange for RadioItem children. */
const menuRadioGroupKey: InjectionKey<{
  groupId: string;
  value: Ref<string>;
  onValueChange: (v: string) => void;
}> = Symbol("forge-menu-radio-group");
/** Checked state for ItemIndicator. */
const menuItemCheckedKey: InjectionKey<Ref<boolean | "indeterminate">> =
  Symbol("forge-menu-item-checked");

function useCtx(): MenuApi {
  const ctx = inject(menuKey);
  if (!ctx) throw new Error("Menu compound parts must be inside <Menu.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const MenuRoot = defineComponent({
  name: "ForgeMenuRoot",
  props: {
    id: { type: String, default: undefined },
    defaultOpen: { type: Boolean, default: undefined },
    open: { type: Boolean, default: undefined },
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
      isContextMenu: false,
      ...(props.id !== undefined && { id: props.id }),
      ...(props.defaultOpen !== undefined && { defaultOpen: props.defaultOpen }),
      ...(props.open !== undefined && { open: props.open }),
      ...(props.loop !== undefined && { loop: props.loop }),
      ...(props.positioning !== undefined && { positioning: props.positioning }),
      onOpenChange: (open: boolean) => {
        emit("update:open", open);
        props.onOpenChange?.(open);
      },
      ...(props.onSelect !== undefined && { onSelect: props.onSelect }),
      ...(props.onHighlightChange !== undefined && { onHighlightChange: props.onHighlightChange }),
      ...(props.onInteractOutside !== undefined && { onInteractOutside: props.onInteractOutside }),
      ...(props.onPointerDownOutside !== undefined && {
        onPointerDownOutside: props.onPointerDownOutside,
      }),
      ...(props.onFocusOutside !== undefined && { onFocusOutside: props.onFocusOutside }),
      ...(props.onEscapeKeyDown !== undefined && { onEscapeKeyDown: props.onEscapeKeyDown }),
    });

    // Controlled open sync: props.open changes after mount must be mirrored to the machine.
    // The machine reads `open` only at creation; this watch keeps it in sync.
    watch(
      () => props.open,
      (v) => {
        if (v !== undefined) api.send(v ? "OPEN" : "CLOSE");
      },
      { immediate: false },
    );

    provide(menuKey, api);

    const presence = usePresence(api.isOpen);
    provide(menuPresenceKey, presence);

    const subTriggers = new Map<string, () => void>();
    provide(menuSubTriggersKey, subTriggers);

    return () => slots["default"]?.();
  },
});

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

const MenuTrigger = defineComponent({
  name: "ForgeMenuTrigger",
  props: {
    asChild: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const {
        onKeydown: _kd,
        ref: _ref,
        ...rest
      } = api.getTriggerProps({ disabled: props.disabled });
      const triggerProps = { ...rest, ...attrs };
      if (props.asChild) return h(Slot, triggerProps, slots["default"]);
      return h("button", triggerProps, slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

const MenuPortal = defineComponent({
  name: "ForgeMenuPortal",
  props: {
    forceMount: { type: Boolean, default: false },
    container: { type: Object as PropType<HTMLElement | null>, default: null },
  },
  setup(props, { slots }) {
    const api = useCtx();
    const presence = inject(menuPresenceKey);
    return () => {
      const isPresent = presence?.isPresent.value ?? api.isOpen.value;
      if (!props.forceMount && !isPresent) return null;
      return h(DialogPortal, {}, slots["default"]);
    };
  },
});

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const MenuContent = defineComponent({
  name: "ForgeMenuContent",
  props: {
    asChild: { type: Boolean, default: false },
    forceMount: { type: Boolean, default: false },
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
    const subTriggers = inject(menuSubTriggersKey);
    const injectedPresence = inject(menuPresenceKey);
    const ownPresence = usePresence(api.isOpen);
    const { isPresent, presenceRef } = injectedPresence ?? ownPresence;

    let prevOpen = api.isOpen.value;
    watch(api.isOpen, (open) => {
      if (open && !prevOpen) {
        // FIRST_ITEM: items are registered via onMounted which runs before this watch fires.
        if (api.highlighted.value === null) api.send("FIRST_ITEM");
        const openEvent = new Event("openfocus", { bubbles: false, cancelable: true });
        props.onOpenAutoFocus?.(openEvent);
        if (!openEvent.defaultPrevented) api.focusContent();
      }
      if (!open && prevOpen) {
        const closeEvent = new Event("closefocus", { bubbles: false, cancelable: true });
        props.onCloseAutoFocus?.(closeEvent);
        if (!closeEvent.defaultPrevented) api.focusTrigger();
      }
      prevOpen = open;
    });

    // ARIA roving tabindex: keyboard highlight moves real focus to the item.
    watch(api.highlighted, () => {
      if (
        api.isOpen.value &&
        api.highlighted.value !== null &&
        api.highlightSource.value === "keyboard"
      ) {
        nextTick(() => api.focusHighlightedItem());
      }
    });

    return () => {
      if (!props.forceMount && !isPresent.value) return null;

      const {
        ref: _ref,
        onKeydown: baseKeydown,
        onKeyDown: _kD,
        ...contentRest
      } = api.getContentProps() as ReturnType<typeof api.getContentProps> & { onKeyDown?: unknown };
      const positionerProps = api.getPositionerProps();

      const closingAttrs = !api.isOpen.value
        ? { "aria-hidden": true, style: { pointerEvents: "none" as const } }
        : {};

      const contentProps = {
        ...contentRest,
        ...closingAttrs,
        ...attrs,
        ref: (el: unknown) => {
          const htmlEl = el as HTMLElement | null;
          presenceRef.value = htmlEl;
          if (typeof _ref === "function") (_ref as (el: unknown) => void)(el);
        },
        onKeydown(e: KeyboardEvent) {
          if (e.key === "Escape" && props.onEscapeKeyDown) {
            props.onEscapeKeyDown(e);
            if (e.defaultPrevented) return;
          }
          const isRTL = getComputedStyle(e.currentTarget as HTMLElement).direction === "rtl";
          const openSubKey = isRTL ? "ArrowLeft" : "ArrowRight";
          if (e.key === openSubKey && api.highlighted.value !== null) {
            const openSub = subTriggers?.get(api.highlighted.value);
            if (openSub) {
              e.preventDefault();
              e.stopPropagation();
              openSub();
              return;
            }
          }
          (baseKeydown as unknown as (e: KeyboardEvent) => void)(e);
        },
      };

      const inner = props.asChild
        ? h(Slot, contentProps, slots["default"])
        : h("div", contentProps, slots["default"]?.());

      // Modal overlay: renders behind the positioner (z-index 49 vs 50).
      // Click on overlay → watchOutside → INTERACT_OUTSIDE → close.
      const overlay =
        api.modal.value && api.isOpen.value
          ? h("div", {
              "data-forge-part": "modal-overlay",
              "aria-hidden": "true",
              style: { position: "fixed", inset: 0, zIndex: 49 },
            })
          : null;

      return [overlay, h("div", positionerProps, [inner])];
    };
  },
});

// ---------------------------------------------------------------------------
// Arrow
// ---------------------------------------------------------------------------

const MenuArrow = defineComponent({
  name: "ForgeMenuArrow",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const { ref: _ref, ...arrowRest } = api.getArrowProps() as ReturnType<
        typeof api.getArrowProps
      > & { ref?: unknown };
      const arrowProps = {
        ...arrowRest,
        ...attrs,
        ref: (el: unknown) => {
          if (typeof _ref === "function") (_ref as (el: unknown) => void)(el);
        },
      };
      if (props.asChild) return h(Slot, arrowProps, slots["default"]);
      return h("span", arrowProps, [
        h(
          "svg",
          {
            ...api.getArrowTipProps(),
            width: 10,
            height: 5,
            viewBox: "0 0 10 5",
            "aria-hidden": "true",
            style: "display:block",
          },
          [h("path", { d: "M0 0L5 5L10 0", fill: "currentColor" })],
        ),
      ]);
    };
  },
});

// ---------------------------------------------------------------------------
// Anchor
// ---------------------------------------------------------------------------

const MenuAnchor = defineComponent({
  name: "ForgeMenuAnchor",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const { ref: _ref, ...anchorRest } = api.getAnchorProps() as ReturnType<
        typeof api.getAnchorProps
      > & { ref?: unknown };
      const anchorProps = {
        ...anchorRest,
        ...attrs,
        ref: (el: unknown) => {
          if (typeof _ref === "function") (_ref as (el: unknown) => void)(el);
        },
      };
      if (props.asChild) return h(Slot, anchorProps, slots["default"]);
      return h("span", anchorProps, slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

const MenuItemComp = defineComponent({
  name: "ForgeMenuItem",
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

    onMounted(() =>
      api.registerItem({
        value: props.value,
        label: props.label ?? props.value,
        ...(props.textValue !== undefined && { textValue: props.textValue }),
        disabled: props.disabled,
      }),
    );
    onScopeDispose(() => api.unregisterItem(props.value));

    return () => {
      const {
        onMousemove: _mm,
        onMouseleave: _ml,
        onClick: baseClick,
        ...itemRest
      } = api.getItemProps(props.value, props.disabled) as ReturnType<typeof api.getItemProps> & {
        onMousemove?: unknown;
        onMouseleave?: unknown;
      };
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
      if (props.asChild) return h(Slot, itemProps, slots["default"]);
      return h("div", itemProps, slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

const MenuLabel = defineComponent({
  name: "ForgeMenuLabel",
  setup(_props, { slots, attrs }) {
    const api = useCtx();
    return () => h("div", { ...api.getLabelProps(), ...attrs }, slots["default"]?.());
  },
});

// ---------------------------------------------------------------------------
// Separator
// ---------------------------------------------------------------------------

const MenuSeparator = defineComponent({
  name: "ForgeMenuSeparator",
  setup(_props, { attrs }) {
    const api = useCtx();
    return () => h("div", { ...api.getSeparatorProps(), ...attrs });
  },
});

// ---------------------------------------------------------------------------
// Group + GroupLabel
// ---------------------------------------------------------------------------

const MenuGroup = defineComponent({
  name: "ForgeMenuGroup",
  props: { id: { type: String, required: true } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => h("div", { ...api.getGroupProps(props.id), ...attrs }, slots["default"]?.());
  },
});

const MenuGroupLabel = defineComponent({
  name: "ForgeMenuGroupLabel",
  props: { groupId: { type: String, required: true } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () =>
      h("div", { ...api.getGroupLabelProps(props.groupId), ...attrs }, slots["default"]?.());
  },
});

// ---------------------------------------------------------------------------
// RadioGroup
// ---------------------------------------------------------------------------

const MenuRadioGroup = defineComponent({
  name: "ForgeMenuRadioGroup",
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
    watch(
      () => props.value,
      (v) => {
        valueRef.value = v;
      },
    );

    provide(menuRadioGroupKey, {
      groupId: props.groupId,
      value: valueRef,
      onValueChange: (v: string) => {
        valueRef.value = v;
        emit("update:value", v);
      },
    });

    return () =>
      h("div", { ...api.getRadioGroupProps(props.groupId), ...attrs }, slots["default"]?.());
  },
});

const MenuRadioGroupLabel = defineComponent({
  name: "ForgeMenuRadioGroupLabel",
  props: { groupId: { type: String, required: true } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () =>
      h("div", { ...api.getRadioGroupLabelProps(props.groupId), ...attrs }, slots["default"]?.());
  },
});

// ---------------------------------------------------------------------------
// RadioItem
// ---------------------------------------------------------------------------

const MenuRadioItem = defineComponent({
  name: "ForgeMenuRadioItem",
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
    const radioCtx = inject(menuRadioGroupKey);
    if (!radioCtx) throw new Error("Menu.RadioItem must be inside <Menu.RadioGroup>");

    onMounted(() =>
      api.registerItem({
        value: props.value,
        label: props.label ?? props.value,
        ...(props.textValue !== undefined && { textValue: props.textValue }),
        disabled: props.disabled,
      }),
    );
    onScopeDispose(() => api.unregisterItem(props.value));

    const isChecked = ref(radioCtx.value.value === props.value);
    watch(radioCtx.value, (v) => {
      isChecked.value = v === props.value;
    });

    provide(menuItemCheckedKey, isChecked as Ref<boolean | "indeterminate">);

    return () => {
      const {
        onMousemove: _mm,
        onMouseleave: _ml,
        onClick: baseClick,
        ...itemRest
      } = api.getRadioItemProps({
        value: props.value,
        checked: isChecked.value,
        disabled: props.disabled,
        closeOnSelect: props.closeOnSelect,
      }) as ReturnType<typeof api.getRadioItemProps> & {
        onMousemove?: unknown;
        onMouseleave?: unknown;
      };

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
      if (props.asChild) return h(Slot, itemProps, slots["default"]);
      return h("div", itemProps, slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// CheckboxItem
// ---------------------------------------------------------------------------

const MenuCheckboxItem = defineComponent({
  name: "ForgeMenuCheckboxItem",
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

    onMounted(() =>
      api.registerItem({
        value: props.value,
        label: props.label ?? props.value,
        ...(props.textValue !== undefined && { textValue: props.textValue }),
        disabled: props.disabled,
      }),
    );
    onScopeDispose(() => api.unregisterItem(props.value));

    const checkedRef = ref(props.checked);
    watch(
      () => props.checked,
      (v) => {
        checkedRef.value = v;
      },
    );
    provide(menuItemCheckedKey, checkedRef as Ref<boolean | "indeterminate">);

    return () => {
      const {
        onMousemove: _mm,
        onMouseleave: _ml,
        onClick: baseClick,
        ...itemRest
      } = api.getCheckboxItemProps({
        value: props.value,
        checked: checkedRef.value,
        disabled: props.disabled,
        closeOnSelect: props.closeOnSelect,
      }) as ReturnType<typeof api.getCheckboxItemProps> & {
        onMousemove?: unknown;
        onMouseleave?: unknown;
      };

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
      if (props.asChild) return h(Slot, itemProps, slots["default"]);
      return h("div", itemProps, slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// ItemIndicator
// ---------------------------------------------------------------------------

const MenuItemIndicator = defineComponent({
  name: "ForgeMenuItemIndicator",
  props: {
    forceMount: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const api = useCtx();
    const checkedCtx = inject(menuItemCheckedKey);

    return () => {
      const isChecked = checkedCtx?.value ?? false;
      if (!props.forceMount && !isChecked) return null;
      return h("span", api.getItemIndicatorProps(isChecked), slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Sub
// ---------------------------------------------------------------------------

const MenuSub = defineComponent({
  name: "ForgeMenuSub",
  props: {
    openDelay: { type: Number, default: 200 },
    closeDelay: { type: Number, default: 300 },
    onSelect: { type: Function as PropType<(value: string) => void>, default: undefined },
  },
  setup(props, { slots }) {
    // Capture the PARENT's triggers map before we override the injection.
    const parentTriggers = inject(menuSubTriggersKey);
    // Create our own map for children's sub-triggers (isolates this nesting level).
    const ownTriggers = new Map<string, () => void>();

    const childApi = useMenu({
      isContextMenu: false,
      positioning: { placement: "right-start" },
      ...(props.onSelect !== undefined && { onSelect: props.onSelect }),
    });
    const childPresence = usePresence(childApi.isOpen);

    provide(menuSubKey, {
      childApi,
      childPresence,
      subMenuId: childApi.id,
      openDelay: props.openDelay,
      closeDelay: props.closeDelay,
      parentTriggers,
    });
    // Override so SubContent and deeper SubTriggers see our own map.
    provide(menuSubTriggersKey, ownTriggers);

    return () => slots["default"]?.();
  },
});

// ---------------------------------------------------------------------------
// SubTrigger
// ---------------------------------------------------------------------------

const MenuSubTrigger = defineComponent({
  name: "ForgeMenuSubTrigger",
  props: {
    value: { type: String, required: true },
    label: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    /** When false, the sub-menu only opens on click — hover has no effect. @default true */
    openOnHover: { type: Boolean, default: true },
  },
  setup(props, { slots, attrs }) {
    const parentApi = useCtx();
    const sub = inject(menuSubKey);
    if (!sub) throw new Error("Menu.SubTrigger must be inside <Menu.Sub>");

    // Use parentTriggers (captured by MenuSub before overriding the injection).
    // This ensures SubTrigger registers in the OUTER level's map, not its own Sub's map.
    const { childApi, subMenuId, openDelay, closeDelay, parentTriggers } = sub;
    const openTimer = ref<ReturnType<typeof setTimeout> | undefined>(undefined);
    const closeTimer = ref<ReturnType<typeof setTimeout> | undefined>(undefined);

    function openSubmenu() {
      clearTimeout(closeTimer.value);
      childApi.setOpen(true);
      setTimeout(() => {
        childApi.focusContent();
        childApi.send("FIRST_ITEM");
      }, 10);
    }

    onMounted(() => parentTriggers?.set(props.value, openSubmenu));
    onScopeDispose(() => parentTriggers?.delete(props.value));

    onMounted(() => {
      const label = props.label ?? props.value;
      parentApi.registerItem({ value: props.value, label, disabled: props.disabled });
    });
    onScopeDispose(() => parentApi.unregisterItem(props.value));

    return () => {
      const {
        onMouseEnter: _pme,
        onMouseLeave: _pml,
        onMousemove: _mm,
        onMouseleave: _ml,
        ...baseTriggerProps
      } = parentApi.getSubTriggerProps(
        subMenuId,
        childApi.isOpen.value,
        props.disabled,
      ) as ReturnType<typeof parentApi.getSubTriggerProps> & {
        onMousemove?: unknown;
        onMouseleave?: unknown;
      };

      const subTriggerProps = {
        ...baseTriggerProps,
        ...attrs,
        onMouseenter() {
          parentApi.send({ type: "HIGHLIGHT_ITEM", value: props.value });
          if (props.openOnHover) {
            clearTimeout(closeTimer.value);
            openTimer.value = setTimeout(() => childApi.setOpen(true), openDelay);
          }
        },
        onMouseleave() {
          if (props.openOnHover) {
            clearTimeout(openTimer.value);
            closeTimer.value = setTimeout(() => {
              if (childApi.isOpen.value) childApi.setOpen(false);
            }, closeDelay);
          }
        },
        onClick() {
          if (!props.disabled) {
            clearTimeout(openTimer.value);
            clearTimeout(closeTimer.value);
            childApi.send("TOGGLE");
            if (!childApi.isOpen.value) {
              setTimeout(() => {
                childApi.focusContent();
                childApi.send("FIRST_ITEM");
              }, 10);
            }
          }
        },
      };

      return h("div", subTriggerProps, slots["default"]?.());
    };
  },
});

// ---------------------------------------------------------------------------
// SubContent
// ---------------------------------------------------------------------------

const MenuSubContent = defineComponent({
  name: "ForgeMenuSubContent",
  props: {
    asChild: { type: Boolean, default: false },
    forceMount: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const parentApi = useCtx();
    const sub = inject(menuSubKey);
    if (!sub) throw new Error("Menu.SubContent must be inside <Menu.Sub>");

    const { childApi, childPresence, closeDelay } = sub;
    // ownTriggers: the map provided by OUR MenuSub (overrode menuSubTriggersKey).
    // Used to open deeper nested sub-menus via ArrowRight.
    const ownTriggers = inject(menuSubTriggersKey);
    const ownPresence = usePresence(childApi.isOpen);

    // ARIA roving tabindex: keyboard highlight moves real focus to the sub-menu item.
    watch(childApi.highlighted, () => {
      if (
        childApi.isOpen.value &&
        childApi.highlighted.value !== null &&
        childApi.highlightSource.value === "keyboard"
      ) {
        nextTick(() => childApi.focusHighlightedItem());
      }
    });
    const { isPresent, presenceRef } = childPresence ?? ownPresence;
    const subCloseTimer = ref<ReturnType<typeof setTimeout> | undefined>(undefined);

    return () => {
      if (!props.forceMount && !isPresent.value) return null;

      const {
        ref: _ref,
        onKeydown: baseKeydown,
        onKeyDown: _kD,
        ...contentRest
      } = childApi.getContentProps() as ReturnType<typeof childApi.getContentProps> & {
        onKeyDown?: unknown;
      };
      const positionerProps = childApi.getPositionerProps();

      const closingAttrs = !childApi.isOpen.value
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
        onMouseenter() {
          clearTimeout(subCloseTimer.value);
        },
        onMouseleave() {
          subCloseTimer.value = setTimeout(() => childApi.setOpen(false), closeDelay);
        },
        onKeydown(e: KeyboardEvent) {
          const isRTL = getComputedStyle(e.currentTarget as HTMLElement).direction === "rtl";
          const closeKey = isRTL ? "ArrowRight" : "ArrowLeft";
          const openKey = isRTL ? "ArrowLeft" : "ArrowRight";

          if (e.key === closeKey) {
            e.preventDefault();
            e.stopPropagation();
            childApi.send("CLOSE");
            setTimeout(() => parentApi.focusContent(), 0);
            return;
          }
          // N-level nesting: open a deeper nested sub via keyboard.
          if (e.key === openKey && childApi.highlighted.value !== null) {
            const openNestedSub = ownTriggers?.get(childApi.highlighted.value);
            if (openNestedSub) {
              e.preventDefault();
              e.stopPropagation();
              openNestedSub();
              return;
            }
          }
          (baseKeydown as unknown as (e: KeyboardEvent) => void)(e);
        },
      };

      const inner = props.asChild
        ? h(Slot, contentProps, slots["default"])
        : h("div", contentProps, slots["default"]?.());

      return h(DialogPortal, {}, () => h("div", positionerProps, [inner]));
    };
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Menu = {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Portal: MenuPortal,
  Content: MenuContent,
  Arrow: MenuArrow,
  Anchor: MenuAnchor,
  Item: MenuItemComp,
  Label: MenuLabel,
  Separator: MenuSeparator,
  Group: MenuGroup,
  GroupLabel: MenuGroupLabel,
  RadioGroup: MenuRadioGroup,
  RadioGroupLabel: MenuRadioGroupLabel,
  RadioItem: MenuRadioItem,
  CheckboxItem: MenuCheckboxItem,
  ItemIndicator: MenuItemIndicator,
  Sub: MenuSub,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
} as const;

export {
  MenuAnchor,
  MenuArrow,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItemComp as MenuItem,
  MenuItemIndicator,
  MenuLabel,
  MenuPortal,
  MenuRadioGroup,
  MenuRadioGroupLabel,
  MenuRadioItem,
  MenuRoot,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
};
