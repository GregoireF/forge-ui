import { clearRegistry, pushLayer } from "@forge-ui/core";
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
// allOptions / client-side filtering
// ---------------------------------------------------------------------------

describe("createComboboxMachine — allOptions client-side filtering", () => {
  const fruits = [
    { value: "apple", label: "Apple" },
    { value: "apricot", label: "Apricot" },
    { value: "banana", label: "Banana" },
  ];

  it("HIGHLIGHT_NEXT navigates only filtered options when inputValue is set", () => {
    const m = make({ options: fruits });
    m.send("OPEN");
    m.send({ type: "INPUT_CHANGE", value: "ap" }); // Apple, Apricot match
    m.send({ type: "HIGHLIGHT_OPTION", value: "apple" });
    m.send("HIGHLIGHT_NEXT");
    // Banana is filtered out — next after apple should be apricot
    expect(m.getSnapshot().context.highlighted).toBe("apricot");
  });

  it("HIGHLIGHT_NEXT wraps within filtered set, not full list", () => {
    const m = make({ options: fruits });
    m.send("OPEN");
    m.send({ type: "INPUT_CHANGE", value: "ap" }); // Apple, Apricot
    m.send({ type: "HIGHLIGHT_OPTION", value: "apricot" });
    m.send("HIGHLIGHT_NEXT");
    // End of filtered set — wraps to apple (not banana)
    expect(m.getSnapshot().context.highlighted).toBe("apple");
  });

  it("custom filterFn is applied during navigation", () => {
    // Only match options whose value starts with the inputValue
    const startsWithFilter = (opt: { value: string; label: string }, input: string) =>
      opt.value.startsWith(input);
    const m = make({ options: fruits, filterFn: startsWithFilter });
    m.send("OPEN");
    m.send({ type: "INPUT_CHANGE", value: "ap" }); // apple, apricot (value starts with "ap")
    m.send("HIGHLIGHT_FIRST");
    expect(m.getSnapshot().context.highlighted).toBe("apple");
    m.send("HIGHLIGHT_NEXT");
    expect(m.getSnapshot().context.highlighted).toBe("apricot");
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

  it("HIGHLIGHT_NEXT skips disabled options", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "Apple" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "b", label: "Banana", disabled: true } });
    m.send({ type: "REGISTER_OPTION", option: { value: "c", label: "Cherry" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "a" });
    m.send("HIGHLIGHT_NEXT");
    expect(m.getSnapshot().context.highlighted).toBe("c");
  });

  it("HIGHLIGHT_PREV skips disabled options", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "Apple" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "b", label: "Banana", disabled: true } });
    m.send({ type: "REGISTER_OPTION", option: { value: "c", label: "Cherry" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "c" });
    m.send("HIGHLIGHT_PREV");
    expect(m.getSnapshot().context.highlighted).toBe("a");
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

// ---------------------------------------------------------------------------
// SELECT_HIGHLIGHTED — keyboard Enter selection
// ---------------------------------------------------------------------------

describe("createComboboxMachine — SELECT_HIGHLIGHTED (single)", () => {
  it("sets value to highlighted and updates inputValue", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "react", label: "React" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "react" });
    m.send("SELECT_HIGHLIGHTED");
    expect(m.getSnapshot().context.value).toEqual(["react"]);
    expect(m.getSnapshot().context.inputValue).toBe("React");
  });

  it("stays open (connect closes for single-select)", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "HIGHLIGHT_OPTION", value: "x" });
    m.send("SELECT_HIGHLIGHTED");
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("is a no-op when highlighted=null", () => {
    const m = make({ defaultValue: ["old"] });
    m.send("OPEN");
    // highlighted=null by default in open
    m.send("SELECT_HIGHLIGHTED");
    expect(m.getSnapshot().context.value).toEqual(["old"]);
  });

  it("calls onValueChange with new value", () => {
    const cb = vi.fn();
    const m = make({ onValueChange: cb });
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "vue", label: "Vue" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "vue" });
    m.send("SELECT_HIGHLIGHTED");
    expect(cb).toHaveBeenCalledWith(["vue"]);
  });
});

describe("createComboboxMachine — SELECT_HIGHLIGHTED (multiple)", () => {
  it("adds highlighted to selection", () => {
    const m = make({ multiple: true });
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "a" });
    m.send("SELECT_HIGHLIGHTED");
    expect(m.getSnapshot().context.value).toContain("a");
  });

  it("removes highlighted if already selected (toggle)", () => {
    const m = make({ multiple: true, defaultValue: ["a"] });
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "a" });
    m.send("SELECT_HIGHLIGHTED");
    expect(m.getSnapshot().context.value).not.toContain("a");
  });

  it("builds selectedLabels on add", () => {
    const m = make({ multiple: true });
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "ts", label: "TypeScript" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "ts" });
    m.send("SELECT_HIGHLIGHTED");
    expect(m.getSnapshot().context.selectedLabels["ts"]).toBe("TypeScript");
  });

  it("removes from selectedLabels on deselect", () => {
    const m = make({ multiple: true, defaultValue: ["ts"] });
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "ts", label: "TypeScript" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "ts" });
    m.send("SELECT_HIGHLIGHTED");
    expect(m.getSnapshot().context.selectedLabels["ts"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// CLOSE / INTERACT_OUTSIDE with multiple=true (label capture)
// ---------------------------------------------------------------------------

describe("createComboboxMachine — CLOSE with multiple=true (label capture)", () => {
  it("captures labels for selected options before unmounting", () => {
    const m = make({ multiple: true });
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "Apple" } });
    m.send({ type: "SELECT_OPTION", value: "a" });
    m.send("CLOSE");
    // Label must be preserved in selectedLabels after options portal unmounts.
    expect(m.getSnapshot().context.selectedLabels["a"]).toBe("Apple");
  });

  it("resets highlighted and inputValue on CLOSE (multiple)", () => {
    const m = make({ multiple: true });
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "a" });
    m.send({ type: "INPUT_CHANGE", value: "typed" });
    m.send("CLOSE");
    expect(m.getSnapshot().context.highlighted).toBeNull();
    expect(m.getSnapshot().context.inputValue).toBe("");
  });

  it("single: resets inputValue to selected label on CLOSE", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "r", label: "React" } });
    m.send({ type: "SELECT_OPTION", value: "r" });
    m.send({ type: "INPUT_CHANGE", value: "re-typed" });
    m.send("CLOSE");
    expect(m.getSnapshot().context.inputValue).toBe("React");
  });

  it("single: resets inputValue to '' when nothing selected", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "INPUT_CHANGE", value: "typed" });
    m.send("CLOSE");
    expect(m.getSnapshot().context.inputValue).toBe("");
  });
});

describe("createComboboxMachine — INTERACT_OUTSIDE with multiple=true", () => {
  it("captures labels for selected options", () => {
    const m = make({ multiple: true });
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "b", label: "Banana" } });
    m.send({ type: "SELECT_OPTION", value: "b" });
    m.send("INTERACT_OUTSIDE");
    expect(m.getSnapshot().context.selectedLabels["b"]).toBe("Banana");
  });

  it("resets highlighted and inputValue", () => {
    const m = make({ multiple: true });
    m.send("OPEN");
    m.send({ type: "HIGHLIGHT_OPTION", value: "x" });
    m.send("INTERACT_OUTSIDE");
    expect(m.getSnapshot().context.highlighted).toBeNull();
    expect(m.getSnapshot().context.inputValue).toBe("");
  });

  it("calls onOpenChange(false)", () => {
    const cb = vi.fn();
    const m = make({ multiple: true, onOpenChange: cb });
    m.send("OPEN");
    m.send("INTERACT_OUTSIDE");
    expect(cb).toHaveBeenLastCalledWith(false);
  });
});

// ---------------------------------------------------------------------------
// INPUT_CHANGE in open state + REGISTER/UNREGISTER in open state
// ---------------------------------------------------------------------------

describe("createComboboxMachine — INPUT_CHANGE in open state", () => {
  it("updates inputValue while already open", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "INPUT_CHANGE", value: "vue" });
    expect(m.getSnapshot().context.inputValue).toBe("vue");
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("calls onInputChange while already open", () => {
    const cb = vi.fn();
    const m = make({ onInputChange: cb });
    m.send("OPEN");
    m.send({ type: "INPUT_CHANGE", value: "filter" });
    expect(cb).toHaveBeenCalledWith("filter");
  });
});

describe("createComboboxMachine — REGISTER/UNREGISTER in open state", () => {
  it("REGISTER_OPTION in open state adds the option", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "x", label: "X" } });
    expect(m.getSnapshot().context.options.some((o) => o.value === "x")).toBe(true);
  });

  it("REGISTER_OPTION in open state is idempotent (no duplicates)", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "x", label: "X" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "x", label: "X" } });
    expect(m.getSnapshot().context.options.filter((o) => o.value === "x")).toHaveLength(1);
  });

  it("UNREGISTER_OPTION in open state removes the option", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "x", label: "X" } });
    m.send({ type: "UNREGISTER_OPTION", value: "x" });
    expect(m.getSnapshot().context.options.some((o) => o.value === "x")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// onHighlightChange callback
// ---------------------------------------------------------------------------

describe("createComboboxMachine — onHighlightChange callback", () => {
  it("HIGHLIGHT_OPTION calls onHighlightChange", () => {
    const cb = vi.fn();
    const m = make({ onHighlightChange: cb });
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "a" });
    expect(cb).toHaveBeenCalledWith("a");
  });

  it("HIGHLIGHT_NEXT calls onHighlightChange", () => {
    const cb = vi.fn();
    const m = make({ onHighlightChange: cb });
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "b", label: "B" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "a" });
    cb.mockClear();
    m.send("HIGHLIGHT_NEXT");
    expect(cb).toHaveBeenCalledWith("b");
  });

  it("HIGHLIGHT_FIRST calls onHighlightChange", () => {
    const cb = vi.fn();
    const m = make({ onHighlightChange: cb });
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "z", label: "Z" } });
    m.send("HIGHLIGHT_FIRST");
    expect(cb).toHaveBeenCalledWith("z");
  });
});

// ---------------------------------------------------------------------------
// onHighlightedScroll callback
//
// WHY: invokeOnHighlightedScroll (machine.ts ~63-65) is called after every
// highlight action but only when the callback is registered AND highlighted≠null.
// Existing tests use onHighlightChange but not onHighlightedScroll, so lines
// 63-65 are unreachable without a test that passes the callback.
// ---------------------------------------------------------------------------

describe("createComboboxMachine — onHighlightedScroll callback", () => {
  it("HIGHLIGHT_OPTION calls onHighlightedScroll with value and 0-based index", () => {
    const cb = vi.fn();
    const m = make({ onHighlightedScroll: cb });
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "b", label: "B" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "b" });
    expect(cb).toHaveBeenCalledWith("b", 1);
  });

  it("HIGHLIGHT_FIRST calls onHighlightedScroll with first option (index 0)", () => {
    const cb = vi.fn();
    const m = make({ onHighlightedScroll: cb });
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "first", label: "First" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "second", label: "Second" } });
    m.send("HIGHLIGHT_FIRST");
    expect(cb).toHaveBeenCalledWith("first", 0);
  });

  it("HIGHLIGHT_NEXT calls onHighlightedScroll with new highlighted value", () => {
    const cb = vi.fn();
    const m = make({ onHighlightedScroll: cb });
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "x", label: "X" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "y", label: "Y" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "x" });
    cb.mockClear();
    m.send("HIGHLIGHT_NEXT");
    expect(cb).toHaveBeenCalledWith("y", 1);
  });
});

// ---------------------------------------------------------------------------
// REGISTER_OPTION / UNREGISTER_OPTION in CLOSED state
//
// WHY: React frameworks register options on mount (before the combobox opens)
// so the machine already knows all options when HIGHLIGHT_FIRST/LAST is called.
// The closed-state handlers (machine.ts ~200-209) are entirely separate from
// the open-state ones and were untested — every previous test called OPEN first.
// ---------------------------------------------------------------------------

describe("createComboboxMachine — REGISTER/UNREGISTER in closed state", () => {
  it("REGISTER_OPTION in closed state adds the option", () => {
    const m = make();
    m.send({ type: "REGISTER_OPTION", option: { value: "preloaded", label: "Preloaded" } });
    expect(m.getSnapshot().context.options.some((o) => o.value === "preloaded")).toBe(true);
  });

  it("REGISTER_OPTION in closed state is idempotent (no duplicates)", () => {
    const m = make();
    m.send({ type: "REGISTER_OPTION", option: { value: "x", label: "X" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "x", label: "X" } });
    expect(m.getSnapshot().context.options.filter((o) => o.value === "x")).toHaveLength(1);
  });

  it("UNREGISTER_OPTION in closed state removes the option", () => {
    const m = make();
    m.send({ type: "REGISTER_OPTION", option: { value: "y", label: "Y" } });
    m.send({ type: "UNREGISTER_OPTION", value: "y" });
    expect(m.getSnapshot().context.options.some((o) => o.value === "y")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// watchOutside activity config callbacks (lines 76-80)
//
// WHY: The getId and getContainers lambdas inside makeWatchOutsideActivity's
// config object are only called when the pointerdown/focusin listener fires
// AND the combobox is the top layer. The layer registry (pushLayer) is normally
// managed by hideBackground — since combobox has no hideBackground activity,
// we must push manually in the test to make isTopLayer return true.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// getEffectiveOptions — server-side filtering path (line 22)
// WHY: `if (context.onInputChange) return base;` skips client-side filtering
// when the caller manages filtering externally. This branch is only triggered
// when onInputChange is set AND a navigation event calls getEffectiveOptions
// (HIGHLIGHT_NEXT, etc.) while the listbox is open.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// getNextHighlighted / getPrevHighlighted edge cases for combobox (lines 29, 37-38)
// WHY: These helpers exist independently in combobox.machine.ts. The select
// machine has its own copy. Both need their own coverage.
// ---------------------------------------------------------------------------

describe("createComboboxMachine — HIGHLIGHT_NEXT/PREV edge cases", () => {
  it("HIGHLIGHT_NEXT returns null when no enabled options (line 29 TRUE)", () => {
    const m = make();
    m.send("OPEN");
    // No options registered → getEffectiveOptions=[] → enabled=[] → return null
    m.send("HIGHLIGHT_NEXT");
    expect(m.getSnapshot().context.highlighted).toBeNull();
  });

  it("HIGHLIGHT_PREV returns null when no enabled options (line 37 TRUE)", () => {
    const m = make();
    m.send("OPEN");
    m.send("HIGHLIGHT_PREV");
    expect(m.getSnapshot().context.highlighted).toBeNull();
  });

  it("HIGHLIGHT_PREV when current=null selects last enabled (line 38 TRUE)", () => {
    const m = make();
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "b", label: "B" } });
    // current=null → return last enabled = "b"
    m.send("HIGHLIGHT_PREV");
    expect(m.getSnapshot().context.highlighted).toBe("b");
  });
});

// ---------------------------------------------------------------------------
// Positioning boundary / middleware (lines 167-168)
// ---------------------------------------------------------------------------

describe("createComboboxMachine — positioning boundary/middleware", () => {
  it("boundary stored in positioning context when provided (line 167)", () => {
    const boundary = document.createElement("div");
    const m = make({ positioning: { boundary } });
    expect(m.getSnapshot().context.positioning.boundary).toBe(boundary);
  });

  it("middleware stored in positioning context when provided (line 168)", () => {
    const middleware = [{ name: "offset" }] as unknown as Parameters<
      typeof createComboboxMachine
    >[0]["positioning"]["middleware"];
    const m = make({ positioning: { middleware } });
    expect(m.getSnapshot().context.positioning.middleware).toBe(middleware);
  });
});

describe("createComboboxMachine — server-side filtering (onInputChange set)", () => {
  it("HIGHLIGHT_NEXT uses unfiltered base options when onInputChange is set (line 22)", () => {
    const opts = [
      { value: "a", label: "Apple" },
      { value: "b", label: "Banana" },
    ];
    const m = make({ options: opts, onInputChange: vi.fn() });
    m.send("OPEN");
    // INPUT_CHANGE resets highlighted to null AND would filter out everything client-side.
    // With server-side mode (onInputChange set), getEffectiveOptions returns unfiltered base
    // → HIGHLIGHT_NEXT resolves first enabled = "a". Without it, filtered=[] → null.
    m.send({ type: "INPUT_CHANGE", value: "xyz" });
    m.send("HIGHLIGHT_NEXT");
    // server-side: getEffectiveOptions → return base (unfiltered) → [a, b], first = "a"
    expect(m.getSnapshot().context.highlighted).toBe("a");
  });
});

// ---------------------------------------------------------------------------
// SELECT_OPTION multiple mode: opt not found in options list (line 304)
// WHY: `opt?.label ?? value` — the `?? value` (fallback to raw value) fires
// when the option is not in context.options (e.g. registering after selecting
// or virtual scroll scenario).
// ---------------------------------------------------------------------------

describe("createComboboxMachine — SELECT_OPTION option not in options list", () => {
  it("multiple mode: uses raw value as label when option not found in context.options (line 304)", () => {
    const m = make({ multiple: true });
    m.send("OPEN");
    // Select "unknown" without registering it → opt=undefined → label falls back to value
    m.send({ type: "SELECT_OPTION", value: "unknown" });
    expect(m.getSnapshot().context.selectedLabels["unknown"]).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// HIGHLIGHT_FIRST / HIGHLIGHT_LAST null fallback in open state (lines 344, 354)
// WHY: `[0]?.value ?? null` — the `?? null` fires when there are no enabled
// options after filtering. Existing tests always have registered options.
// ---------------------------------------------------------------------------

describe("createComboboxMachine — HIGHLIGHT_FIRST/LAST with empty options", () => {
  it("HIGHLIGHT_FIRST returns null when no options are registered (line 344)", () => {
    const m = make();
    m.send("OPEN");
    m.send("HIGHLIGHT_FIRST");
    expect(m.getSnapshot().context.highlighted).toBeNull();
  });

  it("HIGHLIGHT_LAST returns null when no options are registered (line 354)", () => {
    const m = make();
    m.send("OPEN");
    m.send("HIGHLIGHT_LAST");
    expect(m.getSnapshot().context.highlighted).toBeNull();
  });

  it("HIGHLIGHT_FIRST returns null when all options are filtered out by inputValue", () => {
    const m = make({ options: [{ value: "a", label: "Apple" }] });
    m.send("OPEN");
    m.send({ type: "INPUT_CHANGE", value: "xyz" }); // no match
    m.send("HIGHLIGHT_FIRST");
    expect(m.getSnapshot().context.highlighted).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// invokeOnHighlightedScroll: index === -1 false-branch (line 65 → reported as 68)
// WHY: If highlighted is set to a value that is NOT in getEffectiveOptions (e.g.
// because inputValue filters it out), findIndex returns -1 and the callback must
// NOT be invoked. HIGHLIGHT_OPTION is used because it sets highlighted to any
// arbitrary string without validating against the options list.
// ---------------------------------------------------------------------------

describe("createComboboxMachine — invokeOnHighlightedScroll index out of range", () => {
  it("does not invoke onHighlightedScroll when highlighted item is filtered out (line 65)", () => {
    const onHighlightedScroll = vi.fn();
    const m = make({ onHighlightedScroll });
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "Apple" } });
    m.send("OPEN");
    // Type "xyz" → filters out "a" → getEffectiveOptions returns []
    m.send({ type: "INPUT_CHANGE", value: "xyz" });
    // HIGHLIGHT_OPTION sets highlighted to "a" then calls invokeOnHighlightedScroll.
    // getEffectiveOptions → [] → findIndex → -1 → callback NOT called (FALSE branch of `if (index >= 0)`)
    m.send({ type: "HIGHLIGHT_OPTION", value: "a" });
    expect(onHighlightedScroll).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// CLOSE multiple mode — selected value not in context.options (line 227)
// INTERACT_OUTSIDE multiple mode — same (line 247)
// WHY: These handlers iterate over selected values and look up each one in
// context.options. `if (opt)` FALSE branch fires when a selected value has been
// unregistered (virtual scroll, portal unmount) before the close fires.
// ---------------------------------------------------------------------------

describe("createComboboxMachine — CLOSE/INTERACT_OUTSIDE multiple unregistered option", () => {
  it("CLOSE: skips label capture when selected value is not in context.options (line 227 FALSE)", () => {
    const m = make({ multiple: true });
    m.send("OPEN");
    // Register option and select it via SELECT_OPTION
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "Apple" } });
    m.send({ type: "SELECT_OPTION", value: "a" });
    // Unregister the option (simulates virtual-scroll unmount)
    m.send({ type: "UNREGISTER_OPTION", value: "a" });
    // CLOSE fires: context.value=["a"] but context.options=[] → opt=undefined → if(opt) FALSE
    m.send("CLOSE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
    // selectedLabels for "a" was set by SELECT_OPTION; CLOSE should NOT override it with undefined
    expect(m.getSnapshot().context.value).toContain("a");
  });

  it("INTERACT_OUTSIDE: skips label capture when selected value is not in context.options (line 247 FALSE)", () => {
    const m = make({ multiple: true });
    m.send("OPEN");
    m.send({ type: "REGISTER_OPTION", option: { value: "b", label: "Banana" } });
    m.send({ type: "SELECT_OPTION", value: "b" });
    m.send({ type: "UNREGISTER_OPTION", value: "b" });
    m.send("INTERACT_OUTSIDE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
    expect(m.getSnapshot().context.value).toContain("b");
  });
});

// ---------------------------------------------------------------------------
// SELECT_HIGHLIGHTED multiple mode: highlighted not in context.options (line 304)
// WHY: The action uses `context.highlighted` (not event.value). `opt?.label ?? value`
// — the `?? value` fallback fires when the highlighted item is not registered.
// This differs from SELECT_OPTION (line 279) which uses event.value.
// ---------------------------------------------------------------------------

describe("createComboboxMachine — SELECT_HIGHLIGHTED option not registered", () => {
  it("multiple mode: falls back to raw value as label when highlighted item not in context.options (line 304)", () => {
    const m = make({ multiple: true });
    m.send("OPEN");
    // HIGHLIGHT_OPTION without registering the option — sets highlighted directly
    m.send({ type: "HIGHLIGHT_OPTION", value: "unregistered" });
    m.send("SELECT_HIGHLIGHTED");
    // opt=undefined → opt?.label=undefined → ?? "unregistered"
    expect(m.getSnapshot().context.selectedLabels["unregistered"]).toBe("unregistered");
  });
});

describe("createComboboxMachine — watchOutside activity config callbacks", () => {
  afterEach(() => clearRegistry());

  it("getId and getContainers called on outside pointerdown when combobox is top layer", () => {
    const m = make();
    // Register combobox in the layer stack so isTopLayer returns true
    pushLayer("test", null);
    m.send("OPEN");
    expect(m.getSnapshot().matches("open")).toBe(true);

    // Dispatch a pointerdown on a truly outside element
    const outsideEl = document.createElement("button");
    document.body.appendChild(outsideEl);
    outsideEl.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));

    // watchOutside fires INTERACT_OUTSIDE → machine closes
    expect(m.getSnapshot().matches("closed")).toBe(true);
    outsideEl.remove();
  });
});
