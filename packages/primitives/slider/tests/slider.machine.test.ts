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

// ---------------------------------------------------------------------------
// Drag activity — document pointermove / pointerup events
// The drag activity registers global DOM listeners when the machine enters
// "dragging". Setting trackEl lets computeValueFromPointer do real geometry.
// ---------------------------------------------------------------------------

describe("createSliderMachine — drag activity (document events)", () => {
  function makeMockTrackEl(rect = { left: 0, top: 0, width: 100, height: 100 }) {
    return { getBoundingClientRect: () => rect } as unknown as Element;
  }

  it("pointermove updates value via document event", () => {
    const onChange = vi.fn();
    const m = make({ defaultValue: 30, onValueChange: onChange });
    // Set trackEl on the live context (activity receives the same object reference)
    m.setContext({ trackEl: makeMockTrackEl() });
    m.send({ type: "POINTER_DOWN", value: 30 });

    document.dispatchEvent(new PointerEvent("pointermove", { clientX: 75, clientY: 0 }));
    expect(m.getSnapshot().context.value).toBe(75);
    expect(onChange).toHaveBeenCalledWith(75);
  });

  it("pointermove is no-op when computed value equals current value", () => {
    const onChange = vi.fn();
    const m = make({ defaultValue: 50, onValueChange: onChange });
    m.setContext({ trackEl: makeMockTrackEl() });
    m.send({ type: "POINTER_DOWN", value: 50 });
    // POINTER_DOWN itself triggers onValueChange — clear it before asserting pointermove
    onChange.mockClear();

    // clientX=50 on a 100px track → value=50 (unchanged) → early return in onPointerMove
    document.dispatchEvent(new PointerEvent("pointermove", { clientX: 50, clientY: 0 }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("pointermove while disabled does not update value", () => {
    const onChange = vi.fn();
    const m = make({ defaultValue: 50, disabled: true, onValueChange: onChange });
    m.setContext({ trackEl: makeMockTrackEl() });
    // POINTER_DOWN transitions to dragging regardless of disabled (by design)
    m.send({ type: "POINTER_DOWN", value: 50 });

    document.dispatchEvent(new PointerEvent("pointermove", { clientX: 75, clientY: 0 }));
    expect(m.getSnapshot().context.value).toBe(50);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("pointermove: trackEl=null → computeValueFromPointer returns current value (no-op)", () => {
    const onChange = vi.fn();
    const m = make({ defaultValue: 50, onValueChange: onChange });
    // trackEl remains null — computeValueFromPointer returns ctx.value without geometry
    m.send({ type: "POINTER_DOWN", value: 50 });
    // POINTER_DOWN itself triggers onValueChange — clear before the pointermove assertion
    onChange.mockClear();

    document.dispatchEvent(new PointerEvent("pointermove", { clientX: 75, clientY: 0 }));
    // newValue=50 (same as ctx.value) → early return in onPointerMove → no onChange
    expect(onChange).not.toHaveBeenCalled();
  });

  it("pointerup calls onValueCommit and returns to idle", () => {
    const onCommit = vi.fn();
    const m = make({ defaultValue: 30, onValueCommit: onCommit });
    m.setContext({ trackEl: makeMockTrackEl() });
    m.send({ type: "POINTER_DOWN", value: 30 });

    document.dispatchEvent(new PointerEvent("pointerup", { clientX: 80, clientY: 0 }));
    expect(onCommit).toHaveBeenCalledWith(80);
    expect(m.getSnapshot().matches("idle")).toBe(true);
  });

  it("pointerup: trackEl=null commits current value (early return in computeValueFromPointer)", () => {
    const onCommit = vi.fn();
    const m = make({ defaultValue: 40, onValueCommit: onCommit });
    m.send({ type: "POINTER_DOWN", value: 40 });

    // trackEl null → computeValueFromPointer returns ctx.value (40)
    document.dispatchEvent(new PointerEvent("pointerup", { clientX: 80, clientY: 0 }));
    expect(onCommit).toHaveBeenCalledWith(40);
  });

  it("pointercancel returns to idle without commit", () => {
    const onCommit = vi.fn();
    const m = make({ defaultValue: 50, onValueCommit: onCommit });
    m.send({ type: "POINTER_DOWN", value: 50 });

    document.dispatchEvent(new PointerEvent("pointercancel"));
    expect(m.getSnapshot().matches("idle")).toBe(true);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("vertical: pointermove uses inverted clientY axis", () => {
    const m = make({ defaultValue: 50, orientation: "vertical" });
    m.setContext({ trackEl: makeMockTrackEl({ left: 0, top: 0, width: 20, height: 100 }) });
    m.send({ type: "POINTER_DOWN", value: 50 });

    // clientY=25 → percent = 1 - 25/100 = 0.75 → value = 75
    document.dispatchEvent(new PointerEvent("pointermove", { clientX: 0, clientY: 25 }));
    expect(m.getSnapshot().context.value).toBe(75);
  });
});

// ---------------------------------------------------------------------------
// Callbacks — INCREMENT calls both onValueChange AND onValueCommit
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// DECREMENT_PAGE disabled guard (line 108)
// WHY: INCREMENT_PAGE disabled is tested but DECREMENT_PAGE disabled is not.
// Both call the same guard pattern `if (context.disabled) return;`.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// getValueLabel prop — stored in context for aria-valuetext in connect
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

describe("createSliderMachine — DECREMENT_PAGE disabled", () => {
  it("DECREMENT_PAGE is no-op when disabled (line 108)", () => {
    const m = make({ defaultValue: 50, disabled: true });
    m.send("DECREMENT_PAGE");
    expect(m.getSnapshot().context.value).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// id fallback (line 174: `options.id ?? "root"`)
// ---------------------------------------------------------------------------

describe("createSliderMachine — id fallback", () => {
  it("defaults id to 'root' in machine id when omitted (line 174)", () => {
    const m = createSliderMachine({});
    m.start();
    active.push(m);
    expect(m.id).toContain("root");
  });
});

// ---------------------------------------------------------------------------
// SSR guard in drag activity (line 132)
// WHY: The `if (typeof document === "undefined") return;` guard bails the
// drag activity in server-rendered environments. In jsdom this path is
// never taken. vi.stubGlobal('document', undefined) simulates SSR and
// verifies the activity exits without error.
// ---------------------------------------------------------------------------

describe("createSliderMachine — drag activity SSR guard (line 132)", () => {
  it("drag activity exits early when document is undefined (SSR environment)", () => {
    const origDocument = global.document;
    try {
      // @ts-expect-error — intentional undefined to simulate SSR
      global.document = undefined;
      const m = make({ defaultValue: 50 });
      // POINTER_DOWN transitions to dragging which starts the drag activity.
      // With document=undefined, the activity returns immediately — no event
      // listeners are added and no error is thrown.
      m.send({ type: "POINTER_DOWN", value: 50 });
      expect(m.getSnapshot().matches("dragging")).toBe(true);
    } finally {
      global.document = origDocument;
    }
  });
});

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
