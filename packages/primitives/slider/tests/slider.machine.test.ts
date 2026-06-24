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
  it("defaults: min=0, max=100, step=1, values=[0]", () => {
    const m = make();
    const ctx = m.getSnapshot().context;
    expect(ctx.min).toBe(0);
    expect(ctx.max).toBe(100);
    expect(ctx.step).toBe(1);
    expect(ctx.values).toEqual([0]);
  });

  it("single defaultValue → values=[defaultValue]", () => {
    const m = make({ defaultValue: 50 });
    expect(m.getSnapshot().context.values).toEqual([50]);
  });

  it("array defaultValue → multi-thumb", () => {
    const m = make({ defaultValue: [20, 80] });
    expect(m.getSnapshot().context.values).toEqual([20, 80]);
  });

  it("value (controlled) overrides defaultValue", () => {
    const m = make({ value: 30, defaultValue: 70 });
    expect(m.getSnapshot().context.values).toEqual([30]);
  });

  it("values are clamped to [min, max]", () => {
    const m = make({ min: 10, max: 80, defaultValue: [5, 90] });
    expect(m.getSnapshot().context.values).toEqual([10, 80]);
  });

  it("starts in idle state", () => {
    const m = make();
    expect(m.getSnapshot().matches("idle")).toBe(true);
  });

  it("activeThumb defaults to -1", () => {
    const m = make();
    expect(m.getSnapshot().context.activeThumb).toBe(-1);
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
  it("INCREMENT thumb 0 adds one step", () => {
    const m = make({ defaultValue: 30, step: 5 });
    m.send({ type: "INCREMENT", thumbIndex: 0 });
    expect(m.getSnapshot().context.values[0]).toBe(35);
  });

  it("DECREMENT thumb 0 subtracts one step", () => {
    const m = make({ defaultValue: 30, step: 5 });
    m.send({ type: "DECREMENT", thumbIndex: 0 });
    expect(m.getSnapshot().context.values[0]).toBe(25);
  });

  it("INCREMENT clamps at max", () => {
    const m = make({ defaultValue: 98, max: 100, step: 5 });
    m.send({ type: "INCREMENT", thumbIndex: 0 });
    expect(m.getSnapshot().context.values[0]).toBe(100);
  });

  it("DECREMENT clamps at min", () => {
    const m = make({ defaultValue: 2, min: 0, step: 5 });
    m.send({ type: "DECREMENT", thumbIndex: 0 });
    expect(m.getSnapshot().context.values[0]).toBe(0);
  });

  it("INCREMENT is no-op when disabled", () => {
    const m = make({ defaultValue: 50, disabled: true });
    m.send({ type: "INCREMENT", thumbIndex: 0 });
    expect(m.getSnapshot().context.values[0]).toBe(50);
  });

  it("DECREMENT is no-op when disabled", () => {
    const m = make({ defaultValue: 50, disabled: true });
    m.send({ type: "DECREMENT", thumbIndex: 0 });
    expect(m.getSnapshot().context.values[0]).toBe(50);
  });

  it("range: INCREMENT on thumb 1 does not go past max", () => {
    const m = make({ defaultValue: [20, 95], max: 100 });
    m.send({ type: "INCREMENT", thumbIndex: 1 });
    expect(m.getSnapshot().context.values[1]).toBe(96);
  });

  it("range: INCREMENT on thumb 0 clamps against thumb 1's value", () => {
    const m = make({ defaultValue: [49, 50] });
    m.send({ type: "INCREMENT", thumbIndex: 0 });
    // next = 50, but hi = values[1] = 50, clamped to 50
    expect(m.getSnapshot().context.values[0]).toBe(50);
    expect(m.getSnapshot().context.values[1]).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// INCREMENT_PAGE / DECREMENT_PAGE — WAI-ARIA §3.23: PageUp/PageDown = 10%
// ---------------------------------------------------------------------------

describe("createSliderMachine — INCREMENT_PAGE / DECREMENT_PAGE", () => {
  it("INCREMENT_PAGE adds 10% of range", () => {
    const m = make({ min: 0, max: 100, defaultValue: 50 });
    m.send({ type: "INCREMENT_PAGE", thumbIndex: 0 });
    expect(m.getSnapshot().context.values[0]).toBe(60);
  });

  it("DECREMENT_PAGE subtracts 10% of range", () => {
    const m = make({ min: 0, max: 100, defaultValue: 50 });
    m.send({ type: "DECREMENT_PAGE", thumbIndex: 0 });
    expect(m.getSnapshot().context.values[0]).toBe(40);
  });

  it("INCREMENT_PAGE clamps at max", () => {
    const m = make({ min: 0, max: 100, defaultValue: 95 });
    m.send({ type: "INCREMENT_PAGE", thumbIndex: 0 });
    expect(m.getSnapshot().context.values[0]).toBe(100);
  });

  it("DECREMENT_PAGE clamps at min", () => {
    const m = make({ min: 0, max: 100, defaultValue: 5 });
    m.send({ type: "DECREMENT_PAGE", thumbIndex: 0 });
    expect(m.getSnapshot().context.values[0]).toBe(0);
  });

  it("INCREMENT_PAGE is no-op when disabled", () => {
    const m = make({ defaultValue: 50, disabled: true });
    m.send({ type: "INCREMENT_PAGE", thumbIndex: 0 });
    expect(m.getSnapshot().context.values[0]).toBe(50);
  });

  it("DECREMENT_PAGE is no-op when disabled", () => {
    const m = make({ defaultValue: 50, disabled: true });
    m.send({ type: "DECREMENT_PAGE", thumbIndex: 0 });
    expect(m.getSnapshot().context.values[0]).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// SET_VALUE / SET_MIN / SET_MAX — Home/End + controlled mode
// ---------------------------------------------------------------------------

describe("createSliderMachine — SET_VALUE / SET_MIN / SET_MAX", () => {
  it("SET_VALUE sets explicit value for thumb 0", () => {
    const m = make({ defaultValue: 30 });
    m.send({ type: "SET_VALUE", value: 75, thumbIndex: 0 });
    expect(m.getSnapshot().context.values[0]).toBe(75);
  });

  it("SET_MIN sets thumb to min", () => {
    const m = make({ min: 10, max: 90, defaultValue: 50 });
    m.send({ type: "SET_MIN", thumbIndex: 0 });
    expect(m.getSnapshot().context.values[0]).toBe(10);
  });

  it("SET_MAX sets thumb to max", () => {
    const m = make({ min: 10, max: 90, defaultValue: 50 });
    m.send({ type: "SET_MAX", thumbIndex: 0 });
    expect(m.getSnapshot().context.values[0]).toBe(90);
  });

  it("range: SET_VALUE for thumb 1 does not cross max", () => {
    const m = make({ defaultValue: [20, 60], max: 100 });
    m.send({ type: "SET_VALUE", value: 200, thumbIndex: 1 });
    expect(m.getSnapshot().context.values[1]).toBe(100);
  });

  it("range: SET_VALUE for thumb 0 cannot exceed thumb 1", () => {
    const m = make({ defaultValue: [20, 60] });
    m.send({ type: "SET_VALUE", value: 80, thumbIndex: 0 });
    expect(m.getSnapshot().context.values[0]).toBe(60);
  });
});

// ---------------------------------------------------------------------------
// Step snapping — avoids floating-point drift
// ---------------------------------------------------------------------------

describe("createSliderMachine — step snapping", () => {
  it("INCREMENT snaps value to step grid (step=0.1)", () => {
    const m = make({ min: 0, max: 1, step: 0.1, defaultValue: 0.1 });
    m.send({ type: "INCREMENT", thumbIndex: 0 });
    expect(m.getSnapshot().context.values[0]).toBe(0.2);
  });

  it("DECREMENT snaps value to step grid (step=0.25)", () => {
    const m = make({ min: 0, max: 1, step: 0.25, defaultValue: 0.75 });
    m.send({ type: "DECREMENT", thumbIndex: 0 });
    expect(m.getSnapshot().context.values[0]).toBe(0.5);
  });
});

// ---------------------------------------------------------------------------
// POINTER_DOWN → dragging state
// ---------------------------------------------------------------------------

describe("createSliderMachine — POINTER_DOWN → dragging", () => {
  it("transitions to dragging state", () => {
    const m = make({ defaultValue: 30 });
    m.send({ type: "POINTER_DOWN", value: 50, thumbIndex: 0 });
    expect(m.getSnapshot().matches("dragging")).toBe(true);
  });

  it("sets value and activeThumb from pointer", () => {
    const m = make({ defaultValue: 30 });
    m.send({ type: "POINTER_DOWN", value: 60, thumbIndex: 0 });
    expect(m.getSnapshot().context.values[0]).toBe(60);
    expect(m.getSnapshot().context.activeThumb).toBe(0);
  });

  it("POINTER_DOWN when disabled transitions but does not update value", () => {
    const m = make({ defaultValue: 30, disabled: true });
    m.send({ type: "POINTER_DOWN", value: 60, thumbIndex: 0 });
    expect(m.getSnapshot().matches("dragging")).toBe(true);
    expect(m.getSnapshot().context.values[0]).toBe(30);
  });

  it("POINTER_UP → back to idle", () => {
    const m = make({ defaultValue: 30 });
    m.send({ type: "POINTER_DOWN", value: 50, thumbIndex: 0 });
    m.send("POINTER_UP");
    expect(m.getSnapshot().matches("idle")).toBe(true);
  });

  it("range: POINTER_DOWN on thumb 1 sets correct thumb", () => {
    const m = make({ defaultValue: [20, 80] });
    m.send({ type: "POINTER_DOWN", value: 85, thumbIndex: 1 });
    expect(m.getSnapshot().context.values[1]).toBe(85);
    expect(m.getSnapshot().context.values[0]).toBe(20);
    expect(m.getSnapshot().context.activeThumb).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Drag activity
// ---------------------------------------------------------------------------

describe("createSliderMachine — drag activity (document events)", () => {
  function makeMockTrackEl(rect = { left: 0, top: 0, width: 100, height: 100 }) {
    return { getBoundingClientRect: () => rect } as unknown as Element;
  }

  it("pointermove updates value via document event", () => {
    const onChange = vi.fn();
    const m = make({ defaultValue: 30, onValueChange: onChange });
    m.setContext({ trackEl: makeMockTrackEl() });
    m.send({ type: "POINTER_DOWN", value: 30, thumbIndex: 0 });

    document.dispatchEvent(new PointerEvent("pointermove", { clientX: 75, clientY: 0 }));
    expect(m.getSnapshot().context.values[0]).toBe(75);
    expect(onChange).toHaveBeenCalledWith([75]);
  });

  it("pointermove is no-op when computed value equals current value", () => {
    const onChange = vi.fn();
    const m = make({ defaultValue: 50, onValueChange: onChange });
    m.setContext({ trackEl: makeMockTrackEl() });
    m.send({ type: "POINTER_DOWN", value: 50, thumbIndex: 0 });
    onChange.mockClear();

    document.dispatchEvent(new PointerEvent("pointermove", { clientX: 50, clientY: 0 }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("pointermove while disabled does not update value", () => {
    const onChange = vi.fn();
    const m = make({ defaultValue: 50, disabled: true, onValueChange: onChange });
    m.setContext({ trackEl: makeMockTrackEl() });
    m.send({ type: "POINTER_DOWN", value: 50, thumbIndex: 0 });

    document.dispatchEvent(new PointerEvent("pointermove", { clientX: 75, clientY: 0 }));
    expect(m.getSnapshot().context.values[0]).toBe(50);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("pointerup calls onValueCommit and returns to idle", () => {
    const onCommit = vi.fn();
    const m = make({ defaultValue: 30, onValueCommit: onCommit });
    m.setContext({ trackEl: makeMockTrackEl() });
    m.send({ type: "POINTER_DOWN", value: 30, thumbIndex: 0 });

    document.dispatchEvent(new PointerEvent("pointerup", { clientX: 80, clientY: 0 }));
    expect(onCommit).toHaveBeenCalledWith([80]);
    expect(m.getSnapshot().matches("idle")).toBe(true);
  });

  it("pointercancel returns to idle without commit", () => {
    const onCommit = vi.fn();
    const m = make({ defaultValue: 50, onValueCommit: onCommit });
    m.send({ type: "POINTER_DOWN", value: 50, thumbIndex: 0 });

    document.dispatchEvent(new PointerEvent("pointercancel"));
    expect(m.getSnapshot().matches("idle")).toBe(true);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("vertical: pointermove uses inverted clientY axis", () => {
    const m = make({ defaultValue: 50, orientation: "vertical" });
    m.setContext({ trackEl: makeMockTrackEl({ left: 0, top: 0, width: 20, height: 100 }) });
    m.send({ type: "POINTER_DOWN", value: 50, thumbIndex: 0 });

    document.dispatchEvent(new PointerEvent("pointermove", { clientX: 0, clientY: 25 }));
    expect(m.getSnapshot().context.values[0]).toBe(75);
  });

  it("range: drag on thumb 1 stays between thumb 0 and max", () => {
    const onChange = vi.fn();
    const m = make({ defaultValue: [30, 70], onValueChange: onChange });
    m.setContext({ trackEl: makeMockTrackEl() });
    m.send({ type: "POINTER_DOWN", value: 70, thumbIndex: 1 });
    onChange.mockClear();

    // Move thumb 1 toward min — but it can't go past thumb 0 (30)
    document.dispatchEvent(new PointerEvent("pointermove", { clientX: 10, clientY: 0 }));
    expect(m.getSnapshot().context.values[1]).toBe(30);
    expect(m.getSnapshot().context.values[0]).toBe(30);
  });
});

// ---------------------------------------------------------------------------
// Callbacks
// ---------------------------------------------------------------------------

describe("createSliderMachine — callbacks", () => {
  it("onValueChange called on INCREMENT with full values array", () => {
    const onChange = vi.fn();
    const m = make({ defaultValue: 50, onValueChange: onChange });
    m.send({ type: "INCREMENT", thumbIndex: 0 });
    expect(onChange).toHaveBeenCalledWith([51]);
  });

  it("onValueCommit called on INCREMENT (keyboard = immediate commit)", () => {
    const onCommit = vi.fn();
    const m = make({ defaultValue: 50, onValueCommit: onCommit });
    m.send({ type: "INCREMENT", thumbIndex: 0 });
    expect(onCommit).toHaveBeenCalledWith([51]);
  });

  it("onValueChange called on POINTER_DOWN", () => {
    const onChange = vi.fn();
    const m = make({ defaultValue: 30, onValueChange: onChange });
    m.send({ type: "POINTER_DOWN", value: 60, thumbIndex: 0 });
    expect(onChange).toHaveBeenCalledWith([60]);
  });

  it("callbacks NOT called when disabled", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const m = make({ defaultValue: 50, disabled: true, onValueChange: onChange, onValueCommit: onCommit });
    m.send({ type: "INCREMENT", thumbIndex: 0 });
    expect(onChange).not.toHaveBeenCalled();
    expect(onCommit).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getValueLabel
// ---------------------------------------------------------------------------

describe("createSliderMachine — getValueLabel prop", () => {
  it("getValueLabel stored in context when provided", () => {
    const getValueLabel = (v: number) => v < 50 ? "low" : "high";
    const m = make({ getValueLabel });
    expect(m.getSnapshot().context.getValueLabel).toBe(getValueLabel);
  });

  it("getValueLabel absent from context when not provided", () => {
    const m = make();
    expect(m.getSnapshot().context.getValueLabel).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// SSR guard
// ---------------------------------------------------------------------------

describe("createSliderMachine — drag activity SSR guard", () => {
  it("drag activity exits early when document is undefined (SSR environment)", () => {
    const origDocument = global.document;
    try {
      // @ts-expect-error — intentional undefined to simulate SSR
      global.document = undefined;
      const m = make({ defaultValue: 50 });
      m.send({ type: "POINTER_DOWN", value: 50, thumbIndex: 0 });
      expect(m.getSnapshot().matches("dragging")).toBe(true);
    } finally {
      global.document = origDocument;
    }
  });
});

// ---------------------------------------------------------------------------
// id fallback
// ---------------------------------------------------------------------------

describe("createSliderMachine — id fallback", () => {
  it("defaults id to 'root' in machine id when omitted", () => {
    const m = createSliderMachine({});
    m.start();
    active.push(m);
    expect(m.id).toContain("root");
  });
});
