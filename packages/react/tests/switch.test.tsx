import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "../src/components/switch/Switch.js";

// ---------------------------------------------------------------------------
// Switch — React
// ---------------------------------------------------------------------------

describe("Switch (React)", () => {
  describe("rendering", () => {
    it("renders off by default", () => {
      render(
        <Switch.Root>
          <Switch.Control data-testid="control">
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Root>,
      );
      const control = screen.getByTestId("control");
      expect(control).toHaveAttribute("role", "switch");
      expect(control).toHaveAttribute("aria-checked", "false");
      expect(control).toHaveAttribute("data-state", "off");
    });

    it("renders on with defaultChecked=true", () => {
      render(
        <Switch.Root defaultChecked>
          <Switch.Control data-testid="control" />
        </Switch.Root>,
      );
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "true");
      expect(screen.getByTestId("control")).toHaveAttribute("data-state", "on");
    });

    it("renders Label associated to Control via htmlFor", () => {
      render(
        <Switch.Root>
          <Switch.Control data-testid="control" />
          <Switch.Label data-testid="label">Notifications</Switch.Label>
        </Switch.Root>,
      );
      const label = screen.getByTestId("label") as HTMLLabelElement;
      const control = screen.getByTestId("control") as HTMLButtonElement;
      expect(label.htmlFor).toBe(control.id);
    });
  });

  describe("interaction", () => {
    it("toggles on click", () => {
      render(
        <Switch.Root>
          <Switch.Control data-testid="control" />
        </Switch.Root>,
      );
      fireEvent.click(screen.getByTestId("control"));
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "true");
      fireEvent.click(screen.getByTestId("control"));
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "false");
    });

    it("does not toggle when disabled", () => {
      render(
        <Switch.Root disabled>
          <Switch.Control data-testid="control" />
        </Switch.Root>,
      );
      fireEvent.click(screen.getByTestId("control"));
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("callbacks", () => {
    it("calls onCheckedChange on toggle", () => {
      const spy = vi.fn();
      render(
        <Switch.Root onCheckedChange={spy}>
          <Switch.Control data-testid="control" />
        </Switch.Root>,
      );
      fireEvent.click(screen.getByTestId("control"));
      expect(spy).toHaveBeenCalledWith(true);
    });
  });

  describe("controlled mode", () => {
    it("reflects controlled checked prop", () => {
      const { rerender } = render(
        <Switch.Root checked={false}>
          <Switch.Control data-testid="control" />
        </Switch.Root>,
      );
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "false");
      rerender(
        <Switch.Root checked={true}>
          <Switch.Control data-testid="control" />
        </Switch.Root>,
      );
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("form", () => {
    it("renders hidden input when name is set", () => {
      render(
        <Switch.Root name="notifications">
          <Switch.Control />
        </Switch.Root>,
      );
      const input = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(input).not.toBeNull();
      expect(input.name).toBe("notifications");
    });

    it("does not render hidden input without name", () => {
      render(
        <Switch.Root>
          <Switch.Control />
        </Switch.Root>,
      );
      expect(document.querySelector('input[type="checkbox"]')).toBeNull();
    });
  });
});
