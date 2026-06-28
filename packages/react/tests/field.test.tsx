import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it } from "vitest";
import { Field } from "../src/components/field/Field.js";
import { useField } from "../src/components/field/use-field.js";

// ---------------------------------------------------------------------------
// Hook fixture
// ---------------------------------------------------------------------------
function FieldHookFixture({
  invalid = false,
  required = false,
  disabled = false,
  readOnly = false,
}: {
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
} = {}) {
  const field = useField({ id: "test-field", invalid, required, disabled, readOnly });
  return (
    <div>
      <label {...field.getLabelProps()} data-testid="label">
        Email
      </label>
      <input {...field.getControlProps()} data-testid="control" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// useField
// ---------------------------------------------------------------------------
describe("useField (React)", () => {
  describe("label–control association", () => {
    it("label htmlFor matches control id", () => {
      render(<FieldHookFixture />);
      expect(screen.getByTestId("label")).toHaveAttribute("for", screen.getByTestId("control").id);
    });

    it("label has data-forge-scope=field and data-forge-part=label", () => {
      render(<FieldHookFixture />);
      const label = screen.getByTestId("label");
      expect(label).toHaveAttribute("data-forge-scope", "field");
      expect(label).toHaveAttribute("data-forge-part", "label");
    });

    it("control has data-forge-scope=field and data-forge-part=control", () => {
      render(<FieldHookFixture />);
      const control = screen.getByTestId("control");
      expect(control).toHaveAttribute("data-forge-scope", "field");
      expect(control).toHaveAttribute("data-forge-part", "control");
    });
  });

  describe("invalid", () => {
    it("control has aria-invalid=true when invalid", () => {
      render(<FieldHookFixture invalid />);
      expect(screen.getByTestId("control")).toHaveAttribute("aria-invalid", "true");
    });

    it("control does not have aria-invalid=true when valid", () => {
      render(<FieldHookFixture />);
      expect(screen.getByTestId("control")).not.toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("required", () => {
    it("control has aria-required=true when required", () => {
      render(<FieldHookFixture required />);
      expect(screen.getByTestId("control")).toHaveAttribute("aria-required", "true");
    });
  });

  describe("disabled", () => {
    it("control has aria-disabled=true when disabled", () => {
      render(<FieldHookFixture disabled />);
      expect(screen.getByTestId("control")).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("readOnly", () => {
    it("control has aria-readonly=true when readOnly", () => {
      render(<FieldHookFixture readOnly />);
      expect(screen.getByTestId("control")).toHaveAttribute("aria-readonly", "true");
    });
  });
});

// ---------------------------------------------------------------------------
// Field compound
// ---------------------------------------------------------------------------
describe("Field compound (React)", () => {
  describe("Label → Control ARIA wiring", () => {
    it("Label htmlFor matches Control child id", () => {
      render(
        <Field.Root id="wiring">
          <Field.Label data-testid="label">Email</Field.Label>
          <Field.Control>
            <input data-testid="control" />
          </Field.Control>
        </Field.Root>,
      );
      expect(screen.getByTestId("label")).toHaveAttribute("for", screen.getByTestId("control").id);
    });

    it("Control child gets aria-labelledby pointing to Label", () => {
      render(
        <Field.Root id="labelledby">
          <Field.Label data-testid="label">Email</Field.Label>
          <Field.Control>
            <input data-testid="control" />
          </Field.Control>
        </Field.Root>,
      );
      expect(screen.getByTestId("control")).toHaveAttribute(
        "aria-labelledby",
        screen.getByTestId("label").id,
      );
    });
  });

  describe("Description", () => {
    it("Control gets aria-describedby containing Description id", () => {
      render(
        <Field.Root id="desc">
          <Field.Control>
            <input data-testid="control" />
          </Field.Control>
          <Field.Description data-testid="desc">Hint text</Field.Description>
        </Field.Root>,
      );
      expect(screen.getByTestId("control").getAttribute("aria-describedby")).toContain(
        screen.getByTestId("desc").id,
      );
    });

    it("Description has data-forge-part=description and data-forge-scope=field", () => {
      render(
        <Field.Root id="desc-attrs">
          <Field.Control>
            <input />
          </Field.Control>
          <Field.Description data-testid="desc">Hint</Field.Description>
        </Field.Root>,
      );
      expect(screen.getByTestId("desc")).toHaveAttribute("data-forge-part", "description");
      expect(screen.getByTestId("desc")).toHaveAttribute("data-forge-scope", "field");
    });
  });

  describe("Error", () => {
    it("does not render when invalid=false", () => {
      render(
        <Field.Root id="error-hidden">
          <Field.Control>
            <input />
          </Field.Control>
          <Field.Error data-testid="error">Bad</Field.Error>
        </Field.Root>,
      );
      expect(screen.queryByTestId("error")).not.toBeInTheDocument();
    });

    it("renders when invalid=true", () => {
      render(
        <Field.Root id="error-shown" invalid>
          <Field.Control>
            <input />
          </Field.Control>
          <Field.Error data-testid="error">Invalid email</Field.Error>
        </Field.Root>,
      );
      expect(screen.getByTestId("error")).toBeInTheDocument();
    });

    it("has role=alert", () => {
      render(
        <Field.Root id="error-role" invalid>
          <Field.Control>
            <input />
          </Field.Control>
          <Field.Error data-testid="error">Bad</Field.Error>
        </Field.Root>,
      );
      expect(screen.getByTestId("error")).toHaveAttribute("role", "alert");
    });

    it("has data-forge-part=error and data-forge-scope=field", () => {
      render(
        <Field.Root id="error-attrs" invalid>
          <Field.Control>
            <input />
          </Field.Control>
          <Field.Error data-testid="error">Bad</Field.Error>
        </Field.Root>,
      );
      expect(screen.getByTestId("error")).toHaveAttribute("data-forge-part", "error");
      expect(screen.getByTestId("error")).toHaveAttribute("data-forge-scope", "field");
    });

    it("Control has aria-invalid=true when Field.Root is invalid", () => {
      render(
        <Field.Root id="invalid-control" invalid>
          <Field.Control>
            <input data-testid="control" />
          </Field.Control>
        </Field.Root>,
      );
      expect(screen.getByTestId("control")).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("RequiredIndicator", () => {
    it("does not render when required=false", () => {
      render(
        <Field.Root id="req-hidden">
          <Field.Label>
            Email <Field.RequiredIndicator data-testid="req" />
          </Field.Label>
          <Field.Control>
            <input />
          </Field.Control>
        </Field.Root>,
      );
      expect(screen.queryByTestId("req")).not.toBeInTheDocument();
    });

    it("renders when required=true", () => {
      render(
        <Field.Root id="req-shown" required>
          <Field.Label>
            Email <Field.RequiredIndicator data-testid="req" />
          </Field.Label>
          <Field.Control>
            <input />
          </Field.Control>
        </Field.Root>,
      );
      expect(screen.getByTestId("req")).toBeInTheDocument();
    });

    it("is hidden from screen readers (aria-hidden=true)", () => {
      render(
        <Field.Root id="req-aria" required>
          <Field.Label>
            Email <Field.RequiredIndicator data-testid="req" />
          </Field.Label>
          <Field.Control>
            <input />
          </Field.Control>
        </Field.Root>,
      );
      expect(screen.getByTestId("req")).toHaveAttribute("aria-hidden", "true");
    });

    it("has data-forge-part=required-indicator and data-forge-scope=field", () => {
      render(
        <Field.Root id="req-attrs" required>
          <Field.Label>
            Email <Field.RequiredIndicator data-testid="req" />
          </Field.Label>
          <Field.Control>
            <input />
          </Field.Control>
        </Field.Root>,
      );
      expect(screen.getByTestId("req")).toHaveAttribute("data-forge-part", "required-indicator");
      expect(screen.getByTestId("req")).toHaveAttribute("data-forge-scope", "field");
    });

    it("Control has aria-required=true when required", () => {
      render(
        <Field.Root id="req-control" required>
          <Field.Control>
            <input data-testid="control" />
          </Field.Control>
        </Field.Root>,
      );
      expect(screen.getByTestId("control")).toHaveAttribute("aria-required", "true");
    });
  });

  describe("Group / GroupLabel", () => {
    it("Group has role=group", () => {
      render(
        <Field.Root id="group">
          <Field.Group data-testid="group">
            <Field.GroupLabel>Options</Field.GroupLabel>
            <input type="checkbox" />
          </Field.Group>
        </Field.Root>,
      );
      expect(screen.getByTestId("group")).toHaveAttribute("role", "group");
    });

    it("Group aria-labelledby matches GroupLabel id", () => {
      render(
        <Field.Root id="group-label">
          <Field.Group data-testid="group">
            <Field.GroupLabel data-testid="group-label">Options</Field.GroupLabel>
            <input type="checkbox" />
          </Field.Group>
        </Field.Root>,
      );
      expect(screen.getByTestId("group")).toHaveAttribute(
        "aria-labelledby",
        screen.getByTestId("group-label").id,
      );
    });
  });

  describe("asChild", () => {
    it("Label asChild renders consumer element with label props", () => {
      render(
        <Field.Root id="aschild-label">
          <Field.Label asChild>
            <span data-testid="span-label">Email</span>
          </Field.Label>
          <Field.Control>
            <input data-testid="control" />
          </Field.Control>
        </Field.Root>,
      );
      const el = screen.getByTestId("span-label");
      expect(el.tagName).toBe("SPAN");
      expect(el).toHaveAttribute("for", screen.getByTestId("control").id);
    });
  });

  describe("reactivity — invalid prop toggle", () => {
    it("Error appears when parent sets invalid=true", async () => {
      const user = userEvent.setup();

      function Wrapper() {
        const [invalid, setInvalid] = React.useState(false);
        return (
          <div>
            <button data-testid="toggle" onClick={() => setInvalid((v) => !v)}>
              Toggle
            </button>
            <Field.Root id="reactive" invalid={invalid}>
              <Field.Control>
                <input />
              </Field.Control>
              <Field.Error data-testid="error">Bad</Field.Error>
            </Field.Root>
          </div>
        );
      }

      render(<Wrapper />);
      expect(screen.queryByTestId("error")).not.toBeInTheDocument();
      await user.click(screen.getByTestId("toggle"));
      expect(screen.getByTestId("error")).toBeInTheDocument();
    });
  });

  describe("throws when used outside Root", () => {
    it("Label throws without Field.Root", () => {
      expect(() => render(<Field.Label>test</Field.Label>)).toThrow(
        "Field compound parts must be used inside <Field.Root>",
      );
    });
  });
});
