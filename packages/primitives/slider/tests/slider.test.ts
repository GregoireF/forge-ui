import { describe, expect, it, vi } from "vitest";
import { connectSlider } from "../src/slider.connect.js";
import type { SliderContext, SliderState } from "../src/slider.types.js";

function makeCtx(overrides: Partial<SliderContext> = {}): SliderContext {
  return {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    orientation: "horizontal",
    disabled: false,
    trackEl: null,
    ...overrides,
  };
}

function makeSnapshot(ctx: SliderContext, state: SliderState = "idle") {
  return { value: state, context: ctx, matches: (s: string) => s === state };
}

function makeApi(overrides: Partial<SliderContext> = {}, state: SliderState = "idle") {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  return { api: connectSlider(makeSnapshot(ctx, state), send, machine), send };
}

// ---------------------------------------------------------------------------
// value / percent
// ---------------------------------------------------------------------------

describe("connectSlider — value and percent", () => {
  it("exposes current value", () => {
    const { api } = makeApi({ value: 50 });
    expect(api.value).toBe(50);
  });

  it("percent is 50 for value=50 on [0,100]", () => {
    const { api } = makeApi({ value: 50 });
    expect(api.percent).toBe(50);
  });

  it("percent is 0 for value=min", () => {
    const { api } = makeApi({ value: 0 });
    expect(api.percent).toBe(0);
  });

  it("percent is 100 for value=max", () => {
    const { api } = makeApi({ value: 100 });
    expect(api.percent).toBe(100);
  });

  it("isDragging=false when state=idle", () => {
    const { api } = makeApi({}, "idle");
    expect(api.isDragging).toBe(false);
  });

  it("isDragging=true when state=dragging", () => {
    const { api } = makeApi({}, "dragging");
    expect(api.isDragging).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getThumbProps — ARIA
// ---------------------------------------------------------------------------

describe("connectSlider — getThumbProps", () => {
  it("role=slider", () => {
    const { api } = makeApi();
    expect(api.getThumbProps().role).toBe("slider");
  });

  it("aria-valuenow reflects value", () => {
    const { api } = makeApi({ value: 42 });
    expect(api.getThumbProps()["aria-valuenow"]).toBe(42);
  });

  it("aria-valuemin reflects min", () => {
    const { api } = makeApi({ min: 10 });
    expect(api.getThumbProps()["aria-valuemin"]).toBe(10);
  });

  it("aria-valuemax reflects max", () => {
    const { api } = makeApi({ max: 200 });
    expect(api.getThumbProps()["aria-valuemax"]).toBe(200);
  });

  it("tabIndex=0 when enabled", () => {
    const { api } = makeApi();
    expect(api.getThumbProps().tabIndex).toBe(0);
  });

  it("tabIndex=-1 when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getThumbProps().tabIndex).toBe(-1);
  });

  it("aria-disabled when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getThumbProps()["aria-disabled"]).toBe(true);
  });

  it("onKeyDown ArrowRight sends INCREMENT", () => {
    const { api, send } = makeApi();
    api.getThumbProps().onKeyDown({ key: "ArrowRight", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "INCREMENT" });
  });

  it("onKeyDown ArrowLeft sends DECREMENT", () => {
    const { api, send } = makeApi();
    api.getThumbProps().onKeyDown({ key: "ArrowLeft", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "DECREMENT" });
  });

  it("onKeyDown Home sends SET_VALUE with min", () => {
    const { api, send } = makeApi({ min: 5 });
    api.getThumbProps().onKeyDown({ key: "Home", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "SET_VALUE", value: 5 });
  });

  it("onKeyDown End sends SET_VALUE with max", () => {
    const { api, send } = makeApi({ max: 200 });
    api.getThumbProps().onKeyDown({ key: "End", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "SET_VALUE", value: 200 });
  });

  it("disabled: onKeyDown does nothing", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getThumbProps().onKeyDown({ key: "ArrowRight", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getRootProps
// ---------------------------------------------------------------------------

describe("connectSlider — getRootProps", () => {
  it("has data-forge-scope=slider", () => {
    const { api } = makeApi();
    expect(api.getRootProps()["data-forge-scope"]).toBe("slider");
  });

  it("data-disabled when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getRootProps()["data-disabled"]).toBe("");
  });

  it("data-orientation reflects orientation", () => {
    const { api } = makeApi({ orientation: "vertical" });
    expect(api.getRootProps()["data-orientation"]).toBe("vertical");
  });
});

// ---------------------------------------------------------------------------
// getHiddenInputProps
// ---------------------------------------------------------------------------

describe("connectSlider — getHiddenInputProps", () => {
  it("type=range", () => {
    const { api } = makeApi();
    expect(api.getHiddenInputProps().type).toBe("range");
  });

  it("aria-hidden=true", () => {
    const { api } = makeApi();
    expect(api.getHiddenInputProps()["aria-hidden"]).toBe(true);
  });

  it("value reflects current value", () => {
    const { api } = makeApi({ value: 75 });
    expect(api.getHiddenInputProps().value).toBe(75);
  });
});
