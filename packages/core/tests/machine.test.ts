import { describe, expect, it, vi } from "vitest";
import { createMachine } from "../src/machine/machine.js";

// ---------------------------------------------------------------------------
// Fixture: simple toggle machine
// ---------------------------------------------------------------------------
type ToggleContext = { count: number };
type ToggleState = "off" | "on";
type ToggleEvent = { type: "TOGGLE" } | { type: "RESET" } | { type: "@@INIT" };

function makeToggle(initial: ToggleState = "off") {
  return createMachine<ToggleContext, ToggleState, ToggleEvent>({
    id: "toggle",
    context: { count: 0 },
    initial,
    states: {
      off: {
        on: {
          TOGGLE: {
            target: "on",
            actions: [({ setContext, context }) => setContext({ count: context.count + 1 })],
          },
        },
      },
      on: {
        tags: ["active"],
        on: {
          TOGGLE: { target: "off" },
          RESET: { target: "off" },
        },
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Core state machine
// ---------------------------------------------------------------------------
describe("createMachine", () => {
  it("initializes in the configured state", () => {
    const m = makeToggle();
    m.start();
    expect(m.getSnapshot().value).toBe("off");
  });

  it("does not emit before start()", () => {
    const m = makeToggle();
    const listener = vi.fn();
    m.subscribe(listener);
    m.send("TOGGLE");
    expect(listener).not.toHaveBeenCalled();
  });

  it("transitions on a valid event", () => {
    const m = makeToggle();
    m.start();
    m.send("TOGGLE");
    expect(m.getSnapshot().value).toBe("on");
  });

  it("ignores events not defined for the current state", () => {
    const m = makeToggle("off");
    m.start();
    m.send("RESET");
    expect(m.getSnapshot().value).toBe("off");
  });

  it("runs transition actions and updates context", () => {
    const m = makeToggle();
    m.start();
    m.send("TOGGLE");
    expect(m.getSnapshot().context.count).toBe(1);
  });

  it("notifies subscribers on transition", () => {
    const m = makeToggle();
    const listener = vi.fn();
    m.subscribe(listener);
    m.start();
    m.send("TOGGLE");
    expect(listener).toHaveBeenCalledTimes(2); // start() + TOGGLE
  });

  it("unsubscribes correctly", () => {
    const m = makeToggle();
    const listener = vi.fn();
    const unsub = m.subscribe(listener);
    m.start();
    unsub();
    m.send("TOGGLE");
    expect(listener).toHaveBeenCalledTimes(1); // only start()
  });

  it("snapshot.matches() works for multiple values", () => {
    const m = makeToggle("on");
    m.start();
    const s = m.getSnapshot();
    expect(s.matches("on")).toBe(true);
    expect(s.matches("off")).toBe(false);
    expect(s.matches("off", "on")).toBe(true);
  });

  it("snapshot.hasTag() reflects state tags", () => {
    const m = makeToggle("on");
    m.start();
    expect(m.getSnapshot().hasTag("active")).toBe(true);
  });

  it("stop() clears listeners and prevents events", () => {
    const m = makeToggle();
    const listener = vi.fn();
    m.subscribe(listener);
    m.start();
    m.stop();
    listener.mockClear();
    m.send("TOGGLE");
    expect(listener).not.toHaveBeenCalled();
  });

  it("setContext() mutates context in-place", () => {
    const m = makeToggle();
    m.start();
    m.setContext({ count: 42 });
    expect(m.getSnapshot().context.count).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------
describe("guards", () => {
  type GContext = { allowed: boolean };
  type GState = "idle" | "active";
  type GEvent = { type: "ACTIVATE" } | { type: "@@INIT" };

  it("blocks transition when guard returns false", () => {
    const m = createMachine<GContext, GState, GEvent>({
      id: "guard-test",
      context: { allowed: false },
      initial: "idle",
      states: {
        idle: {
          on: { ACTIVATE: { target: "active", guard: ({ context }) => context.allowed } },
        },
        active: {},
      },
    });
    m.start();
    m.send("ACTIVATE");
    expect(m.getSnapshot().value).toBe("idle");
  });
});

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------
describe("activities", () => {
  type AContext = { el: HTMLElement | null };
  type AState = "idle" | "active";
  type AEvent = { type: "START" } | { type: "STOP" } | { type: "@@INIT" };

  function makeActivityMachine() {
    const setup = vi.fn();
    const cleanup = vi.fn();
    const m = createMachine<AContext, AState, AEvent>({
      id: "activity-test",
      context: { el: null },
      initial: "idle",
      states: {
        idle: { on: { START: { target: "active" } } },
        active: {
          activities: ["doWork"],
          on: { STOP: { target: "idle" } },
        },
      },
      activities: {
        doWork: () => {
          setup();
          return cleanup;
        },
      },
    });
    return { m, setup, cleanup };
  }

  it("starts activity when entering a state", () => {
    const { m, setup } = makeActivityMachine();
    m.start();
    m.send("START");
    expect(setup).toHaveBeenCalledTimes(1);
  });

  it("calls cleanup when leaving the state", () => {
    const { m, cleanup } = makeActivityMachine();
    m.start();
    m.send("START");
    m.send("STOP");
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("calls cleanup on stop()", () => {
    const { m, cleanup } = makeActivityMachine();
    m.start();
    m.send("START");
    m.stop();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("activity receives live mutable context", () => {
    const seen: (HTMLElement | null)[] = [];
    const el = {} as HTMLElement;
    const m = createMachine<AContext, AState, AEvent>({
      id: "ctx-test",
      context: { el: null },
      initial: "idle",
      states: {
        idle: { on: { START: { target: "active" } } },
        active: {
          activities: ["observe"],
          on: { STOP: { target: "idle" } },
        },
      },
      activities: {
        observe: (ctx) => {
          // rAF simulated: read ctx after setContext call
          seen.push(ctx.el);
          return undefined;
        },
      },
    });
    m.start();
    m.setContext({ el });
    m.send("START");
    // ctx.el was already set before START → activity sees it
    expect(seen[0]).toBe(el);
  });

  it("activity can send events via api.send", () => {
    type SEvent = { type: "START" } | { type: "STOP" } | { type: "SELF_STOP" } | { type: "@@INIT" };
    const m = createMachine<AContext, AState, SEvent>({
      id: "send-test",
      context: { el: null },
      initial: "idle",
      states: {
        idle: { on: { START: { target: "active" } } },
        active: {
          activities: ["autoStop"],
          on: { STOP: { target: "idle" }, SELF_STOP: { target: "idle" } },
        },
      },
      activities: {
        autoStop: (_ctx, { send }) => {
          // Immediately send a stop — simulates keyboard Escape
          send("SELF_STOP");
          return undefined;
        },
      },
    });
    m.start();
    m.send("START");
    expect(m.getSnapshot().value).toBe("idle");
  });
});
