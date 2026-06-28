import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import type {
  ToggleGroupContext,
  ToggleGroupEvent,
  ToggleGroupState,
} from "./toggle-group.types.js";

type ToggleGroupSend = (event: ToggleGroupEvent) => void;

/**
 * WAI-ARIA Toolbar Pattern §keyboard.
 * role="toolbar" mandates arrow-key navigation with roving tabindex.
 * ArrowRight/Down → next item, ArrowLeft/Up → previous item.
 * Both axes respond regardless of orientation so users are never blocked
 * (mirrors the APG recommendation and RadioGroup behaviour in this codebase).
 * Home → first item, End → last item.
 */
function navigateToolbar(e: KeyboardEvent, context: ToggleGroupContext): boolean {
  const isHorizontal = context.orientation === "horizontal";
  const isNext =
    (isHorizontal && e.key === "ArrowRight") ||
    (!isHorizontal && e.key === "ArrowDown") ||
    // Always support both axes per APG ("should not restrict")
    e.key === "ArrowRight" ||
    e.key === "ArrowDown";
  const isPrev = e.key === "ArrowLeft" || e.key === "ArrowUp";
  const isFirst = e.key === "Home";
  const isLast = e.key === "End";

  if (!isNext && !isPrev && !isFirst && !isLast) return false;

  e.preventDefault();
  const current = e.currentTarget as HTMLElement;
  const toolbar = current.closest<HTMLElement>(
    '[data-forge-scope="toggle-group"][data-forge-part="root"]',
  );
  if (!toolbar) return true;

  const items = [
    ...toolbar.querySelectorAll<HTMLElement>('[data-forge-part="item"]:not([disabled])'),
  ];
  if (items.length === 0) return true;

  let target: HTMLElement | undefined;
  if (isFirst) {
    target = items[0];
  } else if (isLast) {
    target = items[items.length - 1];
  } else {
    const idx = items.indexOf(current);
    const dir = isNext ? 1 : -1;
    const next = idx + dir;
    if (context.loop) {
      target = items[(next + items.length) % items.length];
    } else {
      target = items[Math.max(0, Math.min(next, items.length - 1))];
    }
  }

  target?.focus();
  return true;
}

export function connectToggleGroup(
  snapshot: MachineSnapshot<ToggleGroupContext, ToggleGroupState>,
  send: ToggleGroupSend,
  _machine: Pick<
    MachineInstance<ToggleGroupContext, ToggleGroupState, ToggleGroupEvent>,
    "setContext"
  >,
) {
  const { context } = snapshot;
  const { value, disabled, orientation, rovingFocus } = context;

  function isItemPressed(itemValue: string) {
    return value.includes(itemValue);
  }

  return {
    value,
    disabled,
    send,

    isItemPressed,

    getRootProps() {
      return {
        // role="toolbar" is the correct APG pattern for a set of toggle controls.
        // It mandates arrow-key navigation (roving tabindex) and
        // announces as "toolbar" to screen readers — distinguishing it from
        // a generic group, which has no keyboard contract.
        role: "toolbar" as const,
        "aria-orientation": orientation,
        "aria-disabled": disabled || undefined,
        "data-forge-scope": "toggle-group",
        "data-forge-part": "root",
        "data-orientation": orientation,
        "data-disabled": disabled ? ("" as const) : undefined,
      };
    },

    getItemProps(itemValue: string, itemDisabled = false) {
      const isPressed = isItemPressed(itemValue);
      const isItemDisabled = disabled || itemDisabled;

      // Roving tabindex: only the first pressed item (or first item if nothing
      // pressed) gets tabIndex=0. All others get -1. This makes the toolbar a
      // single tab stop, with internal navigation via arrow keys.
      const isTabStop = rovingFocus
        ? value.length > 0
          ? value[0] === itemValue
          : false // framework layer sets first item tabIndex=0 when value=[]
        : true;

      return {
        type: "button" as const,
        role: "button" as const,
        "aria-pressed": isPressed,
        "aria-disabled": isItemDisabled || undefined,
        disabled: isItemDisabled || undefined,
        tabIndex: rovingFocus ? (isTabStop ? 0 : -1) : undefined,
        "data-state": isPressed ? ("on" as const) : ("off" as const),
        "data-pressed": isPressed ? ("" as const) : undefined,
        "data-disabled": isItemDisabled ? ("" as const) : undefined,
        "data-value": itemValue,
        "data-forge-scope": "toggle-group",
        "data-forge-part": "item",
        onClick() {
          if (!isItemDisabled) send({ type: "PRESS_ITEM", value: itemValue });
        },
        onKeyDown(e: KeyboardEvent) {
          if (rovingFocus && navigateToolbar(e, context)) return;
          if ((e.key === "Enter" || e.key === " ") && !isItemDisabled) {
            e.preventDefault();
            send({ type: "PRESS_ITEM", value: itemValue });
          }
        },
        onKeydown(e: KeyboardEvent) {
          if (rovingFocus && navigateToolbar(e, context)) return;
          if ((e.key === "Enter" || e.key === " ") && !isItemDisabled) {
            e.preventDefault();
            send({ type: "PRESS_ITEM", value: itemValue });
          }
        },
      };
    },
  };
}

export type ToggleGroupApi = ReturnType<typeof connectToggleGroup>;
