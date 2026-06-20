import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Select } from "../src/components/select/Select.js";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeFixture({
  multiple = false,
  defaultValue,
  defaultLabel,
  onValueChange,
  disabled = false,
}: {
  multiple?: boolean;
  defaultValue?: string | string[];
  defaultLabel?: string | string[];
  onValueChange?: (v: string[]) => void;
  disabled?: boolean;
} = {}) {
  return (
    <Select.Root multiple={multiple} defaultValue={defaultValue} defaultLabel={defaultLabel} onValueChange={onValueChange} disabled={disabled}>
      <Select.Label>Fruit</Select.Label>
      <Select.Trigger data-testid="trigger">
        <Select.Value placeholder="Pick a fruit" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content data-testid="content">
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="banana">Banana</Select.Item>
          <Select.Item value="cherry" disabled>Cherry</Select.Item>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Select (React)", () => {
  const user = userEvent.setup();

  describe("rendering", () => {
    it("renders closed by default", () => {
      render(makeFixture());
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("trigger has combobox role and aria attrs", () => {
      render(makeFixture());
      const trigger = screen.getByTestId("trigger");
      expect(trigger).toHaveAttribute("role", "combobox");
      expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("shows placeholder when no value selected", () => {
      render(makeFixture());
      expect(screen.getByTestId("trigger")).toHaveTextContent("Pick a fruit");
    });

    it("opens on trigger click", async () => {
      render(makeFixture());
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("renders all options when open", async () => {
      render(makeFixture());
      await user.click(screen.getByTestId("trigger"));
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(3);
    });
  });

  describe("ARIA attributes", () => {
    it("sets aria-expanded=true when open", async () => {
      render(makeFixture());
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("trigger")).toHaveAttribute("aria-expanded", "true");
    });

    it("options have aria-selected=false by default", async () => {
      render(makeFixture());
      await user.click(screen.getByTestId("trigger"));
      const appleOption = screen.getByRole("option", { name: "Apple" });
      expect(appleOption).toHaveAttribute("aria-selected", "false");
    });

    it("disabled option has aria-disabled", async () => {
      render(makeFixture());
      await user.click(screen.getByTestId("trigger"));
      const cherry = screen.getByRole("option", { name: "Cherry" });
      expect(cherry).toHaveAttribute("aria-disabled", "true");
    });

    it("listbox has aria-labelledby pointing to label", async () => {
      render(makeFixture());
      await user.click(screen.getByTestId("trigger"));
      const listbox = screen.getByRole("listbox");
      expect(listbox).toHaveAttribute("aria-labelledby");
    });
  });

  describe("selection", () => {
    it("closes and shows selected value on option click", async () => {
      render(makeFixture());
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByRole("option", { name: "Apple" }));
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      expect(screen.getByTestId("trigger")).toHaveTextContent("Apple");
    });

    it("calls onValueChange with selected value", async () => {
      const onValueChange = vi.fn();
      render(makeFixture({ onValueChange }));
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByRole("option", { name: "Banana" }));
      expect(onValueChange).toHaveBeenCalledWith(["banana"]);
    });

    it("does not select disabled option", async () => {
      const onValueChange = vi.fn();
      render(makeFixture({ onValueChange }));
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByRole("option", { name: "Cherry" }));
      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("shows pre-selected value from defaultValue + defaultLabel", () => {
      render(makeFixture({ defaultValue: "banana", defaultLabel: "Banana" }));
      expect(screen.getByTestId("trigger")).toHaveTextContent("Banana");
    });

    it("marks pre-selected option as aria-selected=true", async () => {
      render(makeFixture({ defaultValue: "apple", defaultLabel: "Apple" }));
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("option", { name: "Banana" })).toHaveAttribute("aria-selected", "false");
    });
  });

  describe("keyboard navigation", () => {
    it("opens on ArrowDown key", async () => {
      render(makeFixture());
      screen.getByTestId("trigger").focus();
      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("opens on Space key", async () => {
      render(makeFixture());
      screen.getByTestId("trigger").focus();
      await user.keyboard(" ");
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("closes on Escape when open", async () => {
      render(makeFixture());
      await user.click(screen.getByTestId("trigger"));
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("sets aria-activedescendant after open + navigate", async () => {
      render(makeFixture());
      screen.getByTestId("trigger").focus();
      await user.keyboard("{ArrowDown}"); // opens
      await user.keyboard("{ArrowDown}"); // highlights first option
      const trigger = screen.getByTestId("trigger");
      expect(trigger).toHaveAttribute("aria-activedescendant");
    });

    it("selects highlighted option with Enter", async () => {
      const onValueChange = vi.fn();
      render(makeFixture({ onValueChange }));
      screen.getByTestId("trigger").focus();
      await user.keyboard("{ArrowDown}"); // opens
      await user.keyboard("{ArrowDown}"); // highlights first
      await user.keyboard("{ArrowDown}"); // highlights second
      await user.keyboard("{Enter}");
      expect(onValueChange).toHaveBeenCalled();
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  describe("multiple selection", () => {
    it("stays open after selecting an option in multiple mode", async () => {
      render(makeFixture({ multiple: true }));
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByRole("option", { name: "Apple" }));
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("toggles option in multiple mode", async () => {
      const onValueChange = vi.fn();
      render(makeFixture({ multiple: true, onValueChange }));
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByRole("option", { name: "Apple" }));
      expect(onValueChange).toHaveBeenCalledWith(["apple"]);
      await user.click(screen.getByRole("option", { name: "Apple" }));
      expect(onValueChange).toHaveBeenCalledWith([]);
    });

    it("listbox has aria-multiselectable in multiple mode", async () => {
      render(makeFixture({ multiple: true }));
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
    });
  });

  describe("disabled state", () => {
    it("disabled trigger does not open on click", async () => {
      render(makeFixture({ disabled: true }));
      await user.click(screen.getByTestId("trigger"));
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  describe("compound component API", () => {
    it("renders with Separator", async () => {
      render(
        <Select.Root>
          <Select.Trigger data-testid="trigger">
            <Select.Value placeholder="Pick" />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content>
              <Select.Item value="a">A</Select.Item>
              <Select.Separator />
              <Select.Item value="b">B</Select.Item>
            </Select.Content>
          </Select.Portal>
        </Select.Root>,
      );
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("separator")).toBeInTheDocument();
    });

    it("renders with Group and GroupLabel", async () => {
      render(
        <Select.Root>
          <Select.Trigger data-testid="trigger">
            <Select.Value placeholder="Pick" />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content>
              <Select.Group>
                <Select.GroupLabel>Fruits</Select.GroupLabel>
                <Select.Item value="apple">Apple</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Portal>
        </Select.Root>,
      );
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
    });
  });

  describe("CSS contract", () => {
    it("trigger has data-forge-scope=select and data-forge-part=trigger", () => {
      render(makeFixture());
      const trigger = screen.getByTestId("trigger");
      expect(trigger).toHaveAttribute("data-forge-scope", "select");
      expect(trigger).toHaveAttribute("data-forge-part", "trigger");
    });

    it("content has data-forge-scope=select and data-forge-part=content", async () => {
      render(makeFixture());
      await user.click(screen.getByTestId("trigger"));
      const content = screen.getByTestId("content");
      expect(content).toHaveAttribute("data-forge-scope", "select");
      expect(content).toHaveAttribute("data-forge-part", "content");
    });

    it("option has data-forge-scope=select and data-forge-part=option", async () => {
      render(makeFixture());
      await user.click(screen.getByTestId("trigger"));
      const apple = screen.getByRole("option", { name: "Apple" });
      expect(apple).toHaveAttribute("data-forge-scope", "select");
      expect(apple).toHaveAttribute("data-forge-part", "option");
    });

    it("Value span has data-forge-scope=select", () => {
      render(makeFixture());
      const valueSpan = document.querySelector('[data-forge-scope="select"][data-forge-part="value"]');
      expect(valueSpan).toBeInTheDocument();
    });

    it("Placeholder span has data-forge-scope=select", () => {
      render(
        <Select.Root>
          <Select.Trigger data-testid="trigger">
            <Select.Placeholder>Pick a fruit</Select.Placeholder>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content>
              <Select.Item value="apple">Apple</Select.Item>
            </Select.Content>
          </Select.Portal>
        </Select.Root>,
      );
      const placeholder = document.querySelector('[data-forge-scope="select"][data-forge-part="placeholder"]');
      expect(placeholder).toBeInTheDocument();
    });

    it("ItemText has data-forge-scope=select", async () => {
      render(
        <Select.Root>
          <Select.Trigger data-testid="trigger"><Select.Value placeholder="Pick" /></Select.Trigger>
          <Select.Portal>
            <Select.Content>
              <Select.Item value="apple"><Select.ItemText>Apple</Select.ItemText></Select.Item>
            </Select.Content>
          </Select.Portal>
        </Select.Root>,
      );
      await user.click(screen.getByTestId("trigger"));
      const itemText = document.querySelector('[data-forge-scope="select"][data-forge-part="item-text"]');
      expect(itemText).toBeInTheDocument();
    });

    it("Separator has data-forge-scope=select", async () => {
      render(
        <Select.Root>
          <Select.Trigger data-testid="trigger"><Select.Value placeholder="Pick" /></Select.Trigger>
          <Select.Portal>
            <Select.Content>
              <Select.Item value="a">A</Select.Item>
              <Select.Separator />
              <Select.Item value="b">B</Select.Item>
            </Select.Content>
          </Select.Portal>
        </Select.Root>,
      );
      await user.click(screen.getByTestId("trigger"));
      const separator = document.querySelector('[data-forge-scope="select"][data-forge-part="separator"]');
      expect(separator).toBeInTheDocument();
    });

    it("Group and GroupLabel have data-forge-scope=select", async () => {
      render(
        <Select.Root>
          <Select.Trigger data-testid="trigger"><Select.Value placeholder="Pick" /></Select.Trigger>
          <Select.Portal>
            <Select.Content>
              <Select.Group>
                <Select.GroupLabel>Fruits</Select.GroupLabel>
                <Select.Item value="apple">Apple</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Portal>
        </Select.Root>,
      );
      await user.click(screen.getByTestId("trigger"));
      expect(document.querySelector('[data-forge-scope="select"][data-forge-part="group"]')).toBeInTheDocument();
      expect(document.querySelector('[data-forge-scope="select"][data-forge-part="group-label"]')).toBeInTheDocument();
    });
  });
});
