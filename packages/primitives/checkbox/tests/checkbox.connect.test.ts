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
// getRootProps
// ---------------------------------------------------------------------------

describe("connectCheckbox — getRootProps", () => {
  it("data-forge-part=root", () => {
    const { api } = makeApi();
    expect(api.getRootProps()["data-forge-part"]).toBe("root");
  });

  it("data-state reflects current checkbox state", () => {
    expect(makeApi({}, "checked").api.getRootProps()["data-state"]).toBe("checked");
    expect(makeApi({}, "unchecked").api.getRootProps()["data-state"]).toBe("unchecked");
    expect(makeApi({}, "indeterminate").api.getRootProps()["data-state"]).toBe("indeterminate");
  });

  it("data-disabled present when disabled=true", () => {
    expect(makeApi({ disabled: true }).api.getRootProps()["data-disabled"]).toBe("");
  });

  it("data-disabled absent when disabled=false", () => {
    expect(makeApi({ disabled: false }).api.getRootProps()["data-disabled"]).toBeUndefined();
  });

  it("data-required present when required=true", () => {
    expect(makeApi({ required: true }).api.getRootProps()["data-required"]).toBe("");
  });

  it("ref callback registers rootEl on machine", () => {
    const ctx = makeCtx();
    const send = vi.fn();
    const machine = { setContext: vi.fn() };
    const api = connectCheckbox(makeSnapshot(ctx, "unchecked"), send, machine);
    const el = document.createElement("div");
    api.getRootProps().ref(el);
    expect(machine.setContext).toHaveBeenCalledWith({ rootEl: el });
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
    expect(makeApi({}, "indeterminate").api.getIndicatorProps()["data-state"]).toBe(
      "indeterminate",
    );
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

  it("form attribute present when form is set", () => {
    const props = makeApi({ form: "my-form" }).api.getHiddenInputProps();
    expect((props as Record<string, unknown>)["form"]).toBe("my-form");
  });

  it("form attribute absent when form is undefined", () => {
    const props = makeApi({ form: undefined }).api.getHiddenInputProps();
    expect((props as Record<string, unknown>)["form"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getRootProps — readOnly branch (line 35)
// ---------------------------------------------------------------------------

describe("connectCheckbox — getRootProps readOnly", () => {
  it("data-readonly present when readOnly=true", () => {
    expect(makeApi({ readOnly: true }).api.getRootProps()["data-readonly"]).toBe("");
  });

  it("data-readonly absent when readOnly=false", () => {
    expect(makeApi({ readOnly: false }).api.getRootProps()["data-readonly"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getIndicatorProps — disabled branch (line 70)
// ---------------------------------------------------------------------------

describe("connectCheckbox — getIndicatorProps disabled", () => {
  it("data-disabled present when disabled=true", () => {
    expect(makeApi({ disabled: true }).api.getIndicatorProps()["data-disabled"]).toBe("");
  });

  it("data-disabled absent when disabled=false", () => {
    expect(makeApi({ disabled: false }).api.getIndicatorProps()["data-disabled"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getLabelProps — disabled branch (line 80)
// ---------------------------------------------------------------------------

describe("connectCheckbox — getLabelProps disabled", () => {
  it("data-disabled present when disabled=true", () => {
    expect(makeApi({ disabled: true }).api.getLabelProps()["data-disabled"]).toBe("");
  });

  it("data-disabled absent when disabled=false", () => {
    expect(makeApi({ disabled: false }).api.getLabelProps()["data-disabled"]).toBeUndefined();
  });
});
