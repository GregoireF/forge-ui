import { clearRegistry } from "@forge-ui/core";
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
  clearRegistry();
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

// ---------------------------------------------------------------------------
// defaultLabel — pre-seeds valueLabelMap before options mount
// ---------------------------------------------------------------------------

describe("createSelectMachine — defaultLabel", () => {
  it("string defaultLabel seeds label for single defaultValue", () => {
    const m = make({ defaultValue: "react", defaultLabel: "React" });
    expect(m.getSnapshot().context.valueLabelMap["react"]).toBe("React");
  });

  it("array defaultLabel seeds labels for multiple defaultValues", () => {
    const m = make({ defaultValue: ["react", "vue"], defaultLabel: ["React", "Vue"] });
    expect(m.getSnapshot().context.valueLabelMap["react"]).toBe("React");
    expect(m.getSnapshot().context.valueLabelMap["vue"]).toBe("Vue");
  });

  it("no defaultLabel: valueLabelMap starts empty", () => {
    const m = make({ defaultValue: "react" });
    expect(m.getSnapshot().context.valueLabelMap).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// UNREGISTER_OPTION — closed and open states
// ---------------------------------------------------------------------------

describe("createSelectMachine — UNREGISTER_OPTION", () => {
  it("removes option in closed state", () => {
    const m = make();
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "UNREGISTER_OPTION", value: "a" });
    expect(m.getSnapshot().context.options).toHaveLength(0);
  });

  it("removes option in open state", () => {
    const m = make({ defaultOpen: true });
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "UNREGISTER_OPTION", value: "a" });
    expect(m.getSnapshot().context.options).toHaveLength(0);
  });

  it("does not remove other options", () => {
    const m = make();
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "b", label: "B" } });
    m.send({ type: "UNREGISTER_OPTION", value: "a" });
    expect(m.getSnapshot().context.options).toHaveLength(1);
    expect(m.getSnapshot().context.options[0].value).toBe("b");
  });

  it("UNREGISTER keeps valueLabelMap (label survives close)", () => {
    const m = make();
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "Alpha" } });
    m.send({ type: "UNREGISTER_OPTION", value: "a" });
    expect(m.getSnapshot().context.valueLabelMap["a"]).toBe("Alpha");
  });
});

// ---------------------------------------------------------------------------
// SELECT_HIGHLIGHTED — keyboard Enter selection
// ---------------------------------------------------------------------------

describe("createSelectMachine — SELECT_HIGHLIGHTED", () => {
  it("single: selects highlighted option", () => {
    const m = make({ defaultOpen: true });
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "a" });
    m.send("SELECT_HIGHLIGHTED");
    expect(m.getSnapshot().context.value).toEqual(["a"]);
  });

  it("single: no-op when highlighted=null", () => {
    const m = make({ defaultOpen: true });
    m.send("SELECT_HIGHLIGHTED");
    expect(m.getSnapshot().context.value).toEqual([]);
  });

  it("multiple: adds highlighted to selection", () => {
    const m = make({ multiple: true, defaultOpen: true });
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "a" });
    m.send("SELECT_HIGHLIGHTED");
    expect(m.getSnapshot().context.value).toContain("a");
  });

  it("multiple: deselects highlighted if already selected (toggle)", () => {
    const m = make({ multiple: true, defaultValue: ["a"], defaultOpen: true });
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "a" });
    m.send("SELECT_HIGHLIGHTED");
    expect(m.getSnapshot().context.value).not.toContain("a");
  });

  it("multiple: SELECT_HIGHLIGHTED calls onValueChange", () => {
    const cb = vi.fn();
    const m = make({ multiple: true, defaultOpen: true, onValueChange: cb });
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "HIGHLIGHT_OPTION", value: "a" });
    m.send("SELECT_HIGHLIGHTED");
    expect(cb).toHaveBeenCalledWith(["a"]);
  });
});

// ---------------------------------------------------------------------------
// watchOutside activity config callbacks (machine.ts lines 131-132)
//
// WHY: The getId and getContainers lambdas in makeWatchOutsideActivity are only
// called when a pointerdown event fires on the document AND the select is the
// topmost layer. The select registers itself via registerLayer (first open
// activity), so no manual pushLayer is needed — opening the select suffices.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// getNextHighlighted / getPrevHighlighted edge cases (lines 20-29)
// WHY: existing tests always call HIGHLIGHT_OPTION first so `current` is set.
// Lines 20-21 and 28-29 are only hit when no enabled options exist OR
// current===null with enabled options present.
// ---------------------------------------------------------------------------

describe("createSelectMachine — highlight navigation edge cases", () => {
  it("HIGHLIGHT_NEXT returns null when no enabled options (line 20)", () => {
    const m = make({ defaultOpen: true });
    // No options registered → enabled=[] → returns null
    m.send("HIGHLIGHT_NEXT");
    expect(m.getSnapshot().context.highlighted).toBeNull();
  });

  it("HIGHLIGHT_PREV returns null when no enabled options (line 28)", () => {
    const m = make({ defaultOpen: true });
    m.send("HIGHLIGHT_PREV");
    expect(m.getSnapshot().context.highlighted).toBeNull();
  });

  it("HIGHLIGHT_NEXT when current=null selects first enabled (line 21)", () => {
    const m = make({ defaultOpen: true });
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "b", label: "B" } });
    // highlighted=null (default) → returns first enabled
    m.send("HIGHLIGHT_NEXT");
    expect(m.getSnapshot().context.highlighted).toBe("a");
  });

  it("HIGHLIGHT_PREV when current=null selects last enabled (line 29)", () => {
    const m = make({ defaultOpen: true });
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "b", label: "B" } });
    m.send("HIGHLIGHT_PREV");
    expect(m.getSnapshot().context.highlighted).toBe("b");
  });

  it("HIGHLIGHT_FIRST returns null when no enabled options (line 106)", () => {
    const m = make({ defaultOpen: true });
    m.send("HIGHLIGHT_FIRST");
    expect(m.getSnapshot().context.highlighted).toBeNull();
  });

  it("HIGHLIGHT_LAST returns null when no enabled options (line 112)", () => {
    const m = make({ defaultOpen: true });
    m.send("HIGHLIGHT_LAST");
    expect(m.getSnapshot().context.highlighted).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getDefaultHighlighted when selected value is disabled (line 38)
// WHY: value[0] exists in options but is disabled → `if (selected)` is FALSE
// → falls through to first enabled option.
// ---------------------------------------------------------------------------

describe("createSelectMachine — getDefaultHighlighted with disabled selected", () => {
  it("OPEN falls back to first enabled option when selected value is disabled (line 38)", () => {
    const m = make({ defaultValue: "b" });
    m.send({ type: "REGISTER_OPTION", option: { value: "a", label: "A" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "b", label: "B", disabled: true } });
    m.send("OPEN");
    expect(m.getSnapshot().context.highlighted).toBe("a");
  });
});

// ---------------------------------------------------------------------------
// defaultLabel with fewer items than defaultValue (line 155)
// WHY: `if (rawLabels[i] !== undefined)` FALSE branch fires when
// defaultLabel array has fewer entries than defaultValue array.
// ---------------------------------------------------------------------------

describe("createSelectMachine — defaultLabel partial match", () => {
  it("only seeds labels that have a corresponding defaultLabel entry (line 155)", () => {
    const m = make({ defaultValue: ["react", "vue", "angular"], defaultLabel: ["React"] });
    const map = m.getSnapshot().context.valueLabelMap;
    expect(map["react"]).toBe("React");
    expect(map["vue"]).toBeUndefined();
    expect(map["angular"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// positioning boundary / middleware options (lines 184-185)
// ---------------------------------------------------------------------------

describe("createSelectMachine — positioning boundary/middleware", () => {
  it("boundary stored in positioning context when provided (line 184)", () => {
    const boundary = document.createElement("div");
    const m = make({ positioning: { boundary } });
    expect(m.getSnapshot().context.positioning.boundary).toBe(boundary);
  });

  it("middleware array stored in positioning context when provided (line 185)", () => {
    const middleware = [{ name: "offset" }] as unknown as Parameters<
      typeof createSelectMachine
    >[0]["positioning"]["middleware"];
    const m = make({ positioning: { middleware } });
    expect(m.getSnapshot().context.positioning.middleware).toBe(middleware);
  });
});

// ---------------------------------------------------------------------------
// REGISTER_OPTION in open state — duplicate / label-unchanged branches (288-289)
// WHY: closed-state REGISTER_OPTION duplicate is tested, but the open-state
// handler is separate code. Both `if (!exists)` FALSE and `valueLabelMap`
// label-unchanged FALSE branches need a duplicate registration in open state.
// ---------------------------------------------------------------------------

describe("createSelectMachine — REGISTER_OPTION open state idempotency", () => {
  it("duplicate REGISTER_OPTION in open state keeps one entry (line 288 FALSE)", () => {
    const m = make({ defaultOpen: true });
    m.send({ type: "REGISTER_OPTION", option: { value: "x", label: "X" } });
    m.send({ type: "REGISTER_OPTION", option: { value: "x", label: "X" } });
    expect(m.getSnapshot().context.options.filter((o) => o.value === "x")).toHaveLength(1);
  });

  it("duplicate REGISTER_OPTION in open state does not update unchanged label (line 289 FALSE)", () => {
    const m = make({ defaultOpen: true });
    m.send({ type: "REGISTER_OPTION", option: { value: "x", label: "X" } });
    const mapBefore = { ...m.getSnapshot().context.valueLabelMap };
    m.send({ type: "REGISTER_OPTION", option: { value: "x", label: "X" } });
    expect(m.getSnapshot().context.valueLabelMap).toEqual(mapBefore);
  });
});

describe("createSelectMachine — watchOutside activity config callbacks", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getId and getContainers called on outside pointerdown when select is top layer", () => {
    const content = document.createElement("div");
    document.body.appendChild(content);
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);

    const m = make();
    m.setContext({ contentEl: content, triggerEl: trigger });
    m.send("OPEN");
    expect(m.getSnapshot().matches("open")).toBe(true);

    const outsideEl = document.createElement("button");
    document.body.appendChild(outsideEl);
    outsideEl.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));

    // INTERACT_OUTSIDE closes the select
    expect(m.getSnapshot().matches("closed")).toBe(true);

    trigger.remove();
    content.remove();
    outsideEl.remove();
  });
});
