import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { Collapsible } from "../src/components/collapsible/Collapsible.js";

const { Root: CollapsibleRoot, Trigger: CollapsibleTrigger, Content: CollapsibleContent } = Collapsible;

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Fixture factory
// ---------------------------------------------------------------------------

interface FixtureOptions {
  defaultOpen?: boolean;
  open?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function makeFixture(opts: FixtureOptions = {}) {
  return defineComponent({
    components: { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent },
    setup: () => ({ opts }),
    template: `
      <CollapsibleRoot v-bind="opts">
        <CollapsibleTrigger data-testid="trigger">Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">Content</CollapsibleContent>
      </CollapsibleRoot>
    `,
  });
}

// ---------------------------------------------------------------------------
// Collapsible — Vue
// ---------------------------------------------------------------------------

describe("Collapsible (Vue)", () => {
  const user = userEvent.setup();

  describe("rendering", () => {
    it("content is hidden by default", () => {
      render(makeFixture());
      expect(screen.queryByTestId("content")).toBeNull();
    });

    it("content is shown with defaultOpen=true", () => {
      render(makeFixture({ defaultOpen: true }));
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("trigger has aria-expanded=false when closed", () => {
      render(makeFixture());
      expect(screen.getByTestId("trigger")).toHaveAttribute("aria-expanded", "false");
    });

    it("trigger has aria-expanded=true when open", () => {
      render(makeFixture({ defaultOpen: true }));
      expect(screen.getByTestId("trigger")).toHaveAttribute("aria-expanded", "true");
    });

    it("trigger aria-controls points to content id", () => {
      render(makeFixture({ defaultOpen: true }));
      const trigger = screen.getByTestId("trigger");
      const contentId = trigger.getAttribute("aria-controls");
      expect(contentId).toBeTruthy();
      expect(document.getElementById(contentId!)).toBe(screen.getByTestId("content"));
    });
  });

  describe("interaction", () => {
    it("clicking trigger opens content", async () => {
      render(makeFixture());
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("clicking trigger again closes content", async () => {
      render(makeFixture({ defaultOpen: true }));
      await user.click(screen.getByTestId("trigger"));
      expect(screen.queryByTestId("content")).toBeNull();
    });
  });

  describe("keyboard", () => {
    it("Enter opens content", async () => {
      render(makeFixture());
      const trigger = screen.getByTestId("trigger");
      trigger.focus();
      await user.keyboard("{Enter}");
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("Space opens content", async () => {
      render(makeFixture());
      const trigger = screen.getByTestId("trigger");
      trigger.focus();
      await user.keyboard(" ");
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });
  });

  describe("disabled", () => {
    it("disabled: clicking trigger does nothing", async () => {
      render(makeFixture({ disabled: true }));
      await user.click(screen.getByTestId("trigger"));
      expect(screen.queryByTestId("content")).toBeNull();
    });

    it("disabled trigger has aria-disabled", () => {
      render(makeFixture({ disabled: true }));
      expect(screen.getByTestId("trigger")).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("callbacks", () => {
    it("calls onOpenChange(true) when opening", async () => {
      const spy = vi.fn();
      render(makeFixture({ onOpenChange: spy }));
      await user.click(screen.getByTestId("trigger"));
      expect(spy).toHaveBeenCalledWith(true);
    });

    it("calls onOpenChange(false) when closing", async () => {
      const spy = vi.fn();
      render(makeFixture({ defaultOpen: true, onOpenChange: spy }));
      await user.click(screen.getByTestId("trigger"));
      expect(spy).toHaveBeenCalledWith(false);
    });
  });

  describe("controlled mode", () => {
    it("controlled open=true renders content", () => {
      render(makeFixture({ open: true }));
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("controlled open=false hides content", () => {
      render(makeFixture({ open: false }));
      expect(screen.queryByTestId("content")).toBeNull();
    });
  });

  describe("forceMount", () => {
    it("forceMount keeps content in DOM when closed", () => {
      const Fixture = defineComponent({
        components: { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent },
        template: `
          <CollapsibleRoot>
            <CollapsibleTrigger data-testid="trigger">Toggle</CollapsibleTrigger>
            <CollapsibleContent :force-mount="true" data-testid="content">Content</CollapsibleContent>
          </CollapsibleRoot>
        `,
      });
      render(Fixture);
      expect(screen.getByTestId("content")).toBeInTheDocument();
      expect(screen.getByTestId("content")).toHaveAttribute("data-state", "closed");
    });

    it("forceMount open content has data-state=open", () => {
      const Fixture = defineComponent({
        components: { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent },
        template: `
          <CollapsibleRoot :default-open="true">
            <CollapsibleTrigger data-testid="trigger">Toggle</CollapsibleTrigger>
            <CollapsibleContent :force-mount="true" data-testid="content">Content</CollapsibleContent>
          </CollapsibleRoot>
        `,
      });
      render(Fixture);
      expect(screen.getByTestId("content")).toHaveAttribute("data-state", "open");
    });
  });

  describe("CSS contract", () => {
    it("root has data-forge-scope=collapsible and data-forge-part=root", () => {
      render(makeFixture());
      expect(
        document.querySelector('[data-forge-scope="collapsible"][data-forge-part="root"]'),
      ).toBeInTheDocument();
    });

    it("trigger has data-forge-scope=collapsible and data-forge-part=trigger", () => {
      render(makeFixture());
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-forge-scope", "collapsible");
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-forge-part", "trigger");
    });

    it("trigger data-state mirrors open state", async () => {
      render(makeFixture());
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-state", "closed");
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-state", "open");
    });

    it("content has data-forge-scope=collapsible and data-forge-part=content", () => {
      render(makeFixture({ defaultOpen: true }));
      expect(screen.getByTestId("content")).toHaveAttribute("data-forge-scope", "collapsible");
      expect(screen.getByTestId("content")).toHaveAttribute("data-forge-part", "content");
    });
  });
});
