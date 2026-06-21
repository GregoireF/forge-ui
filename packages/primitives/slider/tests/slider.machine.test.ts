import { afterEach, describe, expect, it, vi } from "vitest";
import { createSliderMachine } from "../src/slider.machine.js";

let active: ReturnType<typeof createSliderMachine>[] = [];

function make(opts: Parameters<typeof createSliderMachine>[0] = {}) {
  const m = createSliderMachine({ id: "test", ...opts });
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

describe("createSliderMachine — initial state", () => {
  it("defaults: min=0, max=100, step=1, value=0", () => {
    const m = make();
    const ctx = m.getSnapshot().context;
    expect(ctx.min).toBe(0);
    expect(ctx.max).toBe(100);
    expect(ctx.step).toBe(1);
    expect(ctx.value).toBe(0);
  });

  it("defaultValue sets initial value", () => {
    const m = make({ defaultValue: 50 });
    expect(m.getSnapshot().context.value).toBe(50);
  });

  it("value (controlled) overrides defaultValue", () => {
    const m = make({ value: 30, defaultValue: 70 });
    expect(m.getSnapshot().context.value).toBe(30);
  });

  it("value is clamped to min", () => {
    const m = make({ min: 10, defaultValue: 5 });
    expect(m.getSnapshot().context.value).toBe(10);
  });

  it("value is clamped to max", () => {
    const m = make({ max: 80, defaultValue: 90 });
    expect(m.getSnapshot().context.value).toBe(80);
  });

  it("starts in idle state", () => {
    const m = make();
    expect(m.getSnapshot().matches("idle")).toBe(true);
  });

  it("disabled defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.disabled).toBe(false);
  });

  it("orientation defaults to 'horizontal'", () => {
    const m = make();
    expect(m.getSnapshot().context.orientation).toBe("horizontal");
  });
});

// ---------------------------------------------------------------------------
// INCREMENT / DECREMENT — WAI-ARIA §3.23: Arrow keys
// ---------------------------------------------------------------------------

describe("createSliderMachine — INCREMENT / DECREMENT", () => {
  it("INCREMENT adds one step", () => {
    const m = make({ defaultValue: 30, step: 5 });
    m.send("INCREMENT");
    expect(m.getSnapshot().context.value).toBe(35);
  });

  it("DECREMENT subtracts one step", () => {
    const m = make({ defaultValue: 30, step: 5 });
    m.send("DECREMENT");
    expect(m.getSnapshot().context.value).toBe(25);
  });

  it("INCREMENT clamps at max", () => {
    const m = make({ defaultValue: 98, max: 100, step: 5 });
    m.send("INCREMENT");
    expect(m.getSnapshot().context.value).toBe(100);
  });

  it("DECREMENT clamps at min", () => {
    const m = make({ defaultValue: 2, min: 0, step: 5 });
    m.send("DECREMENT");
    expect(m.getSnapshot().context.value).toBe(0);
  });

  it("INCREMENT is no-op when disabled", () => {
    const m = make({ defaultValue: 50, disabled: true });
    m.send("INCREMENT");
    expect(m.getSnapshot().context.value).toBe(50);
  });

  it("DECREMENT is no-op when disabled", () => {
    const m = make({ defaultValue: 50, disabled: true });
    m.send("DECREMENT");
    expect(m.getSnapshot().context.value).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// INCREMENT_PAGE / DECREMENT_PAGE — WAI-ARIA §3.23: PageUp/PageDown = 10%
// ---------------------------------------------------------------------------

describe("createSliderMachine — INCREMENT_PAGE / DECREMENT_PAGE", () => {
  it("INCREMENT_PAGE adds 10% of range", () => {
    const m = make({ min: 0, max: 100, defaultValue: 50 });
    m.send("INCREMENT_PAGE");
    // pageStep = (100 - 0) / 10 = 10
    expect(m.getSnapshot().context.value).toBe(60);
  });

  it("DECREMENT_PAGE subtracts 10% of range", () => {
    const m = make({ min: 0, max: 100, defaultValue: 50 });
    m.send("DECREMENT_PAGE");
    expect(m.getSnapshot().context.value).toBe(40);
  });

  it("INCREMENT_PAGE with min=20 max=120: pageStep=10", () => {
    const m = make({ min: 20, max: 120, defaultValue: 50 });
    m.send("INCREMENT_PAGE");
    expect(m.getSnapshot().context.value).toBe(60);
  });

  it("INCREMENT_PAGE clamps at max", () => {
    const m = make({ min: 0, max: 100, defaultValue: 95 });
    m.send("INCREMENT_PAGE");
    expect(m.getSnapshot().context.value).toBe(100);
  });

  it("DECREMENT_PAGE clamps at min", () => {
    const m = make({ min: 0, max: 100, defaultValue: 5 });
    m.send("DECREMENT_PAGE");
    expect(m.getSnapshot().context.value).toBe(0);
  });

  it("INCREMENT_PAGE is no-op when disabled", () => {
    const m = make({ defaultValue: 50, disabled: true });
    m.send("INCREMENT_PAGE");
    expect(m.getSnapshot().context.value).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// SET_VALUE — Home/End + controlled mode
// ---------------------------------------------------------------------------

describe("createSliderMachine — SET_VALUE", () => {
  it("sets an explicit value", () => {
    const m = make({ defaultValue: 30 });
    m.send({ type: "SET_VALUE", value: 75 });
    expect(m.getSnapshot().context.value).toBe(75);
  });

  it("SET_VALUE to min = Home key behaviour", () => {
    const m = make({ min: 10, max: 90, defaultValue: 50 });
    m.send({ type: "SET_VALUE", value: 10 });
    expect(m.getSnapshot().context.value).toBe(10);
  });

  it("SET_VALUE to max = End key behaviour", () => {
    const m = make({ min: 10, max: 90, defaultValue: 50 });
    m.send({ type: "SET_VALUE", value: 90 });
    expect(m.getSnapshot().context.value).toBe(90);
  });
});

// ---------------------------------------------------------------------------
// Step snapping — avoids floating-point drift
// ---------------------------------------------------------------------------

describe("createSliderMachine — step snapping", () => {
  it("INCREMENT snaps value to step grid (step=0.1)", () => {
    const m = make({ min: 0, max: 1, step: 0.1, defaultValue: 0.1 });
    m.send("INCREMENT");
    // Without fix: 0.1 + 0.1 = 0.20000000000000001
    expect(m.getSnapshot().context.value).toBe(0.2);
  });

  it("DECREMENT snaps value to step grid (step=0.25)", () => {
    const m = make({ min: 0, max: 1, step: 0.25, defaultValue: 0.75 });
    m.send("DECREMENT");
    expect(m.getSnapshot().context.value).toBe(0.5);
  });
});

// ---------------------------------------------------------------------------
// POINTER_DOWN → dragging state
// ---------------------------------------------------------------------------

describe("createSliderMachine — POINTER_DOWN → dragging", () => {
  it("transitions to dragging state", () => {
    const m = make({ defaultValue: 30 });
    m.send({ type: "POINTER_DOWN", value: 50 });
    expect(m.getSnapshot().matches("dragging")).toBe(true);
  });

  it("sets value from pointer", () => {
    const m = make({ defaultValue: 30 });
    m.send({ type: "POINTER_DOWN", value: 60 });
    expect(m.getSnapshot().context.value).toBe(60);
  });

  it("POINTER_DOWN when disabled still transitions to dragging (value update is guarded, not the transition)", () => {
    const m = make({ defaultValue: 30, disabled: true });
    m.send({ type: "POINTER_DOWN", value: 60 });
    // The FSM transition target is unconditional; the action guard prevents value update.
    // This is intentional: drag activity manages pointermove/pointerup cleanup on state exit.
    expect(m.getSnapshot().matches("dragging")).toBe(true);
    expect(m.getSnapshot().context.value).toBe(30); // value NOT changed
  });

  it("POINTER_UP → back to idle", () => {
    const m = make({ defaultValue: 30 });
    m.send({ type: "POINTER_DOWN", value: 50 });
    m.send("POINTER_UP");
    expect(m.getSnapshot().matches("idle")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Callbacks — INCREMENT calls both onValueChange AND onValueCommit
// ---------------------------------------------------------------------------

describe("createSliderMachine — callbacks", () => {
  it("onValueChange called on INCREMENT", () => {
    const onChange = vi.fn();
    const m = make({ defaultValue: 50, onValueChange: onChange });
    m.send("INCREMENT");
    expect(onChange).toHaveBeenCalledWith(51);
  });

  it("onValueCommit called on INCREMENT (keyboard = immediate commit)", () => {
    const onCommit = vi.fn();
    const m = make({ defaultValue: 50, onValueCommit: onCommit });
    m.send("INCREMENT");
    expect(onCommit).toHaveBeenCalledWith(51);
  });

  it("onValueChange called on POINTER_DOWN", () => {
    const onChange = vi.fn();
    const m = make({ defaultValue: 30, onValueChange: onChange });
    m.send({ type: "POINTER_DOWN", value: 60 });
    expect(onChange).toHaveBeenCalledWith(60);
  });

  it("callbacks NOT called when disabled", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const m = make({ defaultValue: 50, disabled: true, onValueChange: onChange, onValueCommit: onCommit });
    m.send("INCREMENT");
    expect(onChange).not.toHaveBeenCalled();
    expect(onCommit).not.toHaveBeenCalled();
  });
});
