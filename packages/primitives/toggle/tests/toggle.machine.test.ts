import { describe, expect, it, vi } from "vitest";
import { createToggleMachine } from "../src/toggle.machine.js";

describe("createToggleMachine — initial state", () => {
  it("starts in off state by default", () => {
    const m = createToggleMachine({ id: "t" });
    m.start();
    expect(m.getSnapshot().value).toBe("off");
    m.stop();
  });

  it("starts in on state when defaultPressed=true", () => {
    const m = createToggleMachine({ id: "t", defaultPressed: true });
    m.start();
    expect(m.getSnapshot().value).toBe("on");
    m.stop();
  });

  it("starts in on state when pressed=true (controlled)", () => {
    const m = createToggleMachine({ id: "t", pressed: true });
    m.start();
    expect(m.getSnapshot().value).toBe("on");
    m.stop();
  });
});

describe("createToggleMachine — TOGGLE event", () => {
  it("off → TOGGLE → on", () => {
    const m = createToggleMachine({ id: "t" });
    m.start();
    m.send({ type: "TOGGLE" });
    expect(m.getSnapshot().value).toBe("on");
    expect(m.getSnapshot().context.pressed).toBe(true);
    m.stop();
  });

  it("on → TOGGLE → off", () => {
    const m = createToggleMachine({ id: "t", defaultPressed: true });
    m.start();
    m.send({ type: "TOGGLE" });
    expect(m.getSnapshot().value).toBe("off");
    expect(m.getSnapshot().context.pressed).toBe(false);
    m.stop();
  });

  it("calls onPressedChange with new pressed value", () => {
    const onPressedChange = vi.fn();
    const m = createToggleMachine({ id: "t", onPressedChange });
    m.start();
    m.send({ type: "TOGGLE" });
    expect(onPressedChange).toHaveBeenCalledWith(true);
    m.stop();
  });

  it("disabled: TOGGLE does nothing", () => {
    const onPressedChange = vi.fn();
    const m = createToggleMachine({ id: "t", disabled: true, onPressedChange });
    m.start();
    m.send({ type: "TOGGLE" });
    expect(m.getSnapshot().context.pressed).toBe(false);
    expect(onPressedChange).not.toHaveBeenCalled();
    m.stop();
  });
});

describe("createToggleMachine — PRESS / RELEASE events", () => {
  it("PRESS moves to on", () => {
    const m = createToggleMachine({ id: "t" });
    m.start();
    m.send({ type: "PRESS" });
    expect(m.getSnapshot().context.pressed).toBe(true);
    m.stop();
  });

  it("RELEASE moves to off", () => {
    const m = createToggleMachine({ id: "t", defaultPressed: true });
    m.start();
    m.send({ type: "RELEASE" });
    expect(m.getSnapshot().context.pressed).toBe(false);
    m.stop();
  });

  it("PRESS when already on: no change", () => {
    const onPressedChange = vi.fn();
    const m = createToggleMachine({
      id: "t",
      defaultPressed: true,
      onPressedChange,
    });
    m.start();
    m.send({ type: "PRESS" });
    expect(onPressedChange).not.toHaveBeenCalled();
    m.stop();
  });
});
