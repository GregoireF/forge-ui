import { describe, expect, it, vi } from "vitest";
import { connectCombobox } from "../src/combobox.connect.js";
import type { ComboboxContext, ComboboxOption, ComboboxState } from "../src/combobox.types.js";
import { defaultComboboxTranslations } from "../src/combobox.types.js";

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
    translations: defaultComboboxTranslations,
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
  it("aria-label default (EN): 'Clear'", () => {
    const { api } = makeApi();
    expect(api.getClearTriggerProps()["aria-label"]).toBe("Clear");
  });

  it("aria-label uses custom clear translation", () => {
    const { api } = makeApi({ translations: { ...defaultComboboxTranslations, clear: "Effacer" } });
    expect(api.getClearTriggerProps()["aria-label"]).toBe("Effacer");
  });

  it("onClick sends CLEAR when not disabled", () => {
    const { api, send } = makeApi();
    api.getClearTriggerProps().onClick();
    expect(send).toHaveBeenCalledWith("CLEAR");
  });

  it("onClick does NOT send CLEAR when disabled (line 222)", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getClearTriggerProps().onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("onClick does NOT send CLEAR when readOnly (line 222)", () => {
    const { api, send } = makeApi({ readOnly: true });
    api.getClearTriggerProps().onClick();
    expect(send).not.toHaveBeenCalled();
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

  it("End when closed does nothing (guard isOpen=false, line 129)", () => {
    const { api, send } = makeApi({}, "closed");
    fire(api, "End");
    expect(send).not.toHaveBeenCalled();
  });

  it("Tab when closed does nothing (guard isOpen=false, line 145)", () => {
    const { api, send } = makeApi({}, "closed");
    fire(api, "Tab");
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

  it("aria-label default (EN): 'Open' when closed", () => {
    const { api } = makeApi({}, "closed");
    expect(api.getTriggerProps()["aria-label"]).toBe("Open");
  });

  it("aria-label default (EN): 'Close' when open", () => {
    const { api } = makeApi({}, "open");
    expect(api.getTriggerProps()["aria-label"]).toBe("Close");
  });

  it("aria-label uses custom open/close translations", () => {
    const translations = { ...defaultComboboxTranslations, open: "Ouvrir", close: "Fermer" };
    expect(makeApi({ translations }, "closed").api.getTriggerProps()["aria-label"]).toBe("Ouvrir");
    expect(makeApi({ translations }, "open").api.getTriggerProps()["aria-label"]).toBe("Fermer");
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

  // WHY: getOptionProps.onClick has its own `if (!context.multiple) send("CLOSE")` guard
  // (line 209) — separate from the keyboard handler. Multiple=true means the dropdown
  // stays open after clicking an option.
  it("onClick with multiple=true sends SELECT_OPTION but NOT CLOSE (line 209)", () => {
    const { api, send } = makeApi({ multiple: true }, "open");
    api.getOptionProps({ value: "react" }).onClick();
    expect(send).toHaveBeenCalledWith({ type: "SELECT_OPTION", value: "react" });
    expect(send).not.toHaveBeenCalledWith("CLOSE");
  });

  it("onClick with multiple=false sends SELECT_OPTION then CLOSE", () => {
    const { api, send } = makeApi({ multiple: false }, "open");
    api.getOptionProps({ value: "react" }).onClick();
    expect(send).toHaveBeenCalledWith({ type: "SELECT_OPTION", value: "react" });
    expect(send).toHaveBeenCalledWith("CLOSE");
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

  // WHY: When value[0] is not present in the options list (e.g. async options not yet
  // loaded, or a stale value), the optional-chain `?.label` returns undefined →
  // nullish-coalescing fallback is the raw value string (line 47).
  it("valueLabel falls back to raw value when option not found in options (line 47)", () => {
    const { api } = makeApi({ value: ["unknown-framework"], options: OPTIONS });
    expect(api.valueLabel).toBe("unknown-framework");
  });

  // WHY: valueLabels (lines 49-50) is only computed when value is non-empty;
  // the inner map lambda is never invoked when value=[].
  it("valueLabels resolves labels for each selected value (lines 49-50)", () => {
    const { api } = makeApi({
      value: ["react", "vue"],
      options: OPTIONS,
      selectedLabels: {},
    });
    expect(api.valueLabels).toEqual(["React", "Vue"]);
  });

  it("valueLabels prefers selectedLabels map over options lookup", () => {
    const { api } = makeApi({
      value: ["react"],
      options: OPTIONS,
      selectedLabels: { react: "React (cached)" },
    });
    expect(api.valueLabels).toEqual(["React (cached)"]);
  });

  it("valueLabels falls back to raw value when not in selectedLabels or options", () => {
    const { api } = makeApi({
      value: ["ghost"],
      options: OPTIONS,
      selectedLabels: {},
    });
    expect(api.valueLabels).toEqual(["ghost"]);
  });
});

// ---------------------------------------------------------------------------
// getInputProps — placeholder in multi-select mode (line 92)
// ---------------------------------------------------------------------------

describe("connectCombobox — getInputProps placeholder (multiple mode)", () => {
  it("shows selected value labels as placeholder when multiple=true, closed, and has values (line 92)", () => {
    const { api } = makeApi(
      { multiple: true, value: ["react", "vue"], options: OPTIONS, selectedLabels: {} },
      "closed",
    );
    expect(api.getInputProps().placeholder).toBe("React, Vue");
  });

  it("shows default placeholder when multiple=true but no values selected", () => {
    const { api } = makeApi({ multiple: true, value: [], placeholder: "Pick..." }, "closed");
    expect(api.getInputProps().placeholder).toBe("Pick...");
  });

  it("shows default placeholder when multiple=true, has values, but is open (input editable)", () => {
    const { api } = makeApi(
      {
        multiple: true,
        value: ["react"],
        options: OPTIONS,
        selectedLabels: {},
        placeholder: "Search...",
      },
      "open",
    );
    expect(api.getInputProps().placeholder).toBe("Search...");
  });
});

// ---------------------------------------------------------------------------
// getInputProps — onInput handler + ref callback
//
// WHY: The onInput handler is the Vue-native path for controlled input updates
// (Vue fires the native `input` DOM event, not React's synthetic `onChange`).
// The ref callback registers the input element so the machine can measure it.
// Both were systematically uncovered because connect tests only exercised
// the camelCase onKeyDown path and static ARIA attributes.
// ---------------------------------------------------------------------------

describe("connectCombobox — getInputProps onInput handler", () => {
  it("onInput sends INPUT_CHANGE with the current input value", () => {
    const { api, send } = makeApi();
    const e = { target: { value: "typescript" } as HTMLInputElement } as Event;
    (api.getInputProps() as Record<string, (e: Event) => void>)["onInput"](e);
    expect(send).toHaveBeenCalledWith({ type: "INPUT_CHANGE", value: "typescript" });
  });

  it("onInput when disabled does nothing", () => {
    const { api, send } = makeApi({ disabled: true });
    const e = { target: { value: "x" } as HTMLInputElement } as Event;
    (api.getInputProps() as Record<string, (e: Event) => void>)["onInput"](e);
    expect(send).not.toHaveBeenCalled();
  });

  it("onInput when readOnly does nothing", () => {
    const { api, send } = makeApi({ readOnly: true });
    const e = { target: { value: "x" } as HTMLInputElement } as Event;
    (api.getInputProps() as Record<string, (e: Event) => void>)["onInput"](e);
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// ref callbacks — getInputProps, getContentProps, getTriggerProps
//
// WHY: ref callbacks (arrow functions on the returned prop object) register DOM
// elements on the machine so activities like computePosition and watchOutside
// can access them. These lines are only executed when the framework calls the
// ref function — never reached by static prop-getter tests alone.
// ---------------------------------------------------------------------------

describe("connectCombobox — ref callbacks", () => {
  it("getInputProps ref registers triggerEl on machine", () => {
    const ctx = makeCtx();
    const send = vi.fn();
    const machine = { setContext: vi.fn() };
    const api = connectCombobox(makeSnapshot(ctx), send, machine);
    const el = document.createElement("input");
    (api.getInputProps() as Record<string, (el: HTMLElement) => void>)["ref"](el);
    expect(machine.setContext).toHaveBeenCalledWith({ triggerEl: el });
  });

  it("getContentProps ref registers contentEl on machine", () => {
    const ctx = makeCtx();
    const send = vi.fn();
    const machine = { setContext: vi.fn() };
    const api = connectCombobox(makeSnapshot(ctx), send, machine);
    const el = document.createElement("div");
    (api.getContentProps() as Record<string, (el: HTMLElement) => void>)["ref"](el);
    expect(machine.setContext).toHaveBeenCalledWith({ contentEl: el });
  });

  it("getTriggerProps ref registers buttonEl on machine", () => {
    const ctx = makeCtx();
    const send = vi.fn();
    const machine = { setContext: vi.fn() };
    const api = connectCombobox(makeSnapshot(ctx), send, machine);
    const el = document.createElement("button");
    (api.getTriggerProps() as Record<string, (el: HTMLElement) => void>)["ref"](el);
    expect(machine.setContext).toHaveBeenCalledWith({ buttonEl: el });
  });
});

// ---------------------------------------------------------------------------
// aria-busy on listbox content (WAI-ARIA combobox pattern — server-side mode)
// WHY: When onInputChange is provided (server-side filtering), the listbox may
// be empty while results load. aria-busy signals AT to wait before reading the
// list. Radix Combobox has no such affordance; forge-ui explicitly supports it.
// ---------------------------------------------------------------------------

describe("connectCombobox — aria-busy on listbox", () => {
  it("aria-busy absent when isLoading is not set (default)", () => {
    const { api } = makeApi({}, "open");
    const props = api.getContentProps() as Record<string, unknown>;
    expect(props["aria-busy"]).toBeUndefined();
  });

  it("aria-busy absent when isLoading=false", () => {
    const { api } = makeApi({ isLoading: false }, "open");
    const props = api.getContentProps() as Record<string, unknown>;
    expect(props["aria-busy"]).toBeUndefined();
  });

  it("aria-busy=true when isLoading=true", () => {
    const { api } = makeApi({ isLoading: true }, "open");
    const props = api.getContentProps() as Record<string, unknown>;
    expect(props["aria-busy"]).toBe(true);
  });
});
