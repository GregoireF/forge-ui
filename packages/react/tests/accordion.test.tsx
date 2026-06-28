import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Accordion } from "../src/components/accordion/Accordion.js";

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

interface FixtureOptions {
  type?: "single" | "multiple";
  defaultValue?: string[];
  value?: string[];
  collapsible?: boolean;
  disabled?: boolean;
  onValueChange?: (v: string[]) => void;
}

function makeFixture(opts: FixtureOptions = {}) {
  return (
    <Accordion.Root {...opts}>
      <Accordion.Item value="a">
        <Accordion.Header>
          <Accordion.Trigger data-testid="trigger-a">Item A</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content data-testid="content-a">Content A</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="b">
        <Accordion.Header>
          <Accordion.Trigger data-testid="trigger-b">Item B</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content data-testid="content-b">Content B</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

// ---------------------------------------------------------------------------
// Accordion — React
// ---------------------------------------------------------------------------

describe("Accordion (React)", () => {
  describe("rendering", () => {
    it("all items are closed by default", () => {
      render(makeFixture());
      expect(screen.queryByTestId("content-a")).toBeNull();
      expect(screen.queryByTestId("content-b")).toBeNull();
    });

    it("renders open item with defaultValue", () => {
      render(makeFixture({ defaultValue: ["a"] }));
      expect(screen.getByTestId("content-a")).toBeInTheDocument();
      expect(screen.queryByTestId("content-b")).toBeNull();
    });

    it("multiple mode: both items open with defaultValue=['a','b']", () => {
      render(makeFixture({ type: "multiple", defaultValue: ["a", "b"] }));
      expect(screen.getByTestId("content-a")).toBeInTheDocument();
      expect(screen.getByTestId("content-b")).toBeInTheDocument();
    });
  });

  describe("interaction — single mode", () => {
    it("opens item on trigger click", () => {
      render(makeFixture());
      fireEvent.click(screen.getByTestId("trigger-a"));
      expect(screen.getByTestId("content-a")).toBeInTheDocument();
    });

    it("single mode: closes first item when second is opened", () => {
      render(makeFixture({ defaultValue: ["a"] }));
      fireEvent.click(screen.getByTestId("trigger-b"));
      expect(screen.queryByTestId("content-a")).toBeNull();
      expect(screen.getByTestId("content-b")).toBeInTheDocument();
    });

    it("single mode without collapsible: clicking open item does nothing", () => {
      render(makeFixture({ defaultValue: ["a"], collapsible: false }));
      fireEvent.click(screen.getByTestId("trigger-a"));
      expect(screen.getByTestId("content-a")).toBeInTheDocument();
    });

    it("single mode with collapsible: clicking open item closes it", () => {
      render(makeFixture({ defaultValue: ["a"], collapsible: true }));
      fireEvent.click(screen.getByTestId("trigger-a"));
      expect(screen.queryByTestId("content-a")).toBeNull();
    });
  });

  describe("interaction — multiple mode", () => {
    it("multiple mode: items open independently", () => {
      render(makeFixture({ type: "multiple" }));
      fireEvent.click(screen.getByTestId("trigger-a"));
      fireEvent.click(screen.getByTestId("trigger-b"));
      expect(screen.getByTestId("content-a")).toBeInTheDocument();
      expect(screen.getByTestId("content-b")).toBeInTheDocument();
    });

    it("multiple mode: clicking open item closes it", () => {
      render(makeFixture({ type: "multiple", defaultValue: ["a", "b"] }));
      fireEvent.click(screen.getByTestId("trigger-a"));
      expect(screen.queryByTestId("content-a")).toBeNull();
      expect(screen.getByTestId("content-b")).toBeInTheDocument();
    });
  });

  describe("keyboard", () => {
    it("opens item on Enter", () => {
      render(makeFixture());
      const trigger = screen.getByTestId("trigger-a");
      fireEvent.keyDown(trigger, { key: "Enter" });
      expect(screen.getByTestId("content-a")).toBeInTheDocument();
    });

    it("opens item on Space", () => {
      render(makeFixture());
      const trigger = screen.getByTestId("trigger-a");
      fireEvent.keyDown(trigger, { key: " " });
      expect(screen.getByTestId("content-a")).toBeInTheDocument();
    });

    it("ArrowDown moves focus to next trigger", () => {
      render(makeFixture());
      const triggerA = screen.getByTestId("trigger-a");
      triggerA.focus();
      fireEvent.keyDown(triggerA, { key: "ArrowDown" });
      expect(document.activeElement).toBe(screen.getByTestId("trigger-b"));
    });

    it("ArrowUp moves focus to previous trigger", () => {
      render(makeFixture());
      const triggerB = screen.getByTestId("trigger-b");
      triggerB.focus();
      fireEvent.keyDown(triggerB, { key: "ArrowUp" });
      expect(document.activeElement).toBe(screen.getByTestId("trigger-a"));
    });

    it("ArrowDown wraps from last to first", () => {
      render(makeFixture());
      const triggerB = screen.getByTestId("trigger-b");
      triggerB.focus();
      fireEvent.keyDown(triggerB, { key: "ArrowDown" });
      expect(document.activeElement).toBe(screen.getByTestId("trigger-a"));
    });

    it("ArrowUp wraps from first to last", () => {
      render(makeFixture());
      const triggerA = screen.getByTestId("trigger-a");
      triggerA.focus();
      fireEvent.keyDown(triggerA, { key: "ArrowUp" });
      expect(document.activeElement).toBe(screen.getByTestId("trigger-b"));
    });

    it("Home moves focus to first trigger", () => {
      render(makeFixture());
      const triggerB = screen.getByTestId("trigger-b");
      triggerB.focus();
      fireEvent.keyDown(triggerB, { key: "Home" });
      expect(document.activeElement).toBe(screen.getByTestId("trigger-a"));
    });

    it("End moves focus to last trigger", () => {
      render(makeFixture());
      const triggerA = screen.getByTestId("trigger-a");
      triggerA.focus();
      fireEvent.keyDown(triggerA, { key: "End" });
      expect(document.activeElement).toBe(screen.getByTestId("trigger-b"));
    });
  });

  describe("disabled", () => {
    it("disabled accordion: triggers do not open items", () => {
      render(makeFixture({ disabled: true }));
      fireEvent.click(screen.getByTestId("trigger-a"));
      expect(screen.queryByTestId("content-a")).toBeNull();
    });

    it("disabled triggers are marked aria-disabled", () => {
      render(makeFixture({ disabled: true }));
      expect(screen.getByTestId("trigger-a")).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("callbacks", () => {
    it("calls onValueChange when item is toggled", () => {
      const spy = vi.fn();
      render(makeFixture({ onValueChange: spy }));
      fireEvent.click(screen.getByTestId("trigger-a"));
      expect(spy).toHaveBeenCalledWith(["a"]);
    });

    it("calls onValueChange with empty array when collapsible item is closed", () => {
      const spy = vi.fn();
      render(makeFixture({ defaultValue: ["a"], collapsible: true, onValueChange: spy }));
      fireEvent.click(screen.getByTestId("trigger-a"));
      expect(spy).toHaveBeenCalledWith([]);
    });

    it("multiple mode: onValueChange carries cumulative open values", () => {
      const spy = vi.fn();
      render(makeFixture({ type: "multiple", onValueChange: spy }));
      fireEvent.click(screen.getByTestId("trigger-a"));
      expect(spy).toHaveBeenCalledWith(["a"]);
      fireEvent.click(screen.getByTestId("trigger-b"));
      expect(spy).toHaveBeenCalledWith(["a", "b"]);
    });
  });

  describe("controlled mode", () => {
    it("reflects controlled value prop", () => {
      const { rerender } = render(makeFixture({ value: [] }));
      expect(screen.queryByTestId("content-a")).toBeNull();
      rerender(makeFixture({ value: ["a"] }));
      expect(screen.getByTestId("content-a")).toBeInTheDocument();
    });
  });

  describe("forceMount", () => {
    it("forceMount keeps closed content in DOM", () => {
      render(
        <Accordion.Root>
          <Accordion.Item value="a">
            <Accordion.Header>
              <Accordion.Trigger data-testid="trigger-a">A</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content forceMount data-testid="content-a">
              Content A
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>,
      );
      expect(screen.getByTestId("content-a")).toBeInTheDocument();
      expect(screen.getByTestId("content-a")).toHaveAttribute("data-state", "closed");
    });

    it("forceMount content shows data-state=open when opened", () => {
      render(
        <Accordion.Root>
          <Accordion.Item value="a">
            <Accordion.Header>
              <Accordion.Trigger data-testid="trigger-a">A</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content forceMount data-testid="content-a">
              Content A
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>,
      );
      fireEvent.click(screen.getByTestId("trigger-a"));
      expect(screen.getByTestId("content-a")).toHaveAttribute("data-state", "open");
    });
  });

  describe("ARIA", () => {
    it("trigger has aria-expanded=false when closed", () => {
      render(makeFixture());
      expect(screen.getByTestId("trigger-a")).toHaveAttribute("aria-expanded", "false");
    });

    it("trigger has aria-expanded=true when open", () => {
      render(makeFixture({ defaultValue: ["a"] }));
      expect(screen.getByTestId("trigger-a")).toHaveAttribute("aria-expanded", "true");
    });

    it("trigger aria-controls points to content id", () => {
      render(makeFixture({ defaultValue: ["a"] }));
      const trigger = screen.getByTestId("trigger-a");
      const contentId = trigger.getAttribute("aria-controls");
      expect(contentId).toBeTruthy();
      expect(document.getElementById(contentId!)).toBe(screen.getByTestId("content-a"));
    });

    it("content has role=region", () => {
      render(makeFixture({ defaultValue: ["a"] }));
      expect(screen.getByTestId("content-a")).toHaveAttribute("role", "region");
    });

    it("content aria-labelledby points to trigger id", () => {
      render(makeFixture({ defaultValue: ["a"] }));
      const content = screen.getByTestId("content-a");
      const triggerId = content.getAttribute("aria-labelledby");
      expect(triggerId).toBeTruthy();
      expect(document.getElementById(triggerId!)).toBe(screen.getByTestId("trigger-a"));
    });
  });

  describe("CSS contract", () => {
    it("root has data-forge-scope=accordion and data-forge-part=root", () => {
      render(makeFixture());
      const root = document.querySelector('[data-forge-scope="accordion"][data-forge-part="root"]');
      expect(root).toBeInTheDocument();
    });

    it("item has data-forge-scope=accordion and data-forge-part=item", () => {
      render(makeFixture());
      const items = document.querySelectorAll(
        '[data-forge-scope="accordion"][data-forge-part="item"]',
      );
      expect(items.length).toBe(2);
    });

    it("item has data-state=closed by default", () => {
      render(makeFixture());
      const item = document.querySelector('[data-forge-scope="accordion"][data-forge-part="item"]');
      expect(item).toHaveAttribute("data-state", "closed");
    });

    it("item has data-state=open when expanded", () => {
      render(makeFixture({ defaultValue: ["a"] }));
      const openItem = document.querySelector('[data-forge-part="item"][data-state="open"]');
      expect(openItem).toBeInTheDocument();
    });

    it("header has data-forge-scope=accordion and data-forge-part=header", () => {
      render(makeFixture());
      expect(
        document.querySelector('[data-forge-scope="accordion"][data-forge-part="header"]'),
      ).toBeInTheDocument();
    });

    it("trigger has data-forge-scope=accordion and data-forge-part=trigger", () => {
      render(makeFixture());
      expect(screen.getByTestId("trigger-a")).toHaveAttribute("data-forge-scope", "accordion");
      expect(screen.getByTestId("trigger-a")).toHaveAttribute("data-forge-part", "trigger");
    });

    it("content has data-forge-scope=accordion and data-forge-part=content", () => {
      render(makeFixture({ defaultValue: ["a"] }));
      expect(screen.getByTestId("content-a")).toHaveAttribute("data-forge-scope", "accordion");
      expect(screen.getByTestId("content-a")).toHaveAttribute("data-forge-part", "content");
    });
  });
});
