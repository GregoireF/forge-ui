import { describe, expect, it, vi } from "vitest";
import { connectNumberInput } from "../src/number-input.connect.js";
import type { NumberInputContext, NumberInputState } from "../src/number-input.types.js";

function makeCtx(overrides: Partial<NumberInputContext> = {}): NumberInputContext {
  return {
    value: 50,
    inputText: "50",
    min: 0,
    max: 100,
    step: 1,
    largeStep: 10,
    disabled: false,
    readOnly: false,
    required: false,
    focused: false,
    locale: "en",
    fractionDigits: 0,
    allowEmpty: false,
    ...overrides,
  };
}

function makeSnapshot(ctx: NumberInputContext, state: NumberInputState = "idle") {
  return {
    value: state,
    context: ctx,
    tags: [] as ReadonlyArray<string>,
    matches: (...states: string[]) => states.includes(state),
    hasTag: (_tag: string) => false,
  };
}

function makeApi(overrides: Partial<NumberInputContext> = {}, state: NumberInputState = "idle") {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  return { api: connectNumberInput(makeSnapshot(ctx, state), send, machine), send };
}

// ---------------------------------------------------------------------------
// getInputProps — WAI-ARIA spinbutton pattern
// ---------------------------------------------------------------------------

describe("connectNumberInput — getInputProps", () => {
  it("role=spinbutton", () => {
    const { api } = makeApi();
    expect(api.getInputProps().role).toBe("spinbutton");
  });

  it("type=text (not 'number' — spinbutton uses text for formatted display)", () => {
    const { api } = makeApi();
    expect(api.getInputProps().type).toBe("text");
  });

  it("aria-valuenow reflects current numeric value", () => {
    const { api } = makeApi({ value: 42 });
    expect(api.getInputProps()["aria-valuenow"]).toBe(42);
  });

  it("aria-valuenow is undefined when value is null", () => {
    const { api } = makeApi({ value: null, inputText: "" });
    expect(api.getInputProps()["aria-valuenow"]).toBeUndefined();
  });

  it("aria-valuemin reflects min", () => {
    const { api } = makeApi({ min: 10 });
    expect(api.getInputProps()["aria-valuemin"]).toBe(10);
  });

  it("aria-valuemax reflects max when finite", () => {
    const { api } = makeApi({ max: 200 });
    expect(api.getInputProps()["aria-valuemax"]).toBe(200);
  });

  it("aria-valuemax is undefined when max is Infinity", () => {
    const { api } = makeApi({ max: Number.POSITIVE_INFINITY });
    expect(api.getInputProps()["aria-valuemax"]).toBeUndefined();
  });

  it("value (displayed) reflects inputText", () => {
    const { api } = makeApi({ inputText: "42.50" });
    expect(api.getInputProps().value).toBe("42.50");
  });

  it("aria-disabled when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getInputProps()["aria-disabled"]).toBe(true);
  });

  it("aria-readonly when readOnly", () => {
    const { api } = makeApi({ readOnly: true });
    expect(api.getInputProps()["aria-readonly"]).toBe(true);
  });

  it("aria-required when required", () => {
    const { api } = makeApi({ required: true });
    expect(api.getInputProps()["aria-required"]).toBe(true);
  });

  it("aria-valuetext from getValueLabel when provided", () => {
    const getValueLabel = (v: number) => v < 33 ? "low" : "medium";
    const { api } = makeApi({ value: 20, getValueLabel });
    expect(api.getInputProps()["aria-valuetext"]).toBe("low");
  });

  it("aria-valuetext absent when getValueLabel not set", () => {
    const { api } = makeApi({ value: 50 });
    expect(api.getInputProps()["aria-valuetext"]).toBeUndefined();
  });

  // Keyboard events — WAI-ARIA §3.21 spinbutton keyboard interaction
  it("ArrowUp sends INCREMENT", () => {
    const { api, send } = makeApi();
    api.getInputProps().onKeyDown({ key: "ArrowUp", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "INCREMENT" });
  });

  it("ArrowDown sends DECREMENT", () => {
    const { api, send } = makeApi();
    api.getInputProps().onKeyDown({ key: "ArrowDown", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "DECREMENT" });
  });

  it("PageUp sends INCREMENT_PAGE", () => {
    const { api, send } = makeApi();
    api.getInputProps().onKeyDown({ key: "PageUp", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "INCREMENT_PAGE" });
  });

  it("PageDown sends DECREMENT_PAGE", () => {
    const { api, send } = makeApi();
    api.getInputProps().onKeyDown({ key: "PageDown", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "DECREMENT_PAGE" });
  });

  it("Home sends SET_MIN when min is finite", () => {
    const { api, send } = makeApi({ min: 5 });
    api.getInputProps().onKeyDown({ key: "Home", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "SET_MIN" });
  });

  it("Home is no-op when min is -Infinity", () => {
    const { api, send } = makeApi({ min: Number.NEGATIVE_INFINITY });
    api.getInputProps().onKeyDown({ key: "Home", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).not.toHaveBeenCalledWith(expect.objectContaining({ type: "SET_MIN" }));
  });

  it("End sends SET_MAX when max is finite", () => {
    const { api, send } = makeApi({ max: 100 });
    api.getInputProps().onKeyDown({ key: "End", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "SET_MAX" });
  });

  it("End is no-op when max is Infinity", () => {
    const { api, send } = makeApi({ max: Number.POSITIVE_INFINITY });
    api.getInputProps().onKeyDown({ key: "End", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).not.toHaveBeenCalledWith(expect.objectContaining({ type: "SET_MAX" }));
  });

  it("disabled: keyboard events are no-op", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getInputProps().onKeyDown({ key: "ArrowUp", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).not.toHaveBeenCalled();
  });

  it("readOnly: keyboard events are no-op", () => {
    const { api, send } = makeApi({ readOnly: true });
    api.getInputProps().onKeyDown({ key: "ArrowUp", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).not.toHaveBeenCalled();
  });

  it("onInput sends SET_INPUT_TEXT", () => {
    const { api, send } = makeApi();
    const e = { target: { value: "77" } } as unknown as Event;
    api.getInputProps().onInput(e);
    expect(send).toHaveBeenCalledWith({ type: "SET_INPUT_TEXT", text: "77" });
  });

  it("onFocus sends FOCUS event", () => {
    const { api, send } = makeApi();
    const e = new FocusEvent("focus");
    api.getInputProps().onFocus(e);
    expect(send).toHaveBeenCalledWith({ type: "FOCUS", event: e });
  });

  it("onBlur sends BLUR event", () => {
    const { api, send } = makeApi();
    const e = new FocusEvent("blur");
    api.getInputProps().onBlur(e);
    expect(send).toHaveBeenCalledWith({ type: "BLUR", event: e });
  });
});

// ---------------------------------------------------------------------------
// onKeydown (Vue alias)
// ---------------------------------------------------------------------------

describe("connectNumberInput — onKeydown (Vue alias)", () => {
  function callKeydown(api: ReturnType<typeof makeApi>["api"], key: string) {
    const props = api.getInputProps() as Record<string, (e: unknown) => void>;
    props["onKeydown"]({ key, preventDefault: vi.fn() });
  }

  it("ArrowUp → INCREMENT", () => {
    const { api, send } = makeApi();
    callKeydown(api, "ArrowUp");
    expect(send).toHaveBeenCalledWith({ type: "INCREMENT" });
  });

  it("ArrowDown → DECREMENT", () => {
    const { api, send } = makeApi();
    callKeydown(api, "ArrowDown");
    expect(send).toHaveBeenCalledWith({ type: "DECREMENT" });
  });

  it("PageUp → INCREMENT_PAGE", () => {
    const { api, send } = makeApi();
    callKeydown(api, "PageUp");
    expect(send).toHaveBeenCalledWith({ type: "INCREMENT_PAGE" });
  });

  it("PageDown → DECREMENT_PAGE", () => {
    const { api, send } = makeApi();
    callKeydown(api, "PageDown");
    expect(send).toHaveBeenCalledWith({ type: "DECREMENT_PAGE" });
  });

  it("disabled: no-op", () => {
    const { api, send } = makeApi({ disabled: true });
    callKeydown(api, "ArrowUp");
    expect(send).not.toHaveBeenCalled();
  });

  it("unknown key: no-op", () => {
    const { api, send } = makeApi();
    callKeydown(api, "Tab");
    expect(send).not.toHaveBeenCalled();
  });

  it("Home → SET_MIN when min is finite", () => {
    const { api, send } = makeApi({ min: 5 });
    callKeydown(api, "Home");
    expect(send).toHaveBeenCalledWith({ type: "SET_MIN" });
  });

  it("Home → no-op when min is -Infinity", () => {
    const { api, send } = makeApi({ min: Number.NEGATIVE_INFINITY });
    callKeydown(api, "Home");
    expect(send).not.toHaveBeenCalledWith(expect.objectContaining({ type: "SET_MIN" }));
  });

  it("End → SET_MAX when max is finite", () => {
    const { api, send } = makeApi({ max: 100 });
    callKeydown(api, "End");
    expect(send).toHaveBeenCalledWith({ type: "SET_MAX" });
  });

  it("End → no-op when max is Infinity", () => {
    const { api, send } = makeApi({ max: Number.POSITIVE_INFINITY });
    callKeydown(api, "End");
    expect(send).not.toHaveBeenCalledWith(expect.objectContaining({ type: "SET_MAX" }));
  });
});

// ---------------------------------------------------------------------------
// getIncrementTriggerProps / getDecrementTriggerProps
// ---------------------------------------------------------------------------

describe("connectNumberInput — stepper triggers", () => {
  it("increment: type=button, tabIndex=-1", () => {
    const { api } = makeApi();
    const props = api.getIncrementTriggerProps();
    expect(props.type).toBe("button");
    expect(props.tabIndex).toBe(-1);
  });

  it("decrement: type=button, tabIndex=-1", () => {
    const { api } = makeApi();
    const props = api.getDecrementTriggerProps();
    expect(props.type).toBe("button");
    expect(props.tabIndex).toBe(-1);
  });

  it("increment aria-label", () => {
    const { api } = makeApi();
    expect(api.getIncrementTriggerProps()["aria-label"]).toBe("Increase value");
  });

  it("decrement aria-label", () => {
    const { api } = makeApi();
    expect(api.getDecrementTriggerProps()["aria-label"]).toBe("Decrease value");
  });

  it("increment: onPointerDown sends INCREMENT then SPIN_START_UP", () => {
    const { api, send } = makeApi();
    api.getIncrementTriggerProps().onPointerDown({ button: 0, preventDefault: vi.fn() } as unknown as PointerEvent);
    expect(send).toHaveBeenNthCalledWith(1, { type: "INCREMENT" });
    expect(send).toHaveBeenNthCalledWith(2, { type: "SPIN_START_UP" });
  });

  it("decrement: onPointerDown sends DECREMENT then SPIN_START_DOWN", () => {
    const { api, send } = makeApi();
    api.getDecrementTriggerProps().onPointerDown({ button: 0, preventDefault: vi.fn() } as unknown as PointerEvent);
    expect(send).toHaveBeenNthCalledWith(1, { type: "DECREMENT" });
    expect(send).toHaveBeenNthCalledWith(2, { type: "SPIN_START_DOWN" });
  });

  it("increment: onPointerUp sends SPIN_STOP", () => {
    const { api, send } = makeApi();
    api.getIncrementTriggerProps().onPointerUp();
    expect(send).toHaveBeenCalledWith({ type: "SPIN_STOP" });
  });

  it("increment: onPointerLeave sends SPIN_STOP", () => {
    const { api, send } = makeApi();
    api.getIncrementTriggerProps().onPointerLeave();
    expect(send).toHaveBeenCalledWith({ type: "SPIN_STOP" });
  });

  it("disabled: onPointerDown is no-op", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getIncrementTriggerProps().onPointerDown({ button: 0, preventDefault: vi.fn() } as unknown as PointerEvent);
    expect(send).not.toHaveBeenCalled();
  });

  it("non-primary button: onPointerDown is no-op", () => {
    const { api, send } = makeApi();
    api.getIncrementTriggerProps().onPointerDown({ button: 2, preventDefault: vi.fn() } as unknown as PointerEvent);
    expect(send).not.toHaveBeenCalled();
  });

  it("increment: data-forge-part=increment-trigger", () => {
    const { api } = makeApi();
    expect(api.getIncrementTriggerProps()["data-forge-part"]).toBe("increment-trigger");
  });

  it("decrement: data-forge-part=decrement-trigger", () => {
    const { api } = makeApi();
    expect(api.getDecrementTriggerProps()["data-forge-part"]).toBe("decrement-trigger");
  });

  it("decrement: onPointerUp sends SPIN_STOP", () => {
    const { api, send } = makeApi();
    api.getDecrementTriggerProps().onPointerUp();
    expect(send).toHaveBeenCalledWith({ type: "SPIN_STOP" });
  });

  it("decrement: onPointerLeave sends SPIN_STOP", () => {
    const { api, send } = makeApi();
    api.getDecrementTriggerProps().onPointerLeave();
    expect(send).toHaveBeenCalledWith({ type: "SPIN_STOP" });
  });

  it("aria-disabled on increment when value is at max", () => {
    const { api } = makeApi({ value: 100, max: 100 });
    expect(api.getIncrementTriggerProps()["aria-disabled"]).toBe(true);
  });

  it("aria-disabled on decrement when value is at min", () => {
    const { api } = makeApi({ value: 0, min: 0 });
    expect(api.getDecrementTriggerProps()["aria-disabled"]).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getLabelProps / getControlProps
// ---------------------------------------------------------------------------

describe("connectNumberInput — label and control", () => {
  it("getLabelProps: data-forge-part=label", () => {
    const { api } = makeApi();
    expect(api.getLabelProps()["data-forge-part"]).toBe("label");
  });

  it("getControlProps: data-forge-part=control", () => {
    const { api } = makeApi();
    expect(api.getControlProps()["data-forge-part"]).toBe("control");
  });

  it("getControlProps: data-focused when focused", () => {
    const { api } = makeApi({ focused: true });
    expect(api.getControlProps()["data-focused"]).toBe("");
  });

  it("getControlProps: no data-focused when unfocused", () => {
    const { api } = makeApi({ focused: false });
    expect(api.getControlProps()["data-focused"]).toBeUndefined();
  });

  it("data-disabled propagates to label and control", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getLabelProps()["data-disabled"]).toBe("");
    expect(api.getControlProps()["data-disabled"]).toBe("");
  });
});

// ---------------------------------------------------------------------------
// getHiddenInputProps
// ---------------------------------------------------------------------------

describe("connectNumberInput — getHiddenInputProps", () => {
  it("type=hidden", () => {
    const { api } = makeApi();
    expect(api.getHiddenInputProps().type).toBe("hidden");
  });

  it("aria-hidden=true", () => {
    const { api } = makeApi();
    expect(api.getHiddenInputProps()["aria-hidden"]).toBe(true);
  });

  it("value serializes numeric value as string", () => {
    const { api } = makeApi({ value: 42 });
    expect(api.getHiddenInputProps().value).toBe("42");
  });

  it("value is empty string when null", () => {
    const { api } = makeApi({ value: null, inputText: "" });
    expect(api.getHiddenInputProps().value).toBe("");
  });

  it("name prop forwarded when provided", () => {
    const { api } = makeApi();
    expect(api.getHiddenInputProps("quantity").name).toBe("quantity");
  });
});

// ---------------------------------------------------------------------------
// isDragging / isSpinning / focused / value / inputText
// ---------------------------------------------------------------------------

describe("connectNumberInput — top-level props", () => {
  it("value reflects context value", () => {
    const { api } = makeApi({ value: 77 });
    expect(api.value).toBe(77);
  });

  it("value is null when not set", () => {
    const { api } = makeApi({ value: null, inputText: "" });
    expect(api.value).toBe(null);
  });

  it("inputText reflects context inputText", () => {
    const { api } = makeApi({ inputText: "1,234" });
    expect(api.inputText).toBe("1,234");
  });

  it("focused reflects context focused", () => {
    const { api } = makeApi({ focused: true });
    expect(api.focused).toBe(true);
  });

  it("isSpinning=false in idle state", () => {
    const { api } = makeApi({}, "idle");
    expect(api.isSpinning).toBe(false);
  });

  it("isSpinning=true in spinning.up state", () => {
    const { api } = makeApi({}, "spinning.up");
    expect(api.isSpinning).toBe(true);
  });

  it("isSpinning=true in spinning.down state", () => {
    const { api } = makeApi({}, "spinning.down");
    expect(api.isSpinning).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Vue lowercase pointer aliases — increment trigger
// ---------------------------------------------------------------------------

describe("connectNumberInput — increment trigger Vue pointer aliases", () => {
  it("onPointerdown sends INCREMENT then SPIN_START_UP", () => {
    const { api, send } = makeApi();
    const props = api.getIncrementTriggerProps() as Record<string, (e: unknown) => void>;
    props["onPointerdown"]({ button: 0, preventDefault: vi.fn() });
    expect(send).toHaveBeenNthCalledWith(1, { type: "INCREMENT" });
    expect(send).toHaveBeenNthCalledWith(2, { type: "SPIN_START_UP" });
  });

  it("onPointerdown: disabled is no-op", () => {
    const { api, send } = makeApi({ disabled: true });
    const props = api.getIncrementTriggerProps() as Record<string, (e: unknown) => void>;
    props["onPointerdown"]({ button: 0, preventDefault: vi.fn() });
    expect(send).not.toHaveBeenCalled();
  });

  it("onPointerdown: non-primary button is no-op", () => {
    const { api, send } = makeApi();
    const props = api.getIncrementTriggerProps() as Record<string, (e: unknown) => void>;
    props["onPointerdown"]({ button: 2, preventDefault: vi.fn() });
    expect(send).not.toHaveBeenCalled();
  });

  it("onPointerup sends SPIN_STOP", () => {
    const { api, send } = makeApi();
    const props = api.getIncrementTriggerProps() as Record<string, () => void>;
    props["onPointerup"]();
    expect(send).toHaveBeenCalledWith({ type: "SPIN_STOP" });
  });

  it("onPointerleave sends SPIN_STOP", () => {
    const { api, send } = makeApi();
    const props = api.getIncrementTriggerProps() as Record<string, () => void>;
    props["onPointerleave"]();
    expect(send).toHaveBeenCalledWith({ type: "SPIN_STOP" });
  });
});

// ---------------------------------------------------------------------------
// Vue lowercase pointer aliases — decrement trigger
// ---------------------------------------------------------------------------

describe("connectNumberInput — decrement trigger Vue pointer aliases", () => {
  it("onPointerdown sends DECREMENT then SPIN_START_DOWN", () => {
    const { api, send } = makeApi();
    const props = api.getDecrementTriggerProps() as Record<string, (e: unknown) => void>;
    props["onPointerdown"]({ button: 0, preventDefault: vi.fn() });
    expect(send).toHaveBeenNthCalledWith(1, { type: "DECREMENT" });
    expect(send).toHaveBeenNthCalledWith(2, { type: "SPIN_START_DOWN" });
  });

  it("onPointerdown: disabled is no-op", () => {
    const { api, send } = makeApi({ disabled: true });
    const props = api.getDecrementTriggerProps() as Record<string, (e: unknown) => void>;
    props["onPointerdown"]({ button: 0, preventDefault: vi.fn() });
    expect(send).not.toHaveBeenCalled();
  });

  it("onPointerup sends SPIN_STOP", () => {
    const { api, send } = makeApi();
    const props = api.getDecrementTriggerProps() as Record<string, () => void>;
    props["onPointerup"]();
    expect(send).toHaveBeenCalledWith({ type: "SPIN_STOP" });
  });

  it("onPointerleave sends SPIN_STOP", () => {
    const { api, send } = makeApi();
    const props = api.getDecrementTriggerProps() as Record<string, () => void>;
    props["onPointerleave"]();
    expect(send).toHaveBeenCalledWith({ type: "SPIN_STOP" });
  });
});

// ---------------------------------------------------------------------------
// Vue input aliases (onInput_vue, onChange)
// ---------------------------------------------------------------------------

describe("connectNumberInput — Vue input aliases", () => {
  it("onInput_vue sends SET_INPUT_TEXT", () => {
    const { api, send } = makeApi();
    const props = api.getInputProps() as Record<string, (e: unknown) => void>;
    props["onInput_vue"]({ target: { value: "42" } });
    expect(send).toHaveBeenCalledWith({ type: "SET_INPUT_TEXT", text: "42" });
  });

  it("onInput_vue: disabled is no-op", () => {
    const { api, send } = makeApi({ disabled: true });
    const props = api.getInputProps() as Record<string, (e: unknown) => void>;
    props["onInput_vue"]({ target: { value: "42" } });
    expect(send).not.toHaveBeenCalled();
  });

  it("onChange sends SET_INPUT_TEXT", () => {
    const { api, send } = makeApi();
    const props = api.getInputProps() as Record<string, (e: unknown) => void>;
    props["onChange"]({ target: { value: "99" } });
    expect(send).toHaveBeenCalledWith({ type: "SET_INPUT_TEXT", text: "99" });
  });

  it("onChange: readOnly is no-op", () => {
    const { api, send } = makeApi({ readOnly: true });
    const props = api.getInputProps() as Record<string, (e: unknown) => void>;
    props["onChange"]({ target: { value: "99" } });
    expect(send).not.toHaveBeenCalled();
  });
});
