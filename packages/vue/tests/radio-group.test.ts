import userEvent from "@testing-library/user-event";
import { cleanup, fireEvent, render, screen } from "@testing-library/vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";
import { RadioGroup } from "../src/components/radio-group/RadioGroup.js";

const {
  Root: RadioGroupRoot,
  Item: RadioGroupItem,
  Radio: RadioGroupRadio,
  Label: RadioGroupLabel,
  HiddenInput: RadioGroupHiddenInput,
} = RadioGroup;

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

interface FixtureOptions {
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  name?: string;
  onValueChange?: (v: string) => void;
}

function makeFixture(opts: FixtureOptions = {}) {
  return defineComponent({
    components: { RadioGroupRoot, RadioGroupItem, RadioGroupRadio, RadioGroupLabel },
    setup: () => ({ opts }),
    template: `
      <RadioGroupRoot v-bind="opts">
        <RadioGroupItem value="a">
          <RadioGroupRadio data-testid="radio-a" />
          <RadioGroupLabel data-testid="label-a">Option A</RadioGroupLabel>
        </RadioGroupItem>
        <RadioGroupItem value="b">
          <RadioGroupRadio data-testid="radio-b" />
          <RadioGroupLabel data-testid="label-b">Option B</RadioGroupLabel>
        </RadioGroupItem>
      </RadioGroupRoot>
    `,
  });
}

// ---------------------------------------------------------------------------
// RadioGroup — Vue
// ---------------------------------------------------------------------------

describe("RadioGroup (Vue)", () => {
  const user = userEvent.setup();

  describe("rendering", () => {
    it("all radios unchecked by default", () => {
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
    it("selects on Space", async () => {
      render(makeFixture());
      const radio = screen.getByTestId("radio-a");
      radio.focus();
      await user.keyboard(" ");
      expect(radio).toHaveAttribute("aria-checked", "true");
    });

    it("selects on Enter", async () => {
      render(makeFixture());
      const radio = screen.getByTestId("radio-a");
      radio.focus();
      await user.keyboard("{Enter}");
      expect(radio).toHaveAttribute("aria-checked", "true");
    });

    it("ArrowDown moves focus to next radio AND selects it", async () => {
      render(makeFixture({ defaultValue: "a" }));
      const radioA = screen.getByTestId("radio-a");
      radioA.focus();
      fireEvent.keyDown(radioA, { key: "ArrowDown" });
      expect(document.activeElement).toBe(screen.getByTestId("radio-b"));
      await nextTick();
      expect(screen.getByTestId("radio-b")).toHaveAttribute("aria-checked", "true");
      expect(screen.getByTestId("radio-a")).toHaveAttribute("aria-checked", "false");
    });

    it("ArrowUp moves focus to previous radio AND selects it", async () => {
      render(makeFixture({ defaultValue: "b" }));
      const radioB = screen.getByTestId("radio-b");
      radioB.focus();
      fireEvent.keyDown(radioB, { key: "ArrowUp" });
      expect(document.activeElement).toBe(screen.getByTestId("radio-a"));
      await nextTick();
      expect(screen.getByTestId("radio-a")).toHaveAttribute("aria-checked", "true");
    });

    it("ArrowRight also moves to next radio", () => {
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
      const Fixture = defineComponent({
        components: { RadioGroupRoot, RadioGroupItem, RadioGroupRadio },
        template: `
          <RadioGroupRoot>
            <RadioGroupItem value="a" :disabled="true">
              <RadioGroupRadio data-testid="radio-a" />
            </RadioGroupItem>
            <RadioGroupItem value="b">
              <RadioGroupRadio data-testid="radio-b" />
            </RadioGroupItem>
          </RadioGroupRoot>
        `,
      });
      render(Fixture);
      await user.click(screen.getByTestId("radio-a"));
      expect(screen.getByTestId("radio-a")).toHaveAttribute("aria-checked", "false");
      await user.click(screen.getByTestId("radio-b"));
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
      render(makeFixture({ value: "b" }));
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
      expect(screen.getAllByRole("radio").length).toBe(2);
    });

    it("selected radio has tabIndex=0, others -1", () => {
      render(makeFixture({ defaultValue: "a" }));
      expect(screen.getByTestId("radio-a")).toHaveAttribute("tabindex", "0");
      expect(screen.getByTestId("radio-b")).toHaveAttribute("tabindex", "-1");
    });

    it("label for attribute points to radio id", () => {
      render(makeFixture());
      const label = screen.getByTestId("label-a") as HTMLLabelElement;
      const radioId = screen.getByTestId("radio-a").getAttribute("id");
      expect(label.getAttribute("for")).toBe(radioId);
    });
  });

  describe("form", () => {
    it("renders hidden input when name is set", () => {
      const Fixture = defineComponent({
        components: { RadioGroupRoot, RadioGroupItem, RadioGroupRadio, RadioGroupHiddenInput },
        template: `
          <RadioGroupRoot name="color">
            <RadioGroupItem value="red">
              <RadioGroupRadio />
              <RadioGroupHiddenInput />
            </RadioGroupItem>
          </RadioGroupRoot>
        `,
      });
      render(Fixture);
      const input = document.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(input).not.toBeNull();
      expect(input.name).toBe("color");
      expect(input.value).toBe("red");
    });

    it("does not render hidden input when no name", () => {
      const Fixture = defineComponent({
        components: { RadioGroupRoot, RadioGroupItem, RadioGroupRadio, RadioGroupHiddenInput },
        template: `
          <RadioGroupRoot>
            <RadioGroupItem value="red">
              <RadioGroupRadio />
              <RadioGroupHiddenInput />
            </RadioGroupItem>
          </RadioGroupRoot>
        `,
      });
      render(Fixture);
      expect(document.querySelector('input[type="radio"]')).toBeNull();
    });
  });

  describe("CSS contract", () => {
    it("root has data-forge-scope=radio-group and data-forge-part=root", () => {
      render(makeFixture());
      expect(
        document.querySelector('[data-forge-scope="radio-group"][data-forge-part="root"]'),
      ).toBeInTheDocument();
    });

    it("item has data-forge-scope=radio-group and data-forge-part=item", () => {
      render(makeFixture());
      const items = document.querySelectorAll(
        '[data-forge-scope="radio-group"][data-forge-part="item"]',
      );
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
