import { afterEach, describe, expect, it, vi } from "vitest";
import { createCheckboxMachine } from "../src/checkbox.machine.js";

let active: ReturnType<typeof createCheckboxMachine>[] = [];

function make(opts: Partial<Parameters<typeof createCheckboxMachine>[0]> = {}) {
  const m = createCheckboxMachine({ id: "test", ...opts });
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

describe("createCheckboxMachine — initial state", () => {
  it("starts unchecked by default", () => {
    const m = make();
    expect(m.getSnapshot().matches("unchecked")).toBe(true);
  });

  it("defaultChecked=true → starts checked", () => {
    const m = make({ defaultChecked: true });
    expect(m.getSnapshot().matches("checked")).toBe(true);
  });

  it("defaultChecked='indeterminate' → starts indeterminate", () => {
    const m = make({ defaultChecked: "indeterminate" });
    expect(m.getSnapshot().matches("indeterminate")).toBe(true);
  });

  it("checked option overrides defaultChecked", () => {
    const m = make({ checked: false, defaultChecked: true });
    expect(m.getSnapshot().matches("unchecked")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// TOGGLE — WAI-ARIA §3.7: clicking a checkbox cycles its state
// ---------------------------------------------------------------------------

describe("createCheckboxMachine — TOGGLE", () => {
  it("unchecked → checked", () => {
    const m = make();
    m.send("TOGGLE");
    expect(m.getSnapshot().matches("checked")).toBe(true);
  });

  it("checked → unchecked", () => {
    const m = make({ defaultChecked: true });
    m.send("TOGGLE");
    expect(m.getSnapshot().matches("unchecked")).toBe(true);
  });

  it("indeterminate → checked (WAI-ARIA: mixed checkbox → checks all)", () => {
    const m = make({ defaultChecked: "indeterminate" });
    m.send("TOGGLE");
    // Per WAI-ARIA 1.2: clicking a mixed checkbox moves to checked state
    expect(m.getSnapshot().matches("checked")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// CHECK / UNCHECK — explicit state commands
// ---------------------------------------------------------------------------

describe("createCheckboxMachine — CHECK / UNCHECK", () => {
  it("CHECK from unchecked → checked", () => {
    const m = make();
    m.send("CHECK");
    expect(m.getSnapshot().matches("checked")).toBe(true);
  });

  it("CHECK from indeterminate → checked", () => {
    const m = make({ defaultChecked: "indeterminate" });
    m.send("CHECK");
    expect(m.getSnapshot().matches("checked")).toBe(true);
  });

  it("UNCHECK from checked → unchecked", () => {
    const m = make({ defaultChecked: true });
    m.send("UNCHECK");
    expect(m.getSnapshot().matches("unchecked")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SET_INDETERMINATE — third state
// ---------------------------------------------------------------------------

describe("createCheckboxMachine — SET_INDETERMINATE", () => {
  it("unchecked → indeterminate", () => {
    const m = make();
    m.send("SET_INDETERMINATE");
    expect(m.getSnapshot().matches("indeterminate")).toBe(true);
  });

  it("checked → indeterminate", () => {
    const m = make({ defaultChecked: true });
    m.send("SET_INDETERMINATE");
    expect(m.getSnapshot().matches("indeterminate")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// onCheckedChange callback — critical for controlled mode
// ---------------------------------------------------------------------------

describe("createCheckboxMachine — onCheckedChange", () => {
  it("called with true when TOGGLE from unchecked", () => {
    const cb = vi.fn();
    const m = make({ onCheckedChange: cb });
    m.send("TOGGLE");
    expect(cb).toHaveBeenCalledWith(true);
  });

  it("called with false when TOGGLE from checked", () => {
    const cb = vi.fn();
    const m = make({ defaultChecked: true, onCheckedChange: cb });
    m.send("TOGGLE");
    expect(cb).toHaveBeenCalledWith(false);
  });

  it("called with true when TOGGLE from indeterminate (→ checked)", () => {
    const cb = vi.fn();
    const m = make({ defaultChecked: "indeterminate", onCheckedChange: cb });
    m.send("TOGGLE");
    expect(cb).toHaveBeenCalledWith(true);
  });

  it("called with 'indeterminate' on SET_INDETERMINATE", () => {
    const cb = vi.fn();
    const m = make({ onCheckedChange: cb });
    m.send("SET_INDETERMINATE");
    expect(cb).toHaveBeenCalledWith("indeterminate");
  });

  it("NOT called on initial start", () => {
    const cb = vi.fn();
    make({ onCheckedChange: cb });
    expect(cb).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Context defaults — form integration
// ---------------------------------------------------------------------------

describe("createCheckboxMachine — context defaults", () => {
  it("value defaults to 'on' (native checkbox behaviour)", () => {
    const m = make();
    expect(m.getSnapshot().context.value).toBe("on");
  });

  it("value option is stored in context", () => {
    const m = make({ value: "yes" });
    expect(m.getSnapshot().context.value).toBe("yes");
  });

  it("name is stored in context when provided", () => {
    const m = make({ name: "agree" });
    expect(m.getSnapshot().context.name).toBe("agree");
  });

  it("disabled defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.disabled).toBe(false);
  });

  it("required defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.required).toBe(false);
  });
});
