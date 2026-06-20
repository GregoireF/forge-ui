import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { Accordion } from "../src/components/accordion/Accordion.js";

const { Root: AccordionRoot, Item: AccordionItem, Header: AccordionHeader, Trigger: AccordionTrigger, Content: AccordionContent } = Accordion;

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Fixture factory
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
  return defineComponent({
    components: { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionContent },
    setup: () => ({ opts }),
    template: `
      <AccordionRoot
        v-bind="opts"
      >
        <AccordionItem value="a">
          <AccordionHeader>
            <AccordionTrigger data-testid="trigger-a">Item A</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent data-testid="content-a">Content A</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionHeader>
            <AccordionTrigger data-testid="trigger-b">Item B</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent data-testid="content-b">Content B</AccordionContent>
        </AccordionItem>
      </AccordionRoot>
    `,
  });
}

// ---------------------------------------------------------------------------
// Accordion — Vue
// ---------------------------------------------------------------------------

describe("Accordion (Vue)", () => {
  const user = userEvent.setup();

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
    it("opens item on trigger click", async () => {
      render(makeFixture());
      await user.click(screen.getByTestId("trigger-a"));
      expect(screen.getByTestId("content-a")).toBeInTheDocument();
    });

    it("single mode: closes first item when second is opened", async () => {
      render(makeFixture({ defaultValue: ["a"] }));
      await user.click(screen.getByTestId("trigger-b"));
      expect(screen.queryByTestId("content-a")).toBeNull();
      expect(screen.getByTestId("content-b")).toBeInTheDocument();
    });

    it("single mode without collapsible: clicking open item does nothing", async () => {
      render(makeFixture({ defaultValue: ["a"], collapsible: false }));
      await user.click(screen.getByTestId("trigger-a"));
      expect(screen.getByTestId("content-a")).toBeInTheDocument();
    });

    it("single mode with collapsible: clicking open item closes it", async () => {
      render(makeFixture({ defaultValue: ["a"], collapsible: true }));
      await user.click(screen.getByTestId("trigger-a"));
      expect(screen.queryByTestId("content-a")).toBeNull();
    });
  });

  describe("interaction — multiple mode", () => {
    it("multiple mode: items open independently", async () => {
      render(makeFixture({ type: "multiple" }));
      await user.click(screen.getByTestId("trigger-a"));
      await user.click(screen.getByTestId("trigger-b"));
      expect(screen.getByTestId("content-a")).toBeInTheDocument();
      expect(screen.getByTestId("content-b")).toBeInTheDocument();
    });

    it("multiple mode: clicking open item closes it", async () => {
      render(makeFixture({ type: "multiple", defaultValue: ["a", "b"] }));
      await user.click(screen.getByTestId("trigger-a"));
      expect(screen.queryByTestId("content-a")).toBeNull();
      expect(screen.getByTestId("content-b")).toBeInTheDocument();
    });
  });

  describe("keyboard", () => {
    it("opens item on Enter", async () => {
      render(makeFixture());
      const trigger = screen.getByTestId("trigger-a");
      trigger.focus();
      await user.keyboard("{Enter}");
      expect(screen.getByTestId("content-a")).toBeInTheDocument();
    });

    it("opens item on Space", async () => {
      render(makeFixture());
      const trigger = screen.getByTestId("trigger-a");
      trigger.focus();
      await user.keyboard(" ");
      expect(screen.getByTestId("content-a")).toBeInTheDocument();
    });
  });

  describe("disabled", () => {
    it("disabled accordion: triggers do not open items", async () => {
      render(makeFixture({ disabled: true }));
      await user.click(screen.getByTestId("trigger-a"));
      expect(screen.queryByTestId("content-a")).toBeNull();
    });

    it("disabled triggers are marked aria-disabled", () => {
      render(makeFixture({ disabled: true }));
      expect(screen.getByTestId("trigger-a")).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("callbacks", () => {
    it("calls onValueChange when item is toggled", async () => {
      const spy = vi.fn();
      render(makeFixture({ onValueChange: spy }));
      await user.click(screen.getByTestId("trigger-a"));
      expect(spy).toHaveBeenCalledWith(["a"]);
    });

    it("calls onValueChange with [] when collapsible item is closed", async () => {
      const spy = vi.fn();
      render(makeFixture({ defaultValue: ["a"], collapsible: true, onValueChange: spy }));
      await user.click(screen.getByTestId("trigger-a"));
      expect(spy).toHaveBeenCalledWith([]);
    });
  });

  describe("forceMount", () => {
    it("forceMount keeps closed content in DOM", () => {
      const Fixture = defineComponent({
        components: { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionContent },
        template: `
          <AccordionRoot>
            <AccordionItem value="a">
              <AccordionHeader><AccordionTrigger data-testid="trigger-a">A</AccordionTrigger></AccordionHeader>
              <AccordionContent :force-mount="true" data-testid="content-a">Content A</AccordionContent>
            </AccordionItem>
          </AccordionRoot>
        `,
      });
      render(Fixture);
      expect(screen.getByTestId("content-a")).toBeInTheDocument();
      expect(screen.getByTestId("content-a")).toHaveAttribute("data-state", "closed");
    });

    it("forceMount content shows data-state=open when opened", async () => {
      const Fixture = defineComponent({
        components: { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionContent },
        template: `
          <AccordionRoot>
            <AccordionItem value="a">
              <AccordionHeader><AccordionTrigger data-testid="trigger-a">A</AccordionTrigger></AccordionHeader>
              <AccordionContent :force-mount="true" data-testid="content-a">Content A</AccordionContent>
            </AccordionItem>
          </AccordionRoot>
        `,
      });
      render(Fixture);
      await user.click(screen.getByTestId("trigger-a"));
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
      expect(document.querySelector('[data-forge-scope="accordion"][data-forge-part="root"]')).toBeInTheDocument();
    });

    it("item has data-forge-scope=accordion and data-forge-part=item", () => {
      render(makeFixture());
      const items = document.querySelectorAll('[data-forge-scope="accordion"][data-forge-part="item"]');
      expect(items.length).toBe(2);
    });

    it("item has data-state=closed by default", () => {
      render(makeFixture());
      const item = document.querySelector('[data-forge-part="item"]');
      expect(item).toHaveAttribute("data-state", "closed");
    });

    it("item has data-state=open when expanded", () => {
      render(makeFixture({ defaultValue: ["a"] }));
      expect(document.querySelector('[data-forge-part="item"][data-state="open"]')).toBeInTheDocument();
    });

    it("header has data-forge-scope=accordion and data-forge-part=header", () => {
      render(makeFixture());
      expect(document.querySelector('[data-forge-scope="accordion"][data-forge-part="header"]')).toBeInTheDocument();
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
