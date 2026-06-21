import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import type { TabsContext, TabsEvent } from "./tabs.types.js";

type TabsSend = (event: TabsEvent) => void;

/**
 * WAI-ARIA Tabs Pattern §keyboard — moves focus (and optionally activates) between tabs.
 * Respects orientation: horizontal uses Left/Right, vertical uses Up/Down.
 * In automatic mode, focus change also activates the tab.
 * In manual mode, user presses Enter/Space to activate after arrow-focusing.
 */
function navigateTabs(
  e: KeyboardEvent,
  orientation: "horizontal" | "vertical",
  activationMode: "automatic" | "manual",
  send: TabsSend,
): boolean {
  const isHoriz = orientation === "horizontal";
  const nextKey = isHoriz ? "ArrowRight" : "ArrowDown";
  const prevKey = isHoriz ? "ArrowLeft" : "ArrowUp";
  if (e.key !== nextKey && e.key !== prevKey && e.key !== "Home" && e.key !== "End") return false;

  e.preventDefault();
  const current = e.currentTarget as HTMLElement;
  const list = current.closest<HTMLElement>('[data-forge-part="list"]');
  if (!list) return true;
  const triggers = [
    ...list.querySelectorAll<HTMLElement>('[data-forge-part="trigger"]:not([disabled])'),
  ];
  const idx = triggers.indexOf(current);

  let target: HTMLElement | undefined;
  if (e.key === nextKey) target = triggers[(idx + 1) % triggers.length];
  else if (e.key === prevKey) target = triggers[(idx - 1 + triggers.length) % triggers.length];
  else if (e.key === "Home") target = triggers[0];
  else target = triggers[triggers.length - 1];

  if (target) {
    target.focus();
    if (activationMode === "automatic") {
      const val = (target as HTMLElement).dataset.value;
      if (val) send({ type: "SELECT_TAB", value: val });
    }
  }
  return true;
}

export function connectTabs(
  snapshot: MachineSnapshot<TabsContext, "idle">,
  send: TabsSend,
  _machine: Pick<MachineInstance<TabsContext, "idle", TabsEvent>, "setContext">,
) {
  const { context } = snapshot;
  const { value, orientation, activationMode } = context;

  return {
    value,

    send,

    getRootProps() {
      return {
        "data-forge-scope": "tabs",
        "data-forge-part": "root",
        "data-orientation": orientation,
      } as const;
    },

    getListProps() {
      return {
        role: "tablist" as const,
        "aria-orientation": orientation,
        "data-forge-scope": "tabs",
        "data-forge-part": "list",
        "data-orientation": orientation,
      } as const;
    },

    getTriggerProps(tabValue: string) {
      const isSelected = value === tabValue;
      const isDisabled = context.disabled;
      return {
        id: `forge-tabs-trigger-${tabValue}`,
        role: "tab" as const,
        type: "button" as const,
        "aria-selected": isSelected,
        "aria-controls": `forge-tabs-panel-${tabValue}`,
        "aria-disabled": isDisabled || undefined,
        disabled: isDisabled || undefined,
        tabIndex: isSelected ? 0 : -1,
        "data-value": tabValue,
        "data-state": isSelected ? ("active" as const) : ("inactive" as const),
        "data-disabled": isDisabled ? ("" as const) : undefined,
        "data-forge-scope": "tabs",
        "data-forge-part": "trigger",
        "data-orientation": orientation,
        onClick() {
          if (!isDisabled) send({ type: "SELECT_TAB", value: tabValue });
        },
        onFocus() {
          if (!isDisabled && activationMode === "automatic") {
            send({ type: "SELECT_TAB", value: tabValue });
          }
        },
        onFocusin() {
          if (!isDisabled && activationMode === "automatic") {
            send({ type: "SELECT_TAB", value: tabValue });
          }
        },
        onKeyDown(e: KeyboardEvent) {
          if (navigateTabs(e, orientation, activationMode, send)) return;
          if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
            e.preventDefault();
            send({ type: "SELECT_TAB", value: tabValue });
          }
        },
        onKeydown(e: KeyboardEvent) {
          if (navigateTabs(e, orientation, activationMode, send)) return;
          if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
            e.preventDefault();
            send({ type: "SELECT_TAB", value: tabValue });
          }
        },
      };
    },

    getPanelProps(tabValue: string) {
      const isSelected = value === tabValue;
      return {
        id: `forge-tabs-panel-${tabValue}`,
        role: "tabpanel" as const,
        "aria-labelledby": `forge-tabs-trigger-${tabValue}`,
        tabIndex: 0,
        "data-state": isSelected ? ("active" as const) : ("inactive" as const),
        "data-forge-scope": "tabs",
        "data-forge-part": "panel",
        "data-orientation": orientation,
      } as const;
    },
  };
}

export type TabsApi = ReturnType<typeof connectTabs>;
