import { describe, expect, it, vi } from "vitest";
import { connectCombobox } from "../src/combobox.connect.js";
import type { ComboboxContext, ComboboxOption, ComboboxState } from "../src/combobox.types.js";

const OPTIONS: ComboboxOption[] = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
];

function makeCtx(overrides: Partial<ComboboxContext> = {}): ComboboxContext {
  return {
    id: "test-combobox",
    inputId: "test-combobox-input",
    contentId: "test-combobox-content",
    labelId: "test-combobox-label",
    inputValue: "",
    value: [],
    highlighted: null,
    options: OPTIONS,
    selectedLabels: {},
    disabled: false,
    readOnly: false,
    required: false,
    invalid: false,
    multiple: false,
    placeholder: "Select...",
    triggerEl: null,
    contentEl: null,
    buttonEl: null,
    arrowEl: null,
    x: 0,
    y: 0,
    positioned: false,
    currentPlacement: "bottom",
    positioning: { strategy: "absolute", placement: "bottom" } as ComboboxContext["positioning"],
    ...overrides,
  };
}

function makeSnapshot(ctx: ComboboxContext, state: ComboboxState = "closed") {
  return { value: state, context: ctx, matches: (s: string) => s === state };
}

function makeApi(overrides: Partial<ComboboxContext> = {}, state: ComboboxState = "closed") {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  return { api: connectCombobox(makeSnapshot(ctx, state), send, machine), send };
}

// ---------------------------------------------------------------------------
// isOpen / state
// ---------------------------------------------------------------------------

describe("connectCombobox — isOpen", () => {
  it("isOpen=false when state=closed", () => {
    const { api } = makeApi({}, "closed");
    expect(api.isOpen).toBe(false);
    expect(api.state).toBe("closed");
  });

  it("isOpen=true when state=open", () => {
    const { api } = makeApi({}, "open");
    expect(api.isOpen).toBe(true);
    expect(api.state).toBe("open");
  });
});

// ---------------------------------------------------------------------------
// filteredOptions — client-side filter
// ---------------------------------------------------------------------------

describe("connectCombobox — filteredOptions", () => {
  it("returns all options when inputValue is empty", () => {
    const { api } = makeApi({ inputValue: "" });
    expect(api.filteredOptions).toHaveLength(3);
  });

  it("filters by label (case-insensitive)", () => {
    const { api } = makeApi({ inputValue: "re" });
    // "React" contains "re"
    expect(api.filteredOptions.some((o) => o.value === "react")).toBe(true);
  });

  it("returns empty when no options match", () => {
    const { api } = makeApi({ inputValue: "zzz" });
    expect(api.filteredOptions).toHaveLength(0);
  });

  it("skips client-side filter when onInputChange is provided (async mode)", () => {
    const { api } = makeApi({ inputValue: "zzz", onInputChange: vi.fn() });
    expect(api.filteredOptions).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// hasCreateOption
// ---------------------------------------------------------------------------

describe("connectCombobox — hasCreateOption", () => {
  it("false when onCreateOption is not set", () => {
    const { api } = makeApi({ inputValue: "newitem" });
    expect(api.hasCreateOption).toBe(false);
  });

  it("true when onCreateOption is set and input has no exact match", () => {
    const { api } = makeApi({ inputValue: "newitem", onCreateOption: vi.fn() });
    expect(api.hasCreateOption).toBe(true);
  });

  it("false when inputValue exactly matches an existing label (case-insensitive)", () => {
    const { api } = makeApi({ inputValue: "react", onCreateOption: vi.fn() });
    expect(api.hasCreateOption).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getLabelProps
// ---------------------------------------------------------------------------

describe("connectCombobox — getLabelProps", () => {
  it("id=labelId", () => {
    const { api } = makeApi();
    expect(api.getLabelProps().id).toBe("test-combobox-label");
  });

  it("htmlFor=inputId (associates label with input)", () => {
    const { api } = makeApi();
    expect(api.getLabelProps().htmlFor).toBe("test-combobox-input");
  });

  it("data-forge-part=label", () => {
    const { api } = makeApi();
    expect(api.getLabelProps()["data-forge-part"]).toBe("label");
  });
});

// ---------------------------------------------------------------------------
// getInputProps — ARIA
// ---------------------------------------------------------------------------

describe("connectCombobox — getInputProps", () => {
  it("role=combobox", () => {
    const { api } = makeApi();
    expect(api.getInputProps().role).toBe("combobox");
  });

  it("aria-expanded=false when closed", () => {
    const { api } = makeApi({}, "closed");
    expect(api.getInputProps()["aria-expanded"]).toBe(false);
  });

  it("aria-expanded=true when open", () => {
    const { api } = makeApi({}, "open");
    expect(api.getInputProps()["aria-expanded"]).toBe(true);
  });

  it("aria-controls points to content id", () => {
    const { api } = makeApi({ contentId: "my-listbox" });
    expect(api.getInputProps()["aria-controls"]).toBe("my-listbox");
  });

  it("aria-required=true when required", () => {
    const { api } = makeApi({ required: true });
    expect(api.getInputProps()["aria-required"]).toBe(true);
  });

  it("aria-invalid=true when invalid", () => {
    const { api } = makeApi({ invalid: true });
    expect(api.getInputProps()["aria-invalid"]).toBe(true);
  });

  // WAI-ARIA: aria-readonly informs AT the value cannot be changed (even though
  // the user can still focus and copy it — unlike aria-disabled).
  it("aria-readonly=true when readOnly", () => {
    const { api } = makeApi({ readOnly: true });
    expect(api.getInputProps()["aria-readonly"]).toBe(true);
  });

  it("disabled when context.disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getInputProps().disabled).toBe(true);
  });

  // WAI-ARIA 1.2 §6.6.1: aria-autocomplete tells AT what kind of completion
  // is offered. "both" = client-side filter (suggestions updated inline).
  // "list" = server-side / async mode where onInputChange is provided.
  it('aria-autocomplete="both" when filtering client-side (no onInputChange)', () => {
    const { api } = makeApi();
    expect(api.getInputProps()["aria-autocomplete"]).toBe("both");
  });

  it('aria-autocomplete="list" when onInputChange is provided (async/server-side filter)', () => {
    const { api } = makeApi({ onInputChange: vi.fn() });
    expect(api.getInputProps()["aria-autocomplete"]).toBe("list");
  });

  it("autocomplete=off to prevent browser autocomplete from interfering", () => {
    const { api } = makeApi();
    expect(api.getInputProps().autocomplete).toBe("off");
  });

  // WAI-ARIA §6.6.3: combobox must expose aria-activedescendant pointing to
  // the highlighted option element so AT announce the focused item without
  // moving DOM focus out of the input.
  it("aria-activedescendant is undefined when nothing highlighted", () => {
    const { api } = makeApi({ highlighted: null }, "open");
    expect(api.getInputProps()["aria-activedescendant"]).toBeUndefined();
  });

  it("aria-activedescendant points to highlighted option id", () => {
    const { api } = makeApi({ highlighted: "react", contentId: "my-list" }, "open");
    expect(api.getInputProps()["aria-activedescendant"]).toBe("my-list-option-react");
  });

  it("aria-activedescendant uses the option value to build a stable id", () => {
    const { api } = makeApi({ highlighted: "vue" }, "open");
    expect(api.getInputProps()["aria-activedescendant"]).toBe("test-combobox-content-option-vue");
  });
});

// ---------------------------------------------------------------------------
// getContentProps
// ---------------------------------------------------------------------------

describe("connectCombobox — getContentProps", () => {
  it("role=listbox", () => {
    const { api } = makeApi();
    expect(api.getContentProps().role).toBe("listbox");
  });

  it("aria-multiselectable=true when multiple", () => {
    const { api } = makeApi({ multiple: true });
    expect(api.getContentProps()["aria-multiselectable"]).toBe(true);
  });

  it("aria-multiselectable undefined when single-select", () => {
    const { api } = makeApi({ multiple: false });
    expect(api.getContentProps()["aria-multiselectable"]).toBeUndefined();
  });

  it("id matches contentId", () => {
    const { api } = makeApi({ contentId: "cb-list" });
    expect(api.getContentProps().id).toBe("cb-list");
  });
});

// ---------------------------------------------------------------------------
// getOptionProps
// ---------------------------------------------------------------------------

describe("connectCombobox — getOptionProps", () => {
  it("role=option", () => {
    const { api } = makeApi();
    expect(api.getOptionProps({ value: "react" }).role).toBe("option");
  });

  // The option id must match the pattern used by aria-activedescendant in
  // getInputProps so assistive technologies can resolve the reference.
  it("id is contentId-option-value (matches aria-activedescendant target)", () => {
    const { api } = makeApi({ contentId: "cb-list" });
    expect(api.getOptionProps({ value: "react" }).id).toBe("cb-list-option-react");
  });

  it("aria-selected=true when value is selected", () => {
    const { api } = makeApi({ value: ["react"] });
    expect(api.getOptionProps({ value: "react" })["aria-selected"]).toBe(true);
  });

  it("aria-selected=false when value is not selected", () => {
    const { api } = makeApi({ value: [] });
    expect(api.getOptionProps({ value: "react" })["aria-selected"]).toBe(false);
  });

  it("onClick sends SELECT_OPTION", () => {
    const { api, send } = makeApi();
    api.getOptionProps({ value: "react" }).onClick();
    expect(send).toHaveBeenCalledWith({ type: "SELECT_OPTION", value: "react" });
  });

  it("onClick does not send when option is disabled", () => {
    const { api, send } = makeApi();
    api.getOptionProps({ value: "react", disabled: true }).onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("data-highlighted when option is highlighted", () => {
    const { api } = makeApi({ highlighted: "react" });
    expect(api.getOptionProps({ value: "react" })["data-highlighted"]).toBe("");
  });

  // WAI-ARIA §3.5: disabled options must expose aria-disabled so AT announces
  // that the option cannot be selected (instead of just ignoring the click).
  it("aria-disabled=true when option is disabled", () => {
    const { api } = makeApi();
    expect(api.getOptionProps({ value: "react", disabled: true })["aria-disabled"]).toBe(true);
  });

  it("aria-disabled absent when option is enabled", () => {
    const { api } = makeApi();
    const props = api.getOptionProps({ value: "react" }) as Record<string, unknown>;
    expect(props["aria-disabled"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getClearTriggerProps
// ---------------------------------------------------------------------------

describe("connectCombobox — getClearTriggerProps", () => {
  it("type=button", () => {
    const { api } = makeApi();
    expect(api.getClearTriggerProps().type).toBe("button");
  });

  // WAI-ARIA: the clear button must have an accessible name so AT can
  // announce its purpose without relying on an icon or visual context.
  it("aria-label=Clear", () => {
    const { api } = makeApi();
    expect(api.getClearTriggerProps()["aria-label"]).toBe("Clear");
  });

  it("onClick sends CLEAR when not disabled", () => {
    const { api, send } = makeApi();
    api.getClearTriggerProps().onClick();
    expect(send).toHaveBeenCalledWith("CLEAR");
  });
});

// ---------------------------------------------------------------------------
// getInputProps — onKeydown (keyboard navigation)
// Note: the handler name is `onKeydown` (lowercase d), not `onKeyDown`.
// ---------------------------------------------------------------------------

describe("connectCombobox — onKeydown keyboard interactions", () => {
  function fire(api: ReturnType<typeof connectCombobox>, key: string) {
    const e = { key, preventDefault: vi.fn() } as unknown as KeyboardEvent;
    api.getInputProps().onKeydown(e);
    return e;
  }

  it("ArrowDown when closed sends OPEN", () => {
    const { api, send } = makeApi({}, "closed");
    fire(api, "ArrowDown");
    expect(send).toHaveBeenCalledWith("OPEN");
  });

  it("ArrowDown when open and no highlight sends HIGHLIGHT_FIRST", () => {
    const { api, send } = makeApi({ highlighted: null }, "open");
    fire(api, "ArrowDown");
    expect(send).toHaveBeenCalledWith("HIGHLIGHT_FIRST");
  });

  it("ArrowDown when open and highlighted sends HIGHLIGHT_NEXT", () => {
    const { api, send } = makeApi({ highlighted: "react" }, "open");
    fire(api, "ArrowDown");
    expect(send).toHaveBeenCalledWith("HIGHLIGHT_NEXT");
  });

  it("ArrowUp when closed sends OPEN", () => {
    const { api, send } = makeApi({}, "closed");
    fire(api, "ArrowUp");
    expect(send).toHaveBeenCalledWith("OPEN");
  });

  it("ArrowUp when open and no highlight sends HIGHLIGHT_LAST", () => {
    const { api, send } = makeApi({ highlighted: null }, "open");
    fire(api, "ArrowUp");
    expect(send).toHaveBeenCalledWith("HIGHLIGHT_LAST");
  });

  it("ArrowUp when open and highlighted sends HIGHLIGHT_PREV", () => {
    const { api, send } = makeApi({ highlighted: "vue" }, "open");
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

  it("Home when closed does nothing", () => {
    const { api, send } = makeApi({}, "closed");
    fire(api, "Home");
    expect(send).not.toHaveBeenCalled();
  });

  it("Enter when open with highlighted sends SELECT_HIGHLIGHTED then CLOSE (single-select)", () => {
    const { api, send } = makeApi({ highlighted: "react", multiple: false }, "open");
    fire(api, "Enter");
    expect(send).toHaveBeenCalledWith("SELECT_HIGHLIGHTED");
    expect(send).toHaveBeenCalledWith("CLOSE");
  });

  it("Enter when open with highlighted does NOT send CLOSE in multi-select", () => {
    const { api, send } = makeApi({ highlighted: "react", multiple: true }, "open");
    fire(api, "Enter");
    expect(send).toHaveBeenCalledWith("SELECT_HIGHLIGHTED");
    expect(send).not.toHaveBeenCalledWith("CLOSE");
  });

  it("Enter when open but nothing highlighted does nothing", () => {
    const { api, send } = makeApi({ highlighted: null }, "open");
    fire(api, "Enter");
    expect(send).not.toHaveBeenCalled();
  });

  it("Escape when open sends CLOSE", () => {
    const { api, send } = makeApi({}, "open");
    fire(api, "Escape");
    expect(send).toHaveBeenCalledWith("CLOSE");
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

  it("readOnly: ArrowDown does nothing", () => {
    const { api, send } = makeApi({ readOnly: true }, "closed");
    fire(api, "ArrowDown");
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// value / valueLabel
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// getPositionerProps
// ---------------------------------------------------------------------------

describe("connectCombobox — getPositionerProps", () => {
  it("data-forge-part=positioner", () => {
    const { api } = makeApi();
    expect(api.getPositionerProps()["data-forge-part"]).toBe("positioner");
  });

  it("style.top reflects y coordinate", () => {
    const { api } = makeApi({ y: 88 });
    expect(api.getPositionerProps().style.top).toBe("88px");
  });

  it("style.left reflects x coordinate", () => {
    const { api } = makeApi({ x: 44 });
    expect(api.getPositionerProps().style.left).toBe("44px");
  });
});

// ---------------------------------------------------------------------------
// getTriggerProps (toggle button)
// ---------------------------------------------------------------------------

describe("connectCombobox — getTriggerProps", () => {
  it("tabIndex=-1 (not in tab order)", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps().tabIndex).toBe(-1);
  });

  it("aria-label=Open when closed", () => {
    const { api } = makeApi({}, "closed");
    expect(api.getTriggerProps()["aria-label"]).toBe("Open");
  });

  it("aria-label=Close when open", () => {
    const { api } = makeApi({}, "open");
    expect(api.getTriggerProps()["aria-label"]).toBe("Close");
  });

  it("onClick when closed sends OPEN", () => {
    const { api, send } = makeApi({}, "closed");
    api.getTriggerProps().onClick();
    expect(send).toHaveBeenCalledWith("OPEN");
  });

  it("onClick when open sends CLOSE", () => {
    const { api, send } = makeApi({}, "open");
    api.getTriggerProps().onClick();
    expect(send).toHaveBeenCalledWith("CLOSE");
  });

  it("disabled: onClick does nothing", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getTriggerProps().onClick();
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getOptionProps — mouse events
// ---------------------------------------------------------------------------

describe("connectCombobox — getOptionProps mouse events", () => {
  it("onMousemove highlights non-disabled, non-highlighted option", () => {
    const { api, send } = makeApi({ highlighted: null }, "open");
    api.getOptionProps({ value: "react" }).onMousemove();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_OPTION", value: "react" });
  });

  it("onMousemove on already-highlighted option does nothing", () => {
    const { api, send } = makeApi({ highlighted: "react" }, "open");
    api.getOptionProps({ value: "react" }).onMousemove();
    expect(send).not.toHaveBeenCalled();
  });

  it("onMousemove on disabled option does nothing", () => {
    const { api, send } = makeApi({ highlighted: null }, "open");
    api.getOptionProps({ value: "react", disabled: true }).onMousemove();
    expect(send).not.toHaveBeenCalled();
  });

  it("onMouseleave clears highlight (value=null)", () => {
    const { api, send } = makeApi({ highlighted: "react" }, "open");
    api.getOptionProps({ value: "react" }).onMouseleave();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_OPTION", value: null });
  });
});

// ---------------------------------------------------------------------------
// getCreateOptionProps
// ---------------------------------------------------------------------------

describe("connectCombobox — getCreateOptionProps", () => {
  it("role=option", () => {
    const { api } = makeApi();
    expect(api.getCreateOptionProps().role).toBe("option");
  });

  it("aria-selected=false (never pre-selected)", () => {
    const { api } = makeApi();
    expect(api.getCreateOptionProps()["aria-selected"]).toBe(false);
  });

  it("onClick sends CREATE_OPTION", () => {
    const { api, send } = makeApi();
    api.getCreateOptionProps().onClick();
    expect(send).toHaveBeenCalledWith({ type: "CREATE_OPTION" });
  });
});

// ---------------------------------------------------------------------------
// value and valueLabel
// ---------------------------------------------------------------------------

describe("connectCombobox — value and valueLabel", () => {
  it("value is empty array when nothing selected", () => {
    const { api } = makeApi();
    expect(api.value).toEqual([]);
  });

  it("valueLabel is empty string when nothing selected", () => {
    const { api } = makeApi();
    expect(api.valueLabel).toBe("");
  });

  it("valueLabel is resolved from options label", () => {
    const { api } = makeApi({ value: ["react"], options: OPTIONS });
    expect(api.valueLabel).toBe("React");
  });
});
