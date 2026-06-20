import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { HoverCard } from "../src/components/hover-card/HoverCard.js";
import { useHoverCard } from "../src/components/hover-card/use-hover-card.js";

// ---------------------------------------------------------------------------
// Hook fixture
// ---------------------------------------------------------------------------
function HoverCardHookFixture({
  onOpenChange,
  openDelay = 0,
  closeDelay = 0,
}: {
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
} = {}) {
  const api = useHoverCard({ id: "test-hc", openDelay, closeDelay, onOpenChange });
  return (
    <div>
      <a {...api.getTriggerProps()} data-testid="trigger" href="#">
        Hover me
      </a>
      {api.isOpen && (
        <div {...api.getContentProps()} data-testid="content">
          Card content
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// useHoverCard
// ---------------------------------------------------------------------------
describe("useHoverCard (React)", () => {
  const user = userEvent.setup();

  describe("static attributes", () => {
    it("content is absent by default", () => {
      render(<HoverCardHookFixture />);
      expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    });

    it("trigger has data-state=closed when closed", () => {
      render(<HoverCardHookFixture />);
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-state", "closed");
    });

    it("trigger has data-forge-scope=hover-card", () => {
      render(<HoverCardHookFixture />);
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-forge-scope", "hover-card");
    });

    it("trigger has data-forge-part=trigger", () => {
      render(<HoverCardHookFixture />);
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-forge-part", "trigger");
    });

    it("trigger has aria-haspopup=dialog", () => {
      render(<HoverCardHookFixture />);
      expect(screen.getByTestId("trigger")).toHaveAttribute("aria-haspopup", "dialog");
    });

    it("trigger has aria-expanded=false when closed", () => {
      render(<HoverCardHookFixture />);
      expect(screen.getByTestId("trigger")).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("interactions", () => {
    it("opens on mouse enter", async () => {
      render(<HoverCardHookFixture />);
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() => expect(screen.getByTestId("content")).toBeInTheDocument());
    });

    it("trigger has data-state=open when open", async () => {
      render(<HoverCardHookFixture />);
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() =>
        expect(screen.getByTestId("trigger")).toHaveAttribute("data-state", "open"),
      );
    });

    it("trigger has aria-expanded=true when open", async () => {
      render(<HoverCardHookFixture />);
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() =>
        expect(screen.getByTestId("trigger")).toHaveAttribute("aria-expanded", "true"),
      );
    });

    it("closes on mouse leave", async () => {
      render(<HoverCardHookFixture />);
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() => expect(screen.getByTestId("content")).toBeInTheDocument());
      await user.unhover(screen.getByTestId("trigger"));
      await waitFor(() => expect(screen.queryByTestId("content")).not.toBeInTheDocument());
    });

    it("calls onOpenChange(true) on open", async () => {
      const onOpenChange = vi.fn();
      render(<HoverCardHookFixture onOpenChange={onOpenChange} />);
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
    });

    it("calls onOpenChange(false) on close", async () => {
      const onOpenChange = vi.fn();
      render(<HoverCardHookFixture onOpenChange={onOpenChange} />);
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
      onOpenChange.mockClear();
      await user.unhover(screen.getByTestId("trigger"));
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    });

    it("content has role=dialog", async () => {
      render(<HoverCardHookFixture />);
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    });
  });
});

// ---------------------------------------------------------------------------
// HoverCard compound
// ---------------------------------------------------------------------------
describe("HoverCard compound (React)", () => {
  const user = userEvent.setup();

  describe("static attributes", () => {
    it("Trigger renders as <a> by default", () => {
      render(
        <HoverCard.Root id="trigger-tag" openDelay={0}>
          <HoverCard.Trigger data-testid="trigger">Hover me</HoverCard.Trigger>
        </HoverCard.Root>,
      );
      expect(screen.getByTestId("trigger").tagName).toBe("A");
    });

    it("Trigger asChild renders consumer element with forge props", () => {
      render(
        <HoverCard.Root id="aschild" openDelay={0}>
          <HoverCard.Trigger asChild>
            <button data-testid="btn-trigger" type="button">
              Hover me
            </button>
          </HoverCard.Trigger>
        </HoverCard.Root>,
      );
      const btn = screen.getByTestId("btn-trigger");
      expect(btn.tagName).toBe("BUTTON");
      expect(btn).toHaveAttribute("data-forge-part", "trigger");
      expect(btn).toHaveAttribute("data-forge-scope", "hover-card");
    });
  });

  describe("open / close", () => {
    it("opens on trigger hover", async () => {
      render(
        <HoverCard.Root id="compound-open" openDelay={0} closeDelay={0}>
          <HoverCard.Trigger data-testid="trigger">Hover me</HoverCard.Trigger>
          <HoverCard.Content data-testid="content">Card content</HoverCard.Content>
        </HoverCard.Root>,
      );
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() => expect(screen.getByTestId("content")).toBeInTheDocument());
    });

    it("closes on unhover", async () => {
      render(
        <HoverCard.Root id="compound-close" openDelay={0} closeDelay={0}>
          <HoverCard.Trigger data-testid="trigger">Hover me</HoverCard.Trigger>
          <HoverCard.Content data-testid="content">Card content</HoverCard.Content>
        </HoverCard.Root>,
      );
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() => expect(screen.getByTestId("content")).toBeInTheDocument());
      await user.unhover(screen.getByTestId("trigger"));
      await waitFor(() => expect(screen.queryByTestId("content")).not.toBeInTheDocument());
    });

    it("Content has role=dialog when open", async () => {
      render(
        <HoverCard.Root id="compound-role" openDelay={0} closeDelay={0}>
          <HoverCard.Trigger data-testid="trigger">Hover me</HoverCard.Trigger>
          <HoverCard.Content>Card content</HoverCard.Content>
        </HoverCard.Root>,
      );
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    });

    it("stays open when hovering over Content", async () => {
      render(
        <HoverCard.Root id="content-hover" openDelay={0} closeDelay={200}>
          <HoverCard.Trigger data-testid="trigger">Hover me</HoverCard.Trigger>
          <HoverCard.Content forceMount data-testid="content">
            <a href="#">link</a>
          </HoverCard.Content>
        </HoverCard.Root>,
      );
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() =>
        expect(screen.getByTestId("content")).toHaveAttribute("data-state", "open"),
      );
      await user.hover(screen.getByTestId("content"));
      await new Promise((r) => setTimeout(r, 50));
      expect(screen.getByTestId("content")).toHaveAttribute("data-state", "open");
    });
  });

  describe("forceMount", () => {
    it("Content stays in DOM when closed", () => {
      render(
        <HoverCard.Root id="fm" openDelay={0}>
          <HoverCard.Trigger data-testid="trigger">Hover me</HoverCard.Trigger>
          <HoverCard.Content forceMount data-testid="content">
            Card
          </HoverCard.Content>
        </HoverCard.Root>,
      );
      expect(screen.getByTestId("content")).toBeInTheDocument();
      expect(screen.getByTestId("content")).toHaveAttribute("data-state", "closed");
    });

    it("Content data-state becomes open on hover", async () => {
      render(
        <HoverCard.Root id="fm-open" openDelay={0}>
          <HoverCard.Trigger data-testid="trigger">Hover me</HoverCard.Trigger>
          <HoverCard.Content forceMount data-testid="content">
            Card
          </HoverCard.Content>
        </HoverCard.Root>,
      );
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() =>
        expect(screen.getByTestId("content")).toHaveAttribute("data-state", "open"),
      );
    });
  });
});
