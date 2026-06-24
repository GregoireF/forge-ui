import { describe, expect, it, vi } from "vitest";
import { connectSlider } from "../src/slider.connect.js";
import type { SliderContext, SliderState } from "../src/slider.types.js";

function makeCtx(overrides: Partial<SliderContext> = {}): SliderContext {
  return {
    values: [50],
    min: 0,
    max: 100,
    step: 1,
    orientation: "horizontal",
    disabled: false,
    trackEl: null,
    activeThumb: -1,
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
// values / percents
// ---------------------------------------------------------------------------

describe("connectSlider — values and percents", () => {
  it("exposes values array", () => {
    const { api } = makeApi({ values: [50] });
    expect(api.values).toEqual([50]);
  });

  it("percents: 50% for value=50 on [0,100]", () => {
    const { api } = makeApi({ values: [50] });
    expect(api.percents[0]).toBe(50);
  });

  it("percents: 0% for value=min", () => {
    const { api } = makeApi({ values: [0] });
    expect(api.percents[0]).toBe(0);
  });

  it("percents: 100% for value=max", () => {
    const { api } = makeApi({ values: [100] });
    expect(api.percents[0]).toBe(100);
  });

  it("multi-thumb: both percents computed", () => {
    const { api } = makeApi({ values: [25, 75] });
    expect(api.percents[0]).toBe(25);
    expect(api.percents[1]).toBe(75);
  });

  it("isDragging=false when state=idle", () => {
    const { api } = makeApi({}, "idle");
    expect(api.isDragging).toBe(false);
  });

  it("isDragging=true when state=dragging", () => {
    const { api } = makeApi({}, "dragging");
    expect(api.isDragging).toBe(true);
  });

  it("activeThumb is -1 by default", () => {
    const { api } = makeApi();
    expect(api.activeThumb).toBe(-1);
  });
});

// ---------------------------------------------------------------------------
// getThumbProps — ARIA
// ---------------------------------------------------------------------------

describe("connectSlider — getThumbProps", () => {
  it("role=slider", () => {
    const { api } = makeApi();
    expect(api.getThumbProps(0).role).toBe("slider");
  });

  it("aria-valuenow reflects value at thumbIndex", () => {
    const { api } = makeApi({ values: [42] });
    expect(api.getThumbProps(0)["aria-valuenow"]).toBe(42);
  });

  it("multi-thumb: thumb 1 aria-valuenow reflects index 1 value", () => {
    const { api } = makeApi({ values: [20, 80] });
    expect(api.getThumbProps(1)["aria-valuenow"]).toBe(80);
  });

  it("aria-valuemin reflects min", () => {
    const { api } = makeApi({ min: 10 });
    expect(api.getThumbProps(0)["aria-valuemin"]).toBe(10);
  });

  it("aria-valuemax reflects max", () => {
    const { api } = makeApi({ max: 200 });
    expect(api.getThumbProps(0)["aria-valuemax"]).toBe(200);
  });

  it("tabIndex=0 when enabled", () => {
    const { api } = makeApi();
    expect(api.getThumbProps(0).tabIndex).toBe(0);
  });

  it("tabIndex=-1 when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getThumbProps(0).tabIndex).toBe(-1);
  });

  it("aria-disabled when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getThumbProps(0)["aria-disabled"]).toBe(true);
  });

  it("data-index reflects thumbIndex", () => {
    const { api } = makeApi({ values: [20, 80] });
    expect(api.getThumbProps(1)["data-index"]).toBe(1);
  });

  it("data-active when this thumb is being dragged", () => {
    const { api } = makeApi({ values: [50], activeThumb: 0 }, "dragging");
    expect(api.getThumbProps(0)["data-active"]).toBe("");
  });

  it("no data-active when dragging a different thumb", () => {
    const { api } = makeApi({ values: [20, 80], activeThumb: 1 }, "dragging");
    expect(api.getThumbProps(0)["data-active"]).toBeUndefined();
  });

  it("onKeyDown ArrowRight sends INCREMENT with thumbIndex", () => {
    const { api, send } = makeApi();
    api.getThumbProps(0).onKeyDown({ key: "ArrowRight", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "INCREMENT", thumbIndex: 0 });
  });

  it("onKeyDown ArrowLeft sends DECREMENT with thumbIndex", () => {
    const { api, send } = makeApi();
    api.getThumbProps(0).onKeyDown({ key: "ArrowLeft", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "DECREMENT", thumbIndex: 0 });
  });

  it("onKeyDown Home sends SET_MIN with thumbIndex", () => {
    const { api, send } = makeApi({ min: 5 });
    api.getThumbProps(0).onKeyDown({ key: "Home", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "SET_MIN", thumbIndex: 0 });
  });

  it("onKeyDown End sends SET_MAX with thumbIndex", () => {
    const { api, send } = makeApi({ max: 200 });
    api.getThumbProps(0).onKeyDown({ key: "End", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "SET_MAX", thumbIndex: 0 });
  });

  it("onKeyDown PageUp sends INCREMENT_PAGE with thumbIndex", () => {
    const { api, send } = makeApi();
    api.getThumbProps(0).onKeyDown({ key: "PageUp", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "INCREMENT_PAGE", thumbIndex: 0 });
  });

  it("onKeyDown PageDown sends DECREMENT_PAGE with thumbIndex", () => {
    const { api, send } = makeApi();
    api.getThumbProps(0).onKeyDown({ key: "PageDown", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "DECREMENT_PAGE", thumbIndex: 0 });
  });

  it("thumb 1: ArrowRight sends INCREMENT thumbIndex:1", () => {
    const { api, send } = makeApi({ values: [20, 80] });
    api.getThumbProps(1).onKeyDown({ key: "ArrowRight", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "INCREMENT", thumbIndex: 1 });
  });

  it("disabled: onKeyDown does nothing", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getThumbProps(0).onKeyDown({ key: "ArrowRight", preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(send).not.toHaveBeenCalled();
  });

  it("aria-orientation reflects orientation", () => {
    const { api } = makeApi({ orientation: "vertical" });
    expect(api.getThumbProps(0)["aria-orientation"]).toBe("vertical");
  });

  it("horizontal thumb style: left uses percent, transform translateX(-50%)", () => {
    const { api } = makeApi({ values: [25] });
    const style = api.getThumbProps(0).style as Record<string, string>;
    expect(style.left).toBe("25%");
    expect(style.transform).toBe("translateX(-50%)");
  });

  it("vertical thumb style: bottom uses percent, transform translateY(50%)", () => {
    const { api } = makeApi({ values: [75], orientation: "vertical" });
    const style = api.getThumbProps(0).style as Record<string, string>;
    expect(style.bottom).toBe("75%");
    expect(style.transform).toBe("translateY(50%)");
  });
});

// ---------------------------------------------------------------------------
// onKeydown (Vue alias)
// ---------------------------------------------------------------------------

describe("connectSlider — onKeydown (Vue alias)", () => {
  function callKeydown(api: ReturnType<typeof makeApi>["api"], key: string, index = 0) {
    const props = api.getThumbProps(index) as Record<string, (e: unknown) => void>;
    props["onKeydown"]({ key, preventDefault: vi.fn() });
  }

  it("ArrowRight → INCREMENT", () => {
    const { api, send } = makeApi();
    callKeydown(api, "ArrowRight");
    expect(send).toHaveBeenCalledWith({ type: "INCREMENT", thumbIndex: 0 });
  });

  it("ArrowLeft → DECREMENT", () => {
    const { api, send } = makeApi();
    callKeydown(api, "ArrowLeft");
    expect(send).toHaveBeenCalledWith({ type: "DECREMENT", thumbIndex: 0 });
  });

  it("Home → SET_MIN", () => {
    const { api, send } = makeApi({ min: 5 });
    callKeydown(api, "Home");
    expect(send).toHaveBeenCalledWith({ type: "SET_MIN", thumbIndex: 0 });
  });

  it("End → SET_MAX", () => {
    const { api, send } = makeApi({ max: 200 });
    callKeydown(api, "End");
    expect(send).toHaveBeenCalledWith({ type: "SET_MAX", thumbIndex: 0 });
  });

  it("PageUp → INCREMENT_PAGE", () => {
    const { api, send } = makeApi();
    callKeydown(api, "PageUp");
    expect(send).toHaveBeenCalledWith({ type: "INCREMENT_PAGE", thumbIndex: 0 });
  });

  it("PageDown → DECREMENT_PAGE", () => {
    const { api, send } = makeApi();
    callKeydown(api, "PageDown");
    expect(send).toHaveBeenCalledWith({ type: "DECREMENT_PAGE", thumbIndex: 0 });
  });

  it("thumb 1: ArrowUp → INCREMENT thumbIndex:1", () => {
    const { api, send } = makeApi({ values: [20, 80] });
    callKeydown(api, "ArrowUp", 1);
    expect(send).toHaveBeenCalledWith({ type: "INCREMENT", thumbIndex: 1 });
  });

  it("disabled: no-op", () => {
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

  it("ref callback registers trackEl on machine", () => {
    const ctx = makeCtx();
    const machine = { setContext: vi.fn() };
    const api = connectSlider(makeSnapshot(ctx), vi.fn(), machine);
    const el = document.createElement("div");
    (api.getTrackProps() as Record<string, (el: Element | null) => void>)["ref"](el);
    expect(machine.setContext).toHaveBeenCalledWith({ trackEl: el });
  });
});

// ---------------------------------------------------------------------------
// getRangeProps — single thumb fills from 0, range fills between thumbs
// ---------------------------------------------------------------------------

describe("connectSlider — getRangeProps", () => {
  it("data-forge-part=range", () => {
    const { api } = makeApi();
    expect(api.getRangeProps()["data-forge-part"]).toBe("range");
  });

  it("single thumb horizontal: left=0%, right=100-percent", () => {
    const { api } = makeApi({ values: [25] });
    const s = api.getRangeProps().style as Record<string, string>;
    expect(s.left).toBe("0%");
    expect(s.right).toBe("75%");
  });

  it("range horizontal: left=low thumb percent, right=100-high percent", () => {
    const { api } = makeApi({ values: [20, 80] });
    const s = api.getRangeProps().style as Record<string, string>;
    expect(s.left).toBe("20%");
    expect(s.right).toBe("20%");
  });

  it("single thumb vertical: bottom=0%, top=100-percent", () => {
    const { api } = makeApi({ values: [40], orientation: "vertical" });
    const s = api.getRangeProps().style as Record<string, string>;
    expect(s.bottom).toBe("0%");
    expect(s.top).toBe("60%");
  });

  it("range vertical: bottom=low, top=100-high", () => {
    const { api } = makeApi({ values: [30, 70], orientation: "vertical" });
    const s = api.getRangeProps().style as Record<string, string>;
    expect(s.bottom).toBe("30%");
    expect(s.top).toBe("30%");
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

  it("value reflects thumb 0 by default", () => {
    const { api } = makeApi({ values: [75] });
    expect(api.getHiddenInputProps().value).toBe(75);
  });

  it("value reflects specified thumbIndex", () => {
    const { api } = makeApi({ values: [20, 80] });
    expect(api.getHiddenInputProps(undefined, 1).value).toBe(80);
  });

  it("name prop is forwarded when provided", () => {
    const { api } = makeApi({ values: [50] });
    expect(api.getHiddenInputProps("volume").name).toBe("volume");
  });

  it("onChange is a no-op (required by React for controlled inputs)", () => {
    const { api } = makeApi();
    const props = api.getHiddenInputProps() as Record<string, () => void>;
    expect(() => props["onChange"]()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// onPointerDown with trackEl — closest thumb selection
// ---------------------------------------------------------------------------

function makeMockTrackEl(rect: { left: number; top: number; width: number; height: number }) {
  return { getBoundingClientRect: () => rect } as unknown as Element;
}

describe("connectSlider — onPointerDown with trackEl", () => {
  it("trackEl=null is no-op", () => {
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

  it("single thumb: sends POINTER_DOWN thumbIndex:0", () => {
    const trackEl = makeMockTrackEl({ left: 0, top: 0, width: 100, height: 20 });
    const { api, send } = makeApi({ trackEl, values: [0] });
    const e = { button: 0, clientX: 75, clientY: 0, preventDefault: vi.fn() } as unknown as PointerEvent;
    api.getTrackProps().onPointerDown(e);
    expect(send).toHaveBeenCalledWith({ type: "POINTER_DOWN", value: 75, thumbIndex: 0 });
  });

  it("range: click near thumb 1 selects thumb 1", () => {
    const trackEl = makeMockTrackEl({ left: 0, top: 0, width: 100, height: 20 });
    // thumb 0 at 20, thumb 1 at 80 — click at 75 is closer to thumb 1
    const { api, send } = makeApi({ trackEl, values: [20, 80] });
    const e = { button: 0, clientX: 75, clientY: 0, preventDefault: vi.fn() } as unknown as PointerEvent;
    api.getTrackProps().onPointerDown(e);
    expect(send).toHaveBeenCalledWith({ type: "POINTER_DOWN", value: 75, thumbIndex: 1 });
  });

  it("range: click near thumb 0 selects thumb 0", () => {
    const trackEl = makeMockTrackEl({ left: 0, top: 0, width: 100, height: 20 });
    const { api, send } = makeApi({ trackEl, values: [20, 80] });
    const e = { button: 0, clientX: 25, clientY: 0, preventDefault: vi.fn() } as unknown as PointerEvent;
    api.getTrackProps().onPointerDown(e);
    expect(send).toHaveBeenCalledWith({ type: "POINTER_DOWN", value: 25, thumbIndex: 0 });
  });

  it("clamps to min when pointer is left of track", () => {
    const trackEl = makeMockTrackEl({ left: 50, top: 0, width: 100, height: 0 });
    const { api, send } = makeApi({ trackEl, values: [0] });
    const e = { button: 0, clientX: 0, clientY: 0, preventDefault: vi.fn() } as unknown as PointerEvent;
    api.getTrackProps().onPointerDown(e);
    expect(send).toHaveBeenCalledWith({ type: "POINTER_DOWN", value: 0, thumbIndex: 0 });
  });

  it("snaps to nearest step grid", () => {
    const trackEl = makeMockTrackEl({ left: 0, top: 0, width: 100, height: 0 });
    const { api, send } = makeApi({ trackEl, values: [0], step: 10 });
    const e = { button: 0, clientX: 53, clientY: 0, preventDefault: vi.fn() } as unknown as PointerEvent;
    api.getTrackProps().onPointerDown(e);
    expect(send).toHaveBeenCalledWith({ type: "POINTER_DOWN", value: 50, thumbIndex: 0 });
  });
});

// ---------------------------------------------------------------------------
// aria-valuetext / getValueLabel
// ---------------------------------------------------------------------------

describe("connectSlider — aria-valuetext via getValueLabel", () => {
  it("aria-valuetext absent when getValueLabel is not set", () => {
    const { api } = makeApi({ values: [50] });
    const props = api.getThumbProps(0) as Record<string, unknown>;
    expect(props["aria-valuetext"]).toBeUndefined();
  });

  it("aria-valuetext reflects getValueLabel output with value and index", () => {
    const getValueLabel = (v: number, i: number) => i === 0 ? `start: ${v}` : `end: ${v}`;
    const { api } = makeApi({ values: [20, 80], getValueLabel });
    expect((api.getThumbProps(0) as Record<string, unknown>)["aria-valuetext"]).toBe("start: 20");
    expect((api.getThumbProps(1) as Record<string, unknown>)["aria-valuetext"]).toBe("end: 80");
  });
});
