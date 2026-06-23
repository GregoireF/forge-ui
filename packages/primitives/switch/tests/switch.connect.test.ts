import { describe, expect, it, vi } from "vitest";
import { connectSwitch } from "../src/switch.connect.js";
import type { SwitchContext, SwitchState } from "../src/switch.types.js";

function makeCtx(overrides: Partial<SwitchContext> = {}): SwitchContext {
  return {
    id: "test-switch",
    disabled: false,
    required: false,
    readOnly: false,
    invalid: false,
    name: undefined,
    value: "on",
    form: undefined,
    rootEl: null,
    ...overrides,
  };
}

function makeSnapshot(ctx: SwitchContext, state: SwitchState = "off") {
  return { value: state, context: ctx, matches: (s: string) => s === state };
}

function makeApi(overrides: Partial<SwitchContext> = {}, state: SwitchState = "off") {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  return { api: connectSwitch(makeSnapshot(ctx, state), send, machine), send };
}

// ---------------------------------------------------------------------------
// isChecked / dataState
// ---------------------------------------------------------------------------

describe("connectSwitch — isChecked", () => {
  it("isChecked=false when state=off", () => {
    const { api } = makeApi({}, "off");
    expect(api.isChecked).toBe(false);
    expect(api.dataState).toBe("off");
  });

  it("isChecked=true when state=on", () => {
    const { api } = makeApi({}, "on");
    expect(api.isChecked).toBe(true);
    expect(api.dataState).toBe("on");
  });
});

// ---------------------------------------------------------------------------
// getRootProps
// ---------------------------------------------------------------------------

describe("connectSwitch — getRootProps", () => {
  it("data-forge-part=root", () => {
    const { api } = makeApi();
    expect(api.getRootProps()["data-forge-part"]).toBe("root");
  });

  it("data-state=off when off", () => {
    expect(makeApi({}, "off").api.getRootProps()["data-state"]).toBe("off");
  });

  it("data-state=on when on", () => {
    expect(makeApi({}, "on").api.getRootProps()["data-state"]).toBe("on");
  });

  it("data-disabled present when disabled=true", () => {
    expect(makeApi({ disabled: true }).api.getRootProps()["data-disabled"]).toBe("");
  });

  it("data-required present when required=true", () => {
    expect(makeApi({ required: true }).api.getRootProps()["data-required"]).toBe("");
  });

  it("data-invalid present when invalid=true", () => {
    expect(makeApi({ invalid: true }).api.getRootProps()["data-invalid"]).toBe("");
  });
});

// ---------------------------------------------------------------------------
// getControlProps — ARIA
// ---------------------------------------------------------------------------

describe("connectSwitch — getControlProps", () => {
  it("role=switch", () => {
    const { api } = makeApi();
    expect(api.getControlProps().role).toBe("switch");
  });

  it("aria-checked=false when off", () => {
    const { api } = makeApi({}, "off");
    expect(api.getControlProps()["aria-checked"]).toBe(false);
  });

  it("aria-checked=true when on", () => {
    const { api } = makeApi({}, "on");
    expect(api.getControlProps()["aria-checked"]).toBe(true);
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

  it("aria-required=true when required", () => {
    const { api } = makeApi({ required: true });
    expect(api.getControlProps()["aria-required"]).toBe(true);
  });

  it("aria-invalid=true when invalid", () => {
    const { api } = makeApi({ invalid: true });
    expect(api.getControlProps()["aria-invalid"]).toBe(true);
  });

  // WAI-ARIA: aria-readonly informs AT the switch value cannot be changed
  // even though it is visible and receives focus.
  it("aria-readonly=true when readOnly", () => {
    const { api } = makeApi({ readOnly: true });
    expect(api.getControlProps()["aria-readonly"]).toBe(true);
  });

  it("aria-readonly absent when not readOnly", () => {
    const { api } = makeApi({ readOnly: false });
    expect((api.getControlProps() as Record<string, unknown>)["aria-readonly"]).toBeUndefined();
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
});

// ---------------------------------------------------------------------------
// getLabelProps
// ---------------------------------------------------------------------------

describe("connectSwitch — getLabelProps", () => {
  it("htmlFor matches control id", () => {
    const { api } = makeApi({ id: "sw1" });
    expect(api.getLabelProps().htmlFor).toBe(api.getControlProps().id);
  });

  it("data-disabled when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getLabelProps()["data-disabled"]).toBe("");
  });
});

// ---------------------------------------------------------------------------
// getHiddenInputProps
// ---------------------------------------------------------------------------

describe("connectSwitch — getHiddenInputProps", () => {
  it("type=checkbox", () => {
    const { api } = makeApi();
    expect(api.getHiddenInputProps().type).toBe("checkbox");
  });

  it("aria-hidden=true", () => {
    const { api } = makeApi();
    expect(api.getHiddenInputProps()["aria-hidden"]).toBe(true);
  });

  it("checked reflects isChecked", () => {
    const { api: off } = makeApi({}, "off");
    expect(off.getHiddenInputProps().checked).toBe(false);
    const { api: on } = makeApi({}, "on");
    expect(on.getHiddenInputProps().checked).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getThumbProps
// ---------------------------------------------------------------------------

describe("connectSwitch — getThumbProps", () => {
  it("data-state matches dataState", () => {
    const { api } = makeApi({}, "on");
    expect(api.getThumbProps()["data-state"]).toBe("on");
  });

  it("aria-hidden=true", () => {
    const { api } = makeApi();
    expect(api.getThumbProps()["aria-hidden"]).toBe(true);
  });
});
