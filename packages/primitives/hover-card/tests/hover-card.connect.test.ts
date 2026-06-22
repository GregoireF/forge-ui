import { describe, expect, it, vi } from "vitest";
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
