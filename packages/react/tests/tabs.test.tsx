import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tabs } from "../src/components/tabs/Tabs.js";

// ---------------------------------------------------------------------------
// Fixture
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
  return (
    <Tabs.Root {...opts}>
      <Tabs.List>
        <Tabs.Trigger value="a" data-testid="trigger-a">Tab A</Tabs.Trigger>
        <Tabs.Trigger value="b" data-testid="trigger-b">Tab B</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="a" data-testid="panel-a">Content A</Tabs.Panel>
      <Tabs.Panel value="b" data-testid="panel-b">Content B</Tabs.Panel>
    </Tabs.Root>
  );
}

// ---------------------------------------------------------------------------
// Tabs — React
// ---------------------------------------------------------------------------

describe("Tabs (React)", () => {
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
    it("activates tab on Enter keydown", () => {
      render(makeFixture());
      fireEvent.keyDown(screen.getByTestId("trigger-a"), { key: "Enter" });
      expect(screen.getByTestId("panel-a")).toBeInTheDocument();
    });

    it("activates tab on Space keydown", () => {
      render(makeFixture());
      fireEvent.keyDown(screen.getByTestId("trigger-a"), { key: " " });
      expect(screen.getByTestId("panel-a")).toBeInTheDocument();
    });

    it("ArrowRight moves focus to next tab (horizontal)", () => {
      render(makeFixture({ defaultValue: "a" }));
      const triggerA = screen.getByTestId("trigger-a");
      triggerA.focus();
      fireEvent.keyDown(triggerA, { key: "ArrowRight" });
      expect(document.activeElement).toBe(screen.getByTestId("trigger-b"));
    });

    it("ArrowLeft moves focus to previous tab (horizontal)", () => {
      render(makeFixture({ defaultValue: "b" }));
      const triggerB = screen.getByTestId("trigger-b");
      triggerB.focus();
      fireEvent.keyDown(triggerB, { key: "ArrowLeft" });
      expect(document.activeElement).toBe(screen.getByTestId("trigger-a"));
    });

    it("ArrowRight wraps from last to first", () => {
      render(makeFixture({ defaultValue: "b" }));
      const triggerB = screen.getByTestId("trigger-b");
      triggerB.focus();
      fireEvent.keyDown(triggerB, { key: "ArrowRight" });
      expect(document.activeElement).toBe(screen.getByTestId("trigger-a"));
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

    it("ArrowRight in automatic mode selects the focused tab", () => {
      render(makeFixture({ defaultValue: "a", activationMode: "automatic" }));
      const triggerA = screen.getByTestId("trigger-a");
      triggerA.focus();
      fireEvent.keyDown(triggerA, { key: "ArrowRight" });
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

    it("vertical: ArrowDown moves focus to next tab", () => {
      render(makeFixture({ defaultValue: "a", orientation: "vertical" }));
      const triggerA = screen.getByTestId("trigger-a");
      triggerA.focus();
      fireEvent.keyDown(triggerA, { key: "ArrowDown" });
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
      await user.click(screen.getByTestId("trigger-b"));
      expect(spy).toHaveBeenCalledWith("b");
    });
  });

  describe("controlled mode", () => {
    it("reflects controlled value prop", () => {
      const { rerender } = render(makeFixture({ value: "a" }));
      expect(screen.getByTestId("panel-a")).toBeInTheDocument();
      rerender(makeFixture({ value: "b" }));
      expect(screen.queryByTestId("panel-a")).toBeNull();
      expect(screen.getByTestId("panel-b")).toBeInTheDocument();
    });
  });

  describe("forceMount", () => {
    it("forceMount keeps inactive panel in DOM", () => {
      render(
        <Tabs.Root defaultValue="a">
          <Tabs.List>
            <Tabs.Trigger value="a" data-testid="trigger-a">A</Tabs.Trigger>
            <Tabs.Trigger value="b">B</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Panel value="a" data-testid="panel-a">A</Tabs.Panel>
          <Tabs.Panel value="b" forceMount data-testid="panel-b">B</Tabs.Panel>
        </Tabs.Root>,
      );
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

    it("inactive trigger has tabIndex=-1, active has tabIndex=0", () => {
      render(makeFixture({ defaultValue: "a" }));
      expect(screen.getByTestId("trigger-a")).toHaveAttribute("tabindex", "0");
      expect(screen.getByTestId("trigger-b")).toHaveAttribute("tabindex", "-1");
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

    it("active trigger data-state=active, inactive=inactive", () => {
      render(makeFixture({ defaultValue: "a" }));
      expect(screen.getByTestId("trigger-a")).toHaveAttribute("data-state", "active");
      expect(screen.getByTestId("trigger-b")).toHaveAttribute("data-state", "inactive");
    });
  });
});
