import { describe, expect, it } from "vitest";
import { createField } from "../src/field.js";

describe("createField — IDs", () => {
  it("generates stable IDs from id option", () => {
    const field = createField({ id: "email" });
    expect(field.context.controlId).toBe("email");
    expect(field.context.labelId).toBe("email-label");
    expect(field.context.descriptionId).toBe("email-description");
    expect(field.context.errorId).toBe("email-error");
  });

  it("auto-generates id when not provided", () => {
    const field = createField();
    expect(field.context.controlId).toMatch(/^forge-field-\d+$/);
  });

  it("each call gets a unique auto-generated id", () => {
    const a = createField();
    const b = createField();
    expect(a.context.controlId).not.toBe(b.context.controlId);
  });
});

describe("createField — default state", () => {
  it("defaults to not invalid/required/disabled/readOnly", () => {
    const field = createField({ id: "f" });
    expect(field.context.invalid).toBe(false);
    expect(field.context.required).toBe(false);
    expect(field.context.disabled).toBe(false);
    expect(field.context.readOnly).toBe(false);
  });

  it("hasDescription and hasError default to false", () => {
    const field = createField({ id: "f" });
    expect(field.context.hasDescription).toBe(false);
    expect(field.context.hasError).toBe(false);
  });
});

describe("createField — getLabelProps", () => {
  it("returns id and htmlFor pointing at control", () => {
    const field = createField({ id: "name" });
    const props = field.getLabelProps();
    expect(props.id).toBe("name-label");
    expect(props.htmlFor).toBe("name");
  });
});

describe("createField — getControlProps", () => {
  it("returns id and aria-labelledby", () => {
    const field = createField({ id: "name" });
    const props = field.getControlProps();
    expect(props.id).toBe("name");
    expect(props["aria-labelledby"]).toBe("name-label");
  });

  it("aria-describedby is undefined when no description/error", () => {
    const field = createField({ id: "f" });
    expect(field.getControlProps()["aria-describedby"]).toBeUndefined();
  });

  it("aria-describedby includes descriptionId after registerDescription", () => {
    const field = createField({ id: "f" });
    field.registerDescription();
    expect(field.getControlProps()["aria-describedby"]).toBe("f-description");
  });

  it("aria-describedby includes errorId after registerError", () => {
    const field = createField({ id: "f" });
    field.registerError();
    expect(field.getControlProps()["aria-describedby"]).toBe("f-error");
  });

  it("aria-describedby includes both when both registered", () => {
    const field = createField({ id: "f" });
    field.registerDescription();
    field.registerError();
    expect(field.getControlProps()["aria-describedby"]).toBe("f-description f-error");
  });

  it("unregisterDescription removes it from aria-describedby", () => {
    const field = createField({ id: "f" });
    field.registerDescription();
    field.registerError();
    field.unregisterDescription();
    expect(field.getControlProps()["aria-describedby"]).toBe("f-error");
  });

  it("aria-invalid set when invalid:true", () => {
    const field = createField({ id: "f", invalid: true });
    expect(field.getControlProps()["aria-invalid"]).toBe(true);
  });

  it("aria-invalid undefined when not invalid", () => {
    const field = createField({ id: "f" });
    expect(field.getControlProps()["aria-invalid"]).toBeUndefined();
  });

  it("required sets aria-required and required", () => {
    const field = createField({ id: "f", required: true });
    const props = field.getControlProps();
    expect(props["aria-required"]).toBe(true);
    expect(props.required).toBe(true);
  });

  it("disabled sets aria-disabled and disabled", () => {
    const field = createField({ id: "f", disabled: true });
    const props = field.getControlProps();
    expect(props["aria-disabled"]).toBe(true);
    expect(props.disabled).toBe(true);
  });

  it("readOnly sets aria-readonly and readOnly", () => {
    const field = createField({ id: "f", readOnly: true });
    const props = field.getControlProps();
    expect(props["aria-readonly"]).toBe(true);
    expect(props.readOnly).toBe(true);
  });
});

describe("createField — getDescriptionProps", () => {
  it("returns stable descriptionId", () => {
    const field = createField({ id: "f" });
    expect(field.getDescriptionProps().id).toBe("f-description");
  });
});

describe("createField — getErrorProps", () => {
  it("returns errorId with role=alert and aria-live=polite", () => {
    const field = createField({ id: "f" });
    const props = field.getErrorProps();
    expect(props.id).toBe("f-error");
    expect(props.role).toBe("alert");
    expect(props["aria-live"]).toBe("polite");
  });
});
