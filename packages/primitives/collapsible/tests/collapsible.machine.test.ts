import { afterEach, describe, expect, it, vi } from "vitest";
import { createCollapsibleMachine } from "../src/collapsible.machine.js";

let active: ReturnType<typeof createCollapsibleMachine>[] = [];

function make(opts: Partial<Parameters<typeof createCollapsibleMachine>[0]> = {}) {
  const m = createCollapsibleMachine({ id: "test", ...opts });
  m.start();
  active.push(m);
  return m;
}

// Open/closed state is tracked via context.open — the machine has a single "idle" state.
const isOpen = (m: ReturnType<typeof createCollapsibleMachine>) => m.getSnapshot().context.open;

afterEach(() => {
  for (const m of active) m.stop();
  active = [];
});

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe("createCollapsibleMachine — initial state", () => {
  it("starts closed (context.open=false) by default", () => {
    const m = make();
    expect(isOpen(m)).toBe(false);
  });

  it("defaultOpen=true → context.open=true", () => {
    const m = make({ defaultOpen: true });
    expect(isOpen(m)).toBe(true);
  });

  it("open=false overrides defaultOpen=true", () => {
    const m = make({ open: false, defaultOpen: true });
    expect(isOpen(m)).toBe(false);
  });

  it("always in idle state (single-state machine)", () => {
    const m = make();
    expect(m.getSnapshot().matches("idle")).toBe(true);
  });

  it("disabled defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.disabled).toBe(false);
  });

  it("id stored in context", () => {
    const m = make({ id: "my-col" });
    expect(m.getSnapshot().context.id).toBe("my-col");
  });
});

// ---------------------------------------------------------------------------
// TOGGLE
// ---------------------------------------------------------------------------

describe("createCollapsibleMachine — TOGGLE", () => {
  it("TOGGLE opens when closed", () => {
    const m = make();
    m.send("TOGGLE");
    expect(isOpen(m)).toBe(true);
  });

  it("TOGGLE closes when open", () => {
    const m = make({ defaultOpen: true });
    m.send("TOGGLE");
    expect(isOpen(m)).toBe(false);
  });

  it("multiple TOGGLEs cycle correctly", () => {
    const m = make();
    m.send("TOGGLE");
    m.send("TOGGLE");
    m.send("TOGGLE");
    expect(isOpen(m)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SET_OPEN — explicit control (controlled mode)
// ---------------------------------------------------------------------------

describe("createCollapsibleMachine — SET_OPEN", () => {
  it("SET_OPEN true → opens", () => {
    const m = make();
    m.send({ type: "SET_OPEN", open: true });
    expect(isOpen(m)).toBe(true);
  });

  it("SET_OPEN false → closes", () => {
    const m = make({ defaultOpen: true });
    m.send({ type: "SET_OPEN", open: false });
    expect(isOpen(m)).toBe(false);
  });

  it("SET_OPEN true when already open is idempotent", () => {
    const m = make({ defaultOpen: true });
    m.send({ type: "SET_OPEN", open: true });
    expect(isOpen(m)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Disabled guard
// ---------------------------------------------------------------------------

describe("createCollapsibleMachine — disabled guard", () => {
  it("TOGGLE is no-op when disabled=true (stays closed)", () => {
    const m = make({ disabled: true });
    m.send("TOGGLE");
    expect(isOpen(m)).toBe(false);
  });

  it("TOGGLE is no-op when disabled=true (stays open)", () => {
    const m = make({ defaultOpen: true, disabled: true });
    m.send("TOGGLE");
    expect(isOpen(m)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// onOpenChange callback
// ---------------------------------------------------------------------------

describe("createCollapsibleMachine — onOpenChange", () => {
  it("called with true when TOGGLE opens", () => {
    const cb = vi.fn();
    const m = make({ onOpenChange: cb });
    m.send("TOGGLE");
    expect(cb).toHaveBeenCalledWith(true);
  });

  it("called with false when TOGGLE closes", () => {
    const cb = vi.fn();
    const m = make({ defaultOpen: true, onOpenChange: cb });
    m.send("TOGGLE");
    expect(cb).toHaveBeenCalledWith(false);
  });

  it("NOT called when disabled guard fires", () => {
    const cb = vi.fn();
    const m = make({ disabled: true, onOpenChange: cb });
    m.send("TOGGLE");
    expect(cb).not.toHaveBeenCalled();
  });

  it("NOT called on SET_OPEN (machine action only updates context)", () => {
    const cb = vi.fn();
    const m = make({ onOpenChange: cb });
    m.send({ type: "SET_OPEN", open: true });
    // SET_OPEN action only calls setContext, not onOpenChange (connect handles callbacks)
    // This documents intentional machine design: callbacks fire in toggle only
    expect(cb).not.toHaveBeenCalled();
  });

  it("NOT called on initial start", () => {
    const cb = vi.fn();
    make({ defaultOpen: true, onOpenChange: cb });
    expect(cb).not.toHaveBeenCalled();
  });
});
