import { describe, expect, it, vi } from "vitest";
import { connectSelect } from "../src/select.connect.js";
import type { SelectContext, SelectOption, SelectState } from "../src/select.types.js";

const OPTIONS: SelectOption[] = [
  { value: "react", label: "React", disabled: false },
  { value: "vue", label: "Vue", disabled: false },
  { value: "angular", label: "Angular", disabled: true },
];

function makeCtx(overrides: Partial<SelectContext> = {}): SelectContext {
  return {
    id: "test-select",
    multiple: false,
    value: [],
    highlighted: null,
    options: OPTIONS,
    valueLabelMap: {},
    placeholder: "Select...",
    disabled: false,
    x: 0,
    y: 0,
    positioned: false,
    currentPlacement: "bottom",
    positioning: { strategy: "absolute", placement: "bottom" } as SelectContext["positioning"],
    triggerId: "test-select-trigger",
    contentId: "test-select-content",
    labelId: "test-select-label",
    triggerEl: null,
    contentEl: null,
    arrowEl: null,
    ...overrides,
  };
}

function makeSnapshot(ctx: SelectContext, state: SelectState = "closed") {
  return { value: state, context: ctx, matches: (s: string) => s === state };
}

function makeApi(overrides: Partial<SelectContext> = {}, state: SelectState = "closed") {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  return { api: connectSelect(makeSnapshot(ctx, state), send, machine), send };
}

// ---------------------------------------------------------------------------
// isOpen
// ---------------------------------------------------------------------------

describe("connectSelect — isOpen", () => {
  it("isOpen=false when state=closed", () => {
    const { api } = makeApi({}, "closed");
    expect(api.isOpen).toBe(false);
  });

  it("isOpen=true when state=open", () => {
    const { api } = makeApi({}, "open");
    expect(api.isOpen).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// valueLabel
// ---------------------------------------------------------------------------

describe("connectSelect — valueLabel", () => {
  it("empty string when no value selected", () => {
    const { api } = makeApi({ value: [] });
    expect(api.valueLabel).toBe("");
  });

  it("resolves label from valueLabelMap", () => {
    const { api } = makeApi({ value: ["react"], valueLabelMap: { react: "React" } });
    expect(api.valueLabel).toBe("React");
  });

  it("falls back to value when label not found", () => {
    const { api } = makeApi({ value: ["unknown"], valueLabelMap: {} });
    expect(api.valueLabel).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// getTriggerProps — ARIA
// ---------------------------------------------------------------------------

describe("connectSelect — getTriggerProps", () => {
  it("role=combobox", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps().role).toBe("combobox");
  });

  it("aria-haspopup=listbox", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps()["aria-haspopup"]).toBe("listbox");
  });

  it("aria-expanded=false when closed", () => {
    const { api } = makeApi({}, "closed");
    expect(api.getTriggerProps()["aria-expanded"]).toBe(false);
  });

  it("aria-expanded=true when open", () => {
    const { api } = makeApi({}, "open");
    expect(api.getTriggerProps()["aria-expanded"]).toBe(true);
  });

  it("aria-controls points to contentId", () => {
    const { api } = makeApi({ contentId: "my-listbox" });
    expect(api.getTriggerProps()["aria-controls"]).toBe("my-listbox");
  });

  // WAI-ARIA §6.8.1: when open and an option is highlighted, the trigger
  // must expose aria-activedescendant pointing to that option's id so AT
  // can announce the focused item without moving DOM focus.
  it("aria-activedescendant is undefined when closed (never exposed while closed)", () => {
    const { api } = makeApi({ highlighted: "react" }, "closed");
    expect(api.getTriggerProps()["aria-activedescendant"]).toBeUndefined();
  });

  it("aria-activedescendant is undefined when open but nothing highlighted", () => {
    const { api } = makeApi({ highlighted: null }, "open");
    expect(api.getTriggerProps()["aria-activedescendant"]).toBeUndefined();
  });

  it("aria-activedescendant points to highlighted option id when open", () => {
    const { api } = makeApi({ id: "my-sel", highlighted: "react" }, "open");
    expect(api.getTriggerProps()["aria-activedescendant"]).toBe("my-sel-opt-react");
  });

  it("data-state=closed when closed", () => {
    const { api } = makeApi({}, "closed");
    expect(api.getTriggerProps()["data-state"]).toBe("closed");
  });

  it("data-state=open when open", () => {
    const { api } = makeApi({}, "open");
    expect(api.getTriggerProps()["data-state"]).toBe("open");
  });

  it("onClick sends TOGGLE", () => {
    const { api, send } = makeApi();
    api.getTriggerProps().onClick();
    expect(send).toHaveBeenCalledWith("TOGGLE");
  });

  it("disabled: onClick does not send", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getTriggerProps().onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("data-placeholder when value is empty", () => {
    const { api } = makeApi({ value: [] });
    expect(api.getTriggerProps()["data-placeholder"]).toBe("");
  });

  // WAI-ARIA §6.8.1: the trigger's accessible name must reference both the
  // label element and the trigger itself so AT announces "label: selected value".
  it("aria-labelledby references both labelId and triggerId", () => {
    const { api } = makeApi({ labelId: "sel-label", triggerId: "sel-trigger" });
    const labelledBy = api.getTriggerProps()["aria-labelledby"];
    expect(labelledBy).toContain("sel-label");
    expect(labelledBy).toContain("sel-trigger");
  });
});

// ---------------------------------------------------------------------------
// getContentProps
// ---------------------------------------------------------------------------

describe("connectSelect — getContentProps", () => {
  it("role=listbox", () => {
    const { api } = makeApi();
    expect(api.getContentProps().role).toBe("listbox");
  });

  it("id matches contentId", () => {
    const { api } = makeApi({ contentId: "sel-content" });
    expect(api.getContentProps().id).toBe("sel-content");
  });

  it("aria-multiselectable when multiple", () => {
    const { api } = makeApi({ multiple: true });
    expect(api.getContentProps()["aria-multiselectable"]).toBe(true);
  });

  // The listbox must reference the same label as the trigger so AT can
  // announce the label when the listbox receives focus.
  it("aria-labelledby references the labelId", () => {
    const { api } = makeApi({ labelId: "the-label" });
    expect(api.getContentProps()["aria-labelledby"]).toBe("the-label");
  });
});

// ---------------------------------------------------------------------------
// getOptionProps
// ---------------------------------------------------------------------------

describe("connectSelect — getOptionProps", () => {
  it("role=option", () => {
    const { api } = makeApi();
    expect(api.getOptionProps({ value: "react", disabled: false }).role).toBe("option");
  });

  // The option id must match the pattern expected by aria-activedescendant so
  // AT can resolve the reference from the trigger to the highlighted option.
  it("id is selectId-opt-value (matches aria-activedescendant pattern)", () => {
    const { api } = makeApi({ id: "my-sel" });
    expect(api.getOptionProps({ value: "react", disabled: false }).id).toBe("my-sel-opt-react");
  });

  it("aria-selected=true when value is selected", () => {
    const { api } = makeApi({ value: ["react"] });
    expect(api.getOptionProps({ value: "react", disabled: false })["aria-selected"]).toBe(true);
  });

  it("aria-selected=false when value is not selected", () => {
    const { api } = makeApi({ value: [] });
    expect(api.getOptionProps({ value: "react", disabled: false })["aria-selected"]).toBe(false);
  });

  it("aria-disabled when option disabled", () => {
    const { api } = makeApi();
    expect(api.getOptionProps({ value: "angular", disabled: true })["aria-disabled"]).toBe(true);
  });

  it("data-highlighted when option is highlighted", () => {
    const { api } = makeApi({ highlighted: "react" });
    expect(api.getOptionProps({ value: "react", disabled: false })["data-highlighted"]).toBe("");
  });

  it("onClick sends SELECT_OPTION", () => {
    const { api, send } = makeApi();
    api.getOptionProps({ value: "react", disabled: false }).onClick();
    expect(send).toHaveBeenCalledWith({ type: "SELECT_OPTION", value: "react" });
  });

  it("onClick disabled option: no send", () => {
    const { api, send } = makeApi();
    api.getOptionProps({ value: "angular", disabled: true }).onClick();
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getTriggerProps — onKeyDown (keyboard navigation)
// ---------------------------------------------------------------------------

describe("connectSelect — onKeyDown keyboard interactions", () => {
  function fire(api: ReturnType<typeof connectSelect>, key: string, ctrlKey = false) {
    const e = { key, ctrlKey, altKey: false, metaKey: false, preventDefault: vi.fn() } as unknown as KeyboardEvent;
    api.getTriggerProps().onKeyDown(e);
    return e;
  }

  it("ArrowDown when closed sends OPEN", () => {
    const { api, send } = makeApi({}, "closed");
    fire(api, "ArrowDown");
    expect(send).toHaveBeenCalledWith("OPEN");
  });

  it("ArrowDown when open sends HIGHLIGHT_NEXT", () => {
    const { api, send } = makeApi({}, "open");
    fire(api, "ArrowDown");
    expect(send).toHaveBeenCalledWith("HIGHLIGHT_NEXT");
  });

  it("ArrowUp when closed sends OPEN then HIGHLIGHT_LAST", () => {
    const { api, send } = makeApi({}, "closed");
    fire(api, "ArrowUp");
    expect(send).toHaveBeenCalledWith("OPEN");
    expect(send).toHaveBeenCalledWith("HIGHLIGHT_LAST");
  });

  it("ArrowUp when open sends HIGHLIGHT_PREV", () => {
    const { api, send } = makeApi({}, "open");
    fire(api, "ArrowUp");
    expect(send).toHaveBeenCalledWith("HIGHLIGHT_PREV");
  });

  it("Home when open sends HIGHLIGHT_FIRST", () => {
    const { api, send } = makeApi({}, "open");
    fire(api, "Home");
    expect(send).toHaveBeenCalledWith("HIGHLIGHT_FIRST");
  });

  it("End when open sends HIGHLIGHT_LAST", () => {
    const { api, send } = makeApi({}, "open");
    fire(api, "End");
    expect(send).toHaveBeenCalledWith("HIGHLIGHT_LAST");
  });

  it("Enter when closed sends OPEN", () => {
    const { api, send } = makeApi({}, "closed");
    fire(api, "Enter");
    expect(send).toHaveBeenCalledWith("OPEN");
  });

  it("Enter when open with highlighted sends SELECT_OPTION then CLOSE", () => {
    const { api, send } = makeApi({ highlighted: "react", multiple: false }, "open");
    fire(api, "Enter");
    expect(send).toHaveBeenCalledWith({ type: "SELECT_OPTION", value: "react" });
    expect(send).toHaveBeenCalledWith("CLOSE");
  });

  it("Space when open with highlighted sends SELECT_OPTION then CLOSE", () => {
    const { api, send } = makeApi({ highlighted: "vue", multiple: false }, "open");
    fire(api, " ");
    expect(send).toHaveBeenCalledWith({ type: "SELECT_OPTION", value: "vue" });
    expect(send).toHaveBeenCalledWith("CLOSE");
  });

  it("Escape when open sends ESCAPE_KEY", () => {
    const { api, send } = makeApi({}, "open");
    fire(api, "Escape");
    expect(send).toHaveBeenCalledWith("ESCAPE_KEY");
  });

  it("Escape when closed does nothing", () => {
    const { api, send } = makeApi({}, "closed");
    fire(api, "Escape");
    expect(send).not.toHaveBeenCalled();
  });

  it("Tab when open sends CLOSE", () => {
    const { api, send } = makeApi({}, "open");
    fire(api, "Tab");
    expect(send).toHaveBeenCalledWith("CLOSE");
  });

  it("disabled: ArrowDown does nothing", () => {
    const { api, send } = makeApi({ disabled: true }, "closed");
    fire(api, "ArrowDown");
    expect(send).not.toHaveBeenCalled();
  });

  // WAI-ARIA §3.15: printable characters trigger typeahead (highlights first matching option)
  it("letter key when open triggers typeahead → HIGHLIGHT_OPTION", () => {
    const { api, send } = makeApi({ options: OPTIONS }, "open");
    fire(api, "r"); // "r" → React (first option starting with "r")
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_OPTION", value: "react" });
  });

  it("letter key when closed does NOT trigger typeahead", () => {
    const { api, send } = makeApi({ options: OPTIONS }, "closed");
    fire(api, "r");
    expect(send).not.toHaveBeenCalled();
  });

  it("Ctrl+key when open does NOT trigger typeahead", () => {
    const { api, send } = makeApi({ options: OPTIONS }, "open");
    const e = { key: "a", ctrlKey: true, altKey: false, metaKey: false, preventDefault: vi.fn() } as unknown as KeyboardEvent;
    api.getTriggerProps().onKeyDown(e);
    expect(send).not.toHaveBeenCalled();
  });

  // Buffer accumulation: "r" then "e" within 500ms → buffer="re" → matches React
  it("successive keys accumulate buffer — 'r' then 'e' matches 'react'", () => {
    vi.useFakeTimers();
    const { api, send } = makeApi({ options: OPTIONS }, "open");
    fire(api, "r");
    vi.advanceTimersByTime(100); // within window — buffer still "r"
    fire(api, "e"); // buffer = "re" → starts with "re": React
    expect(send).toHaveBeenLastCalledWith({ type: "HIGHLIGHT_OPTION", value: "react" });
    vi.useRealTimers();
  });

  // After 500ms the buffer resets, so a new press starts a fresh match
  it("buffer clears after 500ms — second 'r' matches from scratch", () => {
    vi.useFakeTimers();
    const { api, send } = makeApi({ options: OPTIONS }, "open");
    fire(api, "r"); // first press → "react"
    vi.advanceTimersByTime(600); // timer fires → buffer cleared
    fire(api, "r"); // fresh buffer → "react" again (first matching)
    expect(send).toHaveBeenLastCalledWith({ type: "HIGHLIGHT_OPTION", value: "react" });
    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// getOptionProps — mouse events
// ---------------------------------------------------------------------------

describe("connectSelect — getOptionProps mouse events", () => {
  it("onMouseMove highlights non-disabled option", () => {
    const { api, send } = makeApi({ highlighted: null }, "open");
    api.getOptionProps({ value: "react", disabled: false }).onMouseMove();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_OPTION", value: "react" });
  });

  it("onMouseMove on already-highlighted option does nothing", () => {
    const { api, send } = makeApi({ highlighted: "react" }, "open");
    api.getOptionProps({ value: "react", disabled: false }).onMouseMove();
    expect(send).not.toHaveBeenCalled();
  });

  it("onMouseMove on disabled option does nothing", () => {
    const { api, send } = makeApi({ highlighted: null }, "open");
    api.getOptionProps({ value: "angular", disabled: true }).onMouseMove();
    expect(send).not.toHaveBeenCalled();
  });

  it("onMouseLeave clears highlight (value=null)", () => {
    const { api, send } = makeApi({ highlighted: "react" }, "open");
    api.getOptionProps({ value: "react", disabled: false }).onMouseLeave();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_OPTION", value: null });
  });
});

// ---------------------------------------------------------------------------
// getPositionerProps
// ---------------------------------------------------------------------------

describe("connectSelect — getPositionerProps", () => {
  it("data-forge-part=positioner", () => {
    const { api } = makeApi();
    expect(api.getPositionerProps()["data-forge-part"]).toBe("positioner");
  });

  it("style.position matches positioning strategy", () => {
    const { api } = makeApi({ positioning: { strategy: "fixed", placement: "bottom" } as SelectContext["positioning"] });
    expect(api.getPositionerProps().style.position).toBe("fixed");
  });

  it("style.top reflects y coordinate", () => {
    const { api } = makeApi({ y: 42 });
    expect(api.getPositionerProps().style.top).toBe("42px");
  });

  it("style.left reflects x coordinate", () => {
    const { api } = makeApi({ x: 100 });
    expect(api.getPositionerProps().style.left).toBe("100px");
  });

  it("pointerEvents=none when not yet positioned", () => {
    const { api } = makeApi({ positioned: false });
    expect(api.getPositionerProps().style.pointerEvents).toBe("none");
  });

  it("no pointerEvents restriction when positioned", () => {
    const { api } = makeApi({ positioned: true });
    expect(api.getPositionerProps().style.pointerEvents).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getIndicatorProps
// ---------------------------------------------------------------------------

describe("connectSelect — getIndicatorProps", () => {
  it("aria-hidden=true (decorative element)", () => {
    const { api } = makeApi();
    expect(api.getIndicatorProps()["aria-hidden"]).toBe(true);
  });

  it("data-state=closed when closed", () => {
    const { api } = makeApi({}, "closed");
    expect(api.getIndicatorProps()["data-state"]).toBe("closed");
  });

  it("data-state=open when open", () => {
    const { api } = makeApi({}, "open");
    expect(api.getIndicatorProps()["data-state"]).toBe("open");
  });
});

// ---------------------------------------------------------------------------
// getLabelProps
// ---------------------------------------------------------------------------

describe("connectSelect — getLabelProps", () => {
  it("data-forge-scope=select", () => {
    const { api } = makeApi();
    expect(api.getLabelProps()["data-forge-scope"]).toBe("select");
  });

  it("htmlFor matches triggerId", () => {
    const { api } = makeApi({ triggerId: "my-trigger" });
    expect(api.getLabelProps().htmlFor).toBe("my-trigger");
  });
});
