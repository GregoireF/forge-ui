import type { InjectionKey, PropType } from "vue";
import { defineComponent, h, inject, provide } from "vue";
import { Slot } from "../shared/Slot.js";
import type { UseToggleGroupReturn } from "./use-toggle-group.js";
import { useToggleGroup } from "./use-toggle-group.js";

const toggleGroupKey: InjectionKey<UseToggleGroupReturn> = Symbol("forge-toggle-group");

function useCtx(): UseToggleGroupReturn {
  const ctx = inject(toggleGroupKey);
  if (!ctx) throw new Error("ToggleGroup.Item must be inside <ToggleGroup.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root â€” role="toolbar"
// ---------------------------------------------------------------------------

const ToggleGroupRoot = defineComponent({
  name: "ForgeToggleGroupRoot",
  props: {
    type: { type: String as PropType<"single" | "multiple">, default: "multiple" },
    value: { type: Array as PropType<string[]>, default: undefined },
    defaultValue: { type: Array as PropType<string[]>, default: undefined },
    disabled: { type: Boolean, default: undefined },
    orientation: {
      type: String as PropType<"horizontal" | "vertical">,
      default: "horizontal",
    },
    rovingFocus: { type: Boolean, default: true },
    loop: { type: Boolean, default: true },
    id: { type: String, default: undefined },
    onValueChange: {
      type: Function as PropType<(value: string[]) => void>,
      default: undefined,
    },
  },
  emits: {
    "update:value": (_v: string[]) => true,
  },
  setup(props, { slots, attrs, emit }) {
    const api = useToggleGroup({
      ...(props.id !== undefined && { id: props.id }),
      type: props.type,
      ...(props.value !== undefined && { value: props.value }),
      ...(props.defaultValue !== undefined && { defaultValue: props.defaultValue }),
      ...(props.disabled !== undefined && { disabled: props.disabled }),
      orientation: props.orientation,
      rovingFocus: props.rovingFocus,
      loop: props.loop,
      onValueChange: (v) => {
        emit("update:value", v);
        props.onValueChange?.(v);
      },
    });

    provide(toggleGroupKey, api);

    return () => h("div", { ...api.getRootProps(), ...attrs }, slots['default']?.());
  },
});

// ---------------------------------------------------------------------------
// Item â€” role="button" aria-pressed, roving tabindex
// ---------------------------------------------------------------------------

const ToggleGroupItem = defineComponent({
  name: "ForgeToggleGroupItem",
  props: {
    value: { type: String, required: true },
    disabled: { type: Boolean, default: undefined },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const itemProps = { ...api.getItemProps(props.value, props.disabled), ...attrs };
      if (props.asChild) return h(Slot, itemProps, slots['default']);
      return h("button", itemProps, slots['default']?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const ToggleGroup = { Root: ToggleGroupRoot, Item: ToggleGroupItem } as const;
export { ToggleGroupRoot, ToggleGroupItem };
