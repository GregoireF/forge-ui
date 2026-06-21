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
});

// ---------------------------------------------------------------------------
// getOptionProps
// ---------------------------------------------------------------------------

describe("connectSelect — getOptionProps", () => {
  it("role=option", () => {
    const { api } = makeApi();
    expect(api.getOptionProps({ value: "react", disabled: false }).role).toBe("option");
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
