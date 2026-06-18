import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "../src/components/checkbox/Checkbox.js";

// ---------------------------------------------------------------------------
// Checkbox — React
// ---------------------------------------------------------------------------

describe("Checkbox (React)", () => {
  describe("rendering", () => {
    it("renders unchecked by default", () => {
      render(
        <Checkbox.Root>
          <Checkbox.Control data-testid="control">
            <Checkbox.Indicator />
          </Checkbox.Control>
        </Checkbox.Root>,
      );
      const control = screen.getByTestId("control");
      expect(control).toHaveAttribute("aria-checked", "false");
      expect(control).toHaveAttribute("data-state", "unchecked");
    });

    it("renders checked with defaultChecked=true", () => {
      render(
        <Checkbox.Root defaultChecked>
          <Checkbox.Control data-testid="control" />
        </Checkbox.Root>,
      );
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "true");
      expect(screen.getByTestId("control")).toHaveAttribute("data-state", "checked");
    });

    it("renders indeterminate with defaultChecked='indeterminate'", () => {
      render(
        <Checkbox.Root defaultChecked="indeterminate">
          <Checkbox.Control data-testid="control" />
        </Checkbox.Root>,
      );
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "mixed");
      expect(screen.getByTestId("control")).toHaveAttribute("data-state", "indeterminate");
    });

    it("renders Label associated to Control via htmlFor", () => {
      render(
        <Checkbox.Root>
          <Checkbox.Control data-testid="control" />
          <Checkbox.Label data-testid="label">Accept</Checkbox.Label>
        </Checkbox.Root>,
      );
      const label = screen.getByTestId("label") as HTMLLabelElement;
      const control = screen.getByTestId("control") as HTMLButtonElement;
      expect(label.htmlFor).toBe(control.id);
    });

    it("renders Indicator only when checked", () => {
      const { rerender } = render(
        <Checkbox.Root checked={false}>
          <Checkbox.Control />
          <Checkbox.Indicator data-testid="indicator">✓</Checkbox.Indicator>
        </Checkbox.Root>,
      );
      expect(screen.queryByTestId("indicator")).toBeNull();

      rerender(
        <Checkbox.Root checked={true}>
          <Checkbox.Control />
          <Checkbox.Indicator data-testid="indicator">✓</Checkbox.Indicator>
        </Checkbox.Root>,
      );
      expect(screen.getByTestId("indicator")).toBeInTheDocument();
    });

    it("renders Indicator when indeterminate", () => {
      render(
        <Checkbox.Root defaultChecked="indeterminate">
          <Checkbox.Control />
          <Checkbox.Indicator data-testid="indicator">—</Checkbox.Indicator>
        </Checkbox.Root>,
      );
      expect(screen.getByTestId("indicator")).toBeInTheDocument();
    });

    it("forceMount renders Indicator even when unchecked", () => {
      render(
        <Checkbox.Root>
          <Checkbox.Control />
          <Checkbox.Indicator forceMount data-testid="indicator" />
        </Checkbox.Root>,
      );
      expect(screen.getByTestId("indicator")).toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    it("toggles on click", () => {
      render(
        <Checkbox.Root>
          <Checkbox.Control data-testid="control" />
        </Checkbox.Root>,
      );
      const control = screen.getByTestId("control");
      expect(control).toHaveAttribute("aria-checked", "false");
      fireEvent.click(control);
      expect(control).toHaveAttribute("aria-checked", "true");
      fireEvent.click(control);
      expect(control).toHaveAttribute("aria-checked", "false");
    });

    it("toggles on Space key", () => {
      render(
        <Checkbox.Root>
          <Checkbox.Control data-testid="control" />
        </Checkbox.Root>,
      );
      const control = screen.getByTestId("control");
      fireEvent.click(control);
      expect(control).toHaveAttribute("aria-checked", "true");
    });

    it("goes from indeterminate to checked on toggle", () => {
      render(
        <Checkbox.Root defaultChecked="indeterminate">
          <Checkbox.Control data-testid="control" />
        </Checkbox.Root>,
      );
      fireEvent.click(screen.getByTestId("control"));
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "true");
    });

    it("does not toggle when disabled", () => {
      render(
        <Checkbox.Root disabled>
          <Checkbox.Control data-testid="control" />
        </Checkbox.Root>,
      );
      fireEvent.click(screen.getByTestId("control"));
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("callbacks", () => {
    it("calls onCheckedChange on toggle", () => {
      const spy = vi.fn();
      render(
        <Checkbox.Root onCheckedChange={spy}>
          <Checkbox.Control data-testid="control" />
        </Checkbox.Root>,
      );
      fireEvent.click(screen.getByTestId("control"));
      expect(spy).toHaveBeenCalledWith(true);
      fireEvent.click(screen.getByTestId("control"));
      expect(spy).toHaveBeenCalledWith(false);
    });
  });

  describe("controlled mode", () => {
    it("reflects controlled checked prop", () => {
      const { rerender } = render(
        <Checkbox.Root checked={false}>
          <Checkbox.Control data-testid="control" />
        </Checkbox.Root>,
      );
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "false");
      rerender(
        <Checkbox.Root checked={true}>
          <Checkbox.Control data-testid="control" />
        </Checkbox.Root>,
      );
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "true");
    });

    it("reflects controlled indeterminate", () => {
      const { rerender } = render(
        <Checkbox.Root checked="indeterminate">
          <Checkbox.Control data-testid="control" />
        </Checkbox.Root>,
      );
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "mixed");
      rerender(
        <Checkbox.Root checked={true}>
          <Checkbox.Control data-testid="control" />
        </Checkbox.Root>,
      );
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("form", () => {
    it("renders hidden input when name is set", () => {
      render(
        <Checkbox.Root name="terms" value="1">
          <Checkbox.Control />
        </Checkbox.Root>,
      );
      const input = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(input).not.toBeNull();
      expect(input.name).toBe("terms");
      expect(input.value).toBe("1");
    });

    it("hidden input is checked when checkbox is checked", () => {
      render(
        <Checkbox.Root name="terms" defaultChecked>
          <Checkbox.Control />
        </Checkbox.Root>,
      );
      const input = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(input.checked).toBe(true);
    });

    it("does not render hidden input when no name", () => {
      render(
        <Checkbox.Root>
          <Checkbox.Control />
        </Checkbox.Root>,
      );
      expect(document.querySelector('input[type="checkbox"]')).toBeNull();
    });
  });

  describe("ARIA", () => {
    it("control has role=checkbox", () => {
      render(
        <Checkbox.Root>
          <Checkbox.Control data-testid="control" />
        </Checkbox.Root>,
      );
      expect(screen.getByTestId("control")).toHaveAttribute("role", "checkbox");
    });

    it("disabled control has tabIndex=-1", () => {
      render(
        <Checkbox.Root disabled>
          <Checkbox.Control data-testid="control" />
        </Checkbox.Root>,
      );
      expect(screen.getByTestId("control")).toHaveAttribute("tabindex", "-1");
    });
  });

  describe("Group", () => {
    it("renders a group with multiple items", () => {
      render(
        <Checkbox.Group defaultValue={["a"]}>
          <Checkbox.Root value="a">
            <Checkbox.Control data-testid="a" />
          </Checkbox.Root>
          <Checkbox.Root value="b">
            <Checkbox.Control data-testid="b" />
          </Checkbox.Root>
        </Checkbox.Group>,
      );
      expect(screen.getByTestId("a")).toHaveAttribute("aria-checked", "true");
      expect(screen.getByTestId("b")).toHaveAttribute("aria-checked", "false");
    });

    it("GroupAll shows indeterminate when some items are checked", () => {
      render(
        <Checkbox.Group defaultValue={["a"]}>
          <Checkbox.GroupAll>
            <Checkbox.Control data-testid="all" />
          </Checkbox.GroupAll>
          <Checkbox.Root value="a">
            <Checkbox.Control data-testid="a" />
          </Checkbox.Root>
          <Checkbox.Root value="b">
            <Checkbox.Control data-testid="b" />
          </Checkbox.Root>
        </Checkbox.Group>,
      );
      expect(screen.getByTestId("all")).toHaveAttribute("aria-checked", "mixed");
    });

    it("GroupAll checks all when clicked while indeterminate", () => {
      render(
        <Checkbox.Group defaultValue={["a"]}>
          <Checkbox.GroupAll>
            <Checkbox.Control data-testid="all" />
          </Checkbox.GroupAll>
          <Checkbox.Root value="a">
            <Checkbox.Control data-testid="a" />
          </Checkbox.Root>
          <Checkbox.Root value="b">
            <Checkbox.Control data-testid="b" />
          </Checkbox.Root>
        </Checkbox.Group>,
      );
      fireEvent.click(screen.getByTestId("all"));
      expect(screen.getByTestId("a")).toHaveAttribute("aria-checked", "true");
      expect(screen.getByTestId("b")).toHaveAttribute("aria-checked", "true");
      expect(screen.getByTestId("all")).toHaveAttribute("aria-checked", "true");
    });

    it("GroupAll unchecks all when clicked while all checked", () => {
      render(
        <Checkbox.Group defaultValue={["a", "b"]}>
          <Checkbox.GroupAll>
            <Checkbox.Control data-testid="all" />
          </Checkbox.GroupAll>
          <Checkbox.Root value="a">
            <Checkbox.Control data-testid="a" />
          </Checkbox.Root>
          <Checkbox.Root value="b">
            <Checkbox.Control data-testid="b" />
          </Checkbox.Root>
        </Checkbox.Group>,
      );
      expect(screen.getByTestId("all")).toHaveAttribute("aria-checked", "true");
      fireEvent.click(screen.getByTestId("all"));
      expect(screen.getByTestId("a")).toHaveAttribute("aria-checked", "false");
      expect(screen.getByTestId("b")).toHaveAttribute("aria-checked", "false");
    });
  });
});
