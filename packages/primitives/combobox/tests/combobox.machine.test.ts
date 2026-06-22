import { afterEach, describe, expect, it, vi } from "vitest";
import { createComboboxMachine } from "../src/combobox.machine.js";

let active: ReturnType<typeof createComboboxMachine>[] = [];

function make(opts: Partial<Parameters<typeof createComboboxMachine>[0]> = {}) {
  const m = createComboboxMachine({ id: "test", ...opts });
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

describe("createComboboxMachine — initial state", () => {
  it("starts closed", () => {
    const m = make();
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("value defaults to []", () => {
    const m = make();
    expect(m.getSnapshot().context.value).toEqual([]);
  });

  it("defaultValue string → normalised to [string]", () => {
    const m = make({ defaultValue: "react" });
    expect(m.getSnapshot().context.value).toEqual(["react"]);
  });

  // Zag.js pattern: controlled `value` takes precedence over `defaultValue`
  it("value prop takes precedence over defaultValue (controlled mode)", () => {
    const m = make({ value: "vue", defaultValue: "react" });
    expect(m.getSnapshot().context.value).toEqual(["vue"]);
  });

  it("inputValue starts empty", () => {
    const m = make();
    expect(m.getSnapshot().context.inputValue).toBe("");
  });

  it("highlighted starts null", () => {
    const m = make();
    expect(m.getSnapshot().context.highlighted).toBeNull();
  });

  it("multiple defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.multiple).toBe(false);
  });

  it("disabled defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.disabled).toBe(false);
  });

  it("IDs derived from id", () => {
    const m = createComboboxMachine({ id: "cb" });
    m.start();
    active.push(m);
    expect(m.getSnapshot().context.inputId).toBe("cb-input");
    expect(m.getSnapshot().context.contentId).toBe("cb-listbox");
    expect(m.getSnapshot().context.labelId).toBe("cb-label");
  });
});

// ---------------------------------------------------------------------------
// OPEN / CLOSE
// ---------------------------------------------------------------------------

describe("createComboboxMachine — OPEN / CLOSE", () => {
  it("OPEN → open", () => {
    const m = make();
    m.send("OPEN");
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("CLOSE → closed", () => {
    const m = make();
    m.send("OPEN");
    m.send("CLOSE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("INTERACT_OUTSIDE from open → closed", () => {
    const m = make();
    m.send("OPEN");
    m.send("INTERACT_OUTSIDE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// INPUT_CHANGE from closed → opens automatically (combobox UX)
// ---------------------------------------------------------------------------

describe("createComboboxMachine — INPUT_CHANGE auto-opens", () => {
  it("INPUT_CHANGE from closed transitions to open", () => {
    const m = make();
    m.send({ type: "INPUT_CHANGE", value: "re" });
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("inputValue is updated", () => {
    const m = make();
    m.send({ type: "INPUT_CHANGE", value: "re" });
    expect(m.getSnapshot().context.inputValue).toBe("re");
  });

  it("highlighted reset to null on INPUT_CHANGE (filter changes)", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "a" });
    m.send({ type: "INPUT_CHANGE", value: "x" });
    expect(m.getSnapshot().context.highlighted).toBeNull();
  });

  it("onInputChange callback called", () => {
    const cb = vi.fn();
    const m = make({ onInputChange: cb });
    m.send({ type: "INPUT_CHANGE", value: "react" });
    expect(cb).toHaveBeenCalledWith("react");
  });
});

// ---------------------------------------------------------------------------
// SELECT_OPTION — single mode
// ---------------------------------------------------------------------------

describe("createComboboxMachine — SELECT_OPTION (single)", () => {
  it("sets value to [selected] and updates inputValue to label", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "react", label: "React" } });
    m.send({ type: "SELECT_OPTION", value: "react" });
    expect(m.getSnapshot().context.value).toEqual(["react"]);
    expect(m.getSnapshot().context.inputValue).toBe("React");
  });

  it("machine stays open (connect closes for single-select)", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "SELECT_OPTION", value: "a" });
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("replaces previous single selection", () => {
    const m = make({ defaultValue: "vue" });
    m.send("OPEN");
    m.send({ type: "SELECT_OPTION", value: "react" });
    expect(m.getSnapshot().context.value).toEqual(["react"]);
  });
});

// ---------------------------------------------------------------------------
// SELECT_OPTION — multiple mode
// ---------------------------------------------------------------------------

describe("createComboboxMachine — SELECT_OPTION (multiple)", () => {
  it("adds to selection", () => {
    const m = make({ multiple: true });
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "b", label: "B" } });
    m.send({ type: "SELECT_OPTION", value: "a" });
    m.send({ type: "SELECT_OPTION", value: "b" });
    expect(m.getSnapshot().context.value).toEqual(["a", "b"]);
  });

  it("removes if already selected (toggle)", () => {
    const m = make({ multiple: true, defaultValue: ["a", "b"] });
    m.send("OPEN");
    m.send({ type: "SELECT_OPTION", value: "a" });
    expect(m.getSnapshot().context.value).toEqual(["b"]);
  });

  it("builds selectedLabels map (used when options unmount)", () => {
    const m = make({ multiple: true });
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "react", label: "React" } });
    m.send({ type: "SELECT_OPTION", value: "react" });
    expect(m.getSnapshot().context.selectedLabels["react"]).toBe("React");
  });
});

// ---------------------------------------------------------------------------
// CLEAR — resets selection
// ---------------------------------------------------------------------------

describe("createComboboxMachine — CLEAR", () => {
  it("clears selection from open state → closes", () => {
    const m = make({ defaultValue: ["a"] });
    m.send("OPEN");
    m.send("CLEAR");
    expect(m.getSnapshot().context.value).toEqual([]);
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("clears inputValue", () => {
    const m = make();
    m.send({ type: "INPUT_CHANGE", value: "typed" });
    m.send("CLEAR");
    expect(m.getSnapshot().context.inputValue).toBe("");
  });

  it("CLEAR from closed also clears value", () => {
    const m = make({ defaultValue: ["x"] });
    m.send("CLEAR");
    expect(m.getSnapshot().context.value).toEqual([]);
  });

  it("onValueChange called with []", () => {
    const cb = vi.fn();
    const m = make({ defaultValue: ["a"], onValueChange: cb });
    m.send("CLEAR");
    expect(cb).toHaveBeenCalledWith([]);
  });
});

// ---------------------------------------------------------------------------
// HIGHLIGHT navigation — filters by inputValue (client-side filter)
// ---------------------------------------------------------------------------

describe("createComboboxMachine — HIGHLIGHT navigation", () => {
  function makeWithOpts() {
    const m = make();
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "Apple" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "b", label: "Banana" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "c", label: "Cherry" } });
    return m;
  }

  it("HIGHLIGHT_NEXT moves to next option", () => {
    const m = makeWithOpts();
    m.send({ type: "HIGHLIGHT_OPTION", value: "a" });
    m.send("HIGHLIGHT_NEXT");
    expect(m.getSnapshot().context.highlighted).toBe("b");
  });

  it("HIGHLIGHT_PREV moves to previous option", () => {
    const m = makeWithOpts();
    m.send({ type: "HIGHLIGHT_OPTION", value: "b" });
    m.send("HIGHLIGHT_PREV");
    expect(m.getSnapshot().context.highlighted).toBe("a");
  });

  it("HIGHLIGHT_FIRST goes to first option", () => {
    const m = makeWithOpts();
    m.send({ type: "HIGHLIGHT_OPTION", value: "c" });
    m.send("HIGHLIGHT_FIRST");
    expect(m.getSnapshot().context.highlighted).toBe("a");
  });

  it("HIGHLIGHT_LAST goes to last option", () => {
    const m = makeWithOpts();
    m.send("HIGHLIGHT_LAST");
    expect(m.getSnapshot().context.highlighted).toBe("c");
  });
});

// ---------------------------------------------------------------------------
// CREATE_OPTION — creates and closes
// ---------------------------------------------------------------------------

describe("createComboboxMachine — CREATE_OPTION", () => {
  it("CREATE_OPTION transitions open → closed", () => {
    const m = make({ onCreateOption: vi.fn() });
    m.send("OPEN");
    m.send("CREATE_OPTION");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("calls onCreateOption with current inputValue", () => {
    const cb = vi.fn();
    const m = make({ onCreateOption: cb });
    m.send({ type: "INPUT_CHANGE", value: "new option" });
    m.send("CREATE_OPTION");
    expect(cb).toHaveBeenCalledWith("new option");
  });
});

// ---------------------------------------------------------------------------
// onOpenChange / onValueChange callbacks
// ---------------------------------------------------------------------------

describe("createComboboxMachine — callbacks", () => {
  it("onOpenChange called with true on OPEN", () => {
    const cb = vi.fn();
    const m = make({ onOpenChange: cb });
    m.send("OPEN");
    expect(cb).toHaveBeenCalledWith(true);
  });

  it("onOpenChange called with false on CLOSE", () => {
    const cb = vi.fn();
    const m = make({ onOpenChange: cb });
    m.send("OPEN");
    m.send("CLOSE");
    expect(cb).toHaveBeenLastCalledWith(false);
  });

  it("onValueChange called on SELECT_OPTION", () => {
    const cb = vi.fn();
    const m = make({ onValueChange: cb });
    m.send("OPEN");
    m.send({ type: "SELECT_OPTION", value: "x" });
    expect(cb).toHaveBeenCalledWith(["x"]);
  });
});
