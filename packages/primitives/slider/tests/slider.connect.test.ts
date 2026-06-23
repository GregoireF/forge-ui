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
  return {
    value: state,
    context: ctx,
    tags: [] as ReadonlyArray<string>,
    matches: (...states: string[]) => states.includes(state),
    hasTag: (_tag: string) => false,
  };
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

  // WAI-ARIA §3.14: role="slider" MUST have an accessible name. The connect
  // intentionally omits aria-label — consumers must provide it directly on
  // <Slider.Thumb aria-label="Volume" /> (frameworks spread extra props via
  // ...rest / ...attrs).
  it("no built-in accessible name — consumer must provide aria-label", () => {
    const { api } = makeApi();
    const props = api.getThumbProps() as Record<string, unknown>;
    expect(props["aria-label"]).toBeUndefined();
    expect(props["aria-labelledby"]).toBeUndefined();
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

  // WAI-ARIA §3.23: PageUp / PageDown move by a larger step (10% of range)
  it("onKeyDown PageUp sends INCREMENT_PAGE", () => {
    const { api, send } = makeApi();
    api.getThumbProps().onKeyDown({ key: "PageUp", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "INCREMENT_PAGE" });
  });

  it("onKeyDown PageDown sends DECREMENT_PAGE", () => {
    const { api, send } = makeApi();
    api.getThumbProps().onKeyDown({ key: "PageDown", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "DECREMENT_PAGE" });
  });

  // WAI-ARIA §3.23: vertical orientation uses ArrowUp/ArrowDown for increment/decrement
  it("onKeyDown ArrowUp sends INCREMENT (vertical)", () => {
    const { api, send } = makeApi({ orientation: "vertical" });
    api.getThumbProps().onKeyDown({ key: "ArrowUp", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "INCREMENT" });
  });

  it("onKeyDown ArrowDown sends DECREMENT (vertical)", () => {
    const { api, send } = makeApi({ orientation: "vertical" });
    api.getThumbProps().onKeyDown({ key: "ArrowDown", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "DECREMENT" });
  });

  it("aria-orientation reflects orientation", () => {
    const { api } = makeApi({ orientation: "vertical" });
    expect(api.getThumbProps()["aria-orientation"]).toBe("vertical");
  });

  it("disabled: onKeyDown does nothing", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getThumbProps().onKeyDown({ key: "ArrowRight", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getTrackProps
// ---------------------------------------------------------------------------

describe("connectSlider — getTrackProps", () => {
  it("data-forge-part=track", () => {
    const { api } = makeApi();
    expect(api.getTrackProps()["data-forge-part"]).toBe("track");
  });

  it("data-orientation reflects orientation", () => {
    const { api } = makeApi({ orientation: "vertical" });
    expect(api.getTrackProps()["data-orientation"]).toBe("vertical");
  });

  it("data-disabled when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getTrackProps()["data-disabled"]).toBe("");
  });

  it("no data-disabled when enabled", () => {
    const { api } = makeApi({ disabled: false });
    expect(api.getTrackProps()["data-disabled"]).toBeUndefined();
  });

  it("onPointerDown does nothing when disabled", () => {
    const { api, send } = makeApi({ disabled: true });
    const e = { button: 0, preventDefault: vi.fn() } as unknown as PointerEvent;
    api.getTrackProps().onPointerDown(e);
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getRangeProps
// ---------------------------------------------------------------------------

describe("connectSlider — getRangeProps", () => {
  it("data-forge-part=range", () => {
    const { api } = makeApi();
    expect(api.getRangeProps()["data-forge-part"]).toBe("range");
  });

  it("horizontal: right style reflects 100-percent", () => {
    const { api } = makeApi({ value: 25, min: 0, max: 100 });
    expect(api.getRangeProps().style.right).toBe("75%");
  });

  it("horizontal: left is always 0%", () => {
    const { api } = makeApi({ value: 60 });
    expect(api.getRangeProps().style.left).toBe("0%");
  });

  it("vertical: top style reflects 100-percent", () => {
    const { api } = makeApi({ value: 40, orientation: "vertical" });
    expect(api.getRangeProps().style.top).toBe("60%");
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

  it("onChange is a no-op (required by React for controlled inputs)", () => {
    const { api } = makeApi();
    const props = api.getHiddenInputProps() as Record<string, () => void>;
    expect(() => props["onChange"]()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// onPointerDown — with trackEl (covers computeValueFromPointer + helpers)
// These tests provide a mock trackEl so the handler reaches the computation
// path instead of returning early at the "if (!trackEl) return" guard.
// ---------------------------------------------------------------------------

function makeMockTrackEl(rect: { left: number; top: number; width: number; height: number }) {
  return { getBoundingClientRect: () => rect } as unknown as Element;
}

describe("connectSlider — onPointerDown with trackEl", () => {
  it("trackEl=null (button=0, enabled) is no-op", () => {
    const { api, send } = makeApi({ trackEl: null });
    const e = { button: 0, clientX: 50, clientY: 0, preventDefault: vi.fn() } as unknown as PointerEvent;
    api.getTrackProps().onPointerDown(e);
    expect(send).not.toHaveBeenCalled();
  });

  it("button !== 0 is no-op", () => {
    const { api, send } = makeApi({ trackEl: makeMockTrackEl({ left: 0, top: 0, width: 100, height: 0 }) });
    const e = { button: 2, clientX: 50, clientY: 0, preventDefault: vi.fn() } as unknown as PointerEvent;
    api.getTrackProps().onPointerDown(e);
    expect(send).not.toHaveBeenCalled();
  });

  it("horizontal: sends POINTER_DOWN with value derived from clientX", () => {
    const trackEl = makeMockTrackEl({ left: 0, top: 0, width: 100, height: 20 });
    const { api, send } = makeApi({ trackEl, value: 0, min: 0, max: 100 });
    const e = { button: 0, clientX: 75, clientY: 0, preventDefault: vi.fn() } as unknown as PointerEvent;
    api.getTrackProps().onPointerDown(e);
    expect(send).toHaveBeenCalledWith({ type: "POINTER_DOWN", value: 75 });
  });

  it("vertical: sends POINTER_DOWN with value derived from clientY (inverted axis)", () => {
    const trackEl = makeMockTrackEl({ left: 0, top: 0, width: 20, height: 100 });
    const { api, send } = makeApi({ trackEl, value: 0, min: 0, max: 100, orientation: "vertical" });
    // clientY=30 from top → percent = 1 - 30/100 = 0.7 → value = 70
    const e = { button: 0, clientX: 0, clientY: 30, preventDefault: vi.fn() } as unknown as PointerEvent;
    api.getTrackProps().onPointerDown(e);
    expect(send).toHaveBeenCalledWith({ type: "POINTER_DOWN", value: 70 });
  });

  it("clamps to min when pointer is left of track", () => {
    const trackEl = makeMockTrackEl({ left: 50, top: 0, width: 100, height: 0 });
    const { api, send } = makeApi({ trackEl, min: 0, max: 100 });
    // clientX=0 → percent=(0-50)/100=-0.5 → clamped to 0 → value=0
    const e = { button: 0, clientX: 0, clientY: 0, preventDefault: vi.fn() } as unknown as PointerEvent;
    api.getTrackProps().onPointerDown(e);
    expect(send).toHaveBeenCalledWith({ type: "POINTER_DOWN", value: 0 });
  });

  it("clamps to max when pointer is right of track", () => {
    const trackEl = makeMockTrackEl({ left: 0, top: 0, width: 100, height: 0 });
    const { api, send } = makeApi({ trackEl, min: 0, max: 100 });
    // clientX=200 → percent=2 → clamped to 1 → value=100
    const e = { button: 0, clientX: 200, clientY: 0, preventDefault: vi.fn() } as unknown as PointerEvent;
    api.getTrackProps().onPointerDown(e);
    expect(send).toHaveBeenCalledWith({ type: "POINTER_DOWN", value: 100 });
  });

  it("snaps to nearest step grid", () => {
    const trackEl = makeMockTrackEl({ left: 0, top: 0, width: 100, height: 0 });
    const { api, send } = makeApi({ trackEl, min: 0, max: 100, step: 10 });
    // clientX=53 → raw=53 → snapped to 50 (step=10)
    const e = { button: 0, clientX: 53, clientY: 0, preventDefault: vi.fn() } as unknown as PointerEvent;
    api.getTrackProps().onPointerDown(e);
    expect(send).toHaveBeenCalledWith({ type: "POINTER_DOWN", value: 50 });
  });

  it("snaps with decimal step (avoids float drift)", () => {
    const trackEl = makeMockTrackEl({ left: 0, top: 0, width: 100, height: 0 });
    const { api, send } = makeApi({ trackEl, min: 0, max: 1, step: 0.1 });
    // clientX=33 → raw=0.33 → snapped to 0.3
    const e = { button: 0, clientX: 33, clientY: 0, preventDefault: vi.fn() } as unknown as PointerEvent;
    api.getTrackProps().onPointerDown(e);
    expect(send).toHaveBeenCalledWith({ type: "POINTER_DOWN", value: 0.3 });
  });

  it("calls preventDefault when trackEl is present", () => {
    const trackEl = makeMockTrackEl({ left: 0, top: 0, width: 100, height: 0 });
    const { api } = makeApi({ trackEl });
    const preventDefault = vi.fn();
    const e = { button: 0, clientX: 50, clientY: 0, preventDefault } as unknown as PointerEvent;
    api.getTrackProps().onPointerDown(e);
    expect(preventDefault).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// onKeydown (Vue lowercase alias) — mirrors onKeyDown but for Vue event naming
// Both handlers must be present because React uses camelCase and Vue uses lowercase.
// ---------------------------------------------------------------------------

describe("connectSlider — onKeydown (Vue alias for onKeyDown)", () => {
  function callKeydown(api: ReturnType<typeof makeApi>["api"], key: string) {
    const props = api.getThumbProps() as Record<string, (e: unknown) => void>;
    props["onKeydown"]({ key, preventDefault: vi.fn() });
  }

  it("ArrowRight → INCREMENT", () => {
    const { api, send } = makeApi();
    callKeydown(api, "ArrowRight");
    expect(send).toHaveBeenCalledWith({ type: "INCREMENT" });
  });

  it("ArrowUp → INCREMENT", () => {
    const { api, send } = makeApi();
    callKeydown(api, "ArrowUp");
    expect(send).toHaveBeenCalledWith({ type: "INCREMENT" });
  });

  it("ArrowLeft → DECREMENT", () => {
    const { api, send } = makeApi();
    callKeydown(api, "ArrowLeft");
    expect(send).toHaveBeenCalledWith({ type: "DECREMENT" });
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

  it("Home → SET_VALUE with min", () => {
    const { api, send } = makeApi({ min: 5 });
    callKeydown(api, "Home");
    expect(send).toHaveBeenCalledWith({ type: "SET_VALUE", value: 5 });
  });

  it("End → SET_VALUE with max", () => {
    const { api, send } = makeApi({ max: 200 });
    callKeydown(api, "End");
    expect(send).toHaveBeenCalledWith({ type: "SET_VALUE", value: 200 });
  });

  it("disabled: no-op for any key", () => {
    const { api, send } = makeApi({ disabled: true });
    callKeydown(api, "ArrowRight");
    expect(send).not.toHaveBeenCalled();
  });

  it("unknown key: no-op", () => {
    const { api, send } = makeApi();
    callKeydown(api, "Tab");
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getTrackProps — ref callback
// ---------------------------------------------------------------------------

describe("connectSlider — getTrackProps ref callback", () => {
  it("ref callback registers trackEl on machine", () => {
    const ctx = makeCtx();
    const send = vi.fn();
    const machine = { setContext: vi.fn() };
    const api = connectSlider(makeSnapshot(ctx), send, machine);
    const el = document.createElement("div");
    (api.getTrackProps() as Record<string, (el: Element | null) => void>)["ref"](el);
    expect(machine.setContext).toHaveBeenCalledWith({ trackEl: el });
  });
});
