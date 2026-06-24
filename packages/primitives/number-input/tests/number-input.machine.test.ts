import { afterEach, describe, expect, it, vi } from "vitest";
import { createNumberInputMachine } from "../src/number-input.machine.js";

let active: ReturnType<typeof createNumberInputMachine>[] = [];

function make(opts: Parameters<typeof createNumberInputMachine>[0] = {}) {
  const m = createNumberInputMachine({ id: "test", ...opts });
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

describe("createNumberInputMachine — initial state", () => {
  it("defaults: min=0, max=Infinity, step=1, value=null", () => {
    const m = make();
    const ctx = m.getSnapshot().context;
    expect(ctx.min).toBe(0);
    expect(ctx.max).toBe(Number.POSITIVE_INFINITY);
    expect(ctx.step).toBe(1);
    expect(ctx.value).toBe(null);
  });

  it("defaultValue sets initial value and formats inputText", () => {
    const m = make({ defaultValue: 42 });
    expect(m.getSnapshot().context.value).toBe(42);
    expect(m.getSnapshot().context.inputText).toBe("42");
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

  it("fractionDigits: initial inputText formatted with decimals (value stored as-is, display truncated)", () => {
    const m = make({ defaultValue: 3.14159, fractionDigits: 2 });
    // Value is not rounded on init — only the display text is formatted to 2 decimals
    expect(m.getSnapshot().context.value).toBe(3.14159);
    expect(m.getSnapshot().context.inputText).toBe("3.14");
  });

  it("locale affects formatting", () => {
    const m = make({ defaultValue: 1000, locale: "de", fractionDigits: 0 });
    // German locale uses period as thousands separator
    expect(m.getSnapshot().context.inputText).toMatch(/1[.,]?000/);
  });

  it("largeStep defaults to step * 10", () => {
    const m = make({ step: 5 });
    expect(m.getSnapshot().context.largeStep).toBe(50);
  });

  it("largeStep can be overridden", () => {
    const m = make({ step: 1, largeStep: 25 });
    expect(m.getSnapshot().context.largeStep).toBe(25);
  });
});

// ---------------------------------------------------------------------------
// INCREMENT / DECREMENT
// ---------------------------------------------------------------------------

describe("createNumberInputMachine — INCREMENT / DECREMENT", () => {
  it("INCREMENT adds one step from current value", () => {
    const m = make({ defaultValue: 30, step: 5 });
    m.send({ type: "INCREMENT" });
    expect(m.getSnapshot().context.value).toBe(35);
  });

  it("DECREMENT subtracts one step", () => {
    const m = make({ defaultValue: 30, step: 5 });
    m.send({ type: "DECREMENT" });
    expect(m.getSnapshot().context.value).toBe(25);
  });

  it("INCREMENT clamps at max", () => {
    const m = make({ defaultValue: 98, max: 100, step: 5 });
    m.send({ type: "INCREMENT" });
    expect(m.getSnapshot().context.value).toBe(100);
  });

  it("DECREMENT clamps at min", () => {
    const m = make({ defaultValue: 2, min: 0, step: 5 });
    m.send({ type: "DECREMENT" });
    expect(m.getSnapshot().context.value).toBe(0);
  });

  it("INCREMENT from null value starts at min", () => {
    const m = make({ min: 10, max: 100 });
    m.send({ type: "INCREMENT" });
    expect(m.getSnapshot().context.value).toBe(11);
  });

  it("DECREMENT from null value starts at max", () => {
    const m = make({ min: 0, max: 100 });
    m.send({ type: "DECREMENT" });
    expect(m.getSnapshot().context.value).toBe(99);
  });

  it("INCREMENT is no-op when disabled", () => {
    const m = make({ defaultValue: 50, disabled: true });
    m.send({ type: "INCREMENT" });
    expect(m.getSnapshot().context.value).toBe(50);
  });

  it("INCREMENT is no-op when readOnly", () => {
    const m = make({ defaultValue: 50, readOnly: true });
    m.send({ type: "INCREMENT" });
    expect(m.getSnapshot().context.value).toBe(50);
  });

  it("INCREMENT snaps to step grid", () => {
    const m = make({ min: 0, max: 1, step: 0.1, defaultValue: 0.1 });
    m.send({ type: "INCREMENT" });
    expect(m.getSnapshot().context.value).toBe(0.2);
  });

  it("INCREMENT updates inputText", () => {
    const m = make({ defaultValue: 50 });
    m.send({ type: "INCREMENT" });
    expect(m.getSnapshot().context.inputText).toBe("51");
  });
});

// ---------------------------------------------------------------------------
// INCREMENT_PAGE / DECREMENT_PAGE — PageUp/PageDown = largeStep
// ---------------------------------------------------------------------------

describe("createNumberInputMachine — INCREMENT_PAGE / DECREMENT_PAGE", () => {
  it("INCREMENT_PAGE adds largeStep", () => {
    const m = make({ defaultValue: 50, step: 1, largeStep: 10 });
    m.send({ type: "INCREMENT_PAGE" });
    expect(m.getSnapshot().context.value).toBe(60);
  });

  it("DECREMENT_PAGE subtracts largeStep", () => {
    const m = make({ defaultValue: 50, step: 1, largeStep: 10 });
    m.send({ type: "DECREMENT_PAGE" });
    expect(m.getSnapshot().context.value).toBe(40);
  });

  it("INCREMENT_PAGE clamps at max", () => {
    const m = make({ defaultValue: 95, max: 100, largeStep: 10 });
    m.send({ type: "INCREMENT_PAGE" });
    expect(m.getSnapshot().context.value).toBe(100);
  });

  it("DECREMENT_PAGE clamps at min", () => {
    const m = make({ min: 0, defaultValue: 5, largeStep: 10 });
    m.send({ type: "DECREMENT_PAGE" });
    expect(m.getSnapshot().context.value).toBe(0);
  });

  it("INCREMENT_PAGE is no-op when disabled", () => {
    const m = make({ defaultValue: 50, disabled: true });
    m.send({ type: "INCREMENT_PAGE" });
    expect(m.getSnapshot().context.value).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// SET_VALUE / SET_MIN / SET_MAX — Home / End / controlled mode
// ---------------------------------------------------------------------------

describe("createNumberInputMachine — SET_VALUE / SET_MIN / SET_MAX", () => {
  it("SET_VALUE sets explicit numeric value", () => {
    const m = make({ defaultValue: 30, min: 0, max: 100 });
    m.send({ type: "SET_VALUE", value: 75 });
    expect(m.getSnapshot().context.value).toBe(75);
  });

  it("SET_VALUE clamps value into [min, max]", () => {
    const m = make({ min: 10, max: 90 });
    m.send({ type: "SET_VALUE", value: 200 });
    expect(m.getSnapshot().context.value).toBe(90);
    m.send({ type: "SET_VALUE", value: -5 });
    expect(m.getSnapshot().context.value).toBe(10);
  });

  it("SET_VALUE with null clears the value", () => {
    const m = make({ defaultValue: 50 });
    m.send({ type: "SET_VALUE", value: null });
    expect(m.getSnapshot().context.value).toBe(null);
    expect(m.getSnapshot().context.inputText).toBe("");
  });

  it("SET_MIN sets value to min (Home key)", () => {
    const m = make({ min: 5, max: 100, defaultValue: 50 });
    m.send({ type: "SET_MIN" });
    expect(m.getSnapshot().context.value).toBe(5);
  });

  it("SET_MAX sets value to max (End key)", () => {
    const m = make({ min: 0, max: 90, defaultValue: 50 });
    m.send({ type: "SET_MAX" });
    expect(m.getSnapshot().context.value).toBe(90);
  });

  it("SET_MIN is no-op when disabled", () => {
    const m = make({ min: 0, max: 100, defaultValue: 50, disabled: true });
    m.send({ type: "SET_MIN" });
    expect(m.getSnapshot().context.value).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// SET_INPUT_TEXT — raw typing during editing
// ---------------------------------------------------------------------------

describe("createNumberInputMachine — SET_INPUT_TEXT", () => {
  it("updates inputText without committing value", () => {
    const m = make({ defaultValue: 42 });
    m.send({ type: "SET_INPUT_TEXT", text: "5" });
    expect(m.getSnapshot().context.inputText).toBe("5");
    expect(m.getSnapshot().context.value).toBe(42); // value unchanged until blur
  });

  it("intermediate invalid input is stored as text", () => {
    const m = make({ defaultValue: 10 });
    m.send({ type: "SET_INPUT_TEXT", text: "1." }); // partial decimal
    expect(m.getSnapshot().context.inputText).toBe("1.");
    expect(m.getSnapshot().context.value).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// FOCUS / BLUR — editing mode + commit on blur
// ---------------------------------------------------------------------------

describe("createNumberInputMachine — FOCUS / BLUR", () => {
  it("FOCUS shows raw number as inputText", () => {
    const m = make({ defaultValue: 42, fractionDigits: 2 });
    // Initially formatted: "42.00"
    expect(m.getSnapshot().context.inputText).toBe("42.00");
    const focusEvent = new FocusEvent("focus");
    m.send({ type: "FOCUS", event: focusEvent });
    // On focus: show raw number for editing
    expect(m.getSnapshot().context.inputText).toBe("42");
    expect(m.getSnapshot().context.focused).toBe(true);
  });

  it("BLUR parses inputText and commits value", () => {
    const onCommit = vi.fn();
    const m = make({ defaultValue: 42, onValueCommit: onCommit });
    const focusEvent = new FocusEvent("focus");
    const blurEvent = new FocusEvent("blur");
    m.send({ type: "FOCUS", event: focusEvent });
    m.send({ type: "SET_INPUT_TEXT", text: "75" });
    m.send({ type: "BLUR", event: blurEvent });
    expect(m.getSnapshot().context.value).toBe(75);
    expect(onCommit).toHaveBeenCalledWith(75);
    expect(m.getSnapshot().context.focused).toBe(false);
  });

  it("BLUR clamps parsed value into [min, max]", () => {
    const m = make({ min: 0, max: 100, defaultValue: 50 });
    const focusEvent = new FocusEvent("focus");
    const blurEvent = new FocusEvent("blur");
    m.send({ type: "FOCUS", event: focusEvent });
    m.send({ type: "SET_INPUT_TEXT", text: "999" });
    m.send({ type: "BLUR", event: blurEvent });
    expect(m.getSnapshot().context.value).toBe(100);
  });

  it("BLUR with invalid text keeps previous value (allowEmpty=false)", () => {
    const m = make({ defaultValue: 42 });
    const focusEvent = new FocusEvent("focus");
    const blurEvent = new FocusEvent("blur");
    m.send({ type: "FOCUS", event: focusEvent });
    m.send({ type: "SET_INPUT_TEXT", text: "abc" });
    m.send({ type: "BLUR", event: blurEvent });
    expect(m.getSnapshot().context.value).toBe(42);
  });

  it("BLUR with empty text → null when allowEmpty=true", () => {
    const m = make({ defaultValue: 42, allowEmpty: true });
    const focusEvent = new FocusEvent("focus");
    const blurEvent = new FocusEvent("blur");
    m.send({ type: "FOCUS", event: focusEvent });
    m.send({ type: "SET_INPUT_TEXT", text: "" });
    m.send({ type: "BLUR", event: blurEvent });
    expect(m.getSnapshot().context.value).toBe(null);
  });

  it("FOCUS calls onFocus callback", () => {
    const onFocus = vi.fn();
    const m = make({ onFocus });
    const e = new FocusEvent("focus");
    m.send({ type: "FOCUS", event: e });
    expect(onFocus).toHaveBeenCalledWith(e);
  });

  it("BLUR calls onBlur callback", () => {
    const onBlur = vi.fn();
    const m = make({ defaultValue: 10, onBlur });
    const e = new FocusEvent("blur");
    m.send({ type: "FOCUS", event: new FocusEvent("focus") });
    m.send({ type: "BLUR", event: e });
    expect(onBlur).toHaveBeenCalledWith(e);
  });
});

// ---------------------------------------------------------------------------
// Spinning state — SPIN_START / SPIN_STOP
// ---------------------------------------------------------------------------

describe("createNumberInputMachine — spinning state", () => {
  it("SPIN_START_UP transitions to spinning.up", () => {
    const m = make();
    m.send({ type: "SPIN_START_UP" });
    expect(m.getSnapshot().matches("spinning.up")).toBe(true);
  });

  it("SPIN_START_DOWN transitions to spinning.down", () => {
    const m = make();
    m.send({ type: "SPIN_START_DOWN" });
    expect(m.getSnapshot().matches("spinning.down")).toBe(true);
  });

  it("SPIN_STOP from spinning.up returns to idle", () => {
    const m = make();
    m.send({ type: "SPIN_START_UP" });
    m.send({ type: "SPIN_STOP" });
    expect(m.getSnapshot().matches("idle")).toBe(true);
  });

  it("SPIN_START_DOWN while spinning.up transitions directly", () => {
    const m = make();
    m.send({ type: "SPIN_START_UP" });
    m.send({ type: "SPIN_START_DOWN" });
    expect(m.getSnapshot().matches("spinning.down")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Callbacks
// ---------------------------------------------------------------------------

describe("createNumberInputMachine — callbacks", () => {
  it("onValueChange called on INCREMENT", () => {
    const onChange = vi.fn();
    const m = make({ defaultValue: 50, onValueChange: onChange });
    m.send({ type: "INCREMENT" });
    expect(onChange).toHaveBeenCalledWith(51);
  });

  it("onValueCommit called on INCREMENT (keyboard = immediate commit)", () => {
    const onCommit = vi.fn();
    const m = make({ defaultValue: 50, onValueCommit: onCommit });
    m.send({ type: "INCREMENT" });
    expect(onCommit).toHaveBeenCalledWith(51);
  });

  it("onValueChange NOT called when disabled", () => {
    const onChange = vi.fn();
    const m = make({ defaultValue: 50, disabled: true, onValueChange: onChange });
    m.send({ type: "INCREMENT" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("SET_VALUE calls onValueChange but not onValueCommit", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const m = make({ defaultValue: 50, onValueChange: onChange, onValueCommit: onCommit });
    m.send({ type: "SET_VALUE", value: 75 });
    expect(onChange).toHaveBeenCalledWith(75);
    expect(onCommit).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// id fallback
// ---------------------------------------------------------------------------

describe("createNumberInputMachine — id fallback", () => {
  it("defaults id suffix to 'root' when omitted", () => {
    const m = createNumberInputMachine({});
    m.start();
    active.push(m);
    expect(m.id).toContain("root");
  });
});
