import { cloneVNode, defineComponent, mergeProps } from "vue";

export const Slot = defineComponent({
  name: "ForgeSlot",
  inheritAttrs: false,
  setup(_props, { slots, attrs }) {
    return () => {
      const children = slots['default']?.();
      if (!children || children.length === 0) return null;
      const child = children[0];
      if (!child) return null;
      // mergeProps handles: event composition, class concatenation, style merge
      return cloneVNode(child, mergeProps(child.props ?? {}, attrs));
    };
  },
});
