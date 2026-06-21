import { describe, expect, it } from "vitest";
import { connectField, createFieldIds } from "../src/field.connect.js";
import type { FieldContext } from "../src/field.types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCtx(overrides: Partial<FieldContext> = {}): FieldContext {
  return {
    ...createFieldIds(overrides.controlId ?? "f"),
    invalid: false,
    required: false,
    disabled: false,
    readOnly: false,
    hasDescription: false,
    hasError: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// createFieldIds
// ---------------------------------------------------------------------------

describe("createFieldIds", () => {
  it("derives all IDs from the provided base id", () => {
    const ids = createFieldIds("email");
    expect(ids.controlId).toBe("email");
    expect(ids.labelId).toBe("email-label");
    expect(ids.descriptionId).toBe("email-description");
    expect(ids.errorId).toBe("email-error");
  });

  it("auto-generates a unique id when none provided", () => {
    const a = createFieldIds();
    const b = createFieldIds();
    expect(a.controlId).toMatch(/^forge-field-\d+$/);
    expect(a.controlId).not.toBe(b.controlId);
  });
});

// ---------------------------------------------------------------------------
// connectField — getLabelProps
// ---------------------------------------------------------------------------

describe("connectField — getLabelProps", () => {
  it("returns label id and htmlFor pointing at control", () => {
    const props = connectField(makeCtx({ controlId: "name" })).getLabelProps();
    expect(props.id).toBe("name-label");
    expect(props.htmlFor).toBe("name");
  });
});

// ---------------------------------------------------------------------------
// connectField — getControlProps
// ---------------------------------------------------------------------------

describe("connectField — getControlProps", () => {
  it("returns control id and aria-labelledby", () => {
    const props = connectField(makeCtx({ controlId: "name" })).getControlProps();
    expect(props.id).toBe("name");
    expect(props["aria-labelledby"]).toBe("name-label");
  });

  it("aria-describedby is undefined when hasDescription=false and hasError=false", () => {
    expect(connectField(makeCtx()).getControlProps()["aria-describedby"]).toBeUndefined();
  });

  it("aria-describedby includes descriptionId when hasDescription=true", () => {
    const ctx = makeCtx({ hasDescription: true });
    expect(connectField(ctx).getControlProps()["aria-describedby"]).toBe("f-description");
  });

  it("aria-describedby includes errorId when hasError=true", () => {
    const ctx = makeCtx({ hasError: true });
    expect(connectField(ctx).getControlProps()["aria-describedby"]).toBe("f-error");
  });

  it("aria-describedby includes both when hasDescription=true and hasError=true", () => {
    const ctx = makeCtx({ hasDescription: true, hasError: true });
    expect(connectField(ctx).getControlProps()["aria-describedby"]).toBe("f-description f-error");
  });

  it("reflects invalid=true via aria-invalid", () => {
    expect(connectField(makeCtx({ invalid: true })).getControlProps()["aria-invalid"]).toBe(true);
    expect(connectField(makeCtx()).getControlProps()["aria-invalid"]).toBeUndefined();
  });

  it("reflects required=true via aria-required and required attr", () => {
    const props = connectField(makeCtx({ required: true })).getControlProps();
    expect(props["aria-required"]).toBe(true);
    expect(props.required).toBe(true);
  });

  it("reflects disabled=true via aria-disabled and disabled attr", () => {
    const props = connectField(makeCtx({ disabled: true })).getControlProps();
    expect(props["aria-disabled"]).toBe(true);
    expect(props.disabled).toBe(true);
  });

  it("reflects readOnly=true via aria-readonly and readOnly attr", () => {
    const props = connectField(makeCtx({ readOnly: true })).getControlProps();
    expect(props["aria-readonly"]).toBe(true);
    expect(props.readOnly).toBe(true);
  });

  it("is pure — calling again with different context returns fresh values", () => {
    const ctx1 = makeCtx({ hasDescription: false });
    const ctx2 = makeCtx({ hasDescription: true });
    expect(connectField(ctx1).getControlProps()["aria-describedby"]).toBeUndefined();
    expect(connectField(ctx2).getControlProps()["aria-describedby"]).toBe("f-description");
  });
});

// ---------------------------------------------------------------------------
// connectField — getDescriptionProps / getErrorProps
// ---------------------------------------------------------------------------

describe("connectField — getDescriptionProps", () => {
  it("returns the description id", () => {
    expect(connectField(makeCtx()).getDescriptionProps().id).toBe("f-description");
  });
});

describe("connectField — getErrorProps", () => {
  it("returns error id, role=alert, aria-live=assertive", () => {
    const props = connectField(makeCtx()).getErrorProps();
    expect(props.id).toBe("f-error");
    expect(props.role).toBe("alert");
    expect(props["aria-live"]).toBe("assertive");
  });
});

// ---------------------------------------------------------------------------
// connectField — pure (no side effects)
// ---------------------------------------------------------------------------

describe("connectField — purity", () => {
  it("does not mutate the passed context", () => {
    const ctx = makeCtx();
    connectField(ctx);
    expect(ctx.hasDescription).toBe(false);
  });

  it("reads context lazily — same connect instance reflects context changes", () => {
    const ctx = makeCtx() as FieldContext;
    const connect = connectField(ctx);
    expect(connect.getControlProps()["aria-describedby"]).toBeUndefined();
    // Simulate Vue reactive mutation (frameworks own the state)
    ctx.hasDescription = true;
    expect(connect.getControlProps()["aria-describedby"]).toBe("f-description");
  });
});
