import { describe, expect, it, vi } from "vitest";
import { createToggleGroupMachine } from "../src/toggle-group.machine.js";

describe("createToggleGroupMachine — initial state", () => {
  it("starts with empty value by default", () => {
    const m = createToggleGroupMachine({ id: "g" });
    m.start();
    expect(m.getSnapshot().context.value).toEqual([]);
    m.stop();
  });

  it("starts with defaultValue when provided", () => {
    const m = createToggleGroupMachine({ id: "g", defaultValue: ["bold"] });
    m.start();
    expect(m.getSnapshot().context.value).toEqual(["bold"]);
    m.stop();
  });

  it("defaults type=multiple", () => {
    const m = createToggleGroupMachine({ id: "g" });
    m.start();
    expect(m.getSnapshot().context.type).toBe("multiple");
    m.stop();
  });
});

describe("createToggleGroupMachine — PRESS_ITEM (multiple)", () => {
  it("adds item to value when not present", () => {
    const m = createToggleGroupMachine({ id: "g", type: "multiple" });
    m.start();
    m.send({ type: "PRESS_ITEM", value: "bold" });
    expect(m.getSnapshot().context.value).toEqual(["bold"]);
    m.stop();
  });

  it("removes item from value when already present", () => {
    const m = createToggleGroupMachine({
      id: "g",
      type: "multiple",
      defaultValue: ["bold", "italic"],
    });
    m.start();
    m.send({ type: "PRESS_ITEM", value: "bold" });
    expect(m.getSnapshot().context.value).toEqual(["italic"]);
    m.stop();
  });

  it("calls onValueChange with new value", () => {
    const onValueChange = vi.fn();
    const m = createToggleGroupMachine({ id: "g", onValueChange });
    m.start();
    m.send({ type: "PRESS_ITEM", value: "bold" });
    expect(onValueChange).toHaveBeenCalledWith(["bold"]);
    m.stop();
  });

  it("disabled: PRESS_ITEM does nothing", () => {
    const onValueChange = vi.fn();
    const m = createToggleGroupMachine({ id: "g", disabled: true, onValueChange });
    m.start();
    m.send({ type: "PRESS_ITEM", value: "bold" });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(m.getSnapshot().context.value).toEqual([]);
    m.stop();
  });
});

describe("createToggleGroupMachine — PRESS_ITEM (single)", () => {
  it("sets value to [item] when selecting", () => {
    const m = createToggleGroupMachine({ id: "g", type: "single" });
    m.start();
    m.send({ type: "PRESS_ITEM", value: "left" });
    expect(m.getSnapshot().context.value).toEqual(["left"]);
    m.stop();
  });

  it("replaces previous selection", () => {
    const m = createToggleGroupMachine({
      id: "g",
      type: "single",
      defaultValue: ["left"],
    });
    m.start();
    m.send({ type: "PRESS_ITEM", value: "center" });
    expect(m.getSnapshot().context.value).toEqual(["center"]);
    m.stop();
  });

  it("deselects when pressing the already-selected item", () => {
    const m = createToggleGroupMachine({
      id: "g",
      type: "single",
      defaultValue: ["left"],
    });
    m.start();
    m.send({ type: "PRESS_ITEM", value: "left" });
    expect(m.getSnapshot().context.value).toEqual([]);
    m.stop();
  });
});

describe("createToggleGroupMachine — SET_VALUE", () => {
  it("replaces the value array", () => {
    const m = createToggleGroupMachine({ id: "g", defaultValue: ["bold"] });
    m.start();
    m.send({ type: "SET_VALUE", value: ["italic", "underline"] });
    expect(m.getSnapshot().context.value).toEqual(["italic", "underline"]);
    m.stop();
  });
});
