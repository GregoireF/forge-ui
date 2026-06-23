import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { connectHoverCard } from "../src/hover-card.connect.js";
import type { HoverCardContext, HoverCardState } from "../src/hover-card.types.js";

function makeCtx(overrides: Partial<HoverCardContext> = {}): HoverCardContext {
  return {
    id: "test-hc",
    openDelay: 700,
    closeDelay: 300,
    isOpen: false,
    triggerId: "test-hc-trigger",
    contentId: "test-hc-content",
    currentPlacement: "bottom",
    positioning: { strategy: "absolute", placement: "bottom" } as HoverCardContext["positioning"],
    triggerEl: null,
    contentEl: null,
    arrowEl: null,
    x: 0,
    y: 0,
    positioned: false,
    _openTimerId: undefined,
    _closeTimerId: undefined,
    ...overrides,
  };
}

function makeSnapshot(ctx: HoverCardContext, state: HoverCardState = "idle") {
  return {
    value: state,
    context: ctx,
    matches: (...states: string[]) => states.includes(state),
  };
}

function makeApi(overrides: Partial<HoverCardContext> = {}, state: HoverCardState = "idle") {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  return { api: connectHoverCard(makeSnapshot(ctx, state), send, machine), send };
}

// ---------------------------------------------------------------------------
// isOpen
// ---------------------------------------------------------------------------

describe("connectHoverCard — isOpen", () => {
  it("isOpen=false when state=idle", () => {
    const { api } = makeApi({}, "idle");
    expect(api.isOpen).toBe(false);
  });

  it("isOpen=true when state=open", () => {
    const { api } = makeApi({}, "open");
    expect(api.isOpen).toBe(true);
  });

  it("isOpen=true when state=closing (hover still active)", () => {
    const { api } = makeApi({}, "closing");
    expect(api.isOpen).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getTriggerProps
// ---------------------------------------------------------------------------

describe("connectHoverCard — getTriggerProps", () => {
  it("aria-haspopup=dialog", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps()["aria-haspopup"]).toBe("dialog");
  });

  it("aria-expanded=false when closed", () => {
    const { api } = makeApi({}, "idle");
    expect(api.getTriggerProps()["aria-expanded"]).toBe(false);
  });

  it("aria-expanded=true when open", () => {
    const { api } = makeApi({}, "open");
    expect(api.getTriggerProps()["aria-expanded"]).toBe(true);
  });

  it("aria-controls points to content id", () => {
    const { api } = makeApi({ contentId: "hc-content" });
    expect(api.getTriggerProps()["aria-controls"]).toBe("hc-content");
  });

  it("data-state=closed when idle", () => {
    const { api } = makeApi({}, "idle");
    expect(api.getTriggerProps()["data-state"]).toBe("closed");
  });

  it("data-state=open when open", () => {
    const { api } = makeApi({}, "open");
    expect(api.getTriggerProps()["data-state"]).toBe("open");
  });

  it("data-forge-scope=hover-card", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps()["data-forge-scope"]).toBe("hover-card");
  });

  it("onMouseEnter sends MOUSE_ENTER", () => {
    const { api, send } = makeApi();
    api.getTriggerProps().onMouseEnter();
    expect(send).toHaveBeenCalledWith({ type: "MOUSE_ENTER" });
  });

  // WAI-ARIA: keyboard focus must also open hover card (without delay)
  it("onFocus sends FOCUS", () => {
    const { api, send } = makeApi();
    api.getTriggerProps().onFocus();
    expect(send).toHaveBeenCalledWith({ type: "FOCUS" });
  });

  it("onBlur sends BLUR", () => {
    const { api, send } = makeApi();
    api.getTriggerProps().onBlur();
    expect(send).toHaveBeenCalledWith({ type: "BLUR" });
  });

  it("onMouseLeave sends MOUSE_LEAVE", () => {
    const { api, send } = makeApi();
    api.getTriggerProps().onMouseLeave();
    expect(send).toHaveBeenCalledWith({ type: "MOUSE_LEAVE" });
  });
});

// ---------------------------------------------------------------------------
// getContentProps
// ---------------------------------------------------------------------------

describe("connectHoverCard — getContentProps", () => {
  it("role=dialog", () => {
    const { api } = makeApi();
    expect(api.getContentProps().role).toBe("dialog");
  });

  it("id matches contentId", () => {
    const { api } = makeApi({ contentId: "card-body" });
    expect(api.getContentProps().id).toBe("card-body");
  });

  it("data-forge-scope=hover-card", () => {
    const { api } = makeApi();
    expect(api.getContentProps()["data-forge-scope"]).toBe("hover-card");
  });

  it("data-state=open when open", () => {
    const { api } = makeApi({}, "open");
    expect(api.getContentProps()["data-state"]).toBe("open");
  });
});

// ---------------------------------------------------------------------------
// getPositionerProps
// ---------------------------------------------------------------------------

describe("connectHoverCard — getPositionerProps", () => {
  it("data-forge-part=positioner", () => {
    const { api } = makeApi();
    expect(api.getPositionerProps()["data-forge-part"]).toBe("positioner");
  });

  it("data-side derived from placement", () => {
    const { api } = makeApi({ currentPlacement: "top" });
    expect(api.getPositionerProps()["data-side"]).toBe("top");
  });
});

describe("connectHoverCard — getArrowProps", () => {
  it("data-forge-part=arrow", () => {
    const { api } = makeApi();
    expect(api.getArrowProps()["data-forge-part"]).toBe("arrow");
  });

  it("data-side matches placement side", () => {
    const { api } = makeApi({ currentPlacement: "left" });
    expect(api.getArrowProps()["data-side"]).toBe("left");
  });

  it("ref callback calls machine.setContext with arrowEl", () => {
    const ctx = makeCtx();
    const send = vi.fn();
    const machine = { setContext: vi.fn() };
    const api = connectHoverCard(makeSnapshot(ctx), send, machine);
    const el = document.createElement("div");
    api.getArrowProps().ref(el);
    expect(machine.setContext).toHaveBeenCalledWith({ arrowEl: el });
  });
});

// ---------------------------------------------------------------------------
// scheduleOpen / scheduleClose — timer bodies via fake timers
//
// WHY fake timers: the connect layer uses raw setTimeout for open/close delays.
// vi.useFakeTimers() replaces setTimeout with a synchronous stub, so we can
// advance time and assert the OPEN_TIMEOUT / CLOSE_TIMEOUT events were sent
// without waiting real milliseconds.
// ---------------------------------------------------------------------------

describe("connectHoverCard — scheduleOpen (onMouseEnter timer)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("OPEN_TIMEOUT sent after openDelay", () => {
    const { api, send } = makeApi({ openDelay: 700 });
    api.getTriggerProps().onMouseEnter();
    expect(send).not.toHaveBeenCalledWith({ type: "OPEN_TIMEOUT" });
    vi.advanceTimersByTime(700);
    expect(send).toHaveBeenCalledWith({ type: "OPEN_TIMEOUT" });
  });

  it("cancels pending close timer when scheduleOpen runs", () => {
    const { api, send } = makeApi({ openDelay: 700, closeDelay: 300 });
    // Start a close timer
    api.getTriggerProps().onMouseLeave();
    // Immediately mouse-enter → should cancel the close timer
    api.getTriggerProps().onMouseEnter();
    vi.advanceTimersByTime(300);
    expect(send).not.toHaveBeenCalledWith({ type: "CLOSE_TIMEOUT" });
  });

  it("OPEN_TIMEOUT not sent before delay elapses", () => {
    const { api, send } = makeApi({ openDelay: 700 });
    api.getTriggerProps().onMouseEnter();
    vi.advanceTimersByTime(699);
    expect(send).not.toHaveBeenCalledWith({ type: "OPEN_TIMEOUT" });
  });
});

describe("connectHoverCard — scheduleClose (onMouseLeave timer)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("CLOSE_TIMEOUT sent after closeDelay", () => {
    const { api, send } = makeApi({ closeDelay: 300 });
    api.getTriggerProps().onMouseLeave();
    expect(send).not.toHaveBeenCalledWith({ type: "CLOSE_TIMEOUT" });
    vi.advanceTimersByTime(300);
    expect(send).toHaveBeenCalledWith({ type: "CLOSE_TIMEOUT" });
  });

  it("cancels pending open timer when scheduleClose runs", () => {
    const { api, send } = makeApi({ openDelay: 700, closeDelay: 300 });
    // Start an open timer
    api.getTriggerProps().onMouseEnter();
    // Immediately mouse-leave → should cancel the open timer
    api.getTriggerProps().onMouseLeave();
    vi.advanceTimersByTime(700);
    expect(send).not.toHaveBeenCalledWith({ type: "OPEN_TIMEOUT" });
  });

  it("CLOSE_TIMEOUT not sent before delay elapses", () => {
    const { api, send } = makeApi({ closeDelay: 300 });
    api.getTriggerProps().onMouseLeave();
    vi.advanceTimersByTime(299);
    expect(send).not.toHaveBeenCalledWith({ type: "CLOSE_TIMEOUT" });
  });
});

// ---------------------------------------------------------------------------
// getContentProps — mouse event handlers
//
// WHY: The content panel keeps the hover-card open while the user interacts
// with it. onMouseEnter cancels the pending close timer; onMouseLeave restarts
// the close countdown. These handlers are never tested in the prop-getter
// section above, leaving lines 110-120 of the connect file uncovered.
// ---------------------------------------------------------------------------

describe("connectHoverCard — getContentProps event handlers", () => {
  it("onMouseEnter sends MOUSE_ENTER", () => {
    const { api, send } = makeApi();
    api.getContentProps().onMouseEnter();
    expect(send).toHaveBeenCalledWith({ type: "MOUSE_ENTER" });
  });

  it("onMouseEnter clears pending _closeTimerId", () => {
    vi.useFakeTimers();
    const { api, send } = makeApi({ closeDelay: 300 });
    // Start a close timer via trigger leave
    api.getTriggerProps().onMouseLeave();
    // Hover onto the content → should cancel that timer
    api.getContentProps().onMouseEnter();
    vi.advanceTimersByTime(300);
    expect(send).not.toHaveBeenCalledWith({ type: "CLOSE_TIMEOUT" });
    vi.useRealTimers();
  });

  it("onMouseLeave sends MOUSE_LEAVE", () => {
    const { api, send } = makeApi();
    api.getContentProps().onMouseLeave();
    expect(send).toHaveBeenCalledWith({ type: "MOUSE_LEAVE" });
  });

  it("onMouseLeave schedules close: CLOSE_TIMEOUT fired after closeDelay", () => {
    vi.useFakeTimers();
    const { api, send } = makeApi({ closeDelay: 300 });
    api.getContentProps().onMouseLeave();
    vi.advanceTimersByTime(300);
    expect(send).toHaveBeenCalledWith({ type: "CLOSE_TIMEOUT" });
    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// ref callbacks — trigger and content
// Calling ref(el) exercises the arrow functions that register DOM elements
// on the machine. These lines are systematically uncovered without this test.
// ---------------------------------------------------------------------------

describe("connectHoverCard — ref callbacks", () => {
  it("getTriggerProps ref registers triggerEl on machine", () => {
    const ctx = makeCtx();
    const send = vi.fn();
    const machine = { setContext: vi.fn() };
    const api = connectHoverCard(makeSnapshot(ctx), send, machine);
    const el = document.createElement("button");
    (api.getTriggerProps() as Record<string, (el: HTMLElement) => void>)["ref"](el);
    expect(machine.setContext).toHaveBeenCalledWith({ triggerEl: el });
  });

  it("getContentProps ref registers contentEl on machine", () => {
    const ctx = makeCtx();
    const send = vi.fn();
    const machine = { setContext: vi.fn() };
    const api = connectHoverCard(makeSnapshot(ctx), send, machine);
    const el = document.createElement("div");
    (api.getContentProps() as Record<string, (el: HTMLElement) => void>)["ref"](el);
    expect(machine.setContext).toHaveBeenCalledWith({ contentEl: el });
  });
});
