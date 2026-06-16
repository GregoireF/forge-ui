import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Popover } from "../src/components/popover/Popover.js";
import { usePopover } from "../src/components/popover/use-popover.js";

// ---------------------------------------------------------------------------
// Test component — headless hook
// ---------------------------------------------------------------------------
function PopoverFixture({
  onOpenChange,
  onEscapeKeyDown,
}: {
  onOpenChange?: (open: boolean) => void;
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
} = {}) {
  const api = usePopover({ id: "test-pop", onOpenChange, onEscapeKeyDown });
  return (
    <div>
      <button {...api.getTriggerProps()} data-testid="trigger">
        Open
      </button>
      {api.isOpen && (
        <div {...api.getContentProps()} data-testid="content">
          <h2 {...api.getTitleProps()}>Popover Title</h2>
          <p {...api.getDescriptionProps()}>Popover body.</p>
          <button {...api.getCloseProps()} data-testid="close-btn">
            Close
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("usePopover (React)", () => {
  const user = userEvent.setup();

  describe("rendering", () => {
    it("renders closed by default", () => {
      render(<PopoverFixture />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("opens on trigger click", async () => {
      render(<PopoverFixture />);
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("closes on Close button click", async () => {
      render(<PopoverFixture />);
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByTestId("close-btn"));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("toggles on repeated trigger clicks", async () => {
      render(<PopoverFixture />);
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      await user.click(screen.getByTestId("trigger"));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("ARIA", () => {
    it("trigger has aria-haspopup=dialog", () => {
      render(<PopoverFixture />);
      expect(screen.getByTestId("trigger")).toHaveAttribute("aria-haspopup", "dialog");
    });

    it("trigger aria-expanded reflects open state", async () => {
      render(<PopoverFixture />);
      expect(screen.getByTestId("trigger")).toHaveAttribute("aria-expanded", "false");
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("trigger")).toHaveAttribute("aria-expanded", "true");
    });

    it("trigger aria-controls points to content id", async () => {
      render(<PopoverFixture />);
      await user.click(screen.getByTestId("trigger"));
      const triggerId = screen.getByTestId("trigger").getAttribute("aria-controls");
      expect(screen.getByRole("dialog").id).toBe(triggerId);
    });

    it("content has role=dialog", async () => {
      render(<PopoverFixture />);
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("content")).toHaveAttribute("role", "dialog");
    });

    it("content has data-forge-scope=popover", async () => {
      render(<PopoverFixture />);
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("content")).toHaveAttribute("data-forge-scope", "popover");
    });

    it("content has data-state=open when open", async () => {
      render(<PopoverFixture />);
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("content")).toHaveAttribute("data-state", "open");
    });

    it("adds aria-labelledby once Title mounts (compound)", async () => {
      render(
        <Popover.Root id="aria-test">
          <Popover.Trigger data-testid="trig">Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Title>Labelled</Popover.Title>
            <Popover.Description>Body.</Popover.Description>
          </Popover.Content>
        </Popover.Root>,
      );
      await user.click(screen.getByTestId("trig"));
      const content = screen.getByRole("dialog");
      const titleId = screen.getByRole("heading").id;
      expect(content).toHaveAttribute("aria-labelledby", titleId);
    });
  });

  describe("keyboard", () => {
    it("Escape closes the popover", async () => {
      render(<PopoverFixture />);
      await user.click(screen.getByTestId("trigger"));
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("fires onEscapeKeyDown callback", async () => {
      const onEscapeKeyDown = vi.fn();
      render(<PopoverFixture onEscapeKeyDown={onEscapeKeyDown} />);
      await user.click(screen.getByTestId("trigger"));
      await user.keyboard("{Escape}");
      expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  describe("callbacks", () => {
    it("fires onOpenChange(true) on open", async () => {
      const onOpenChange = vi.fn();
      render(<PopoverFixture onOpenChange={onOpenChange} />);
      await user.click(screen.getByTestId("trigger"));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("fires onOpenChange(false) on close", async () => {
      const onOpenChange = vi.fn();
      render(<PopoverFixture onOpenChange={onOpenChange} />);
      await user.click(screen.getByTestId("trigger"));
      onOpenChange.mockClear();
      await user.click(screen.getByTestId("close-btn"));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("Popover compound components", () => {
    it("opens and closes via compound Close", async () => {
      render(
        <Popover.Root id="cmp-test">
          <Popover.Trigger data-testid="trig">Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Title>Info</Popover.Title>
            <Popover.Description>More detail here.</Popover.Description>
            <Popover.Close data-testid="close">Close</Popover.Close>
          </Popover.Content>
        </Popover.Root>,
      );
      await user.click(screen.getByTestId("trig"));
      expect(screen.getByRole("dialog", { name: "Info" })).toBeInTheDocument();
      await user.click(screen.getByTestId("close"));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("Escape closes the compound popover", async () => {
      render(
        <Popover.Root id="cmp-escape">
          <Popover.Trigger data-testid="trig">Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Title>Info</Popover.Title>
            <Popover.Description>Detail.</Popover.Description>
            <Popover.Close data-testid="close">Close</Popover.Close>
          </Popover.Content>
        </Popover.Root>,
      );
      await user.click(screen.getByTestId("trig"));
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("forceMount keeps content in DOM when closed", () => {
      render(
        <Popover.Root id="cmp-force">
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content forceMount data-testid="content">
            <Popover.Title>Info</Popover.Title>
            <Popover.Description>Detail.</Popover.Description>
          </Popover.Content>
        </Popover.Root>,
      );
      // Closed but forceMount — aria-hidden, not queryable as dialog role.
      const content = screen.getByTestId("content");
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("controlled state", () => {
    it("respects open=true prop", () => {
      render(
        <Popover.Root id="ctrl" open>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Title>Ctrl</Popover.Title>
            <Popover.Description>Body.</Popover.Description>
          </Popover.Content>
        </Popover.Root>,
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("respects open=false prop", () => {
      render(
        <Popover.Root id="ctrl-closed" open={false}>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Title>Ctrl</Popover.Title>
            <Popover.Description>Body.</Popover.Description>
          </Popover.Content>
        </Popover.Root>,
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
