import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/vue";
import { describe, expect, it } from "vitest";
import { defineComponent, nextTick } from "vue";
import {
  FieldControl,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldGroupLabel,
  FieldLabel,
  FieldRequiredIndicator,
  FieldRoot,
} from "../src/components/field/Field.js";
import { useField } from "../src/components/field/use-field.js";

// ---------------------------------------------------------------------------
// useField
// ---------------------------------------------------------------------------
describe("useField (Vue)", () => {
  describe("label–control association", () => {
    it("label for matches control id", () => {
      const Fixture = defineComponent({
        setup: () => useField({ id: "test-field" }),
        template: `
          <div>
            <label v-bind="getLabelProps()" data-testid="label">Email</label>
            <input v-bind="getControlProps()" data-testid="control" />
          </div>
        `,
      });
      render(Fixture);
      const label = screen.getByTestId("label") as HTMLLabelElement;
      expect(label).toHaveAttribute("for", screen.getByTestId("control").id);
    });

    it("label has data-forge-scope=field and data-forge-part=label", () => {
      const Fixture = defineComponent({
        setup: () => useField({ id: "test-field" }),
        template: `
          <div>
            <label v-bind="getLabelProps()" data-testid="label">Email</label>
            <input v-bind="getControlProps()" />
          </div>
        `,
      });
      render(Fixture);
      const label = screen.getByTestId("label");
      expect(label).toHaveAttribute("data-forge-scope", "field");
      expect(label).toHaveAttribute("data-forge-part", "label");
    });

    it("control has data-forge-scope=field and data-forge-part=control", () => {
      const Fixture = defineComponent({
        setup: () => useField({ id: "test-field" }),
        template: `
          <div>
            <label v-bind="getLabelProps()">Email</label>
            <input v-bind="getControlProps()" data-testid="control" />
          </div>
        `,
      });
      render(Fixture);
      expect(screen.getByTestId("control")).toHaveAttribute("data-forge-scope", "field");
      expect(screen.getByTestId("control")).toHaveAttribute("data-forge-part", "control");
    });
  });

  describe("invalid", () => {
    it("control has aria-invalid=true when invalid", () => {
      const Fixture = defineComponent({
        setup: () => useField({ id: "test-field", invalid: true }),
        template: `
          <div>
            <label v-bind="getLabelProps()">Email</label>
            <input v-bind="getControlProps()" data-testid="control" />
          </div>
        `,
      });
      render(Fixture);
      expect(screen.getByTestId("control")).toHaveAttribute("aria-invalid", "true");
    });

    it("control does not have aria-invalid=true when valid", () => {
      const Fixture = defineComponent({
        setup: () => useField({ id: "test-field" }),
        template: `
          <div>
            <label v-bind="getLabelProps()">Email</label>
            <input v-bind="getControlProps()" data-testid="control" />
          </div>
        `,
      });
      render(Fixture);
      expect(screen.getByTestId("control")).not.toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("required", () => {
    it("control has aria-required=true when required", () => {
      const Fixture = defineComponent({
        setup: () => useField({ id: "test-field", required: true }),
        template: `
          <div>
            <label v-bind="getLabelProps()">Email</label>
            <input v-bind="getControlProps()" data-testid="control" />
          </div>
        `,
      });
      render(Fixture);
      expect(screen.getByTestId("control")).toHaveAttribute("aria-required", "true");
    });
  });

  describe("disabled", () => {
    it("control has aria-disabled=true when disabled", () => {
      const Fixture = defineComponent({
        setup: () => useField({ id: "test-field", disabled: true }),
        template: `
          <div>
            <label v-bind="getLabelProps()">Email</label>
            <input v-bind="getControlProps()" data-testid="control" />
          </div>
        `,
      });
      render(Fixture);
      expect(screen.getByTestId("control")).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("readOnly", () => {
    it("control has aria-readonly=true when readOnly", () => {
      const Fixture = defineComponent({
        setup: () => useField({ id: "test-field", readOnly: true }),
        template: `
          <div>
            <label v-bind="getLabelProps()">Email</label>
            <input v-bind="getControlProps()" data-testid="control" />
          </div>
        `,
      });
      render(Fixture);
      expect(screen.getByTestId("control")).toHaveAttribute("aria-readonly", "true");
    });
  });
});

// ---------------------------------------------------------------------------
// Field compound
// ---------------------------------------------------------------------------
describe("Field compound (Vue)", () => {
  describe("Label → Control ARIA wiring", () => {
    it("Label for matches Control child id", async () => {
      const Fixture = defineComponent({
        components: { FieldRoot, FieldLabel, FieldControl },
        template: `
          <FieldRoot id="wiring">
            <FieldLabel data-testid="label">Email</FieldLabel>
            <FieldControl><input data-testid="control" /></FieldControl>
          </FieldRoot>
        `,
      });
      render(Fixture);
      await nextTick();
      expect(screen.getByTestId("label")).toHaveAttribute("for", screen.getByTestId("control").id);
    });

    it("Control child gets aria-labelledby pointing to Label", async () => {
      const Fixture = defineComponent({
        components: { FieldRoot, FieldLabel, FieldControl },
        template: `
          <FieldRoot id="labelledby">
            <FieldLabel data-testid="label">Email</FieldLabel>
            <FieldControl><input data-testid="control" /></FieldControl>
          </FieldRoot>
        `,
      });
      render(Fixture);
      await nextTick();
      expect(screen.getByTestId("control")).toHaveAttribute(
        "aria-labelledby",
        screen.getByTestId("label").id,
      );
    });
  });

  describe("Description", () => {
    it("Control gets aria-describedby containing Description id", async () => {
      const Fixture = defineComponent({
        components: { FieldRoot, FieldControl, FieldDescription },
        template: `
          <FieldRoot id="desc">
            <FieldControl><input data-testid="control" /></FieldControl>
            <FieldDescription data-testid="desc">Hint</FieldDescription>
          </FieldRoot>
        `,
      });
      render(Fixture);
      await nextTick();
      expect(screen.getByTestId("control").getAttribute("aria-describedby")).toContain(
        screen.getByTestId("desc").id,
      );
    });

    it("Description has data-forge-part=description and data-forge-scope=field", async () => {
      const Fixture = defineComponent({
        components: { FieldRoot, FieldControl, FieldDescription },
        template: `
          <FieldRoot id="desc-attrs">
            <FieldControl><input /></FieldControl>
            <FieldDescription data-testid="desc">Hint</FieldDescription>
          </FieldRoot>
        `,
      });
      render(Fixture);
      await nextTick();
      expect(screen.getByTestId("desc")).toHaveAttribute("data-forge-part", "description");
      expect(screen.getByTestId("desc")).toHaveAttribute("data-forge-scope", "field");
    });
  });

  describe("Error", () => {
    it("does not render when invalid=false", async () => {
      const Fixture = defineComponent({
        components: { FieldRoot, FieldControl, FieldError },
        template: `
          <FieldRoot id="error-hidden">
            <FieldControl><input /></FieldControl>
            <FieldError data-testid="error">Bad</FieldError>
          </FieldRoot>
        `,
      });
      render(Fixture);
      await nextTick();
      expect(screen.queryByTestId("error")).not.toBeInTheDocument();
    });

    it("renders when invalid=true", async () => {
      const Fixture = defineComponent({
        components: { FieldRoot, FieldControl, FieldError },
        template: `
          <FieldRoot id="error-shown" :invalid="true">
            <FieldControl><input /></FieldControl>
            <FieldError data-testid="error">Invalid email</FieldError>
          </FieldRoot>
        `,
      });
      render(Fixture);
      await nextTick();
      expect(screen.getByTestId("error")).toBeInTheDocument();
    });

    it("has role=alert", async () => {
      const Fixture = defineComponent({
        components: { FieldRoot, FieldControl, FieldError },
        template: `
          <FieldRoot id="error-role" :invalid="true">
            <FieldControl><input /></FieldControl>
            <FieldError data-testid="error">Bad</FieldError>
          </FieldRoot>
        `,
      });
      render(Fixture);
      await nextTick();
      expect(screen.getByTestId("error")).toHaveAttribute("role", "alert");
    });

    it("has data-forge-part=error and data-forge-scope=field", async () => {
      const Fixture = defineComponent({
        components: { FieldRoot, FieldControl, FieldError },
        template: `
          <FieldRoot id="error-attrs" :invalid="true">
            <FieldControl><input /></FieldControl>
            <FieldError data-testid="error">Bad</FieldError>
          </FieldRoot>
        `,
      });
      render(Fixture);
      await nextTick();
      expect(screen.getByTestId("error")).toHaveAttribute("data-forge-part", "error");
      expect(screen.getByTestId("error")).toHaveAttribute("data-forge-scope", "field");
    });

    it("Control has aria-invalid=true when Field.Root is invalid", async () => {
      const Fixture = defineComponent({
        components: { FieldRoot, FieldControl },
        template: `
          <FieldRoot id="invalid-control" :invalid="true">
            <FieldControl><input data-testid="control" /></FieldControl>
          </FieldRoot>
        `,
      });
      render(Fixture);
      await nextTick();
      expect(screen.getByTestId("control")).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("RequiredIndicator", () => {
    it("does not render when required=false", async () => {
      const Fixture = defineComponent({
        components: { FieldRoot, FieldLabel, FieldControl, FieldRequiredIndicator },
        template: `
          <FieldRoot id="req-hidden">
            <FieldLabel>Email <FieldRequiredIndicator data-testid="req" /></FieldLabel>
            <FieldControl><input /></FieldControl>
          </FieldRoot>
        `,
      });
      render(Fixture);
      await nextTick();
      expect(screen.queryByTestId("req")).not.toBeInTheDocument();
    });

    it("renders when required=true", async () => {
      const Fixture = defineComponent({
        components: { FieldRoot, FieldLabel, FieldControl, FieldRequiredIndicator },
        template: `
          <FieldRoot id="req-shown" :required="true">
            <FieldLabel>Email <FieldRequiredIndicator data-testid="req" /></FieldLabel>
            <FieldControl><input /></FieldControl>
          </FieldRoot>
        `,
      });
      render(Fixture);
      await nextTick();
      expect(screen.getByTestId("req")).toBeInTheDocument();
    });

    it("is hidden from screen readers (aria-hidden=true)", async () => {
      const Fixture = defineComponent({
        components: { FieldRoot, FieldLabel, FieldControl, FieldRequiredIndicator },
        template: `
          <FieldRoot id="req-aria" :required="true">
            <FieldLabel>Email <FieldRequiredIndicator data-testid="req" /></FieldLabel>
            <FieldControl><input /></FieldControl>
          </FieldRoot>
        `,
      });
      render(Fixture);
      await nextTick();
      expect(screen.getByTestId("req")).toHaveAttribute("aria-hidden", "true");
    });

    it("has data-forge-part=required-indicator and data-forge-scope=field", async () => {
      const Fixture = defineComponent({
        components: { FieldRoot, FieldLabel, FieldControl, FieldRequiredIndicator },
        template: `
          <FieldRoot id="req-attrs" :required="true">
            <FieldLabel>Email <FieldRequiredIndicator data-testid="req" /></FieldLabel>
            <FieldControl><input /></FieldControl>
          </FieldRoot>
        `,
      });
      render(Fixture);
      await nextTick();
      expect(screen.getByTestId("req")).toHaveAttribute("data-forge-part", "required-indicator");
      expect(screen.getByTestId("req")).toHaveAttribute("data-forge-scope", "field");
    });

    it("Control has aria-required=true when required", async () => {
      const Fixture = defineComponent({
        components: { FieldRoot, FieldControl },
        template: `
          <FieldRoot id="req-control" :required="true">
            <FieldControl><input data-testid="control" /></FieldControl>
          </FieldRoot>
        `,
      });
      render(Fixture);
      await nextTick();
      expect(screen.getByTestId("control")).toHaveAttribute("aria-required", "true");
    });
  });

  describe("Group / GroupLabel", () => {
    it("Group has role=group", async () => {
      const Fixture = defineComponent({
        components: { FieldRoot, FieldGroup, FieldGroupLabel },
        template: `
          <FieldRoot id="group">
            <FieldGroup data-testid="group">
              <FieldGroupLabel>Options</FieldGroupLabel>
              <input type="checkbox" />
            </FieldGroup>
          </FieldRoot>
        `,
      });
      render(Fixture);
      await nextTick();
      expect(screen.getByTestId("group")).toHaveAttribute("role", "group");
    });

    it("Group aria-labelledby matches GroupLabel id", async () => {
      const Fixture = defineComponent({
        components: { FieldRoot, FieldGroup, FieldGroupLabel },
        template: `
          <FieldRoot id="group-label">
            <FieldGroup data-testid="group">
              <FieldGroupLabel data-testid="group-label">Options</FieldGroupLabel>
              <input type="checkbox" />
            </FieldGroup>
          </FieldRoot>
        `,
      });
      render(Fixture);
      await nextTick();
      expect(screen.getByTestId("group")).toHaveAttribute(
        "aria-labelledby",
        screen.getByTestId("group-label").id,
      );
    });
  });

  describe("asChild", () => {
    it("Label asChild renders consumer element with label id for aria-labelledby", async () => {
      const Fixture = defineComponent({
        components: { FieldRoot, FieldLabel, FieldControl },
        template: `
          <FieldRoot id="aschild-label">
            <FieldLabel :asChild="true">
              <span data-testid="span-label">Email</span>
            </FieldLabel>
            <FieldControl><input data-testid="control" /></FieldControl>
          </FieldRoot>
        `,
      });
      render(Fixture);
      await nextTick();
      const el = screen.getByTestId("span-label");
      expect(el.tagName).toBe("SPAN");
      // getLabelProps() injects the label id so the control can aria-labelledby reference it
      expect(screen.getByTestId("control")).toHaveAttribute("aria-labelledby", el.id);
    });
  });

  describe("reactivity — invalid prop toggle", () => {
    it("Error appears when parent sets invalid=true dynamically", async () => {
      const user = userEvent.setup();
      const Fixture = defineComponent({
        components: { FieldRoot, FieldControl, FieldError },
        data: () => ({ invalid: false }),
        template: `
          <div>
            <button data-testid="toggle" @click="invalid = !invalid">Toggle</button>
            <FieldRoot id="reactive" :invalid="invalid">
              <FieldControl><input /></FieldControl>
              <FieldError data-testid="error">Bad</FieldError>
            </FieldRoot>
          </div>
        `,
      });
      render(Fixture);
      expect(screen.queryByTestId("error")).not.toBeInTheDocument();
      await user.click(screen.getByTestId("toggle"));
      await nextTick();
      expect(screen.getByTestId("error")).toBeInTheDocument();
    });
  });

  describe("throws when used outside Root", () => {
    it("Label throws without Field.Root", () => {
      const Fixture = defineComponent({
        components: { FieldLabel },
        template: `<FieldLabel>test</FieldLabel>`,
      });
      expect(() => render(Fixture)).toThrow("Field compound parts must be inside <Field.Root>");
    });
  });
});
