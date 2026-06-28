import type { PropType } from "vue";
import { defineComponent, h } from "vue";
import { Slot } from "../shared/Slot.js";
import type { UseToggleOptions } from "./use-toggle.js";
import { useToggle } from "./use-toggle.js";

// ---------------------------------------------------------------------------
// Standalone Toggle â€” no compound context needed (single element)
// ---------------------------------------------------------------------------

const ToggleRoot = defineComponent({
  name: "ForgeToggle",
  props: {
    pressed: { type: Boolean as PropType<boolean>, default: undefined },
    defaultPressed: { type: Boolean as PropType<boolean>, default: undefined },
    disabled: { type: Boolean, default: undefined },
    value: { type: String, default: undefined },
    id: { type: String, default: undefined },
    asChild: { type: Boolean, default: false },
    onPressedChange: {
      type: Function as PropType<(pressed: boolean) => void>,
      default: undefined,
    },
  },
  emits: {
    "update:pressed": (_v: boolean) => true,
  },
  setup(props, { slots, attrs, emit }) {
    const api = useToggle({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.pressed !== undefined && { pressed: props.pressed }),
      ...(props.defaultPressed !== undefined && { defaultPressed: props.defaultPressed }),
      ...(props.disabled !== undefined && { disabled: props.disabled }),
      ...(props.value !== undefined && { value: props.value }),
      onPressedChange: (p) => {
        emit("update:pressed", p);
        props.onPressedChange?.(p);
      },
    } as UseToggleOptions);

    return () => {
      const toggleProps = { ...api.getRootProps(), ...attrs };
      if (props.asChild) return h(Slot, toggleProps, slots["default"]);
      return h("button", toggleProps, slots["default"]?.());
    };
  },
});

export const Toggle = { Root: ToggleRoot } as const;
export { ToggleRoot };
