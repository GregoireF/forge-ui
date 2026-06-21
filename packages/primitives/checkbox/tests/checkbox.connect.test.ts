import { describe, expect, it, vi } from "vitest";
import { connectCheckbox } from "../src/checkbox.connect.js";
import type { CheckboxContext, CheckboxState } from "../src/checkbox.types.js";

function makeCtx(overrides: Partial<CheckboxContext> = {}): CheckboxContext {
  return {
    id: "test-checkbox",
    disabled: false,
    required: false,
    readOnly: false,
    name: undefined,
    value: "on",
    form: undefined,
    rootEl: null,
    ...overrides,
  };
}

function makeSnapshot(ctx: CheckboxContext, state: CheckboxState = "unchecked") {
  return { value: state, context: ctx, matches: (s: string) => s === state };
}

function makeApi(overrides: Partial<CheckboxContext> = {}, state: CheckboxState = "unchecked") {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  return { api: connectCheckbox(makeSnapshot(ctx, state), send, machine), send };
}

// ---------------------------------------------------------------------------
// checked / dataState
// ---------------------------------------------------------------------------

describe("connectCheckbox — checked", () => {
  it("checked=false when state=unchecked", () => {
    const { api } = makeApi({}, "unchecked");
    expect(api.checked).toBe(false);
    expect(api.dataState).toBe("unchecked");
    expect(api.isChecked).toBe(false);
    expect(api.isIndeterminate).toBe(false);
  });

  it("checked=true when state=checked", () => {
    const { api } = makeApi({}, "checked");
    expect(api.checked).toBe(true);
    expect(api.dataState).toBe("checked");
    expect(api.isChecked).toBe(true);
    expect(api.isIndeterminate).toBe(false);
  });

  it('checked="indeterminate" when state=indeterminate', () => {
    const { api } = makeApi({}, "indeterminate");
    expect(api.checked).toBe("indeterminate");
    expect(api.dataState).toBe("indeterminate");
    expect(api.isChecked).toBe(false);
    expect(api.isIndeterminate).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getControlProps — ARIA
// ---------------------------------------------------------------------------

describe("connectCheckbox — getControlProps", () => {
  it("role=checkbox", () => {
    const { api } = makeApi();
    expect(api.getControlProps().role).toBe("checkbox");
  });

  it("aria-checked=false when unchecked", () => {
    const { api } = makeApi({}, "unchecked");
    expect(api.getControlProps()["aria-checked"]).toBe(false);
  });

  it("aria-checked=true when checked", () => {
    const { api } = makeApi({}, "checked");
    expect(api.getControlProps()["aria-checked"]).toBe(true);
  });

  it('aria-checked="mixed" when indeterminate', () => {
    const { api } = makeApi({}, "indeterminate");
    expect(api.getControlProps()["aria-checked"]).toBe("mixed");
  });

  it("aria-disabled=true when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getControlProps()["aria-disabled"]).toBe(true);
  });

  it("tabIndex=-1 when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getControlProps().tabIndex).toBe(-1);
  });

  it("tabIndex=0 when enabled", () => {
    const { api } = makeApi();
    expect(api.getControlProps().tabIndex).toBe(0);
  });

  it("onClick sends TOGGLE when enabled", () => {
    const { api, send } = makeApi();
    api.getControlProps().onClick({ preventDefault: vi.fn() });
    expect(send).toHaveBeenCalledWith("TOGGLE");
  });

  it("onClick does not send when disabled", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getControlProps().onClick({ preventDefault: vi.fn() });
    expect(send).not.toHaveBeenCalled();
  });

  it("onClick does not send when readOnly", () => {
    const { api, send } = makeApi({ readOnly: true });
    api.getControlProps().onClick({ preventDefault: vi.fn() });
    expect(send).not.toHaveBeenCalled();
  });

  it("aria-required=true when required", () => {
    const { api } = makeApi({ required: true });
    expect(api.getControlProps()["aria-required"]).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getLabelProps
// ---------------------------------------------------------------------------

describe("connectCheckbox — getLabelProps", () => {
  it("htmlFor matches control id", () => {
    const { api } = makeApi({ id: "cb1" });
    expect(api.getLabelProps().htmlFor).toBe(api.getControlProps().id);
  });

  it("data-forge-scope=checkbox", () => {
    const { api } = makeApi();
    expect(api.getLabelProps()["data-forge-scope"]).toBe("checkbox");
  });
});

// ---------------------------------------------------------------------------
// getIndicatorProps
// ---------------------------------------------------------------------------

describe("connectCheckbox — getIndicatorProps", () => {
  it("aria-hidden=true", () => {
    const { api } = makeApi();
    expect(api.getIndicatorProps()["aria-hidden"]).toBe(true);
  });

  it("data-state reflects checked state", () => {
    expect(makeApi({}, "checked").api.getIndicatorProps()["data-state"]).toBe("checked");
    expect(makeApi({}, "indeterminate").api.getIndicatorProps()["data-state"]).toBe("indeterminate");
    expect(makeApi({}, "unchecked").api.getIndicatorProps()["data-state"]).toBe("unchecked");
  });
});

// ---------------------------------------------------------------------------
// getHiddenInputProps
// ---------------------------------------------------------------------------

describe("connectCheckbox — getHiddenInputProps", () => {
  it("type=checkbox", () => {
    const { api } = makeApi();
    expect(api.getHiddenInputProps().type).toBe("checkbox");
  });

  it("aria-hidden=true", () => {
    const { api } = makeApi();
    expect(api.getHiddenInputProps()["aria-hidden"]).toBe(true);
  });

  it("tabIndex=-1", () => {
    const { api } = makeApi();
    expect(api.getHiddenInputProps().tabIndex).toBe(-1);
  });

  it("checked=true when state=checked", () => {
    const { api } = makeApi({}, "checked");
    expect(api.getHiddenInputProps().checked).toBe(true);
  });
});
