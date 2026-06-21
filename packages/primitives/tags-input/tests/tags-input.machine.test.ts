import { afterEach, describe, expect, it, vi } from "vitest";
import { createTagsInputMachine } from "../src/tags-input.machine.js";

let active: ReturnType<typeof createTagsInputMachine>[] = [];

function make(opts: Parameters<typeof createTagsInputMachine>[0] = {}) {
  const m = createTagsInputMachine({ id: "test", ...opts });
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

describe("createTagsInputMachine — initial state", () => {
  it("starts in idle state", () => {
    const m = make();
    expect(m.getSnapshot().matches("idle")).toBe(true);
  });

  it("value defaults to []", () => {
    const m = make();
    expect(m.getSnapshot().context.value).toEqual([]);
  });

  it("defaultValue pre-fills tags", () => {
    const m = make({ defaultValue: ["a", "b"] });
    expect(m.getSnapshot().context.value).toEqual(["a", "b"]);
  });

  it("value (controlled) takes priority over defaultValue", () => {
    const m = make({ value: ["x"], defaultValue: ["a"] });
    expect(m.getSnapshot().context.value).toEqual(["x"]);
  });

  it("inputValue starts empty", () => {
    const m = make();
    expect(m.getSnapshot().context.inputValue).toBe("");
  });

  it("allowDuplicates defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.allowDuplicates).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// FOCUS / BLUR — state transitions
// ---------------------------------------------------------------------------

describe("createTagsInputMachine — FOCUS / BLUR", () => {
  it("FOCUS transitions idle → focused", () => {
    const m = make();
    m.send("FOCUS");
    expect(m.getSnapshot().matches("focused")).toBe(true);
  });

  it("BLUR transitions focused → idle", () => {
    const m = make();
    m.send("FOCUS");
    m.send("BLUR");
    expect(m.getSnapshot().matches("idle")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// INPUT_CHANGE — only works in focused state
// ---------------------------------------------------------------------------

describe("createTagsInputMachine — INPUT_CHANGE", () => {
  it("updates inputValue in focused state", () => {
    const m = make();
    m.send("FOCUS");
    m.send({ type: "INPUT_CHANGE", value: "hello" });
    expect(m.getSnapshot().context.inputValue).toBe("hello");
  });

  it("calls onInputChange callback", () => {
    const cb = vi.fn();
    const m = make({ onInputChange: cb });
    m.send("FOCUS");
    m.send({ type: "INPUT_CHANGE", value: "world" });
    expect(cb).toHaveBeenCalledWith("world");
  });
});

// ---------------------------------------------------------------------------
// ADD_TAG — only works in focused state, multiple guards
// ---------------------------------------------------------------------------

describe("createTagsInputMachine — ADD_TAG (in focused state)", () => {
  it("adds a new tag from inputValue", () => {
    const m = make();
    m.send("FOCUS");
    m.send({ type: "INPUT_CHANGE", value: "react" });
    m.send("ADD_TAG");
    expect(m.getSnapshot().context.value).toContain("react");
  });

  it("clears inputValue after add", () => {
    const m = make();
    m.send("FOCUS");
    m.send({ type: "INPUT_CHANGE", value: "react" });
    m.send("ADD_TAG");
    expect(m.getSnapshot().context.inputValue).toBe("");
  });

  it("ADD_TAG is no-op when inputValue is empty (trim to '')", () => {
    const m = make();
    m.send("FOCUS");
    m.send("ADD_TAG");
    expect(m.getSnapshot().context.value).toEqual([]);
  });

  it("ADD_TAG is no-op when inputValue is whitespace only", () => {
    const m = make();
    m.send("FOCUS");
    m.send({ type: "INPUT_CHANGE", value: "   " });
    m.send("ADD_TAG");
    expect(m.getSnapshot().context.value).toEqual([]);
  });

  it("ADD_TAG is no-op in idle state (requires focused)", () => {
    const m = make();
    m.send({ type: "INPUT_CHANGE", value: "react" });
    m.send("ADD_TAG");
    // Still in idle, ADD_TAG not in idle transitions
    expect(m.getSnapshot().context.value).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// maxTags guard
// ---------------------------------------------------------------------------

describe("createTagsInputMachine — maxTags guard", () => {
  it("ADD_TAG is blocked when maxTags is reached", () => {
    const m = make({ defaultValue: ["a", "b"], maxTags: 2 });
    m.send("FOCUS");
    m.send({ type: "INPUT_CHANGE", value: "c" });
    m.send("ADD_TAG");
    expect(m.getSnapshot().context.value).toHaveLength(2);
    expect(m.getSnapshot().context.value).not.toContain("c");
  });

  it("ADD_TAG succeeds when below maxTags", () => {
    const m = make({ defaultValue: ["a"], maxTags: 3 });
    m.send("FOCUS");
    m.send({ type: "INPUT_CHANGE", value: "b" });
    m.send("ADD_TAG");
    expect(m.getSnapshot().context.value).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Duplicate guard
// ---------------------------------------------------------------------------

describe("createTagsInputMachine — duplicate guard", () => {
  it("duplicate is blocked when allowDuplicates=false (default)", () => {
    const m = make({ defaultValue: ["react"] });
    m.send("FOCUS");
    m.send({ type: "INPUT_CHANGE", value: "react" });
    m.send("ADD_TAG");
    expect(m.getSnapshot().context.value).toHaveLength(1);
  });

  it("duplicate clears inputValue even when blocked", () => {
    const m = make({ defaultValue: ["react"] });
    m.send("FOCUS");
    m.send({ type: "INPUT_CHANGE", value: "react" });
    m.send("ADD_TAG");
    expect(m.getSnapshot().context.inputValue).toBe("");
  });

  it("duplicate is allowed when allowDuplicates=true", () => {
    const m = make({ defaultValue: ["react"], allowDuplicates: true });
    m.send("FOCUS");
    m.send({ type: "INPUT_CHANGE", value: "react" });
    m.send("ADD_TAG");
    expect(m.getSnapshot().context.value).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// REMOVE_TAG — available in both idle and focused states
// ---------------------------------------------------------------------------

describe("createTagsInputMachine — REMOVE_TAG", () => {
  it("removes a tag in focused state", () => {
    const m = make({ defaultValue: ["a", "b", "c"] });
    m.send("FOCUS");
    m.send({ type: "REMOVE_TAG", value: "b" });
    expect(m.getSnapshot().context.value).toEqual(["a", "c"]);
  });

  it("removes a tag in idle state", () => {
    const m = make({ defaultValue: ["a", "b"] });
    m.send({ type: "REMOVE_TAG", value: "a" });
    expect(m.getSnapshot().context.value).toEqual(["b"]);
  });

  it("REMOVE_TAG is no-op when disabled", () => {
    const m = make({ defaultValue: ["a", "b"], disabled: true });
    m.send({ type: "REMOVE_TAG", value: "a" });
    expect(m.getSnapshot().context.value).toEqual(["a", "b"]);
  });

  it("REMOVE_TAG is no-op when readOnly", () => {
    const m = make({ defaultValue: ["a", "b"], readOnly: true });
    m.send({ type: "REMOVE_TAG", value: "a" });
    expect(m.getSnapshot().context.value).toEqual(["a", "b"]);
  });
});

// ---------------------------------------------------------------------------
// REMOVE_LAST_TAG — Backspace on empty input
// ---------------------------------------------------------------------------

describe("createTagsInputMachine — REMOVE_LAST_TAG", () => {
  it("removes last tag when inputValue is empty", () => {
    const m = make({ defaultValue: ["a", "b", "c"] });
    m.send("FOCUS");
    m.send("REMOVE_LAST_TAG");
    expect(m.getSnapshot().context.value).toEqual(["a", "b"]);
  });

  it("is no-op when inputValue is not empty", () => {
    const m = make({ defaultValue: ["a", "b"] });
    m.send("FOCUS");
    m.send({ type: "INPUT_CHANGE", value: "typed" });
    m.send("REMOVE_LAST_TAG");
    expect(m.getSnapshot().context.value).toEqual(["a", "b"]);
  });

  it("is no-op when value is empty array", () => {
    const m = make();
    m.send("FOCUS");
    m.send("REMOVE_LAST_TAG");
    expect(m.getSnapshot().context.value).toEqual([]);
  });

  it("is no-op when disabled", () => {
    const m = make({ defaultValue: ["a"], disabled: true });
    m.send("FOCUS");
    m.send("REMOVE_LAST_TAG");
    expect(m.getSnapshot().context.value).toEqual(["a"]);
  });
});

// ---------------------------------------------------------------------------
// onValueChange callback
// ---------------------------------------------------------------------------

describe("createTagsInputMachine — onValueChange", () => {
  it("called when ADD_TAG succeeds", () => {
    const cb = vi.fn();
    const m = make({ onValueChange: cb });
    m.send("FOCUS");
    m.send({ type: "INPUT_CHANGE", value: "x" });
    m.send("ADD_TAG");
    expect(cb).toHaveBeenCalledWith(["x"]);
  });

  it("called when REMOVE_TAG succeeds", () => {
    const cb = vi.fn();
    const m = make({ defaultValue: ["a", "b"], onValueChange: cb });
    m.send({ type: "REMOVE_TAG", value: "a" });
    expect(cb).toHaveBeenCalledWith(["b"]);
  });

  it("NOT called when ADD_TAG is blocked (empty input)", () => {
    const cb = vi.fn();
    const m = make({ onValueChange: cb });
    m.send("FOCUS");
    m.send("ADD_TAG");
    expect(cb).not.toHaveBeenCalled();
  });

  it("NOT called on initial start", () => {
    const cb = vi.fn();
    make({ defaultValue: ["a"], onValueChange: cb });
    expect(cb).not.toHaveBeenCalled();
  });
});
