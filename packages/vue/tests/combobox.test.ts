import { cleanup, fireEvent, render, screen } from "@testing-library/vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";
import { useCombobox } from "../src/components/combobox/use-combobox.js";

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "grape", label: "Grape", disabled: true },
];

function makeComboboxFixture(opts: Partial<Parameters<typeof useCombobox>[0]> = {}) {
  return defineComponent({
    setup() {
      return useCombobox({ id: "test", ...opts });
    },
    template: `
      <div>
        <label v-bind="getLabelProps()" data-testid="label">Fruit</label>
        <input v-bind="getInputProps()" data-testid="input" />
        <button v-bind="getTriggerProps()" data-testid="trigger">▾</button>
        <ul v-if="isOpen" v-bind="getContentProps()" data-testid="content">
          <li
            v-for="opt in getFilteredOptions()"
            :key="opt.value"
            v-bind="getOptionProps({ value: opt.value, disabled: opt.disabled })"
            :data-testid="'item-' + opt.value"
          >{{ opt.label }}</li>
        </ul>
      </div>
    `,
  });
}

// Register options in a fixture that pre-populates the machine option list.
// In real usage, Combobox.Item calls REGISTER_OPTION on mount. Here we send them manually.
function makeComboboxWithOptions(opts: Partial<Parameters<typeof useCombobox>[0]> = {}) {
  return defineComponent({
    setup() {
      const api = useCombobox({ id: "test", ...opts });
      // Pre-register options synchronously so tests don't need to wait for mount.
      for (const f of fruits) {
        api.send({ type: "REGISTER_OPTION", option: f });
      }
      return api;
    },
    template: `
      <div>
        <label v-bind="getLabelProps()" data-testid="label">Fruit</label>
        <input v-bind="getInputProps()" data-testid="input" />
        <button v-bind="getTriggerProps()" data-testid="trigger">▾</button>
        <ul v-if="isOpen" v-bind="getContentProps()" data-testid="content">
          <li
            v-for="opt in getFilteredOptions()"
            :key="opt.value"
            v-bind="getOptionProps({ value: opt.value, disabled: opt.disabled })"
            :data-testid="'item-' + opt.value"
          >{{ opt.label }}</li>
        </ul>
      </div>
    `,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useCombobox (Vue)", () => {
  describe("accessibility", () => {
    it("input has role=combobox", () => {
      render(makeComboboxFixture());
      expect(screen.getByTestId("input")).toHaveAttribute("role", "combobox");
    });

    it("input has aria-expanded=false when closed", () => {
      render(makeComboboxFixture());
      expect(screen.getByTestId("input")).toHaveAttribute("aria-expanded", "false");
    });

    it("input has aria-controls pointing to listbox", () => {
      render(makeComboboxFixture());
      expect(screen.getByTestId("input").getAttribute("aria-controls")).toBeTruthy();
    });

    it("label htmlFor matches input id", () => {
      render(makeComboboxFixture());
      const input = screen.getByTestId("input");
      const label = screen.getByTestId("label") as HTMLLabelElement;
      expect(label.htmlFor).toBe(input.id);
    });
  });

  describe("open / close", () => {
    it("opens on trigger click", async () => {
      render(makeComboboxFixture());
      await fireEvent.click(screen.getByTestId("trigger"));
      await nextTick();
      expect(screen.getByTestId("input")).toHaveAttribute("aria-expanded", "true");
    });

    it("listbox absent when closed", () => {
      render(makeComboboxFixture());
      expect(screen.queryByTestId("content")).toBeNull();
    });

    it("opens when input value changes", async () => {
      render(makeComboboxFixture());
      await fireEvent.input(screen.getByTestId("input"), { target: { value: "ap" } });
      await nextTick();
      expect(screen.getByTestId("input")).toHaveAttribute("aria-expanded", "true");
    });

    it("closes on Escape", async () => {
      render(makeComboboxFixture());
      await fireEvent.click(screen.getByTestId("trigger"));
      await nextTick();
      await fireEvent.keyDown(screen.getByTestId("input"), { key: "Escape" });
      await nextTick();
      expect(screen.getByTestId("input")).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("client-side filtering", () => {
    it("filters options by input text (case-insensitive)", async () => {
      render(makeComboboxWithOptions());
      await fireEvent.input(screen.getByTestId("input"), { target: { value: "an" } });
      await nextTick();
      // "Banana" contains "an". "Apple", "Cherry", "Grape" do not.
      expect(screen.getByTestId("item-banana")).toBeInTheDocument();
      expect(screen.queryByTestId("item-apple")).toBeNull();
    });
  });

  describe("selection", () => {
    it("selects item on click", async () => {
      const onValueChange = vi.fn();
      render(makeComboboxWithOptions({ onValueChange }));
      await fireEvent.click(screen.getByTestId("trigger"));
      await nextTick();
      await fireEvent.click(screen.getByTestId("item-apple"));
      await nextTick();
      expect(onValueChange).toHaveBeenCalledWith(["apple"]);
    });

    it("sets input to selected label after single-select", async () => {
      render(makeComboboxWithOptions());
      await fireEvent.click(screen.getByTestId("trigger"));
      await nextTick();
      await fireEvent.click(screen.getByTestId("item-apple"));
      await nextTick();
      expect(screen.getByTestId("input")).toHaveValue("Apple");
    });
  });

  describe("keyboard navigation", () => {
    it("ArrowDown highlights first option", async () => {
      render(makeComboboxWithOptions());
      await fireEvent.click(screen.getByTestId("trigger"));
      await nextTick();
      await fireEvent.keyDown(screen.getByTestId("input"), { key: "ArrowDown" });
      await nextTick();
      expect(screen.getByTestId("item-apple")).toHaveAttribute("data-highlighted", "");
    });
  });

  describe("async mode", () => {
    it("calls onInputChange when typing", async () => {
      const onInputChange = vi.fn();
      render(makeComboboxFixture({ onInputChange }));
      await fireEvent.input(screen.getByTestId("input"), { target: { value: "ap" } });
      await nextTick();
      expect(onInputChange).toHaveBeenCalledWith("ap");
    });
  });
});
