import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tooltip } from "../src/components/tooltip/Tooltip.js";

// ---------------------------------------------------------------------------
// Tooltip — React
// ---------------------------------------------------------------------------

function TestTooltip({
  openDelay = 0,
  closeDelay = 0,
  interactive = false,
  disabled = false,
  closeOnPointerDown = true,
  open,
  onOpenChange,
}: {
  openDelay?: number;
  closeDelay?: number;
  interactive?: boolean;
  disabled?: boolean;
  closeOnPointerDown?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  return (
    <Tooltip.Root
      openDelay={openDelay}
      closeDelay={closeDelay}
      interactive={interactive}
      disabled={disabled}
      closeOnPointerDown={closeOnPointerDown}
      {...(open !== undefined && { open })}
      {...(onOpenChange !== undefined && { onOpenChange })}
    >
      <Tooltip.Trigger data-testid="trigger">Hover me</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content data-testid="content">Tooltip text</Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

describe("Tooltip (React)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  describe("rendering", () => {
    it("trigger is rendered, content is not in DOM when closed", () => {
      render(<TestTooltip />);
      expect(screen.getByTestId("trigger")).toBeInTheDocument();
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("trigger has aria-describedby pointing to content id", () => {
      render(<TestTooltip />);
      const trigger = screen.getByTestId("trigger");
      const describedBy = trigger.getAttribute("aria-describedby");
      expect(describedBy).toBeTruthy();
    });

    it("content has role='tooltip'", () => {
      render(<TestTooltip open />);
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    it("trigger aria-describedby matches content id", () => {
      render(<TestTooltip open />);
      const trigger = screen.getByTestId("trigger");
      const content = screen.getByRole("tooltip");
      expect(trigger.getAttribute("aria-describedby")).toBe(content.id);
    });
  });

  // -------------------------------------------------------------------------
  // Open / close interactions
  // -------------------------------------------------------------------------

  describe("interactions", () => {
    it("opens after openDelay on pointer enter", () => {
      render(<TestTooltip openDelay={200} />);
      const trigger = screen.getByTestId("trigger");

      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    it("does not open on touch pointer enter", () => {
      render(<TestTooltip openDelay={0} />);
      const trigger = screen.getByTestId("trigger");

      fireEvent.pointerEnter(trigger, { pointerType: "touch" });
      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("closes after closeDelay on pointer leave", () => {
      render(<TestTooltip openDelay={0} closeDelay={150} />);
      const trigger = screen.getByTestId("trigger");

      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      act(() => {
        vi.advanceTimersByTime(0);
      });
      expect(screen.getByRole("tooltip")).toBeInTheDocument();

      fireEvent.pointerLeave(trigger);
      expect(screen.getByRole("tooltip")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("opens on focus, closes on blur", () => {
      render(<TestTooltip openDelay={0} closeDelay={0} />);
      const trigger = screen.getByTestId("trigger");

      fireEvent.focus(trigger);
      act(() => {
        vi.advanceTimersByTime(0);
      });
      expect(screen.getByRole("tooltip")).toBeInTheDocument();

      fireEvent.blur(trigger);
      act(() => {
        vi.advanceTimersByTime(0);
      });
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("closes on Escape keydown when open", () => {
      render(<TestTooltip openDelay={0} closeDelay={0} />);
      const trigger = screen.getByTestId("trigger");

      fireEvent.focus(trigger);
      act(() => {
        vi.advanceTimersByTime(0);
      });
      expect(screen.getByRole("tooltip")).toBeInTheDocument();

      fireEvent.keyDown(trigger, { key: "Escape" });
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("closeOnPointerDown closes the tooltip", () => {
      render(<TestTooltip openDelay={0} closeDelay={0} closeOnPointerDown />);
      const trigger = screen.getByTestId("trigger");

      fireEvent.focus(trigger);
      act(() => {
        vi.advanceTimersByTime(0);
      });
      expect(screen.getByRole("tooltip")).toBeInTheDocument();

      fireEvent.pointerDown(trigger);
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("does not open when disabled", () => {
      render(<TestTooltip openDelay={0} disabled />);
      const trigger = screen.getByTestId("trigger");

      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      act(() => {
        vi.advanceTimersByTime(0);
      });
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("pointer leave cancels a pending open", () => {
      render(<TestTooltip openDelay={300} closeDelay={0} />);
      const trigger = screen.getByTestId("trigger");

      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      fireEvent.pointerLeave(trigger);

      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Interactive tooltip
  // -------------------------------------------------------------------------

  describe("interactive", () => {
    it("stays open when pointer moves from trigger to content", () => {
      render(<TestTooltip openDelay={0} closeDelay={100} interactive />);
      const trigger = screen.getByTestId("trigger");

      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      act(() => {
        vi.advanceTimersByTime(0);
      });
      expect(screen.getByRole("tooltip")).toBeInTheDocument();

      fireEvent.pointerLeave(trigger);
      const content = screen.getByTestId("content");
      fireEvent.pointerEnter(content, { pointerType: "mouse" });

      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Controlled mode
  // -------------------------------------------------------------------------

  describe("controlled", () => {
    it("open=true renders tooltip without interaction", () => {
      render(<TestTooltip open />);
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    it("open=false keeps tooltip closed", () => {
      render(<TestTooltip open={false} />);
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Callbacks
  // -------------------------------------------------------------------------

  describe("callbacks", () => {
    it("onOpenChange fires with true when tooltip opens", () => {
      const onOpenChange = vi.fn();
      render(<TestTooltip openDelay={0} onOpenChange={onOpenChange} />);

      fireEvent.pointerEnter(screen.getByTestId("trigger"), { pointerType: "mouse" });
      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("onOpenChange fires with false when tooltip closes", () => {
      const onOpenChange = vi.fn();
      render(<TestTooltip openDelay={0} closeDelay={0} onOpenChange={onOpenChange} />);
      const trigger = screen.getByTestId("trigger");

      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      act(() => {
        vi.advanceTimersByTime(0);
      });

      fireEvent.pointerLeave(trigger);
      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  // -------------------------------------------------------------------------
  // Provider — skip delay
  // -------------------------------------------------------------------------

  describe("Provider", () => {
    it("skips openDelay when a tooltip just closed (skipDelay)", () => {
      // Both tooltips share the same Provider — lastClosedAtRef is shared.
      render(
        <Tooltip.Provider openDelay={500} closeDelay={0} skipDelay={1000}>
          <Tooltip.Root openDelay={500} closeDelay={0}>
            <Tooltip.Trigger data-testid="trigger-a">A</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content data-testid="content-a">Tip A</Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
          <Tooltip.Root>
            <Tooltip.Trigger data-testid="trigger-b">B</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content data-testid="content-b">Tip B</Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>,
      );

      // Open A (500ms delay from Provider)
      fireEvent.pointerEnter(screen.getByTestId("trigger-a"), { pointerType: "mouse" });
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.getByTestId("content-a")).toBeInTheDocument();

      // Close A (0ms delay) — notifyClose sets lastClosedAtRef
      fireEvent.pointerLeave(screen.getByTestId("trigger-a"));
      act(() => {
        vi.advanceTimersByTime(0);
      });
      expect(screen.queryByTestId("content-a")).not.toBeInTheDocument();

      // Open B immediately — isInQuickSuccession returns true → delay=0
      fireEvent.pointerEnter(screen.getByTestId("trigger-b"), { pointerType: "mouse" });
      act(() => {
        vi.advanceTimersByTime(0);
      });
      expect(screen.getByTestId("content-b")).toBeInTheDocument();
    });
  });
});
