import type { HoverCardPositioning } from "@forge-ui/hover-card";
import type { ComponentPublicInstance, InjectionKey, PropType, Ref } from "vue";
import { defineComponent, h, inject, provide, watch } from "vue";
import { usePresence } from "../../hooks/use-presence.js";
import { DialogPortal } from "../dialog/DialogPortal.js";
import { Slot } from "../dialog/Slot.js";
import { hoverCardKey } from "./hover-card-context.js";
import { useHoverCard } from "./use-hover-card.js";

type HoverCardPresenceContext = {
  isPresent: Ref<boolean>;
  presenceRef: Ref<HTMLElement | null>;
};
const hoverCardPresenceKey: InjectionKey<HoverCardPresenceContext> = Symbol(
  "forge-hover-card-presence",
);

type HoverCardApi = ReturnType<typeof useHoverCard>;

function useCtx(): HoverCardApi {
  const ctx = inject(hoverCardKey);
  if (!ctx) throw new Error("HoverCard compound parts must be inside <HoverCard.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Vue's h() hyphenates multi-word event keys. Remap to all-lowercase-after-on
// so hyphenate yields the correct DOM event name.
// ---------------------------------------------------------------------------
function patchVueEvents(props: Record<string, unknown>): Record<string, unknown> {
  const { onMouseEnter, onMouseLeave, ...rest } = props as Record<string, unknown>;
  return {
    ...rest,
    ...(onMouseEnter !== undefined && { onMouseenter: onMouseEnter }),
    ...(onMouseLeave !== undefined && { onMouseleave: onMouseLeave }),
  };
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const HoverCardRoot = defineComponent({
  name: "ForgeHoverCardRoot",
  props: {
    openDelay: { type: Number, default: undefined },
    closeDelay: { type: Number, default: undefined },
    id: { type: String, default: undefined },
    positioning: {
      type: Object as PropType<HoverCardPositioning>,
      default: undefined,
    },
    onOpenChange: {
      type: Function as PropType<(open: boolean) => void>,
      default: undefined,
    },
  },
  emits: ["update:open"],
  setup(props, { slots, emit }) {
    const api = useHoverCard({
      ...(props.id !== undefined && { id: props.id }),
      ...(props.openDelay !== undefined && { openDelay: props.openDelay }),
      ...(props.closeDelay !== undefined && { closeDelay: props.closeDelay }),
      ...(props.positioning !== undefined && { positioning: props.positioning }),
      ...(props.onOpenChange !== undefined && { onOpenChange: props.onOpenChange }),
    });

    provide(hoverCardKey, api);

    const presence = usePresence(api.isOpen);
    provide(hoverCardPresenceKey, presence);

    watch(api.isOpen, (open) => emit("update:open", open));

    return () => slots.default?.();
  },
});

// ---------------------------------------------------------------------------
// Trigger — defaults to <a> element (typical HoverCard usage)
// ---------------------------------------------------------------------------

const HoverCardTrigger = defineComponent({
  name: "ForgeHoverCardTrigger",
  props: { asChild: { type: Boolean, default: false } },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    return () => {
      const triggerProps = { ...patchVueEvents(api.getTriggerProps()), ...attrs };
      if (props.asChild) return h(Slot, triggerProps, slots.default);
      return h("a", triggerProps, slots.default?.());
    };
  },
});

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

const HoverCardPortal = defineComponent({
  name: "ForgeHoverCardPortal",
  props: {
    to: { type: [String, Object] as PropType<string | HTMLElement>, default: "body" },
    disabled: { type: Boolean, default: false },
    forceMount: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const api = useCtx();
    const presence = inject(hoverCardPresenceKey, null);
    return () => {
      const isPresent = presence?.isPresent.value ?? api.isOpen.value;
      if (!props.forceMount && !isPresent) return null;
      return h(DialogPortal, { to: props.to, disabled: props.disabled }, slots.default);
    };
  },
});

// ---------------------------------------------------------------------------
// Content — Presence-aware. Positioner div wraps content div (role="dialog").
// Mouse enter/leave on content are handled by the connect (keeps card open).
// ---------------------------------------------------------------------------

const HoverCardContent = defineComponent({
  name: "ForgeHoverCardContent",
  inheritAttrs: false,
  props: {
    forceMount: { type: Boolean, default: false },
    asChild: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const api = useCtx();
    const injectedPresence = inject(hoverCardPresenceKey, null);
    const ownPresence = usePresence(api.isOpen);
    const { isPresent, presenceRef } = injectedPresence ?? ownPresence;

    return () => {
      if (!props.forceMount && !isPresent.value) return null;

      const positionerProps = api.getPositionerProps();
      const contentProps = api.getContentProps();
      const isOpen = api.isOpen.value;

      const machineRef = contentProps.ref as (el: HTMLElement | null) => void;
      const { ref: _ref, ...patchedContentProps } = patchVueEvents(contentProps) as Record<
        string,
        unknown
      >;
      const finalContentProps = {
        ...patchedContentProps,
        ...(!isOpen && { "aria-hidden": true }),
        ...attrs,
        ...(!isOpen && { style: [attrs.style, { pointerEvents: "none" }] }),
        ref: (el: Element | ComponentPublicInstance | null) => {
          const htmlEl = el instanceof HTMLElement ? el : null;
          machineRef(htmlEl);
          presenceRef.value = htmlEl;
        },
      };

      if (props.asChild) {
        return h("div", positionerProps, h(Slot, finalContentProps, slots.default));
      }
      return h("div", positionerProps, h("div", finalContentProps, slots.default?.()));
    };
  },
});

// ---------------------------------------------------------------------------
// Arrow — renderless, always Slot.
// ---------------------------------------------------------------------------

const HoverCardArrow = defineComponent({
  name: "ForgeHoverCardArrow",
  setup(_props, { slots }) {
    const api = useCtx();
    return () => h(Slot, api.getArrowProps(), slots.default);
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const HoverCard = {
  Root: HoverCardRoot,
  Trigger: HoverCardTrigger,
  Portal: HoverCardPortal,
  Content: HoverCardContent,
  Arrow: HoverCardArrow,
} as const;

export {
  HoverCardArrow,
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger,
};
