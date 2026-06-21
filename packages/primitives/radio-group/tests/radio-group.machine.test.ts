import { afterEach, describe, expect, it, vi } from "vitest";
import { createRadioGroupMachine } from "../src/radio-group.machine.js";

let active: ReturnType<typeof createRadioGroupMachine>[] = [];

function make(opts: Partial<Parameters<typeof createRadioGroupMachine>[0]> = {}) {
  const m = createRadioGroupMachine({ id: "test", ...opts });
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

describe("createRadioGroupMachine — initial state", () => {
  it("value defaults to undefined (uncontrolled)", () => {
    const m = make();
    expect(m.getSnapshot().context.value).toBeUndefined();
  });

  it("defaultValue sets initial selection", () => {
    const m = make({ defaultValue: "b" });
    expect(m.getSnapshot().context.value).toBe("b");
  });

  it("value (controlled) overrides defaultValue", () => {
    const m = make({ value: "a", defaultValue: "b" });
    expect(m.getSnapshot().context.value).toBe("a");
  });

  it("disabled defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.disabled).toBe(false);
  });

  it("required defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.required).toBe(false);
  });

  it("orientation defaults to 'vertical'", () => {
    const m = make();
    expect(m.getSnapshot().context.orientation).toBe("vertical");
  });
});

// ---------------------------------------------------------------------------
// SELECT — WAI-ARIA §3.18: radio selection (only one at a time)
// ---------------------------------------------------------------------------

describe("createRadioGroupMachine — SELECT", () => {
  it("selects a radio item", () => {
    const m = make();
    m.send({ type: "SELECT", value: "a" });
    expect(m.getSnapshot().context.value).toBe("a");
  });

  it("switching selection deselects the previous", () => {
    const m = make({ defaultValue: "a" });
    m.send({ type: "SELECT", value: "b" });
    expect(m.getSnapshot().context.value).toBe("b");
  });

  it("selecting the current item is idempotent", () => {
    const m = make({ defaultValue: "a" });
    m.send({ type: "SELECT", value: "a" });
    expect(m.getSnapshot().context.value).toBe("a");
  });
});

// ---------------------------------------------------------------------------
// Disabled guards — WAI-ARIA: disabled radio items must not be selectable
// ---------------------------------------------------------------------------

describe("createRadioGroupMachine — disabled guards", () => {
  it("SELECT is no-op when group is disabled", () => {
    const m = make({ disabled: true, defaultValue: "a" });
    m.send({ type: "SELECT", value: "b" });
    expect(m.getSnapshot().context.value).toBe("a");
  });

  it("SELECT works when group is not disabled", () => {
    const m = make({ disabled: false });
    m.send({ type: "SELECT", value: "a" });
    expect(m.getSnapshot().context.value).toBe("a");
  });
});

// ---------------------------------------------------------------------------
// SET_VALUE — controlled update
// ---------------------------------------------------------------------------

describe("createRadioGroupMachine — SET_VALUE", () => {
  it("updates value", () => {
    const m = make({ defaultValue: "a" });
    m.send({ type: "SET_VALUE", value: "c" });
    expect(m.getSnapshot().context.value).toBe("c");
  });

  it("can set to undefined (clear selection)", () => {
    const m = make({ defaultValue: "a" });
    m.send({ type: "SET_VALUE", value: undefined });
    expect(m.getSnapshot().context.value).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// onValueChange callback
// ---------------------------------------------------------------------------

describe("createRadioGroupMachine — onValueChange", () => {
  it("called with new value on SELECT", () => {
    const cb = vi.fn();
    const m = make({ onValueChange: cb });
    m.send({ type: "SELECT", value: "a" });
    expect(cb).toHaveBeenCalledWith("a");
  });

  it("NOT called when group is disabled", () => {
    const cb = vi.fn();
    const m = make({ disabled: true, onValueChange: cb });
    m.send({ type: "SELECT", value: "a" });
    expect(cb).not.toHaveBeenCalled();
  });

  it("NOT called on SET_VALUE (silent controlled update)", () => {
    const cb = vi.fn();
    const m = make({ onValueChange: cb });
    m.send({ type: "SET_VALUE", value: "b" });
    // SET_VALUE is for controlled mode — it updates value silently without triggering callback
    expect(cb).not.toHaveBeenCalled();
  });

  it("NOT called on initial start", () => {
    const cb = vi.fn();
    make({ defaultValue: "a", onValueChange: cb });
    expect(cb).not.toHaveBeenCalled();
  });
});
