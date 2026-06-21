import { describe, expect, it, vi } from "vitest";
import { connectAccordion } from "../src/accordion.connect.js";
import type { AccordionContext } from "../src/accordion.types.js";

function makeCtx(overrides: Partial<AccordionContext> = {}): AccordionContext {
  return {
    value: [],
    type: "single",
    collapsible: false,
    disabled: false,
    ...overrides,
  };
}

function makeSnapshot(ctx: AccordionContext) {
  return { value: "idle" as const, context: ctx, matches: (s: string) => s === "idle" };
}

function makeApi(overrides: Partial<AccordionContext> = {}) {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  return { api: connectAccordion(makeSnapshot(ctx), send, machine), send, ctx };
}

// ---------------------------------------------------------------------------
// getRootProps
// ---------------------------------------------------------------------------

describe("connectAccordion — getRootProps", () => {
  it("has data-forge-scope=accordion and data-forge-part=root", () => {
    const { api } = makeApi();
    expect(api.getRootProps()["data-forge-scope"]).toBe("accordion");
    expect(api.getRootProps()["data-forge-part"]).toBe("root");
  });

  it("sets data-disabled when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getRootProps()["data-disabled"]).toBe("");
  });

  it("does not set data-disabled when enabled", () => {
    const { api } = makeApi();
    expect(api.getRootProps()["data-disabled"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getItemProps
// ---------------------------------------------------------------------------

describe("connectAccordion — getItemProps", () => {
  it("data-state=closed when item not in value", () => {
    const { api } = makeApi({ value: [] });
    expect(api.getItemProps("a")["data-state"]).toBe("closed");
  });

  it("data-state=open when item is in value", () => {
    const { api } = makeApi({ value: ["a"] });
    expect(api.getItemProps("a")["data-state"]).toBe("open");
  });
});

// ---------------------------------------------------------------------------
// getTriggerProps
// ---------------------------------------------------------------------------

describe("connectAccordion — getTriggerProps", () => {
  it("aria-expanded=false when item closed", () => {
    const { api } = makeApi({ value: [] });
    expect(api.getTriggerProps("a")["aria-expanded"]).toBe(false);
  });

  it("aria-expanded=true when item open", () => {
    const { api } = makeApi({ value: ["a"] });
    expect(api.getTriggerProps("a")["aria-expanded"]).toBe(true);
  });

  it("aria-controls points to content id", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps("x")["aria-controls"]).toBe("forge-accordion-content-x");
  });

  it("id follows forge naming convention", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps("x").id).toBe("forge-accordion-trigger-x");
  });

  it("onClick sends TOGGLE_ITEM", () => {
    const { api, send } = makeApi();
    api.getTriggerProps("a").onClick();
    expect(send).toHaveBeenCalledWith({ type: "TOGGLE_ITEM", value: "a" });
  });

  it("disabled: onClick does not send", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getTriggerProps("a").onClick();
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getContentProps
// ---------------------------------------------------------------------------

describe("connectAccordion — getContentProps", () => {
  it("role=region", () => {
    const { api } = makeApi();
    expect(api.getContentProps("a").role).toBe("region");
  });

  it("aria-labelledby points to trigger id", () => {
    const { api } = makeApi();
    expect(api.getContentProps("x")["aria-labelledby"]).toBe("forge-accordion-trigger-x");
  });

  it("data-state=open when item is open", () => {
    const { api } = makeApi({ value: ["x"] });
    expect(api.getContentProps("x")["data-state"]).toBe("open");
  });

  it("data-state=closed when item is closed", () => {
    const { api } = makeApi({ value: [] });
    expect(api.getContentProps("x")["data-state"]).toBe("closed");
  });
});

// ---------------------------------------------------------------------------
// value exposure
// ---------------------------------------------------------------------------

describe("connectAccordion — value", () => {
  it("exposes current value array", () => {
    const { api } = makeApi({ value: ["foo", "bar"] });
    expect(api.value).toEqual(["foo", "bar"]);
  });

  it("is pure — different contexts return independent values", () => {
    const { api: api1 } = makeApi({ value: ["a"] });
    const { api: api2 } = makeApi({ value: ["b"] });
    expect(api1.value).toEqual(["a"]);
    expect(api2.value).toEqual(["b"]);
  });
});
