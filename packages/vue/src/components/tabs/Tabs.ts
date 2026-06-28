import type { InjectionKey, PropType } from "vue";
import { defineComponent, h, inject, provide, watch } from "vue";
import { Slot } from "../shared/Slot.js";
import type { UseTabsReturn } from "./use-tabs.js";
import { useTabs } from "./use-tabs.js";

const tabsKey: InjectionKey<UseTabsReturn> = Symbol("forge-tabs");

function useCtx(): UseTabsReturn {
  const ctx = inject(tabsKey);
  if (!ctx) throw new Error("Tabs compound parts must be inside <Tabs.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const TabsRoot = defineComponent({
  name: "ForgeTabsRoot",
  props: {
    id: { type: String, default: undefined },
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    activationMode: { type: String as PropType<"automatic" | "manual">, default: undefined },
    disabled: { type: Boolean, default: undefined },
    orientation: { type: String as PropType<"horizontal" | "vertical">, default: undefined },
    onValueChange: { type: Function as PropType<(v: string) => void>, default: undefined },
    asChild: { type: Boolean, default: false },
  },
  emits: {
    "update:value": (_v: string) => true,
  },
  setup(props, { slots, attrs, emit }) {
    const api = useTabs({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.value !== undefined && { value: props.value }),
      ...(props.defaultValue !== undefined && { defaultValue: props.defaultValue }),
      ...(props.activationMode !== undefined && { activationMode: props.activationMode }),
      ...(props.disabled !== undefined && { disabled: props.disabled }),
      ...(props.orientation !== undefined && { orientation: props.orientation }),
      ...(props.onValueChange !== undefined && { onValueChange: props.onValueChange }),
    });
    watch(api.value, (v) => { if (v !== undefined) emit("update:value", v); });
    provide(tabsKey, api);
    return () => {
      const rootProps = { ...api.getRootProps(), ...attrs };
      if (props.asChild) return h(Slot, rootProps, slots['default']);
      return h("div", rootProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

const TabsList = defineComponent({
  name: "ForgeTabsList",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const listProps = { ...api.getListProps(), ...attrs };
      if (props.asChild) return h(Slot, listProps, slots['default']);
      return h("div", listProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

const TabsTrigger = defineComponent({
  name: "ForgeTabsTrigger",
  props: {
    value: { type: String, required: true },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      // Strip React-only onFocus (Vue uses onFocusin)
      const { onFocus: _f, onKeyDown: _kd, ...triggerProps } = api.getTriggerProps(props.value);
      const merged = { ...triggerProps, ...attrs };
      if (props.asChild) return h(Slot, merged, slots['default']);
      return h("button", merged, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

const TabsPanel = defineComponent({
  name: "ForgeTabsPanel",
  props: {
    value: { type: String, required: true },
    asChild: { type: Boolean, default: false },
    forceMount: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const isActive = api.value.value === props.value;
      if (!props.forceMount && !isActive) return null;
      const panelProps = { ...api.getPanelProps(props.value), ...attrs };
      if (props.asChild) return h(Slot, panelProps, slots['default']);
      return h("div", panelProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Panel: TabsPanel,
} as const;

export { TabsList, TabsPanel, TabsRoot, TabsTrigger };
