import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import { updateLayerContentEl } from "@forge-ui/core";
import {
  getAlignFromPlacement,
  getSideFromPlacement,
  getTransformOrigin,
} from "@forge-ui/floating";
import type { PopoverContext, PopoverEvent, PopoverSend, PopoverState } from "./popover.types.js";

export type PopoverApi = ReturnType<typeof connectPopover>;

/**
 * Maps machine snapshot → framework-agnostic DOM props.
 *
 * Positioner is INTERNAL — not exposed as a compound part. `getPositionerProps`
 * is called inside the framework binding's Content component to wrap the
 * actual content div with a positioning shim.
 *
 * Arrow is RENDERLESS — `getArrowProps` merges onto the consumer's child element.
 * The framework binding's Arrow component is always a Slot.
 */
export function connectPopover(
  snapshot: MachineSnapshot<PopoverContext, PopoverState>,
  send: PopoverSend,
  machine: Pick<MachineInstance<PopoverContext, PopoverState, PopoverEvent>, "setContext">,
) {
  const { context } = snapshot;
  const isOpen = snapshot.matches("open");
  const state = isOpen ? "open" : "closed";

  const side = getSideFromPlacement(context.currentPlacement);
  const align = getAlignFromPlacement(context.currentPlacement);

  return {
    isOpen,

    getTriggerProps() {
      return {
        id: context.triggerId,
        type: "button" as const,
        "aria-expanded": isOpen,
        "aria-controls": context.contentId,
        "aria-haspopup": "dialog" as const,
        "data-state": state,
        "data-forge-scope": "popover",
        "data-forge-part": "trigger",
        ref: (el: unknown) => machine.setContext({ triggerEl: el as HTMLElement | null }),
        onClick() {
          send("TOGGLE");
        },
      };
    },

    getAnchorProps() {
      return {
        "data-forge-scope": "popover",
        "data-forge-part": "anchor",
        ref: (el: unknown) => machine.setContext({ anchorEl: el as HTMLElement | null }),
      };
    },

    /** Internal — rendered inside Popover.Content, not exposed as a compound part. */
    getPositionerProps() {
      return {
        style: {
          position: context.positioning.strategy,
          top: `${context.y}px`,
          left: `${context.x}px`,
          width: "max-content",
          // Opacity is driven by the CSS custom property --forge-revealed set
          // directly on the DOM node by the floating activity. Using a CSS var
          // here means React/Vue re-renders with positioned=false can never
          // accidentally override the value written by direct DOM manipulation.
          opacity: "var(--forge-revealed, 0)" as unknown as number,
          ...(!context.positioned && { pointerEvents: "none" as const }),
        },
        "data-forge-scope": "popover",
        "data-forge-part": "positioner",
        "data-side": side,
        "data-align": align,
        "data-placement": context.currentPlacement,
      };
    },

    getContentProps() {
      return {
        id: context.contentId,
        role: "dialog" as const,
        "aria-modal": context.modal,
        ...(context.titleRegistered && { "aria-labelledby": context.titleId }),
        ...(context.descriptionRegistered && { "aria-describedby": context.descriptionId }),
        tabIndex: -1,
        "data-state": state,
        "data-forge-scope": "popover",
        "data-forge-part": "content",
        "data-side": side,
        "data-align": align,
        "data-placement": context.currentPlacement,
        style: {
          "--forge-popover-content-transform-origin": getTransformOrigin(context.currentPlacement),
        } as unknown as Record<string, string>,
        ref: (el: unknown) => {
          const contentEl = el as HTMLElement | null;
          machine.setContext({ contentEl });
          updateLayerContentEl(context.id, contentEl);
        },
      };
    },

    getArrowProps() {
      return {
        "data-forge-scope": "popover",
        "data-forge-part": "arrow",
        "data-side": side,
        ref: (el: unknown) => machine.setContext({ arrowEl: el as Element | null }),
      };
    },

    getArrowTipProps() {
      return {
        "data-forge-scope": "popover",
        "data-forge-part": "arrow-tip",
      };
    },

    getCloseProps() {
      return {
        type: "button" as const,
        "data-forge-scope": "popover",
        "data-forge-part": "close",
        onClick() {
          send("CLOSE");
        },
      };
    },

    getTitleProps() {
      return {
        id: context.titleId,
        "data-forge-scope": "popover",
        "data-forge-part": "title",
      };
    },

    getDescriptionProps() {
      return {
        id: context.descriptionId,
        "data-forge-scope": "popover",
        "data-forge-part": "description",
      };
    },
  };
}
