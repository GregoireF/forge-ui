import { describe, expect, it, vi } from "vitest";
import { connectRadioGroup } from "../src/radio-group.connect.js";
import type { RadioGroupContext } from "../src/radio-group.types.js";

function makeCtx(overrides: Partial<RadioGroupContext> = {}): RadioGroupContext {
  return {
    value: undefined,
    disabled: false,
    required: false,
    orientation: "vertical",
    name: "my-radio",
    ...overrides,
  };
}

function makeSnapshot(ctx: RadioGroupContext) {
  return { value: "idle" as const, context: ctx, matches: (s: string) => s === "idle" };
}

function makeApi(overrides: Partial<RadioGroupContext> = {}) {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  return { api: connectRadioGroup(makeSnapshot(ctx), send, machine), send };
}

// ---------------------------------------------------------------------------
// getRootProps
// ---------------------------------------------------------------------------

describe("connectRadioGroup — getRootProps", () => {
  it("role=radiogroup", () => {
    const { api } = makeApi();
    expect(api.getRootProps().role).toBe("radiogroup");
  });

  it("data-forge-scope=radio-group", () => {
    const { api } = makeApi();
    expect(api.getRootProps()["data-forge-scope"]).toBe("radio-group");
  });

  it("data-disabled when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getRootProps()["data-disabled"]).toBe("");
  });

  it("aria-required when required", () => {
    const { api } = makeApi({ required: true });
    expect(api.getRootProps()["aria-required"]).toBe(true);
  });

  it("data-orientation reflects orientation", () => {
    const { api } = makeApi({ orientation: "horizontal" });
    expect(api.getRootProps()["data-orientation"]).toBe("horizontal");
  });
});

// ---------------------------------------------------------------------------
// getItemProps
// ---------------------------------------------------------------------------

describe("connectRadioGroup — getItemProps", () => {
  it("data-state=checked when item is selected", () => {
    const { api } = makeApi({ value: "a" });
    expect(api.getItemProps("a")["data-state"]).toBe("checked");
  });

  it("data-state=unchecked when item is not selected", () => {
    const { api } = makeApi({ value: "a" });
    expect(api.getItemProps("b")["data-state"]).toBe("unchecked");
  });
});

// ---------------------------------------------------------------------------
// getRadioProps
// ---------------------------------------------------------------------------

describe("connectRadioGroup — getRadioProps", () => {
  it("role=radio", () => {
    const { api } = makeApi();
    expect(api.getRadioProps("a").role).toBe("radio");
  });

  it("aria-checked=true when item is selected", () => {
    const { api } = makeApi({ value: "a" });
    expect(api.getRadioProps("a")["aria-checked"]).toBe(true);
  });

  it("aria-checked=false when item is not selected", () => {
    const { api } = makeApi({ value: "b" });
    expect(api.getRadioProps("a")["aria-checked"]).toBe(false);
  });

  it("tabIndex=0 for checked item (roving tabIndex)", () => {
    const { api } = makeApi({ value: "a" });
    expect(api.getRadioProps("a").tabIndex).toBe(0);
  });

  it("tabIndex=-1 for unchecked item", () => {
    const { api } = makeApi({ value: "b" });
    expect(api.getRadioProps("a").tabIndex).toBe(-1);
  });

  it("id follows forge naming convention", () => {
    const { api } = makeApi();
    expect(api.getRadioProps("x").id).toBe("forge-radio-x");
  });

  it("onClick sends SELECT when enabled", () => {
    const { api, send } = makeApi();
    api.getRadioProps("a").onClick();
    expect(send).toHaveBeenCalledWith({ type: "SELECT", value: "a" });
  });

  it("onClick does not send when group disabled", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getRadioProps("a").onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("onClick does not send when item disabled", () => {
    const { api, send } = makeApi();
    api.getRadioProps("a", true).onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("aria-disabled when item disabled", () => {
    const { api } = makeApi();
    expect(api.getRadioProps("a", true)["aria-disabled"]).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getLabelProps
// ---------------------------------------------------------------------------

describe("connectRadioGroup — getLabelProps", () => {
  it("htmlFor matches radio id", () => {
    const { api } = makeApi();
    expect(api.getLabelProps("x").htmlFor).toBe("forge-radio-x");
  });

  it("data-state=checked when value matches", () => {
    const { api } = makeApi({ value: "x" });
    expect(api.getLabelProps("x")["data-state"]).toBe("checked");
  });
});

// ---------------------------------------------------------------------------
// getHiddenInputProps
// ---------------------------------------------------------------------------

describe("connectRadioGroup — getHiddenInputProps", () => {
  it("type=radio", () => {
    const { api } = makeApi();
    expect(api.getHiddenInputProps("a").type).toBe("radio");
  });

  it("aria-hidden=true", () => {
    const { api } = makeApi();
    expect(api.getHiddenInputProps("a")["aria-hidden"]).toBe(true);
  });

  it("checked=true when item is selected", () => {
    const { api } = makeApi({ value: "a" });
    expect(api.getHiddenInputProps("a").checked).toBe(true);
  });

  it("name reflects group name", () => {
    const { api } = makeApi({ name: "choice" });
    expect(api.getHiddenInputProps("a").name).toBe("choice");
  });
});

// ---------------------------------------------------------------------------
// value / disabled exposure
// ---------------------------------------------------------------------------

describe("connectRadioGroup — value / disabled", () => {
  it("exposes current value", () => {
    const { api } = makeApi({ value: "react" });
    expect(api.value).toBe("react");
  });

  it("exposes disabled state", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.disabled).toBe(true);
  });
});
