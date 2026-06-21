import { afterEach, describe, expect, it, vi } from "vitest";
import { createTooltipMachine } from "../src/tooltip.machine.js";

let active: ReturnType<typeof createTooltipMachine>[] = [];

function make(opts: Parameters<typeof createTooltipMachine>[0] = { id: "test" }) {
  const m = createTooltipMachine({ id: "test", ...opts });
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

describe("createTooltipMachine — initial state", () => {
  it("starts closed by default", () => {
    const m = make();
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("open=true starts in open state", () => {
    const m = make({ id: "test", open: true });
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("contentId = <id>-content", () => {
    const m = createTooltipMachine({ id: "tip" });
    m.start();
    active.push(m);
    expect(m.getSnapshot().context.contentId).toBe("tip-content");
  });

  it("disabled defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.disabled).toBe(false);
  });

  it("openDelay defaults to 700", () => {
    const m = make();
    expect(m.getSnapshot().context.openDelay).toBe(700);
  });

  it("closeDelay defaults to 300", () => {
    const m = make();
    expect(m.getSnapshot().context.closeDelay).toBe(300);
  });

  it("interactive defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.interactive).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// OPEN / CLOSE — state transitions (WAI-ARIA §3.29: tooltip role)
// These test the machine's FSM, not the delay timers (those are in connect).
// ---------------------------------------------------------------------------

describe("createTooltipMachine — OPEN / CLOSE", () => {
  it("OPEN transitions closed → open", () => {
    const m = make();
    m.send("OPEN");
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("CLOSE transitions open → closed", () => {
    const m = make({ id: "test", open: true });
    m.send("CLOSE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("CLOSE on closed stays closed (no-op)", () => {
    const m = make();
    m.send("CLOSE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("multiple OPEN events are idempotent", () => {
    const m = make();
    m.send("OPEN");
    m.send("OPEN");
    expect(m.getSnapshot().matches("open")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// onOpenChange callback
// ---------------------------------------------------------------------------

describe("createTooltipMachine — onOpenChange", () => {
  it("called with true on OPEN", () => {
    const cb = vi.fn();
    const m = make({ id: "test", onOpenChange: cb });
    m.send("OPEN");
    expect(cb).toHaveBeenCalledWith(true);
  });

  it("called with false on CLOSE", () => {
    const cb = vi.fn();
    const m = make({ id: "test", open: true, onOpenChange: cb });
    m.send("CLOSE");
    expect(cb).toHaveBeenCalledWith(false);
  });

  it("NOT called on initial start", () => {
    const cb = vi.fn();
    make({ id: "test", open: true, onOpenChange: cb });
    expect(cb).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Custom delays — verified as context properties, not as timers
// ---------------------------------------------------------------------------

describe("createTooltipMachine — custom delays", () => {
  it("custom openDelay stored in context", () => {
    const m = make({ id: "test", openDelay: 200 });
    expect(m.getSnapshot().context.openDelay).toBe(200);
  });

  it("custom closeDelay stored in context", () => {
    const m = make({ id: "test", closeDelay: 0 });
    expect(m.getSnapshot().context.closeDelay).toBe(0);
  });
});
