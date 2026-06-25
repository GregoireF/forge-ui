import { defineComponent, h } from "vue";
import type { VisuallyHiddenOptions } from "@forge-ui/visually-hidden";
import { connectVisuallyHidden } from "@forge-ui/visually-hidden";

const VisuallyHiddenRoot = defineComponent({
  name: "ForgeVisuallyHidden",
  props: {
    focusable: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const api = connectVisuallyHidden({ focusable: props.focusable } as VisuallyHiddenOptions);
      return h("span", { ...api.getProps(), ...attrs }, slots.default?.());
    };
  },
});

export const VisuallyHidden = { Root: VisuallyHiddenRoot } as const;
export { VisuallyHiddenRoot };
