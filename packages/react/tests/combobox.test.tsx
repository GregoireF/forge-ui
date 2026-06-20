import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "../src/components/combobox/Combobox.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "grape", label: "Grape", disabled: true },
];

function FruitCombobox(props: React.ComponentProps<typeof Combobox.Root>) {
  return (
    <Combobox.Root {...props}>
      <Combobox.Label>Fruit</Combobox.Label>
      <Combobox.Input data-testid="input" />
      <Combobox.Trigger data-testid="trigger">▾</Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Content data-testid="content">
          {fruits.map((f) => (
            <Combobox.Item
              key={f.value}
              value={f.value}
              label={f.label}
              disabled={f.disabled}
              data-testid={`item-${f.value}`}
            >
              <Combobox.ItemText>{f.label}</Combobox.ItemText>
              <Combobox.ItemIndicator value={f.value}>✓</Combobox.ItemIndicator>
            </Combobox.Item>
          ))}
        </Combobox.Content>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

// ---------------------------------------------------------------------------
// Combobox — React
// ---------------------------------------------------------------------------

describe("Combobox (React)", () => {
  describe("accessibility", () => {
    it("input has role=combobox", () => {
      render(<FruitCombobox />);
      expect(screen.getByTestId("input")).toHaveAttribute("role", "combobox");
    });

    it("input has aria-expanded=false when closed", () => {
      render(<FruitCombobox />);
      expect(screen.getByTestId("input")).toHaveAttribute("aria-expanded", "false");
    });

    it("input has aria-controls pointing to listbox", () => {
      render(<FruitCombobox />);
      const input = screen.getByTestId("input");
      const listboxId = input.getAttribute("aria-controls");
      expect(listboxId).toBeTruthy();
    });

    it("label is associated with input via htmlFor", () => {
      render(<FruitCombobox />);
      const input = screen.getByTestId("input");
      const label = screen.getByText("Fruit") as HTMLLabelElement;
      expect(label.htmlFor).toBe(input.id);
    });
  });

  describe("open / close", () => {
    it("opens when Trigger is clicked", async () => {
      render(<FruitCombobox />);
      await act(async () => { fireEvent.click(screen.getByTestId("trigger")); });
      expect(screen.getByTestId("input")).toHaveAttribute("aria-expanded", "true");
    });

    it("listbox is not in DOM when closed", () => {
      render(<FruitCombobox />);
      expect(screen.queryByTestId("content")).toBeNull();
    });

    it("listbox appears when input is typed into", async () => {
      render(<FruitCombobox />);
      await act(async () => { fireEvent.change(screen.getByTestId("input"), { target: { value: "app" } }); });
      expect(screen.getByTestId("input")).toHaveAttribute("aria-expanded", "true");
    });

    it("closes on Escape", async () => {
      render(<FruitCombobox />);
      await act(async () => { fireEvent.click(screen.getByTestId("trigger")); });
      await act(async () => { fireEvent.keyDown(screen.getByTestId("input"), { key: "Escape" }); });
      expect(screen.getByTestId("input")).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("client-side filtering", () => {
    it("filters options based on input text", async () => {
      render(<FruitCombobox />);
      await act(async () => { fireEvent.change(screen.getByTestId("input"), { target: { value: "an" } }); });
      // "Banana" matches "an". "Apple", "Cherry", "Grape" do not.
      expect(screen.getByTestId("item-banana")).toBeInTheDocument();
      expect(screen.queryByTestId("item-apple")).toBeNull();
    });

    it("is case-insensitive", async () => {
      render(<FruitCombobox />);
      await act(async () => { fireEvent.change(screen.getByTestId("input"), { target: { value: "APPLE" } }); });
      expect(screen.getByTestId("item-apple")).toBeInTheDocument();
    });
  });

  describe("selection", () => {
    it("selects item on click and closes", async () => {
      const onValueChange = vi.fn();
      render(<FruitCombobox onValueChange={onValueChange} />);
      await act(async () => { fireEvent.click(screen.getByTestId("trigger")); });
      await act(async () => { fireEvent.click(screen.getByTestId("item-apple")); });
      expect(onValueChange).toHaveBeenCalledWith(["apple"]);
      expect(screen.getByTestId("input")).toHaveAttribute("aria-expanded", "false");
    });

    it("sets input value to selected label after selection (single-select)", async () => {
      render(<FruitCombobox />);
      await act(async () => { fireEvent.click(screen.getByTestId("trigger")); });
      await act(async () => { fireEvent.click(screen.getByTestId("item-apple")); });
      expect(screen.getByTestId("input")).toHaveValue("Apple");
    });

    it("does not select disabled items on click", async () => {
      const onValueChange = vi.fn();
      render(<FruitCombobox onValueChange={onValueChange} />);
      await act(async () => { fireEvent.click(screen.getByTestId("trigger")); });
      await act(async () => { fireEvent.click(screen.getByTestId("item-grape")); });
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe("keyboard navigation", () => {
    it("ArrowDown highlights first option", async () => {
      render(<FruitCombobox />);
      await act(async () => { fireEvent.click(screen.getByTestId("trigger")); });
      await act(async () => { fireEvent.keyDown(screen.getByTestId("input"), { key: "ArrowDown" }); });
      expect(screen.getByTestId("item-apple")).toHaveAttribute("data-highlighted", "");
    });

    it("Enter selects highlighted option", async () => {
      const onValueChange = vi.fn();
      render(<FruitCombobox onValueChange={onValueChange} />);
      await act(async () => { fireEvent.click(screen.getByTestId("trigger")); });
      await act(async () => { fireEvent.keyDown(screen.getByTestId("input"), { key: "ArrowDown" }); });
      await act(async () => { fireEvent.keyDown(screen.getByTestId("input"), { key: "Enter" }); });
      expect(onValueChange).toHaveBeenCalledWith(["apple"]);
    });
  });

  describe("async mode", () => {
    it("calls onInputChange when typing", async () => {
      const onInputChange = vi.fn();
      render(<FruitCombobox onInputChange={onInputChange} />);
      await act(async () => { fireEvent.change(screen.getByTestId("input"), { target: { value: "ap" } }); });
      expect(onInputChange).toHaveBeenCalledWith("ap");
    });
  });

  describe("multi-select", () => {
    it("selects multiple values without closing", async () => {
      const onValueChange = vi.fn();
      render(<FruitCombobox multiple onValueChange={onValueChange} />);
      await act(async () => { fireEvent.click(screen.getByTestId("trigger")); });
      // multi-select: clicking an item does NOT close the dropdown
      await act(async () => { fireEvent.click(screen.getByTestId("item-apple")); });
      await act(async () => { fireEvent.click(screen.getByTestId("item-banana")); });
      expect(onValueChange).toHaveBeenLastCalledWith(["apple", "banana"]);
    });
  });

  describe("CSS contract", () => {
    it("input has data-forge-scope=combobox and data-forge-part=input", () => {
      render(<FruitCombobox />);
      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("data-forge-scope", "combobox");
      expect(input).toHaveAttribute("data-forge-part", "input");
    });

    it("trigger button has data-forge-scope=combobox and data-forge-part=trigger", () => {
      render(<FruitCombobox />);
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-forge-scope", "combobox");
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-forge-part", "trigger");
    });

    it("content has data-forge-scope=combobox and data-forge-part=content", async () => {
      render(<FruitCombobox />);
      await act(async () => { fireEvent.click(screen.getByTestId("trigger")); });
      expect(screen.getByTestId("content")).toHaveAttribute("data-forge-scope", "combobox");
      expect(screen.getByTestId("content")).toHaveAttribute("data-forge-part", "content");
    });

    it("item has data-forge-scope=combobox and data-forge-part=option", async () => {
      render(<FruitCombobox />);
      await act(async () => { fireEvent.click(screen.getByTestId("trigger")); });
      expect(screen.getByTestId("item-apple")).toHaveAttribute("data-forge-scope", "combobox");
      expect(screen.getByTestId("item-apple")).toHaveAttribute("data-forge-part", "option");
    });

    it("ItemText has data-forge-scope=combobox", async () => {
      render(<FruitCombobox />);
      await act(async () => { fireEvent.click(screen.getByTestId("trigger")); });
      const itemText = document.querySelector('[data-forge-scope="combobox"][data-forge-part="item-text"]');
      expect(itemText).toBeInTheDocument();
    });
  });
});
