import { afterEach, describe, expect, it, vi } from "vitest";
import { createSwitchMachine } from "../src/switch.machine.js";

let active: ReturnType<typeof createSwitchMachine>[] = [];

function make(opts: Partial<Parameters<typeof createSwitchMachine>[0]> = {}) {
  const m = createSwitchMachine({ id: "test", ...opts });
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

describe("createSwitchMachine — initial state", () => {
  it("starts off by default", () => {
    const m = make();
    expect(m.getSnapshot().matches("off")).toBe(true);
  });

  it("defaultChecked=true → starts on", () => {
    const m = make({ defaultChecked: true });
    expect(m.getSnapshot().matches("on")).toBe(true);
  });

  it("checked=false overrides defaultChecked", () => {
    const m = make({ checked: false, defaultChecked: true });
    expect(m.getSnapshot().matches("off")).toBe(true);
  });

  it("disabled defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.disabled).toBe(false);
  });

  it("required defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.required).toBe(false);
  });

  it("readOnly defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.readOnly).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// TOGGLE — role=switch WAI-ARIA §4.6.26
// ---------------------------------------------------------------------------

describe("createSwitchMachine — TOGGLE", () => {
  it("off → on", () => {
    const m = make();
    m.send("TOGGLE");
    expect(m.getSnapshot().matches("on")).toBe(true);
  });

  it("on → off", () => {
    const m = make({ defaultChecked: true });
    m.send("TOGGLE");
    expect(m.getSnapshot().matches("off")).toBe(true);
  });

  it("multiple toggles cycle correctly", () => {
    const m = make();
    m.send("TOGGLE");
    m.send("TOGGLE");
    expect(m.getSnapshot().matches("off")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// CHECK / UNCHECK — explicit commands (programmatic control)
// ---------------------------------------------------------------------------

describe("createSwitchMachine — CHECK / UNCHECK", () => {
  it("CHECK from off → on", () => {
    const m = make();
    m.send("CHECK");
    expect(m.getSnapshot().matches("on")).toBe(true);
  });

  it("CHECK from on → stays on", () => {
    const m = make({ defaultChecked: true });
    m.send("CHECK");
    expect(m.getSnapshot().matches("on")).toBe(true);
  });

  it("UNCHECK from on → off", () => {
    const m = make({ defaultChecked: true });
    m.send("UNCHECK");
    expect(m.getSnapshot().matches("off")).toBe(true);
  });

  it("UNCHECK from off → stays off", () => {
    const m = make();
    m.send("UNCHECK");
    expect(m.getSnapshot().matches("off")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// onCheckedChange callback
// ---------------------------------------------------------------------------

describe("createSwitchMachine — onCheckedChange", () => {
  it("called with true when TOGGLE off→on", () => {
    const cb = vi.fn();
    const m = make({ onCheckedChange: cb });
    m.send("TOGGLE");
    expect(cb).toHaveBeenCalledWith(true);
  });

  it("called with false when TOGGLE on→off", () => {
    const cb = vi.fn();
    const m = make({ defaultChecked: true, onCheckedChange: cb });
    m.send("TOGGLE");
    expect(cb).toHaveBeenCalledWith(false);
  });

  it("called with true on CHECK", () => {
    const cb = vi.fn();
    const m = make({ onCheckedChange: cb });
    m.send("CHECK");
    expect(cb).toHaveBeenCalledWith(true);
  });

  it("called with false on UNCHECK", () => {
    const cb = vi.fn();
    const m = make({ defaultChecked: true, onCheckedChange: cb });
    m.send("UNCHECK");
    expect(cb).toHaveBeenCalledWith(false);
  });

  it("NOT called on initial start", () => {
    const cb = vi.fn();
    make({ defaultChecked: true, onCheckedChange: cb });
    expect(cb).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Context fields — form integration values
// IDs (controlId, labelId) are derived in the connect layer, not stored in context.
// ---------------------------------------------------------------------------

describe("createSwitchMachine — context fields", () => {
  it("id stored in context", () => {
    const m = createSwitchMachine({ id: "agree" });
    m.start();
    active.push(m);
    expect(m.getSnapshot().context.id).toBe("agree");
  });

  it("invalid defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.invalid).toBe(false);
  });

  it("name stored in context when provided", () => {
    const m = make({ name: "darkmode" });
    expect(m.getSnapshot().context.name).toBe("darkmode");
  });

  it("value defaults to 'on' (native form submit value)", () => {
    const m = make();
    expect(m.getSnapshot().context.value).toBe("on");
  });

  it("form stored in context when provided", () => {
    const m = make({ form: "settings-form" });
    expect(m.getSnapshot().context.form).toBe("settings-form");
  });
});
