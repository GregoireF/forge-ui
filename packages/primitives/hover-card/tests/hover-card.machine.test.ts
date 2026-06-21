import { afterEach, describe, expect, it, vi } from "vitest";
import { createHoverCardMachine } from "../src/hover-card.machine.js";

let active: ReturnType<typeof createHoverCardMachine>[] = [];

function make(opts: Parameters<typeof createHoverCardMachine>[0] = { id: "test" }) {
  const m = createHoverCardMachine({ id: "test", ...opts });
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

describe("createHoverCardMachine — initial state", () => {
  it("starts in idle state", () => {
    const m = make();
    expect(m.getSnapshot().matches("idle")).toBe(true);
  });

  it("isOpen=false initially", () => {
    const m = make();
    expect(m.getSnapshot().context.isOpen).toBe(false);
  });

  it("openDelay defaults to 700", () => {
    const m = make();
    expect(m.getSnapshot().context.openDelay).toBe(700);
  });

  it("closeDelay defaults to 300", () => {
    const m = make();
    expect(m.getSnapshot().context.closeDelay).toBe(300);
  });

  it("contentId = <id>-content", () => {
    const m = createHoverCardMachine({ id: "hc" });
    m.start();
    active.push(m);
    expect(m.getSnapshot().context.contentId).toBe("hc-content");
  });

  it("triggerId = <id>-trigger", () => {
    const m = createHoverCardMachine({ id: "hc" });
    m.start();
    active.push(m);
    expect(m.getSnapshot().context.triggerId).toBe("hc-trigger");
  });
});

// ---------------------------------------------------------------------------
// MOUSE_ENTER → opening state (WAI-ARIA: delay before open = "opening")
// ---------------------------------------------------------------------------

describe("createHoverCardMachine — MOUSE_ENTER / MOUSE_LEAVE from idle", () => {
  it("MOUSE_ENTER transitions idle → opening", () => {
    const m = make();
    m.send("MOUSE_ENTER");
    expect(m.getSnapshot().matches("opening")).toBe(true);
  });

  it("MOUSE_LEAVE from opening → idle (cancel)", () => {
    const m = make();
    m.send("MOUSE_ENTER");
    m.send("MOUSE_LEAVE");
    expect(m.getSnapshot().matches("idle")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// FOCUS → open immediately (WAI-ARIA: keyboard focus skips delay)
// ---------------------------------------------------------------------------

describe("createHoverCardMachine — FOCUS from idle", () => {
  it("FOCUS transitions idle → open directly", () => {
    const m = make();
    m.send("FOCUS");
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("isOpen=true after FOCUS", () => {
    const m = make();
    m.send("FOCUS");
    expect(m.getSnapshot().context.isOpen).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// OPEN_TIMEOUT — simulates delay expiry
// ---------------------------------------------------------------------------

describe("createHoverCardMachine — OPEN_TIMEOUT", () => {
  it("OPEN_TIMEOUT from opening → open", () => {
    const m = make();
    m.send("MOUSE_ENTER");
    m.send("OPEN_TIMEOUT");
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("isOpen=true after OPEN_TIMEOUT", () => {
    const m = make();
    m.send("MOUSE_ENTER");
    m.send("OPEN_TIMEOUT");
    expect(m.getSnapshot().context.isOpen).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Open state — MOUSE_LEAVE → closing (not immediately closed)
// ---------------------------------------------------------------------------

describe("createHoverCardMachine — from open state", () => {
  function makeOpen() {
    const m = make();
    m.send("MOUSE_ENTER");
    m.send("OPEN_TIMEOUT");
    return m;
  }

  it("MOUSE_LEAVE from open → closing (card stays visible during delay)", () => {
    const m = makeOpen();
    m.send("MOUSE_LEAVE");
    expect(m.getSnapshot().matches("closing")).toBe(true);
  });

  it("MOUSE_ENTER from closing → back to open (re-hover)", () => {
    const m = makeOpen();
    m.send("MOUSE_LEAVE");
    m.send("MOUSE_ENTER");
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("CLOSE_TIMEOUT from closing → idle", () => {
    const m = makeOpen();
    m.send("MOUSE_LEAVE");
    m.send("CLOSE_TIMEOUT");
    expect(m.getSnapshot().matches("idle")).toBe(true);
  });

  it("isOpen=false after CLOSE_TIMEOUT", () => {
    const m = makeOpen();
    m.send("MOUSE_LEAVE");
    m.send("CLOSE_TIMEOUT");
    expect(m.getSnapshot().context.isOpen).toBe(false);
  });

  it("BLUR from open → idle (keyboard close)", () => {
    const m = make();
    m.send("FOCUS");
    m.send("BLUR");
    expect(m.getSnapshot().matches("idle")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// onOpenChange callback
// ---------------------------------------------------------------------------

describe("createHoverCardMachine — onOpenChange", () => {
  it("called with true on FOCUS (immediate open)", () => {
    const cb = vi.fn();
    const m = make({ id: "test", onOpenChange: cb });
    m.send("FOCUS");
    expect(cb).toHaveBeenCalledWith(true);
  });

  it("called with true on OPEN_TIMEOUT", () => {
    const cb = vi.fn();
    const m = make({ id: "test", onOpenChange: cb });
    m.send("MOUSE_ENTER");
    m.send("OPEN_TIMEOUT");
    expect(cb).toHaveBeenCalledWith(true);
  });

  it("called with false on CLOSE_TIMEOUT", () => {
    const cb = vi.fn();
    const m = make({ id: "test", onOpenChange: cb });
    m.send("FOCUS");
    m.send("BLUR");
    expect(cb).toHaveBeenLastCalledWith(false);
  });

  it("NOT called on initial start", () => {
    const cb = vi.fn();
    make({ id: "test", onOpenChange: cb });
    expect(cb).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Custom delays — stored in context, used by connect timers
// ---------------------------------------------------------------------------

describe("createHoverCardMachine — custom delays", () => {
  it("custom openDelay stored in context", () => {
    const m = make({ id: "test", openDelay: 100 });
    expect(m.getSnapshot().context.openDelay).toBe(100);
  });

  it("custom closeDelay stored in context", () => {
    const m = make({ id: "test", closeDelay: 0 });
    expect(m.getSnapshot().context.closeDelay).toBe(0);
  });
});
