import { afterEach, describe, expect, it, vi } from "vitest";
import { createAccordionMachine } from "../src/accordion.machine.js";

let active: ReturnType<typeof createAccordionMachine>[] = [];

function make(opts: Parameters<typeof createAccordionMachine>[0] = {}) {
  const m = createAccordionMachine(opts);
  m.start();
  active.push(m);
  return m;
}

afterEach(() => {
  for (const m of active) m.stop();
  active = [];
});

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe("createAccordionMachine — initial state", () => {
  it("starts with value=[] by default", () => {
    const m = make();
    expect(m.getSnapshot().context.value).toEqual([]);
  });

  it("defaultValue string → normalises to string[]", () => {
    const m = make({ defaultValue: "what" });
    expect(m.getSnapshot().context.value).toEqual(["what"]);
  });

  it("defaultValue string[] → kept as-is", () => {
    const m = make({ defaultValue: ["what", "why"] });
    expect(m.getSnapshot().context.value).toEqual(["what", "why"]);
  });

  it("value option overrides defaultValue", () => {
    const m = make({ value: ["force"], defaultValue: "ignored" });
    expect(m.getSnapshot().context.value).toEqual(["force"]);
  });

  it("type defaults to 'single'", () => {
    const m = make();
    expect(m.getSnapshot().context.type).toBe("single");
  });

  it("collapsible defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.collapsible).toBe(false);
  });

  it("disabled defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.disabled).toBe(false);
  });

  it("always in idle state", () => {
    const m = make();
    expect(m.getSnapshot().matches("idle")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// TOGGLE_ITEM — single mode
// ---------------------------------------------------------------------------

describe("createAccordionMachine — TOGGLE_ITEM (single mode)", () => {
  it("opens a closed item", () => {
    const m = make({ type: "single" });
    m.send({ type: "TOGGLE_ITEM", value: "what" });
    expect(m.getSnapshot().context.value).toEqual(["what"]);
  });

  it("opening one item closes the previous one (single exclusivity)", () => {
    const m = make({ type: "single", defaultValue: "what" });
    m.send({ type: "TOGGLE_ITEM", value: "why" });
    expect(m.getSnapshot().context.value).toEqual(["why"]);
    expect(m.getSnapshot().context.value).not.toContain("what");
  });

  it("does NOT close when collapsible=false", () => {
    const m = make({ type: "single", collapsible: false, defaultValue: "what" });
    m.send({ type: "TOGGLE_ITEM", value: "what" });
    expect(m.getSnapshot().context.value).toEqual(["what"]);
  });

  it("closes when collapsible=true", () => {
    const m = make({ type: "single", collapsible: true, defaultValue: "what" });
    m.send({ type: "TOGGLE_ITEM", value: "what" });
    expect(m.getSnapshot().context.value).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// TOGGLE_ITEM — multiple mode
// ---------------------------------------------------------------------------

describe("createAccordionMachine — TOGGLE_ITEM (multiple mode)", () => {
  it("opens a closed item without closing others", () => {
    const m = make({ type: "multiple", defaultValue: "what" });
    m.send({ type: "TOGGLE_ITEM", value: "why" });
    expect(m.getSnapshot().context.value).toContain("what");
    expect(m.getSnapshot().context.value).toContain("why");
  });

  it("closes an open item", () => {
    const m = make({ type: "multiple", defaultValue: ["what", "why"] });
    m.send({ type: "TOGGLE_ITEM", value: "what" });
    expect(m.getSnapshot().context.value).not.toContain("what");
    expect(m.getSnapshot().context.value).toContain("why");
  });

  it("can have all items open simultaneously", () => {
    const m = make({ type: "multiple" });
    m.send({ type: "TOGGLE_ITEM", value: "a" });
    m.send({ type: "TOGGLE_ITEM", value: "b" });
    m.send({ type: "TOGGLE_ITEM", value: "c" });
    expect(m.getSnapshot().context.value).toEqual(["a", "b", "c"]);
  });
});

// ---------------------------------------------------------------------------
// Disabled guard
// ---------------------------------------------------------------------------

describe("createAccordionMachine — disabled guard", () => {
  it("TOGGLE_ITEM is a no-op when disabled=true", () => {
    const m = make({ disabled: true });
    m.send({ type: "TOGGLE_ITEM", value: "what" });
    expect(m.getSnapshot().context.value).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// SET_VALUE
// ---------------------------------------------------------------------------

describe("createAccordionMachine — SET_VALUE", () => {
  it("replaces the value array", () => {
    const m = make({ defaultValue: "old" });
    m.send({ type: "SET_VALUE", value: ["new1", "new2"] });
    expect(m.getSnapshot().context.value).toEqual(["new1", "new2"]);
  });

  it("can set to empty array", () => {
    const m = make({ defaultValue: "what" });
    m.send({ type: "SET_VALUE", value: [] });
    expect(m.getSnapshot().context.value).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// onValueChange callback (WAI-ARIA: inform parent of controlled value change)
// ---------------------------------------------------------------------------

describe("createAccordionMachine — onValueChange", () => {
  it("called with new value on TOGGLE_ITEM open", () => {
    const cb = vi.fn();
    const m = make({ onValueChange: cb });
    m.send({ type: "TOGGLE_ITEM", value: "x" });
    expect(cb).toHaveBeenCalledWith(["x"]);
  });

  it("called with [] on close (collapsible=true)", () => {
    const cb = vi.fn();
    const m = make({ collapsible: true, defaultValue: "x", onValueChange: cb });
    m.send({ type: "TOGGLE_ITEM", value: "x" });
    expect(cb).toHaveBeenLastCalledWith([]);
  });

  it("NOT called when disabled guard fires", () => {
    const cb = vi.fn();
    const m = make({ disabled: true, onValueChange: cb });
    m.send({ type: "TOGGLE_ITEM", value: "x" });
    expect(cb).not.toHaveBeenCalled();
  });

  it("NOT called when collapsible=false and item already open", () => {
    const cb = vi.fn();
    const m = make({ collapsible: false, defaultValue: "x", onValueChange: cb });
    m.send({ type: "TOGGLE_ITEM", value: "x" }); // no-op
    expect(cb).not.toHaveBeenCalled();
  });

  it("called with SET_VALUE new value", () => {
    const cb = vi.fn();
    const m = make({ onValueChange: cb });
    m.send({ type: "SET_VALUE", value: ["a", "b"] });
    expect(cb).toHaveBeenCalledWith(["a", "b"]);
  });
});
