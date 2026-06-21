import { describe, expect, it, vi } from "vitest";
import { connectTooltip } from "../src/tooltip.connect.js";
import type { TooltipContext, TooltipState } from "../src/tooltip.types.js";

function makeCtx(overrides: Partial<TooltipContext> = {}): TooltipContext {
  return {
    id: "test-tooltip",
    open: false,
    disabled: false,
    interactive: false,
    closeOnPointerDown: false,
    openDelay: 700,
    closeDelay: 300,
    contentId: "test-tooltip-content",
    triggerEl: null,
    contentEl: null,
    arrowEl: null,
    x: 0,
    y: 0,
    positioned: false,
    currentPlacement: "bottom",
    positioning: { strategy: "absolute", placement: "bottom" } as TooltipContext["positioning"],
    _openTimerId: undefined,
    _closeTimerId: undefined,
    ...overrides,
  };
}

function makeSnapshot(ctx: TooltipContext, state: TooltipState = "closed") {
  return { value: state, context: ctx, matches: (s: string) => s === state };
}

function makeApi(overrides: Partial<TooltipContext> = {}, state: TooltipState = "closed") {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  return { api: connectTooltip(makeSnapshot(ctx, state), send, machine), send };
}

// ---------------------------------------------------------------------------
// isOpen
// ---------------------------------------------------------------------------

describe("connectTooltip — isOpen", () => {
  it("isOpen=false when state=closed", () => {
    const { api } = makeApi({}, "closed");
    expect(api.isOpen).toBe(false);
  });

  it("isOpen=true when state=open", () => {
    const { api } = makeApi({}, "open");
    expect(api.isOpen).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getTriggerProps
// ---------------------------------------------------------------------------

describe("connectTooltip — getTriggerProps", () => {
  it("aria-describedby points to content id", () => {
    const { api } = makeApi({ contentId: "my-tooltip-content" });
    expect(api.getTriggerProps()["aria-describedby"]).toBe("my-tooltip-content");
  });

  it("data-state=closed when closed", () => {
    const { api } = makeApi({}, "closed");
    expect(api.getTriggerProps()["data-state"]).toBe("closed");
  });

  it("data-state=open when open", () => {
    const { api } = makeApi({}, "open");
    expect(api.getTriggerProps()["data-state"]).toBe("open");
  });

  it("data-forge-scope=tooltip", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps()["data-forge-scope"]).toBe("tooltip");
  });

  it("data-forge-part=trigger", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps()["data-forge-part"]).toBe("trigger");
  });

  it("data-disabled when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getTriggerProps()["data-disabled"]).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getTriggerProps — event handlers (timer-based)
// ---------------------------------------------------------------------------

describe("connectTooltip — getTriggerProps event handlers", () => {
  it("onFocus schedules OPEN after openDelay", () => {
    vi.useFakeTimers();
    const { api, send } = makeApi({ openDelay: 100 });
    api.getTriggerProps().onFocus();
    vi.advanceTimersByTime(100);
    expect(send).toHaveBeenCalledWith("OPEN");
    vi.useRealTimers();
  });

  it("disabled: onFocus does NOT schedule OPEN", () => {
    vi.useFakeTimers();
    const { api, send } = makeApi({ disabled: true });
    api.getTriggerProps().onFocus();
    vi.runAllTimers();
    expect(send).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("onBlur schedules CLOSE after closeDelay", () => {
    vi.useFakeTimers();
    const { api, send } = makeApi({ closeDelay: 100 });
    api.getTriggerProps().onBlur();
    vi.advanceTimersByTime(100);
    expect(send).toHaveBeenCalledWith("CLOSE");
    vi.useRealTimers();
  });

  it("onPointerEnter (mouse) schedules OPEN", () => {
    vi.useFakeTimers();
    const { api, send } = makeApi({ openDelay: 50 });
    api.getTriggerProps().onPointerEnter({ pointerType: "mouse" });
    vi.advanceTimersByTime(50);
    expect(send).toHaveBeenCalledWith("OPEN");
    vi.useRealTimers();
  });

  it("onPointerEnter with touch does NOT schedule OPEN", () => {
    vi.useFakeTimers();
    const { api, send } = makeApi({ openDelay: 50 });
    api.getTriggerProps().onPointerEnter({ pointerType: "touch" });
    vi.runAllTimers();
    expect(send).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("onKeyDown Escape when open sends CLOSE immediately", () => {
    const { api, send } = makeApi({}, "open");
    api.getTriggerProps().onKeyDown({ key: "Escape" });
    expect(send).toHaveBeenCalledWith("CLOSE");
  });

  it("onKeyDown Escape when closed does nothing", () => {
    const { api, send } = makeApi({}, "closed");
    api.getTriggerProps().onKeyDown({ key: "Escape" });
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getContentProps
// ---------------------------------------------------------------------------

describe("connectTooltip — getContentProps", () => {
  it("role=tooltip", () => {
    const { api } = makeApi();
    expect(api.getContentProps().role).toBe("tooltip");
  });

  it("id matches contentId", () => {
    const { api } = makeApi({ contentId: "my-tooltip" });
    expect(api.getContentProps().id).toBe("my-tooltip");
  });

  it("data-state=closed when closed", () => {
    const { api } = makeApi({}, "closed");
    expect(api.getContentProps()["data-state"]).toBe("closed");
  });

  it("data-state=open when open", () => {
    const { api } = makeApi({}, "open");
    expect(api.getContentProps()["data-state"]).toBe("open");
  });

  it("data-forge-scope=tooltip", () => {
    const { api } = makeApi();
    expect(api.getContentProps()["data-forge-scope"]).toBe("tooltip");
  });
});

// ---------------------------------------------------------------------------
// getPositionerProps
// ---------------------------------------------------------------------------

describe("connectTooltip — getPositionerProps", () => {
  it("data-forge-part=positioner", () => {
    const { api } = makeApi();
    expect(api.getPositionerProps()["data-forge-part"]).toBe("positioner");
  });

  it("data-side derived from placement", () => {
    const { api } = makeApi({ currentPlacement: "bottom" });
    expect(api.getPositionerProps()["data-side"]).toBe("bottom");
  });
});

// ---------------------------------------------------------------------------
// getArrowProps
// ---------------------------------------------------------------------------

describe("connectTooltip — getArrowProps", () => {
  it("data-forge-part=arrow", () => {
    const { api } = makeApi();
    expect(api.getArrowProps()["data-forge-part"]).toBe("arrow");
  });

  it("data-side matches placement side", () => {
    const { api } = makeApi({ currentPlacement: "top" });
    expect(api.getArrowProps()["data-side"]).toBe("top");
  });
});
