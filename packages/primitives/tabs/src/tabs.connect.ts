import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import type { TabsContext, TabsEvent } from "./tabs.types.js";

type TabsSend = (event: TabsEvent) => void;

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
        "data-state": isSelected ? ("active" as const) : ("inactive" as const),
        "data-disabled": isDisabled ? ("" as const) : undefined,
        "data-forge-scope": "tabs",
        "data-forge-part": "trigger",
        "data-orientation": orientation,
        onClick() {
          if (!isDisabled) {
            send({ type: "SELECT_TAB", value: tabValue });
          }
        },
        onFocus() {
          if (!isDisabled && activationMode === "automatic") {
            send({ type: "SELECT_TAB", value: tabValue });
          }
        },
        // Vue camel-case variant
        onFocusin() {
          if (!isDisabled && activationMode === "automatic") {
            send({ type: "SELECT_TAB", value: tabValue });
          }
        },
        onKeyDown(e: KeyboardEvent) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!isDisabled) {
              send({ type: "SELECT_TAB", value: tabValue });
            }
          }
        },
        onKeydown(e: KeyboardEvent) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!isDisabled) {
              send({ type: "SELECT_TAB", value: tabValue });
            }
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
