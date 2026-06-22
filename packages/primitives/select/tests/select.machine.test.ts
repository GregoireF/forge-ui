import { afterEach, describe, expect, it, vi } from "vitest";
import { createSelectMachine } from "../src/select.machine.js";

let active: ReturnType<typeof createSelectMachine>[] = [];

function make(opts: Partial<Parameters<typeof createSelectMachine>[0]> = {}) {
  const m = createSelectMachine({ id: "test", ...opts });
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

describe("createSelectMachine — initial state", () => {
  it("starts closed by default", () => {
    const m = make();
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("defaultOpen=true starts open", () => {
    const m = make({ defaultOpen: true });
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("value defaults to [] (empty selection)", () => {
    const m = make();
    expect(m.getSnapshot().context.value).toEqual([]);
  });

  it("defaultValue string → normalises to [string]", () => {
    const m = make({ defaultValue: "react" });
    expect(m.getSnapshot().context.value).toEqual(["react"]);
  });

  it("defaultValue string[] → kept as-is", () => {
    const m = make({ defaultValue: ["react", "vue"] });
    expect(m.getSnapshot().context.value).toEqual(["react", "vue"]);
  });

  // Zag.js pattern: controlled `value` takes precedence over `defaultValue`
  it("value prop takes precedence over defaultValue (controlled mode)", () => {
    const m = make({ value: "vue", defaultValue: "react" });
    expect(m.getSnapshot().context.value).toEqual(["vue"]);
  });

  it("value array takes precedence over defaultValue (controlled multi)", () => {
    const m = make({ value: ["vue"], defaultValue: ["react", "angular"] });
    expect(m.getSnapshot().context.value).toEqual(["vue"]);
  });

  it("multiple defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.multiple).toBe(false);
  });

  it("highlighted starts at null", () => {
    const m = make();
    expect(m.getSnapshot().context.highlighted).toBeNull();
  });

  it("options starts empty", () => {
    const m = make();
    expect(m.getSnapshot().context.options).toEqual([]);
  });

  it("disabled defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.disabled).toBe(false);
  });

  it("IDs derived from id option", () => {
    const m = createSelectMachine({ id: "my-select" });
    m.start();
    active.push(m);
    const ctx = m.getSnapshot().context;
    expect(ctx.triggerId).toBe("my-select-trigger");
    expect(ctx.contentId).toBe("my-select-content");
    expect(ctx.labelId).toBe("my-select-label");
  });
});

// ---------------------------------------------------------------------------
// OPEN / CLOSE / TOGGLE
// ---------------------------------------------------------------------------

describe("createSelectMachine — OPEN / CLOSE / TOGGLE", () => {
  it("OPEN transitions closed → open", () => {
    const m = make();
    m.send("OPEN");
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("TOGGLE from closed → open", () => {
    const m = make();
    m.send("TOGGLE");
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("CLOSE transitions open → closed", () => {
    const m = make({ defaultOpen: true });
    m.send("CLOSE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("TOGGLE from open → closed", () => {
    const m = make({ defaultOpen: true });
    m.send("TOGGLE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("ESCAPE_KEY from open → closed", () => {
    const m = make({ defaultOpen: true });
    m.send("ESCAPE_KEY");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("INTERACT_OUTSIDE from open → closed", () => {
    const m = make({ defaultOpen: true });
    m.send("INTERACT_OUTSIDE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// OPEN sets default highlight to first enabled option (WAI-ARIA: auto-focus)
// ---------------------------------------------------------------------------

describe("createSelectMachine — OPEN sets default highlight", () => {
  it("highlights first enabled option on OPEN", () => {
    const m = make();
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "b", label: "B" } });
    m.send("OPEN");
    expect(m.getSnapshot().context.highlighted).toBe("a");
  });

  it("highlights selected value on OPEN if it's in the option list", () => {
    const m = make({ defaultValue: "b" });
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "b", label: "B" } });
    m.send("OPEN");
    expect(m.getSnapshot().context.highlighted).toBe("b");
  });

  it("CLOSE clears the highlight", () => {
    const m = make({ defaultOpen: true });
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "a" });
    m.send("CLOSE");
    expect(m.getSnapshot().context.highlighted).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// SELECT_OPTION — single mode (machine stays open; connect sends CLOSE)
// ---------------------------------------------------------------------------

describe("createSelectMachine — SELECT_OPTION (single)", () => {
  it("sets value to [selected]", () => {
    const m = make({ defaultOpen: true });
    m.send({ type: "SELECT_OPTION", value: "react" });
    expect(m.getSnapshot().context.value).toEqual(["react"]);
  });

  it("replaces previous selection", () => {
    const m = make({ defaultValue: "vue", defaultOpen: true });
    m.send({ type: "SELECT_OPTION", value: "react" });
    expect(m.getSnapshot().context.value).toEqual(["react"]);
  });

  it("machine stays open after SELECT_OPTION (connect handles CLOSE)", () => {
    const m = make({ defaultOpen: true });
    m.send({ type: "SELECT_OPTION", value: "react" });
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("highlighted is updated to the selected value", () => {
    const m = make({ defaultOpen: true });
    m.send({ type: "SELECT_OPTION", value: "react" });
    expect(m.getSnapshot().context.highlighted).toBe("react");
  });
});

// ---------------------------------------------------------------------------
// SELECT_OPTION — multiple mode (toggle)
// ---------------------------------------------------------------------------

describe("createSelectMachine — SELECT_OPTION (multiple)", () => {
  it("adds to selection when not already selected", () => {
    const m = make({ multiple: true, defaultOpen: true });
    m.send({ type: "SELECT_OPTION", value: "a" });
    m.send({ type: "SELECT_OPTION", value: "b" });
    expect(m.getSnapshot().context.value).toEqual(["a", "b"]);
  });

  it("removes from selection when already selected (toggle behaviour)", () => {
    const m = make({ multiple: true, defaultValue: ["a", "b"], defaultOpen: true });
    m.send({ type: "SELECT_OPTION", value: "a" });
    expect(m.getSnapshot().context.value).toEqual(["b"]);
  });

  it("stays open after SELECT_OPTION in multiple mode", () => {
    const m = make({ multiple: true, defaultOpen: true });
    m.send({ type: "SELECT_OPTION", value: "a" });
    expect(m.getSnapshot().matches("open")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Highlight navigation — WAI-ARIA keyboard navigation in listbox
// ---------------------------------------------------------------------------

describe("createSelectMachine — HIGHLIGHT_OPTION / HIGHLIGHT_NEXT / HIGHLIGHT_PREV", () => {
  function makeWithOptions() {
    const m = make({ defaultOpen: true });
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "b", label: "B" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "c", label: "C" } });
    return m;
  }

  it("HIGHLIGHT_OPTION sets exact value", () => {
    const m = makeWithOptions();
    m.send({ type: "HIGHLIGHT_OPTION", value: "b" });
    expect(m.getSnapshot().context.highlighted).toBe("b");
  });

  it("HIGHLIGHT_NEXT wraps around at end", () => {
    const m = makeWithOptions();
    m.send({ type: "HIGHLIGHT_OPTION", value: "c" });
    m.send("HIGHLIGHT_NEXT");
    expect(m.getSnapshot().context.highlighted).toBe("a");
  });

  it("HIGHLIGHT_PREV wraps around at start", () => {
    const m = makeWithOptions();
    m.send({ type: "HIGHLIGHT_OPTION", value: "a" });
    m.send("HIGHLIGHT_PREV");
    expect(m.getSnapshot().context.highlighted).toBe("c");
  });

  it("HIGHLIGHT_FIRST goes to first enabled option", () => {
    const m = makeWithOptions();
    m.send({ type: "HIGHLIGHT_OPTION", value: "c" });
    m.send("HIGHLIGHT_FIRST");
    expect(m.getSnapshot().context.highlighted).toBe("a");
  });

  it("HIGHLIGHT_LAST goes to last enabled option", () => {
    const m = makeWithOptions();
    m.send("HIGHLIGHT_LAST");
    expect(m.getSnapshot().context.highlighted).toBe("c");
  });

  it("disabled options are skipped by HIGHLIGHT_NEXT", () => {
    const m = make({ defaultOpen: true });
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "b", label: "B", disabled: true } });
    m.send({ type: "REGISTER_OPTION", option: { value: "c", label: "C" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "a" });
    m.send("HIGHLIGHT_NEXT");
    expect(m.getSnapshot().context.highlighted).toBe("c");
  });
});

// ---------------------------------------------------------------------------
// REGISTER_OPTION — option management
// ---------------------------------------------------------------------------

describe("createSelectMachine — REGISTER_OPTION", () => {
  it("adds option to list in closed state", () => {
    const m = make();
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    expect(m.getSnapshot().context.options).toHaveLength(1);
  });

  it("does not add duplicate options", () => {
    const m = make();
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    expect(m.getSnapshot().context.options).toHaveLength(1);
  });

  it("stores label in valueLabelMap (persists after close for trigger display)", () => {
    const m = make({ defaultOpen: true });
    m.send({ type: "REGISTER_OPTION", option: { value: "react", label: "React" } });
    m.send("CLOSE");
    expect(m.getSnapshot().context.valueLabelMap["react"]).toBe("React");
  });
});

// ---------------------------------------------------------------------------
// onValueChange / onOpenChange callbacks
// ---------------------------------------------------------------------------

describe("createSelectMachine — callbacks", () => {
  it("onValueChange called on SELECT_OPTION", () => {
    const cb = vi.fn();
    const m = make({ defaultOpen: true, onValueChange: cb });
    m.send({ type: "SELECT_OPTION", value: "a" });
    expect(cb).toHaveBeenCalledWith(["a"]);
  });

  it("onOpenChange called with true on OPEN", () => {
    const cb = vi.fn();
    const m = make({ onOpenChange: cb });
    m.send("OPEN");
    expect(cb).toHaveBeenCalledWith(true);
  });

  it("onOpenChange called with false on CLOSE", () => {
    const cb = vi.fn();
    const m = make({ defaultOpen: true, onOpenChange: cb });
    m.send("CLOSE");
    expect(cb).toHaveBeenCalledWith(false);
  });

  it("onHighlightChange called on HIGHLIGHT_OPTION", () => {
    const cb = vi.fn();
    const m = make({ defaultOpen: true, onHighlightChange: cb });
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "a" });
    expect(cb).toHaveBeenCalledWith("a");
  });
});
