import userEvent from "@testing-library/user-event";
import { cleanup, render, screen, waitFor } from "@testing-library/vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import {
  CheckboxControl,
  CheckboxGroup,
  CheckboxGroupAll,
  CheckboxIndicator,
  CheckboxRoot,
} from "../src/components/checkbox/Checkbox.js";
import { useCheckbox } from "../src/components/checkbox/use-checkbox.js";

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeCheckboxFixture(opts: Parameters<typeof useCheckbox>[0] = {}) {
  return defineComponent({
    setup() {
      return useCheckbox({ id: "test", ...opts });
    },
    template: `
      <div v-bind="getRootProps()">
        <button v-bind="getControlProps()" data-testid="control" />
        <span v-if="isChecked || isIndeterminate" v-bind="getIndicatorProps()" data-testid="indicator">✓</span>
        <label v-bind="getLabelProps()" data-testid="label">Accept</label>
      </div>
    `,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useCheckbox (Vue)", () => {
  const user = userEvent.setup();

  describe("rendering", () => {
    it("renders unchecked by default", () => {
      render(makeCheckboxFixture());
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "false");
      expect(screen.getByTestId("control")).toHaveAttribute("data-state", "unchecked");
    });

    it("renders checked with defaultChecked=true", () => {
      render(makeCheckboxFixture({ defaultChecked: true }));
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "true");
      expect(screen.getByTestId("control")).toHaveAttribute("data-state", "checked");
    });

    it("renders indeterminate", () => {
      render(makeCheckboxFixture({ defaultChecked: "indeterminate" }));
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "mixed");
      expect(screen.getByTestId("control")).toHaveAttribute("data-state", "indeterminate");
    });

    it("Label is associated with Control via htmlFor", () => {
      render(makeCheckboxFixture());
      const label = screen.getByTestId("label") as HTMLLabelElement;
      const control = screen.getByTestId("control") as HTMLButtonElement;
      expect(label.htmlFor).toBe(control.id);
    });

    it("Indicator hidden when unchecked", () => {
      render(makeCheckboxFixture());
      expect(screen.queryByTestId("indicator")).toBeNull();
    });

    it("Indicator visible when checked", () => {
      render(makeCheckboxFixture({ defaultChecked: true }));
      expect(screen.getByTestId("indicator")).toBeInTheDocument();
    });

    it("Indicator visible when indeterminate", () => {
      render(makeCheckboxFixture({ defaultChecked: "indeterminate" }));
      expect(screen.getByTestId("indicator")).toBeInTheDocument();
    });

    it("forceMount renders Indicator even when unchecked", () => {
      render(
        defineComponent({
          components: { CheckboxRoot, CheckboxControl, CheckboxIndicator },
          template: `
            <CheckboxRoot>
              <CheckboxControl />
              <CheckboxIndicator :forceMount="true" data-testid="indicator">✓</CheckboxIndicator>
            </CheckboxRoot>
          `,
        }),
      );
      expect(screen.getByTestId("indicator")).toBeInTheDocument();
    });

    it("control has role=checkbox", () => {
      render(makeCheckboxFixture());
      expect(screen.getByTestId("control")).toHaveAttribute("role", "checkbox");
    });

    it("disabled control has tabIndex=-1", () => {
      render(makeCheckboxFixture({ disabled: true }));
      expect(screen.getByTestId("control")).toHaveAttribute("tabindex", "-1");
    });
  });

  describe("interaction", () => {
    it("toggles on click: unchecked → checked → unchecked", async () => {
      render(makeCheckboxFixture());
      const control = screen.getByTestId("control");
      await user.click(control);
      expect(control).toHaveAttribute("aria-checked", "true");
      await user.click(control);
      expect(control).toHaveAttribute("aria-checked", "false");
    });

    it("goes from indeterminate to checked on click", async () => {
      render(makeCheckboxFixture({ defaultChecked: "indeterminate" }));
      await user.click(screen.getByTestId("control"));
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "true");
    });

    it("toggles on Space key (WAI-ARIA §3.7)", async () => {
      render(makeCheckboxFixture());
      const control = screen.getByTestId("control");
      await user.click(control);
      expect(control).toHaveAttribute("aria-checked", "true");
      await user.keyboard(" ");
      expect(control).toHaveAttribute("aria-checked", "false");
    });

    it("does not toggle when disabled", async () => {
      render(makeCheckboxFixture({ disabled: true }));
      await user.click(screen.getByTestId("control"));
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("callbacks", () => {
    it("calls onCheckedChange on toggle", async () => {
      const spy = vi.fn();
      render(makeCheckboxFixture({ onCheckedChange: spy }));
      await user.click(screen.getByTestId("control"));
      expect(spy).toHaveBeenCalledWith(true);
      await user.click(screen.getByTestId("control"));
      expect(spy).toHaveBeenCalledWith(false);
    });
  });

  describe("controlled mode", () => {
    it("reflects controlled checked prop", async () => {
      const isChecked = ref(false);
      render(
        defineComponent({
          components: { CheckboxRoot, CheckboxControl },
          setup() {
            return { isChecked };
          },
          template: `<CheckboxRoot :checked="isChecked"><CheckboxControl data-testid="control" /></CheckboxRoot>`,
        }),
      );
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "false");
      isChecked.value = true;
      await nextTick();
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "true");
    });

    it("reflects controlled indeterminate", async () => {
      const state = ref<boolean | "indeterminate">("indeterminate");
      render(
        defineComponent({
          components: { CheckboxRoot, CheckboxControl },
          setup() {
            return { state };
          },
          template: `<CheckboxRoot :checked="state"><CheckboxControl data-testid="control" /></CheckboxRoot>`,
        }),
      );
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "mixed");
      state.value = true;
      await nextTick();
      expect(screen.getByTestId("control")).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("form", () => {
    it("renders hidden input when name is set", () => {
      render(
        defineComponent({
          setup() {
            const api = useCheckbox({ id: "test", name: "terms", value: "yes" });
            return api;
          },
          template: `
            <div v-bind="getRootProps()">
              <button v-bind="getControlProps()" />
              <input v-bind="getHiddenInputProps()" name="terms" value="yes" />
            </div>
          `,
        }),
      );
      const input = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(input).not.toBeNull();
      expect(input.name).toBe("terms");
    });

    it("hidden input is checked when checkbox is checked", () => {
      render(
        defineComponent({
          components: { CheckboxRoot, CheckboxControl },
          template: `<CheckboxRoot name="terms" :defaultChecked="true"><CheckboxControl /></CheckboxRoot>`,
        }),
      );
      const input = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(input).not.toBeNull();
      expect(input.checked).toBe(true);
    });

    it("does not render hidden input when no name", () => {
      render(
        defineComponent({
          components: { CheckboxRoot, CheckboxControl },
          template: `<CheckboxRoot><CheckboxControl /></CheckboxRoot>`,
        }),
      );
      expect(document.querySelector('input[type="checkbox"]')).toBeNull();
    });
  });

  describe("Group", () => {
    it("items in group reflect initial value", () => {
      const fixture = defineComponent({
        components: { CheckboxGroup, CheckboxRoot, CheckboxControl },
        template: `
          <CheckboxGroup :defaultValue="['a']">
            <CheckboxRoot value="a">
              <CheckboxControl data-testid="a" />
            </CheckboxRoot>
            <CheckboxRoot value="b">
              <CheckboxControl data-testid="b" />
            </CheckboxRoot>
          </CheckboxGroup>
        `,
      });
      render(fixture);
      expect(screen.getByTestId("a")).toHaveAttribute("aria-checked", "true");
      expect(screen.getByTestId("b")).toHaveAttribute("aria-checked", "false");
    });

    it("GroupAll shows indeterminate when some items are checked", async () => {
      const fixture = defineComponent({
        components: { CheckboxGroup, CheckboxGroupAll, CheckboxRoot, CheckboxControl },
        template: `
          <CheckboxGroup :defaultValue="['a']">
            <CheckboxGroupAll>
              <CheckboxControl data-testid="all" />
            </CheckboxGroupAll>
            <CheckboxRoot value="a">
              <CheckboxControl data-testid="a" />
            </CheckboxRoot>
            <CheckboxRoot value="b">
              <CheckboxControl data-testid="b" />
            </CheckboxRoot>
          </CheckboxGroup>
        `,
      });
      render(fixture);
      await waitFor(() =>
        expect(screen.getByTestId("all")).toHaveAttribute("aria-checked", "mixed"),
      );
    });

    it("GroupAll selects all when clicked while indeterminate", async () => {
      const fixture = defineComponent({
        components: { CheckboxGroup, CheckboxGroupAll, CheckboxRoot, CheckboxControl },
        template: `
          <CheckboxGroup :defaultValue="['a']">
            <CheckboxGroupAll>
              <CheckboxControl data-testid="all" />
            </CheckboxGroupAll>
            <CheckboxRoot value="a">
              <CheckboxControl data-testid="a" />
            </CheckboxRoot>
            <CheckboxRoot value="b">
              <CheckboxControl data-testid="b" />
            </CheckboxRoot>
          </CheckboxGroup>
        `,
      });
      render(fixture);
      await waitFor(() =>
        expect(screen.getByTestId("all")).toHaveAttribute("aria-checked", "mixed"),
      );
      await userEvent.click(screen.getByTestId("all"));
      await waitFor(() => {
        expect(screen.getByTestId("a")).toHaveAttribute("aria-checked", "true");
        expect(screen.getByTestId("b")).toHaveAttribute("aria-checked", "true");
      });
    });

    it("GroupAll unchecks all when all are checked", async () => {
      const fixture = defineComponent({
        components: { CheckboxGroup, CheckboxGroupAll, CheckboxRoot, CheckboxControl },
        template: `
          <CheckboxGroup :defaultValue="['a', 'b']">
            <CheckboxGroupAll>
              <CheckboxControl data-testid="all" />
            </CheckboxGroupAll>
            <CheckboxRoot value="a">
              <CheckboxControl data-testid="a" />
            </CheckboxRoot>
            <CheckboxRoot value="b">
              <CheckboxControl data-testid="b" />
            </CheckboxRoot>
          </CheckboxGroup>
        `,
      });
      render(fixture);
      await waitFor(() =>
        expect(screen.getByTestId("all")).toHaveAttribute("aria-checked", "true"),
      );
      await userEvent.click(screen.getByTestId("all"));
      await waitFor(() => {
        expect(screen.getByTestId("a")).toHaveAttribute("aria-checked", "false");
        expect(screen.getByTestId("b")).toHaveAttribute("aria-checked", "false");
      });
    });
  });
});
