import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { Select } from "../src/components/select/Select.js";

// Destructure at module level — dot-notation doesn't work in template strings
const {
  Root: SelectRoot,
  Label: SelectLabel,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Placeholder: SelectPlaceholder,
  Portal: SelectPortal,
  Content: SelectContent,
  Item: SelectItem,
  ItemText: SelectItemText,
  ItemIndicator: SelectItemIndicator,
  Separator: SelectSeparator,
  Group: SelectGroup,
  GroupLabel: SelectGroupLabel,
} = Select;

// ---------------------------------------------------------------------------
// Fixture factory
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
  return defineComponent({
    components: {
      SelectRoot,
      SelectLabel,
      SelectTrigger,
      SelectValue,
      SelectPortal,
      SelectContent,
      SelectItem,
    },
    setup() {
      return { multiple, defaultValue, defaultLabel, onValueChange, disabled };
    },
    template: `
      <SelectRoot :multiple="multiple" :defaultValue="defaultValue" :defaultLabel="defaultLabel" :onValueChange="onValueChange" :disabled="disabled">
        <SelectLabel>Fruit</SelectLabel>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent data-testid="content">
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="cherry" :disabled="true">Cherry</SelectItem>
          </SelectContent>
        </SelectPortal>
      </SelectRoot>
    `,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Select (Vue)", () => {
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
      const apple = screen.getByRole("option", { name: "Apple" });
      expect(apple).toHaveAttribute("aria-selected", "false");
    });

    it("disabled option has aria-disabled", async () => {
      render(makeFixture());
      await user.click(screen.getByTestId("trigger"));
      const cherry = screen.getByRole("option", { name: "Cherry" });
      expect(cherry).toHaveAttribute("aria-disabled", "true");
    });

    it("listbox has aria-labelledby", async () => {
      render(makeFixture());
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("listbox")).toHaveAttribute("aria-labelledby");
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
      await user.keyboard("{ArrowDown}"); // highlights first
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
    it("stays open after selecting in multiple mode", async () => {
      render(makeFixture({ multiple: true }));
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByRole("option", { name: "Apple" }));
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("listbox has aria-multiselectable in multiple mode", async () => {
      render(makeFixture({ multiple: true }));
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
    });
  });

  describe("compound component API", () => {
    it("renders Separator between options", async () => {
      const WithSeparator = defineComponent({
        components: { SelectRoot, SelectTrigger, SelectValue, SelectPortal, SelectContent, SelectItem, SelectSeparator },
        template: `
          <SelectRoot>
            <SelectTrigger data-testid="trigger"><SelectValue placeholder="Pick" /></SelectTrigger>
            <SelectPortal>
              <SelectContent>
                <SelectItem value="a">A</SelectItem>
                <SelectSeparator />
                <SelectItem value="b">B</SelectItem>
              </SelectContent>
            </SelectPortal>
          </SelectRoot>
        `,
      });
      render(WithSeparator);
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("separator")).toBeInTheDocument();
    });

    it("renders Group and GroupLabel", async () => {
      const WithGroup = defineComponent({
        components: { SelectRoot, SelectTrigger, SelectValue, SelectPortal, SelectContent, SelectItem, SelectGroup, SelectGroupLabel },
        template: `
          <SelectRoot>
            <SelectTrigger data-testid="trigger"><SelectValue placeholder="Pick" /></SelectTrigger>
            <SelectPortal>
              <SelectContent>
                <SelectGroup>
                  <SelectGroupLabel>Fruits</SelectGroupLabel>
                  <SelectItem value="apple">Apple</SelectItem>
                </SelectGroup>
              </SelectContent>
            </SelectPortal>
          </SelectRoot>
        `,
      });
      render(WithGroup);
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
      expect(screen.getByTestId("content")).toHaveAttribute("data-forge-scope", "select");
      expect(screen.getByTestId("content")).toHaveAttribute("data-forge-part", "content");
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
      const WithPlaceholder = defineComponent({
        components: { SelectRoot, SelectTrigger, SelectPlaceholder, SelectPortal, SelectContent, SelectItem },
        template: `
          <SelectRoot>
            <SelectTrigger data-testid="trigger">
              <SelectPlaceholder>Pick</SelectPlaceholder>
            </SelectTrigger>
            <SelectPortal><SelectContent><SelectItem value="a">A</SelectItem></SelectContent></SelectPortal>
          </SelectRoot>
        `,
      });
      render(WithPlaceholder);
      const placeholder = document.querySelector('[data-forge-scope="select"][data-forge-part="placeholder"]');
      expect(placeholder).toBeInTheDocument();
    });

    it("ItemText has data-forge-scope=select", async () => {
      const WithItemText = defineComponent({
        components: { SelectRoot, SelectTrigger, SelectValue, SelectPortal, SelectContent, SelectItem, SelectItemText },
        template: `
          <SelectRoot>
            <SelectTrigger data-testid="trigger"><SelectValue placeholder="Pick" /></SelectTrigger>
            <SelectPortal>
              <SelectContent>
                <SelectItem value="apple"><SelectItemText>Apple</SelectItemText></SelectItem>
              </SelectContent>
            </SelectPortal>
          </SelectRoot>
        `,
      });
      render(WithItemText);
      await user.click(screen.getByTestId("trigger"));
      const itemText = document.querySelector('[data-forge-scope="select"][data-forge-part="item-text"]');
      expect(itemText).toBeInTheDocument();
    });

    it("Separator has data-forge-scope=select", async () => {
      const WithSeparator = defineComponent({
        components: { SelectRoot, SelectTrigger, SelectValue, SelectPortal, SelectContent, SelectItem, SelectSeparator },
        template: `
          <SelectRoot>
            <SelectTrigger data-testid="trigger"><SelectValue placeholder="Pick" /></SelectTrigger>
            <SelectPortal>
              <SelectContent>
                <SelectItem value="a">A</SelectItem>
                <SelectSeparator />
                <SelectItem value="b">B</SelectItem>
              </SelectContent>
            </SelectPortal>
          </SelectRoot>
        `,
      });
      render(WithSeparator);
      await user.click(screen.getByTestId("trigger"));
      const sep = document.querySelector('[data-forge-scope="select"][data-forge-part="separator"]');
      expect(sep).toBeInTheDocument();
    });

    it("Group and GroupLabel have data-forge-scope=select", async () => {
      const WithGroup = defineComponent({
        components: { SelectRoot, SelectTrigger, SelectValue, SelectPortal, SelectContent, SelectItem, SelectGroup, SelectGroupLabel },
        template: `
          <SelectRoot>
            <SelectTrigger data-testid="trigger"><SelectValue placeholder="Pick" /></SelectTrigger>
            <SelectPortal>
              <SelectContent>
                <SelectGroup>
                  <SelectGroupLabel>Fruits</SelectGroupLabel>
                  <SelectItem value="apple">Apple</SelectItem>
                </SelectGroup>
              </SelectContent>
            </SelectPortal>
          </SelectRoot>
        `,
      });
      render(WithGroup);
      await user.click(screen.getByTestId("trigger"));
      expect(document.querySelector('[data-forge-scope="select"][data-forge-part="group"]')).toBeInTheDocument();
      expect(document.querySelector('[data-forge-scope="select"][data-forge-part="group-label"]')).toBeInTheDocument();
    });

    it("Indicator has data-forge-scope=select, data-forge-part=indicator, and data-state=closed", () => {
      const SelectIndicator = Select.Indicator;
      const WithIndicator = defineComponent({
        components: { SelectRoot, SelectTrigger, SelectValue, SelectPortal, SelectContent, SelectItem, SelectIndicator },
        template: `
          <SelectRoot>
            <SelectTrigger data-testid="trigger">
              <SelectValue placeholder="Pick" />
              <SelectIndicator data-testid="indicator">▼</SelectIndicator>
            </SelectTrigger>
            <SelectPortal><SelectContent><SelectItem value="a">A</SelectItem></SelectContent></SelectPortal>
          </SelectRoot>
        `,
      });
      render(WithIndicator);
      const indicator = screen.getByTestId("indicator");
      expect(indicator).toHaveAttribute("data-forge-scope", "select");
      expect(indicator).toHaveAttribute("data-forge-part", "indicator");
      expect(indicator).toHaveAttribute("data-state", "closed");
    });

    it("Indicator data-state=open when select is open", async () => {
      const SelectIndicator = Select.Indicator;
      const WithIndicator = defineComponent({
        components: { SelectRoot, SelectTrigger, SelectValue, SelectPortal, SelectContent, SelectItem, SelectIndicator },
        template: `
          <SelectRoot>
            <SelectTrigger data-testid="trigger">
              <SelectValue placeholder="Pick" />
              <SelectIndicator data-testid="indicator">▼</SelectIndicator>
            </SelectTrigger>
            <SelectPortal><SelectContent><SelectItem value="a">A</SelectItem></SelectContent></SelectPortal>
          </SelectRoot>
        `,
      });
      render(WithIndicator);
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("indicator")).toHaveAttribute("data-state", "open");
    });
  });
});
