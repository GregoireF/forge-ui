import type { PropType } from "vue";
import { defineComponent, h } from "vue";
import type { SeparatorOptions } from "@forge-ui/separator";
import { connectSeparator } from "@forge-ui/separator";

const SeparatorRoot = defineComponent({
  name: "ForgeSeparator",
  props: {
    orientation: {
      type: String as PropType<"horizontal" | "vertical">,
      default: "horizontal",
    },
    decorative: { type: Boolean, default: false },
  },
  setup(props, { attrs }) {
    return () => {
      const api = connectSeparator({
        orientation: props.orientation,
        decorative: props.decorative,
      } as SeparatorOptions);
      return h("div", { ...api.getSeparatorProps(), ...attrs });
    };
  },
});

export const Separator = { Root: SeparatorRoot } as const;
export { SeparatorRoot };
