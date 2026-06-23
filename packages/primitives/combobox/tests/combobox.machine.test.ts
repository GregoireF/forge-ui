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
