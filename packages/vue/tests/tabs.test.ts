import { cleanup, fireEvent, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";
import { Tabs } from "../src/components/tabs/Tabs.js";

const { Root: TabsRoot, List: TabsList, Trigger: TabsTrigger, Panel: TabsPanel } = Tabs;

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Fixture factory
// ---------------------------------------------------------------------------

interface FixtureOptions {
  defaultValue?: string;
  value?: string;
  activationMode?: "automatic" | "manual";
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  onValueChange?: (v: string) => void;
}

function makeFixture(opts: FixtureOptions = {}) {
  return defineComponent({
    components: { TabsRoot, TabsList, TabsTrigger, TabsPanel },
    setup: () => ({ opts }),
    template: `
      <TabsRoot v-bind="opts">
        <TabsList>
          <TabsTrigger value="a" data-testid="trigger-a">Tab A</TabsTrigger>
          <TabsTrigger value="b" data-testid="trigger-b">Tab B</TabsTrigger>
        </TabsList>
        <TabsPanel value="a" data-testid="panel-a">Content A</TabsPanel>
        <TabsPanel value="b" data-testid="panel-b">Content B</TabsPanel>
      </TabsRoot>
    `,
  });
}

// ---------------------------------------------------------------------------
// Tabs — Vue
// ---------------------------------------------------------------------------

describe("Tabs (Vue)", () => {
  const user = userEvent.setup();

  describe("rendering", () => {
    it("no panel shown when no defaultValue", () => {
      render(makeFixture());
      expect(screen.queryByTestId("panel-a")).toBeNull();
      expect(screen.queryByTestId("panel-b")).toBeNull();
    });

    it("shows active panel with defaultValue", () => {
      render(makeFixture({ defaultValue: "a" }));
      expect(screen.getByTestId("panel-a")).toBeInTheDocument();
      expect(screen.queryByTestId("panel-b")).toBeNull();
    });

    it("trigger for active tab has data-state=active", () => {
      render(makeFixture({ defaultValue: "a" }));
      expect(screen.getByTestId("trigger-a")).toHaveAttribute("data-state", "active");
      expect(screen.getByTestId("trigger-b")).toHaveAttribute("data-state", "inactive");
    });
  });

  describe("interaction", () => {
    it("activates tab on click", async () => {
      render(makeFixture());
      await user.click(screen.getByTestId("trigger-a"));
      expect(screen.getByTestId("panel-a")).toBeInTheDocument();
    });

    it("switching tabs unmounts previous panel and shows new one", async () => {
      render(makeFixture({ defaultValue: "a" }));
      await user.click(screen.getByTestId("trigger-b"));
      expect(screen.queryByTestId("panel-a")).toBeNull();
      expect(screen.getByTestId("panel-b")).toBeInTheDocument();
    });
  });

  describe("keyboard", () => {
    it("activates tab on Enter", async () => {
      render(makeFixture());
      const trigger = screen.getByTestId("trigger-a");
      trigger.focus();
      await user.keyboard("{Enter}");
      expect(screen.getByTestId("panel-a")).toBeInTheDocument();
    });

    it("activates tab on Space", async () => {
      render(makeFixture());
      const trigger = screen.getByTestId("trigger-a");
      trigger.focus();
      await user.keyboard(" ");
      expect(screen.getByTestId("panel-a")).toBeInTheDocument();
    });

    it("ArrowRight moves focus to next tab (horizontal)", () => {
      render(makeFixture({ defaultValue: "a" }));
      const triggerA = screen.getByTestId("trigger-a");
      triggerA.focus();
      fireEvent.keyDown(triggerA, { key: "ArrowRight" });
      expect(document.activeElement).toBe(screen.getByTestId("trigger-b"));
    });

    it("ArrowLeft moves focus to previous tab", () => {
      render(makeFixture({ defaultValue: "b" }));
      const triggerB = screen.getByTestId("trigger-b");
      triggerB.focus();
      fireEvent.keyDown(triggerB, { key: "ArrowLeft" });
      expect(document.activeElement).toBe(screen.getByTestId("trigger-a"));
    });

    it("ArrowRight in automatic mode also selects the tab", async () => {
      render(makeFixture({ defaultValue: "a", activationMode: "automatic" }));
      const triggerA = screen.getByTestId("trigger-a");
      triggerA.focus();
      fireEvent.keyDown(triggerA, { key: "ArrowRight" });
      await nextTick();
      expect(screen.getByTestId("panel-b")).toBeInTheDocument();
    });

    it("ArrowRight in manual mode moves focus without selecting", () => {
      render(makeFixture({ defaultValue: "a", activationMode: "manual" }));
      const triggerA = screen.getByTestId("trigger-a");
      triggerA.focus();
      fireEvent.keyDown(triggerA, { key: "ArrowRight" });
      expect(document.activeElement).toBe(screen.getByTestId("trigger-b"));
      expect(screen.queryByTestId("panel-b")).toBeNull();
    });

    it("Home moves focus to first tab", () => {
      render(makeFixture({ defaultValue: "b" }));
      const triggerB = screen.getByTestId("trigger-b");
      triggerB.focus();
      fireEvent.keyDown(triggerB, { key: "Home" });
      expect(document.activeElement).toBe(screen.getByTestId("trigger-a"));
    });

    it("End moves focus to last tab", () => {
      render(makeFixture({ defaultValue: "a" }));
      const triggerA = screen.getByTestId("trigger-a");
      triggerA.focus();
      fireEvent.keyDown(triggerA, { key: "End" });
      expect(document.activeElement).toBe(screen.getByTestId("trigger-b"));
    });
  });

  describe("disabled", () => {
    it("disabled tabs: clicking trigger does not activate", async () => {
      render(makeFixture({ disabled: true }));
      await user.click(screen.getByTestId("trigger-a"));
      expect(screen.queryByTestId("panel-a")).toBeNull();
    });
  });

  describe("callbacks", () => {
    it("calls onValueChange with tab value", async () => {
      const spy = vi.fn();
      render(makeFixture({ onValueChange: spy }));
      await user.click(screen.getByTestId("trigger-a"));
      expect(spy).toHaveBeenCalledWith("a");
    });
  });

  describe("controlled mode", () => {
    it("reflects controlled value prop — shows panel matching value", () => {
      render(makeFixture({ value: "b" }));
      expect(screen.queryByTestId("panel-a")).toBeNull();
      expect(screen.getByTestId("panel-b")).toBeInTheDocument();
    });
  });

  describe("forceMount", () => {
    it("forceMount keeps inactive panel in DOM", () => {
      const Fixture = defineComponent({
        components: { TabsRoot, TabsList, TabsTrigger, TabsPanel },
        template: `
          <TabsRoot default-value="a">
            <TabsList>
              <TabsTrigger value="a" data-testid="trigger-a">A</TabsTrigger>
              <TabsTrigger value="b">B</TabsTrigger>
            </TabsList>
            <TabsPanel value="a" data-testid="panel-a">A</TabsPanel>
            <TabsPanel value="b" :force-mount="true" data-testid="panel-b">B</TabsPanel>
          </TabsRoot>
        `,
      });
      render(Fixture);
      expect(screen.getByTestId("panel-a")).toBeInTheDocument();
      expect(screen.getByTestId("panel-b")).toBeInTheDocument();
      expect(screen.getByTestId("panel-b")).toHaveAttribute("data-state", "inactive");
    });
  });

  describe("ARIA", () => {
    it("tablist has role=tablist", () => {
      render(makeFixture());
      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("triggers have role=tab", () => {
      render(makeFixture());
      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBe(2);
    });

    it("active trigger has aria-selected=true", () => {
      render(makeFixture({ defaultValue: "a" }));
      expect(screen.getByTestId("trigger-a")).toHaveAttribute("aria-selected", "true");
      expect(screen.getByTestId("trigger-b")).toHaveAttribute("aria-selected", "false");
    });

    it("trigger aria-controls points to panel id", () => {
      render(makeFixture({ defaultValue: "a" }));
      const trigger = screen.getByTestId("trigger-a");
      const panelId = trigger.getAttribute("aria-controls");
      expect(panelId).toBeTruthy();
      expect(document.getElementById(panelId!)).toBe(screen.getByTestId("panel-a"));
    });

    it("panel has role=tabpanel", () => {
      render(makeFixture({ defaultValue: "a" }));
      expect(screen.getByTestId("panel-a")).toHaveAttribute("role", "tabpanel");
    });

    it("panel aria-labelledby points to trigger id", () => {
      render(makeFixture({ defaultValue: "a" }));
      const panel = screen.getByTestId("panel-a");
      const triggerId = panel.getAttribute("aria-labelledby");
      expect(triggerId).toBeTruthy();
      expect(document.getElementById(triggerId!)).toBe(screen.getByTestId("trigger-a"));
    });
  });

  describe("CSS contract", () => {
    it("root has data-forge-scope=tabs and data-forge-part=root", () => {
      render(makeFixture());
      expect(document.querySelector('[data-forge-scope="tabs"][data-forge-part="root"]')).toBeInTheDocument();
    });

    it("list has data-forge-scope=tabs and data-forge-part=list", () => {
      render(makeFixture());
      expect(document.querySelector('[data-forge-scope="tabs"][data-forge-part="list"]')).toBeInTheDocument();
    });

    it("trigger has data-forge-scope=tabs and data-forge-part=trigger", () => {
      render(makeFixture());
      expect(screen.getByTestId("trigger-a")).toHaveAttribute("data-forge-scope", "tabs");
      expect(screen.getByTestId("trigger-a")).toHaveAttribute("data-forge-part", "trigger");
    });

    it("panel has data-forge-scope=tabs and data-forge-part=panel", () => {
      render(makeFixture({ defaultValue: "a" }));
      expect(screen.getByTestId("panel-a")).toHaveAttribute("data-forge-scope", "tabs");
      expect(screen.getByTestId("panel-a")).toHaveAttribute("data-forge-part", "panel");
    });

    it("data-state=active on active trigger and panel", () => {
      render(makeFixture({ defaultValue: "a" }));
      expect(screen.getByTestId("trigger-a")).toHaveAttribute("data-state", "active");
      expect(screen.getByTestId("panel-a")).toHaveAttribute("data-state", "active");
    });
  });
});
