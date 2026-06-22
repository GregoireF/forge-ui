import { cleanup, fireEvent, render, screen } from "@testing-library/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "../src/components/tooltip/Tooltip.js";

// ---------------------------------------------------------------------------
// Tooltip — Vue
// ---------------------------------------------------------------------------

afterEach(cleanup);

function TestTooltip(opts: {
  openDelay?: number;
  closeDelay?: number;
  interactive?: boolean;
  disabled?: boolean;
  closeOnPointerDown?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  return defineComponent({
    render() {
      return h(
        TooltipRoot,
        {
          openDelay: opts.openDelay ?? 0,
          closeDelay: opts.closeDelay ?? 0,
          ...(opts.interactive !== undefined && { interactive: opts.interactive }),
          ...(opts.disabled !== undefined && { disabled: opts.disabled }),
          ...(opts.closeOnPointerDown !== undefined && {
            closeOnPointerDown: opts.closeOnPointerDown,
          }),
          ...(opts.open !== undefined && { open: opts.open }),
          ...(opts.onOpenChange !== undefined && { onOpenChange: opts.onOpenChange }),
        },
        {
          default: () => [
            h(TooltipTrigger, { "data-testid": "trigger" }, () => "Hover me"),
            h(
              TooltipPortal,
              {},
              {
                default: () =>
                  h(TooltipContent, { "data-testid": "content" }, () => "Tooltip text"),
              },
            ),
          ],
        },
      );
    },
  });
}

describe("Tooltip (Vue)", () => {
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
      render(TestTooltip());
      expect(screen.getByTestId("trigger")).toBeInTheDocument();
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("trigger has aria-describedby attribute", () => {
      render(TestTooltip());
      const trigger = screen.getByTestId("trigger");
      expect(trigger.getAttribute("aria-describedby")).toBeTruthy();
    });

    it("content has role='tooltip' when open", async () => {
      render(TestTooltip({ open: true }));
      await nextTick();
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    it("trigger aria-describedby matches content id", async () => {
      render(TestTooltip({ open: true }));
      await nextTick();
      const trigger = screen.getByTestId("trigger");
      const content = screen.getByRole("tooltip");
      expect(trigger.getAttribute("aria-describedby")).toBe(content.id);
    });
  });

  // -------------------------------------------------------------------------
  // Open / close interactions
  // -------------------------------------------------------------------------

  describe("interactions", () => {
    it("opens after openDelay on pointer enter", async () => {
      render(TestTooltip({ openDelay: 200 }));
      const trigger = screen.getByTestId("trigger");

      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

      vi.advanceTimersByTime(200);
      await nextTick();

      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    it("does not open on touch pointer enter", async () => {
      render(TestTooltip({ openDelay: 0 }));
      const trigger = screen.getByTestId("trigger");

      fireEvent.pointerEnter(trigger, { pointerType: "touch" });
      vi.advanceTimersByTime(0);
      await nextTick();

      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("closes after closeDelay on pointer leave", async () => {
      render(TestTooltip({ openDelay: 0, closeDelay: 150 }));
      const trigger = screen.getByTestId("trigger");

      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      vi.advanceTimersByTime(0);
      await nextTick();
      expect(screen.getByRole("tooltip")).toBeInTheDocument();

      fireEvent.pointerLeave(trigger);
      vi.advanceTimersByTime(150);
      await nextTick();

      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("opens on focus, closes on blur", async () => {
      render(TestTooltip({ openDelay: 0, closeDelay: 0 }));
      const trigger = screen.getByTestId("trigger");

      fireEvent.focus(trigger);
      vi.advanceTimersByTime(0);
      await nextTick();
      expect(screen.getByRole("tooltip")).toBeInTheDocument();

      fireEvent.blur(trigger);
      vi.advanceTimersByTime(0);
      await nextTick();
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("closes on Escape keydown when open", async () => {
      render(TestTooltip({ openDelay: 0, closeDelay: 0 }));
      const trigger = screen.getByTestId("trigger");

      fireEvent.focus(trigger);
      vi.advanceTimersByTime(0);
      await nextTick();
      expect(screen.getByRole("tooltip")).toBeInTheDocument();

      fireEvent.keyDown(trigger, { key: "Escape" });
      await nextTick();
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("closeOnPointerDown closes the tooltip", async () => {
      render(TestTooltip({ openDelay: 0, closeDelay: 0, closeOnPointerDown: true }));
      const trigger = screen.getByTestId("trigger");

      fireEvent.focus(trigger);
      vi.advanceTimersByTime(0);
      await nextTick();
      expect(screen.getByRole("tooltip")).toBeInTheDocument();

      fireEvent.pointerDown(trigger);
      await nextTick();
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("does not open when disabled", async () => {
      render(TestTooltip({ openDelay: 0, disabled: true }));
      const trigger = screen.getByTestId("trigger");

      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      vi.advanceTimersByTime(0);
      await nextTick();
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("pointer leave cancels a pending open", async () => {
      render(TestTooltip({ openDelay: 300 }));
      const trigger = screen.getByTestId("trigger");

      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      fireEvent.pointerLeave(trigger);
      vi.advanceTimersByTime(300);
      await nextTick();

      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Interactive tooltip
  // -------------------------------------------------------------------------

  describe("interactive", () => {
    it("stays open when pointer moves from trigger to content", async () => {
      render(TestTooltip({ openDelay: 0, closeDelay: 100, interactive: true }));
      const trigger = screen.getByTestId("trigger");

      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
      vi.advanceTimersByTime(0);
      await nextTick();
      expect(screen.getByRole("tooltip")).toBeInTheDocument();

      fireEvent.pointerLeave(trigger);
      const content = screen.getByTestId("content");
      fireEvent.pointerEnter(content, { pointerType: "mouse" });

      vi.advanceTimersByTime(100);
      await nextTick();
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Controlled mode
  // -------------------------------------------------------------------------

  describe("controlled", () => {
    it("open=true renders tooltip without interaction", async () => {
      render(TestTooltip({ open: true }));
      await nextTick();
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    it("open=false keeps tooltip closed", () => {
      render(TestTooltip({ open: false }));
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Callbacks
  // -------------------------------------------------------------------------

  describe("callbacks", () => {
    it("onOpenChange fires with true when tooltip opens", async () => {
      const onOpenChange = vi.fn();
      render(TestTooltip({ openDelay: 0, onOpenChange }));
      const trigger = screen.getByTestId("trigger");

      fireEvent.focus(trigger);
      vi.advanceTimersByTime(0);
      await nextTick();

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("onOpenChange fires with false when tooltip closes", async () => {
      const onOpenChange = vi.fn();
      render(TestTooltip({ openDelay: 0, closeDelay: 0, onOpenChange }));
      const trigger = screen.getByTestId("trigger");

      fireEvent.focus(trigger);
      vi.advanceTimersByTime(0);
      await nextTick();

      fireEvent.blur(trigger);
      vi.advanceTimersByTime(0);
      await nextTick();

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  // -------------------------------------------------------------------------
  // Provider — skip delay
  // -------------------------------------------------------------------------

  describe("Provider", () => {
    it("skips openDelay when a tooltip just closed (skipDelay)", async () => {
      render(
        defineComponent({
          render() {
            return h(
              TooltipProvider,
              { openDelay: 500, closeDelay: 0, skipDelay: 1000 },
              {
                default: () => [
                  h(
                    TooltipRoot,
                    { openDelay: 500, closeDelay: 0 },
                    {
                      default: () => [
                        h(TooltipTrigger, { "data-testid": "trigger-a" }, () => "A"),
                        h(TooltipPortal, {}, {
                          default: () => h(TooltipContent, { "data-testid": "content-a" }, () => "Tip A"),
                        }),
                      ],
                    },
                  ),
                  h(
                    TooltipRoot,
                    {},
                    {
                      default: () => [
                        h(TooltipTrigger, { "data-testid": "trigger-b" }, () => "B"),
                        h(TooltipPortal, {}, {
                          default: () => h(TooltipContent, { "data-testid": "content-b" }, () => "Tip B"),
                        }),
                      ],
                    },
                  ),
                ],
              },
            );
          },
        }),
      );

      // Open A — 500ms delay from Provider
      fireEvent.pointerEnter(screen.getByTestId("trigger-a"), { pointerType: "mouse" });
      vi.advanceTimersByTime(500);
      await nextTick();
      expect(screen.getByTestId("content-a")).toBeInTheDocument();

      // Close A — notifyClose sets lastClosedAtRef
      fireEvent.pointerLeave(screen.getByTestId("trigger-a"));
      vi.advanceTimersByTime(0);
      await nextTick();
      expect(screen.queryByTestId("content-a")).not.toBeInTheDocument();

      // Open B immediately — isInQuickSuccession=true → delay=0
      fireEvent.pointerEnter(screen.getByTestId("trigger-b"), { pointerType: "mouse" });
      vi.advanceTimersByTime(0);
      await nextTick();
      expect(screen.getByTestId("content-b")).toBeInTheDocument();
    });

    it("Provider provides openDelay override to child Roots", async () => {
      render(
        defineComponent({
          render() {
            return h(
              TooltipProvider,
              { openDelay: 200, closeDelay: 0, skipDelay: 1000 },
              {
                default: () =>
                  h(
                    TooltipRoot,
                    {},
                    {
                      default: () => [
                        h(TooltipTrigger, { "data-testid": "trigger" }, () => "A"),
                        h(
                          TooltipPortal,
                          {},
                          {
                            default: () =>
                              h(
                                TooltipContent,
                                { "data-testid": "content" },
                                () => "Tip",
                              ),
                          },
                        ),
                      ],
                    },
                  ),
              },
            );
          },
        }),
      );

      const trigger = screen.getByTestId("trigger");
      fireEvent.pointerEnter(trigger, { pointerType: "mouse" });

      vi.advanceTimersByTime(100);
      await nextTick();
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

      vi.advanceTimersByTime(100);
      await nextTick();
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
  });
});
