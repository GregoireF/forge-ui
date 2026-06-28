import userEvent from "@testing-library/user-event";
import { cleanup, render, screen } from "@testing-library/vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { useSwitch } from "../src/components/switch/use-switch.js";

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeSwitchFixture(opts: Parameters<typeof useSwitch>[0] = {}) {
  return defineComponent({
    setup() {
      return useSwitch({ id: "test", ...opts });
    },
    template: `
      <div v-bind="getRootProps()">
        <button v-bind="getControlProps()" data-testid="control">
          <span v-bind="getThumbProps()" data-testid="thumb" />
        </button>
        <label v-bind="getLabelProps()" data-testid="label">Toggle</label>
      </div>
    `,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useSwitch (Vue)", () => {
  const user = userEvent.setup();

  describe("rendering", () => {
    it("renders off by default", () => {
      render(makeSwitchFixture());
      const control = screen.getByTestId("control");
      expect(control).toHaveAttribute("role", "switch");
      expect(control).toHaveAttribute("aria-checked", "false");
      expect(control).toHaveAttribute("data-state", "off");
    });

    it("renders on with defaultChecked=true", () => {
      render(makeSwitchFixture({ defaultChecked: true }));
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "true");
      expect(screen.getByTestId("control")).toHaveAttribute("data-state", "on");
    });

    it("Label associated with Control via htmlFor", () => {
      render(makeSwitchFixture());
      const label = screen.getByTestId("label") as HTMLLabelElement;
      const control = screen.getByTestId("control") as HTMLButtonElement;
      expect(label.htmlFor).toBe(control.id);
    });

    it("Thumb renders data-state", () => {
      render(makeSwitchFixture({ defaultChecked: true }));
      expect(screen.getByTestId("thumb")).toHaveAttribute("data-state", "on");
    });
  });

  describe("interaction", () => {
    it("toggles on click: off → on → off", async () => {
      render(makeSwitchFixture());
      const control = screen.getByTestId("control");
      await user.click(control);
      expect(control).toHaveAttribute("aria-checked", "true");
      await user.click(control);
      expect(control).toHaveAttribute("aria-checked", "false");
    });

    it("does not toggle when disabled", async () => {
      render(makeSwitchFixture({ disabled: true }));
      await user.click(screen.getByTestId("control"));
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("callbacks", () => {
    it("calls onCheckedChange on toggle", async () => {
      const spy = vi.fn();
      render(makeSwitchFixture({ onCheckedChange: spy }));
      await user.click(screen.getByTestId("control"));
      expect(spy).toHaveBeenCalledWith(true);
      await user.click(screen.getByTestId("control"));
      expect(spy).toHaveBeenCalledWith(false);
    });
  });

  describe("controlled mode", () => {
    it("reflects controlled checked=true", () => {
      render(makeSwitchFixture({ checked: true }));
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "true");
    });

    it("reflects controlled checked=false", () => {
      render(makeSwitchFixture({ checked: false }));
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "false");
    });
  });
});
