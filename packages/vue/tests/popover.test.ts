import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { Popover } from "../src/components/popover/Popover.js";
import { usePopover } from "../src/components/popover/use-popover.js";

// ---------------------------------------------------------------------------
// Test component — headless hook
// ---------------------------------------------------------------------------
function makePopoverFixture(
  props: {
    onOpenChange?: (open: boolean) => void;
    onEscapeKeyDown?: (e: KeyboardEvent) => void;
  } = {},
) {
  return defineComponent({
    setup() {
      return usePopover({ id: "test-pop", ...props });
    },
    template: `
      <div>
        <button v-bind="getTriggerProps()" data-testid="trigger">Open</button>
        <template v-if="isOpen">
          <div v-bind="getContentProps()" data-testid="content">
            <h2 v-bind="getTitleProps()">Popover Title</h2>
            <p v-bind="getDescriptionProps()">Popover body.</p>
            <button v-bind="getCloseProps()" data-testid="close-btn">Close</button>
          </div>
        </template>
      </div>
    `,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
const {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: PopoverClose,
} = Popover;

describe("usePopover (Vue)", () => {
  const user = userEvent.setup();

  describe("rendering", () => {
    it("renders closed by default", () => {
      render(makePopoverFixture());
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("opens on trigger click", async () => {
      render(makePopoverFixture());
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("closes on Close button click", async () => {
      render(makePopoverFixture());
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByTestId("close-btn"));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("toggles on repeated trigger clicks", async () => {
      render(makePopoverFixture());
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      await user.click(screen.getByTestId("trigger"));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("ARIA", () => {
    it("trigger has aria-haspopup=dialog", () => {
      render(makePopoverFixture());
      expect(screen.getByTestId("trigger")).toHaveAttribute("aria-haspopup", "dialog");
    });

    it("trigger aria-expanded reflects open state", async () => {
      render(makePopoverFixture());
      expect(screen.getByTestId("trigger")).toHaveAttribute("aria-expanded", "false");
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("trigger")).toHaveAttribute("aria-expanded", "true");
    });

    it("trigger aria-controls points to content id", async () => {
      render(makePopoverFixture());
      await user.click(screen.getByTestId("trigger"));
      const triggerId = screen.getByTestId("trigger").getAttribute("aria-controls");
      expect(screen.getByRole("dialog").id).toBe(triggerId);
    });

    it("content has role=dialog", async () => {
      render(makePopoverFixture());
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("content")).toHaveAttribute("role", "dialog");
    });

    it("content has data-forge-scope=popover", async () => {
      render(makePopoverFixture());
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("content")).toHaveAttribute("data-forge-scope", "popover");
    });

    it("content has data-state=open when open", async () => {
      render(makePopoverFixture());
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("content")).toHaveAttribute("data-state", "open");
    });
  });

  describe("keyboard", () => {
    it("Escape closes the popover", async () => {
      render(makePopoverFixture());
      await user.click(screen.getByTestId("trigger"));
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("fires onEscapeKeyDown callback", async () => {
      const onEscapeKeyDown = vi.fn();
      render(makePopoverFixture({ onEscapeKeyDown }));
      await user.click(screen.getByTestId("trigger"));
      await user.keyboard("{Escape}");
      expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  describe("callbacks", () => {
    it("fires onOpenChange(true) on open", async () => {
      const onOpenChange = vi.fn();
      render(makePopoverFixture({ onOpenChange }));
      await user.click(screen.getByTestId("trigger"));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("fires onOpenChange(false) on close", async () => {
      const onOpenChange = vi.fn();
      render(makePopoverFixture({ onOpenChange }));
      await user.click(screen.getByTestId("trigger"));
      onOpenChange.mockClear();
      await user.click(screen.getByTestId("close-btn"));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("Popover compound components", () => {
    it("opens and closes via compound Close", async () => {
      const Fixture = defineComponent({
        components: { PopoverRoot, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose },
        template: `
          <PopoverRoot id="vue-cmp">
            <PopoverTrigger data-testid="trig">Open</PopoverTrigger>
            <PopoverContent>
              <PopoverTitle>Info</PopoverTitle>
              <PopoverDescription>More detail here.</PopoverDescription>
              <PopoverClose data-testid="close">Close</PopoverClose>
            </PopoverContent>
          </PopoverRoot>
        `,
      });
      render(Fixture);
      await user.click(screen.getByTestId("trig"));
      expect(screen.getByRole("dialog", { name: "Info" })).toBeInTheDocument();
      await user.click(screen.getByTestId("close"));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("Escape closes the compound popover", async () => {
      const Fixture = defineComponent({
        components: { PopoverRoot, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose },
        template: `
          <PopoverRoot id="vue-escape">
            <PopoverTrigger data-testid="trig">Open</PopoverTrigger>
            <PopoverContent>
              <PopoverTitle>Info</PopoverTitle>
              <PopoverDescription>Detail.</PopoverDescription>
              <PopoverClose data-testid="close">Close</PopoverClose>
            </PopoverContent>
          </PopoverRoot>
        `,
      });
      render(Fixture);
      await user.click(screen.getByTestId("trig"));
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("forceMount keeps content in DOM when closed", () => {
      const Fixture = defineComponent({
        components: { PopoverRoot, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription },
        template: `
          <PopoverRoot id="vue-force">
            <PopoverTrigger>Open</PopoverTrigger>
            <PopoverContent :force-mount="true" data-testid="content">
              <PopoverTitle>Info</PopoverTitle>
              <PopoverDescription>Detail.</PopoverDescription>
            </PopoverContent>
          </PopoverRoot>
        `,
      });
      render(Fixture);
      const content = screen.getByTestId("content");
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("controlled state", () => {
    it("respects :open=true prop", () => {
      const Fixture = defineComponent({
        components: { PopoverRoot, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription },
        template: `
          <PopoverRoot id="vue-ctrl" :open="true">
            <PopoverTrigger>Open</PopoverTrigger>
            <PopoverContent>
              <PopoverTitle>Ctrl</PopoverTitle>
              <PopoverDescription>Body.</PopoverDescription>
            </PopoverContent>
          </PopoverRoot>
        `,
      });
      render(Fixture);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("respects :open=false prop", () => {
      const Fixture = defineComponent({
        components: { PopoverRoot, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription },
        template: `
          <PopoverRoot id="vue-ctrl-closed" :open="false">
            <PopoverTrigger>Open</PopoverTrigger>
            <PopoverContent>
              <PopoverTitle>Ctrl</PopoverTitle>
              <PopoverDescription>Body.</PopoverDescription>
            </PopoverContent>
          </PopoverRoot>
        `,
      });
      render(Fixture);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
