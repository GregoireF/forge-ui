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

  // WAI-ARIA §4.2.5: aria-describedby must be absent when disabled — the tooltip
  // never opens so pointing AT to an invisible content element is a broken promise.
  it("aria-describedby present when enabled", () => {
    const { api } = makeApi({ disabled: false, contentId: "tip-content" });
    expect(api.getTriggerProps()["aria-describedby"]).toBe("tip-content");
  });

  it("aria-describedby absent when disabled", () => {
    const { api } = makeApi({ disabled: true, contentId: "tip-content" });
    expect((api.getTriggerProps() as Record<string, unknown>)["aria-describedby"]).toBeUndefined();
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

  it("onPointerLeave schedules CLOSE after closeDelay", () => {
    vi.useFakeTimers();
    const { api, send } = makeApi({ closeDelay: 100 });
    api.getTriggerProps().onPointerLeave();
    vi.advanceTimersByTime(100);
    expect(send).toHaveBeenCalledWith("CLOSE");
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

  it("ref callback registers contentEl on machine", () => {
    const ctx = makeCtx();
    const send = vi.fn();
    const machine = { setContext: vi.fn() };
    const api = connectTooltip(makeSnapshot(ctx), send, machine);
    const el = document.createElement("div");
    (api.getContentProps() as Record<string, (el: HTMLElement) => void>)["ref"](el);
    expect(machine.setContext).toHaveBeenCalledWith({ contentEl: el });
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

  it("ref callback registers arrowEl on machine", () => {
    const ctx = makeCtx();
    const send = vi.fn();
    const machine = { setContext: vi.fn() };
    const api = connectTooltip(makeSnapshot(ctx), send, machine);
    const el = document.createElement("div");
    api.getArrowProps().ref(el);
    expect(machine.setContext).toHaveBeenCalledWith({ arrowEl: el });
  });
});

// ---------------------------------------------------------------------------
// getArrowTipProps
// ---------------------------------------------------------------------------

describe("connectTooltip — getArrowTipProps", () => {
  it("data-forge-part=arrow-tip", () => {
    expect(makeApi().api.getArrowTipProps()["data-forge-part"]).toBe("arrow-tip");
  });

  it("data-forge-scope=tooltip", () => {
    expect(makeApi().api.getArrowTipProps()["data-forge-scope"]).toBe("tooltip");
  });
});

// ---------------------------------------------------------------------------
// getAnchorProps
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Provider callbacks (_isInQuickSuccession / _notifyOpen / _notifyClose)
// ---------------------------------------------------------------------------

describe("connectTooltip — Provider skip-delay callbacks", () => {
  it("schedules OPEN with delay=0 when _isInQuickSuccession returns true", () => {
    vi.useFakeTimers();
    const { api, send } = makeApi({
      openDelay: 700,
      _isInQuickSuccession: () => true,
    });
    api.getTriggerProps().onFocus();
    // With quick succession the delay is 0 — OPEN should fire synchronously after
    // the 0ms timer flushes.
    vi.advanceTimersByTime(0);
    expect(send).toHaveBeenCalledWith("OPEN");
    vi.useRealTimers();
  });

  it("uses full openDelay when _isInQuickSuccession returns false", () => {
    vi.useFakeTimers();
    const { api, send } = makeApi({
      openDelay: 700,
      _isInQuickSuccession: () => false,
    });
    api.getTriggerProps().onFocus();
    vi.advanceTimersByTime(699);
    expect(send).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(send).toHaveBeenCalledWith("OPEN");
    vi.useRealTimers();
  });

  it("calls _notifyOpen when OPEN fires", () => {
    vi.useFakeTimers();
    const notifyOpen = vi.fn();
    const { api } = makeApi({ openDelay: 0, _notifyOpen: notifyOpen });
    api.getTriggerProps().onFocus();
    vi.advanceTimersByTime(0);
    expect(notifyOpen).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("calls _notifyClose when CLOSE fires", () => {
    vi.useFakeTimers();
    const notifyClose = vi.fn();
    const { api } = makeApi({ closeDelay: 0, _notifyClose: notifyClose });
    api.getTriggerProps().onBlur();
    vi.advanceTimersByTime(0);
    expect(notifyClose).toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe("connectTooltip — getAnchorProps", () => {
  it("data-forge-part=anchor", () => {
    expect(makeApi().api.getAnchorProps()["data-forge-part"]).toBe("anchor");
  });

  it("data-forge-scope=tooltip", () => {
    expect(makeApi().api.getAnchorProps()["data-forge-scope"]).toBe("tooltip");
  });

  it("ref callback registers anchorEl on machine", () => {
    const ctx = makeCtx();
    const send = vi.fn();
    const machine = { setContext: vi.fn() };
    const api = connectTooltip(makeSnapshot(ctx), send, machine);
    const el = document.createElement("div");
    api.getAnchorProps().ref(el);
    expect(machine.setContext).toHaveBeenCalledWith({ anchorEl: el });
  });
});

// ---------------------------------------------------------------------------
// getTriggerProps — ref callback
// ---------------------------------------------------------------------------

describe("connectTooltip — getTriggerProps ref callback", () => {
  it("ref callback registers triggerEl on machine", () => {
    const ctx = makeCtx();
    const send = vi.fn();
    const machine = { setContext: vi.fn() };
    const api = connectTooltip(makeSnapshot(ctx), send, machine);
    const el = document.createElement("div");
    (api.getTriggerProps() as Record<string, (el: HTMLElement) => void>)["ref"](el);
    expect(machine.setContext).toHaveBeenCalledWith({ triggerEl: el });
  });
});

// ---------------------------------------------------------------------------
// getTriggerProps — closeOnPointerDown (conditional handler)
// When closeOnPointerDown=true, the trigger gets an onPointerDown that immediately
// cancels any pending open timer and closes the tooltip if it is currently open.
// ---------------------------------------------------------------------------

describe("connectTooltip — getTriggerProps closeOnPointerDown", () => {
  it("closeOnPointerDown=true: onPointerDown while open sends CLOSE", () => {
    const { api, send } = makeApi({ closeOnPointerDown: true }, "open");
    const props = api.getTriggerProps() as Record<string, () => void>;
    props["onPointerDown"]();
    expect(send).toHaveBeenCalledWith("CLOSE");
  });

  it("closeOnPointerDown=true: onPointerDown while closed clears timer but does not send CLOSE", () => {
    const { api, send } = makeApi({ closeOnPointerDown: true }, "closed");
    const props = api.getTriggerProps() as Record<string, () => void>;
    props["onPointerDown"]();
    expect(send).not.toHaveBeenCalled();
  });

  it("closeOnPointerDown=false: onPointerDown is not present on trigger", () => {
    const { api } = makeApi({ closeOnPointerDown: false });
    const props = api.getTriggerProps() as Record<string, unknown>;
    expect(props["onPointerDown"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getContentProps — interactive mode handlers
// When interactive=true, the content element gets onPointerEnter/onPointerLeave
// so hovering onto the tooltip content itself keeps it open (e.g. for links inside).
// ---------------------------------------------------------------------------

describe("connectTooltip — getContentProps interactive handlers", () => {
  it("interactive=true: onPointerEnter schedules OPEN after openDelay", () => {
    vi.useFakeTimers();
    const { api, send } = makeApi({ interactive: true, openDelay: 50 });
    const props = api.getContentProps() as Record<string, () => void>;
    props["onPointerEnter"]();
    vi.advanceTimersByTime(50);
    expect(send).toHaveBeenCalledWith("OPEN");
    vi.useRealTimers();
  });

  it("interactive=true: onPointerLeave schedules CLOSE after closeDelay", () => {
    vi.useFakeTimers();
    const { api, send } = makeApi({ interactive: true, closeDelay: 50 });
    const props = api.getContentProps() as Record<string, () => void>;
    props["onPointerLeave"]();
    vi.advanceTimersByTime(50);
    expect(send).toHaveBeenCalledWith("CLOSE");
    vi.useRealTimers();
  });

  it("interactive=false: onPointerEnter/onPointerLeave are absent on content", () => {
    const { api } = makeApi({ interactive: false });
    const props = api.getContentProps() as Record<string, unknown>;
    expect(props["onPointerEnter"]).toBeUndefined();
    expect(props["onPointerLeave"]).toBeUndefined();
  });
});
