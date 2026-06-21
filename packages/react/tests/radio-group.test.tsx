import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup } from "../src/components/radio-group/RadioGroup.js";

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

interface FixtureOptions {
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  orientation?: "horizontal" | "vertical";
  onValueChange?: (v: string) => void;
}

function makeFixture(opts: FixtureOptions = {}) {
  return (
    <RadioGroup.Root {...opts}>
      <RadioGroup.Item value="a">
        <RadioGroup.Radio data-testid="radio-a" />
        <RadioGroup.Label data-testid="label-a">Option A</RadioGroup.Label>
      </RadioGroup.Item>
      <RadioGroup.Item value="b">
        <RadioGroup.Radio data-testid="radio-b" />
        <RadioGroup.Label data-testid="label-b">Option B</RadioGroup.Label>
      </RadioGroup.Item>
    </RadioGroup.Root>
  );
}

// ---------------------------------------------------------------------------
// RadioGroup — React
// ---------------------------------------------------------------------------

describe("RadioGroup (React)", () => {
  const user = userEvent.setup();

  describe("rendering", () => {
    it("renders all radio items unchecked by default", () => {
      render(makeFixture());
      expect(screen.getByTestId("radio-a")).toHaveAttribute("aria-checked", "false");
      expect(screen.getByTestId("radio-b")).toHaveAttribute("aria-checked", "false");
    });

    it("renders with defaultValue selected", () => {
      render(makeFixture({ defaultValue: "a" }));
      expect(screen.getByTestId("radio-a")).toHaveAttribute("aria-checked", "true");
      expect(screen.getByTestId("radio-b")).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("interaction", () => {
    it("selects radio on click", async () => {
      render(makeFixture());
      await user.click(screen.getByTestId("radio-a"));
      expect(screen.getByTestId("radio-a")).toHaveAttribute("aria-checked", "true");
    });

    it("switching selection deselects previous", async () => {
      render(makeFixture({ defaultValue: "a" }));
      await user.click(screen.getByTestId("radio-b"));
      expect(screen.getByTestId("radio-a")).toHaveAttribute("aria-checked", "false");
      expect(screen.getByTestId("radio-b")).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("keyboard", () => {
    it("selects on Space", () => {
      render(makeFixture());
      fireEvent.keyDown(screen.getByTestId("radio-a"), { key: " " });
      expect(screen.getByTestId("radio-a")).toHaveAttribute("aria-checked", "true");
    });

    it("selects on Enter", () => {
      render(makeFixture());
      fireEvent.keyDown(screen.getByTestId("radio-a"), { key: "Enter" });
      expect(screen.getByTestId("radio-a")).toHaveAttribute("aria-checked", "true");
    });

    it("ArrowDown moves focus to next radio AND selects it", () => {
      render(makeFixture({ defaultValue: "a" }));
      const radioA = screen.getByTestId("radio-a");
      radioA.focus();
      fireEvent.keyDown(radioA, { key: "ArrowDown" });
      expect(document.activeElement).toBe(screen.getByTestId("radio-b"));
      expect(screen.getByTestId("radio-b")).toHaveAttribute("aria-checked", "true");
      expect(screen.getByTestId("radio-a")).toHaveAttribute("aria-checked", "false");
    });

    it("ArrowUp moves focus to previous radio AND selects it", () => {
      render(makeFixture({ defaultValue: "b" }));
      const radioB = screen.getByTestId("radio-b");
      radioB.focus();
      fireEvent.keyDown(radioB, { key: "ArrowUp" });
      expect(document.activeElement).toBe(screen.getByTestId("radio-a"));
      expect(screen.getByTestId("radio-a")).toHaveAttribute("aria-checked", "true");
    });

    it("ArrowRight also moves focus to next radio", () => {
      render(makeFixture({ defaultValue: "a" }));
      const radioA = screen.getByTestId("radio-a");
      radioA.focus();
      fireEvent.keyDown(radioA, { key: "ArrowRight" });
      expect(document.activeElement).toBe(screen.getByTestId("radio-b"));
    });

    it("ArrowDown wraps from last to first", () => {
      render(makeFixture({ defaultValue: "b" }));
      const radioB = screen.getByTestId("radio-b");
      radioB.focus();
      fireEvent.keyDown(radioB, { key: "ArrowDown" });
      expect(document.activeElement).toBe(screen.getByTestId("radio-a"));
    });
  });

  describe("disabled", () => {
    it("disabled group: clicking does not select", async () => {
      render(makeFixture({ disabled: true }));
      await user.click(screen.getByTestId("radio-a"));
      expect(screen.getByTestId("radio-a")).toHaveAttribute("aria-checked", "false");
    });

    it("disabled group: radios have aria-disabled", () => {
      render(makeFixture({ disabled: true }));
      expect(screen.getByTestId("radio-a")).toHaveAttribute("aria-disabled", "true");
    });

    it("item-level disabled: only that item is blocked", async () => {
      render(
        <RadioGroup.Root>
          <RadioGroup.Item value="a" disabled>
            <RadioGroup.Radio data-testid="radio-a" />
          </RadioGroup.Item>
          <RadioGroup.Item value="b">
            <RadioGroup.Radio data-testid="radio-b" />
          </RadioGroup.Item>
        </RadioGroup.Root>,
      );
      await user.click(screen.getByTestId("radio-a"));
      await user.click(screen.getByTestId("radio-b"));
      expect(screen.getByTestId("radio-a")).toHaveAttribute("aria-checked", "false");
      expect(screen.getByTestId("radio-b")).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("callbacks", () => {
    it("calls onValueChange when selected", async () => {
      const spy = vi.fn();
      render(makeFixture({ onValueChange: spy }));
      await user.click(screen.getByTestId("radio-a"));
      expect(spy).toHaveBeenCalledWith("a");
    });
  });

  describe("controlled mode", () => {
    it("reflects controlled value prop", () => {
      const { rerender } = render(makeFixture({ value: "a" }));
      expect(screen.getByTestId("radio-a")).toHaveAttribute("aria-checked", "true");
      rerender(makeFixture({ value: "b" }));
      expect(screen.getByTestId("radio-a")).toHaveAttribute("aria-checked", "false");
      expect(screen.getByTestId("radio-b")).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("ARIA", () => {
    it("root has role=radiogroup", () => {
      render(makeFixture());
      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    });

    it("radios have role=radio", () => {
      render(makeFixture());
      const radios = screen.getAllByRole("radio");
      expect(radios.length).toBe(2);
    });

    it("selected radio has tabIndex=0, others -1", () => {
      render(makeFixture({ defaultValue: "a" }));
      expect(screen.getByTestId("radio-a")).toHaveAttribute("tabindex", "0");
      expect(screen.getByTestId("radio-b")).toHaveAttribute("tabindex", "-1");
    });

    it("label has htmlFor pointing to radio id", () => {
      render(makeFixture({ defaultValue: "a" }));
      const label = screen.getByTestId("label-a") as HTMLLabelElement;
      const radioId = screen.getByTestId("radio-a").getAttribute("id");
      expect(label.htmlFor).toBe(radioId);
    });
  });

  describe("form", () => {
    it("renders hidden input when name is set", () => {
      render(
        <RadioGroup.Root name="color">
          <RadioGroup.Item value="red">
            <RadioGroup.Radio />
            <RadioGroup.HiddenInput />
          </RadioGroup.Item>
        </RadioGroup.Root>,
      );
      const input = document.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(input).not.toBeNull();
      expect(input.name).toBe("color");
      expect(input.value).toBe("red");
    });

    it("does not render hidden input when no name", () => {
      render(
        <RadioGroup.Root>
          <RadioGroup.Item value="red">
            <RadioGroup.Radio />
            <RadioGroup.HiddenInput />
          </RadioGroup.Item>
        </RadioGroup.Root>,
      );
      expect(document.querySelector('input[type="radio"]')).toBeNull();
    });
  });

  describe("CSS contract", () => {
    it("root has data-forge-scope=radio-group and data-forge-part=root", () => {
      render(makeFixture());
      expect(document.querySelector('[data-forge-scope="radio-group"][data-forge-part="root"]')).toBeInTheDocument();
    });

    it("item has data-forge-scope=radio-group and data-forge-part=item", () => {
      render(makeFixture());
      const items = document.querySelectorAll('[data-forge-scope="radio-group"][data-forge-part="item"]');
      expect(items.length).toBe(2);
    });

    it("radio has data-forge-scope=radio-group and data-forge-part=radio", () => {
      render(makeFixture());
      expect(screen.getByTestId("radio-a")).toHaveAttribute("data-forge-scope", "radio-group");
      expect(screen.getByTestId("radio-a")).toHaveAttribute("data-forge-part", "radio");
    });

    it("radio data-state=checked when selected", () => {
      render(makeFixture({ defaultValue: "a" }));
      expect(screen.getByTestId("radio-a")).toHaveAttribute("data-state", "checked");
      expect(screen.getByTestId("radio-b")).toHaveAttribute("data-state", "unchecked");
    });
  });
});
