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

  it("disabled when context.disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getInputProps().disabled).toBe(true);
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
});

// ---------------------------------------------------------------------------
// getClearTriggerProps
// ---------------------------------------------------------------------------

describe("connectCombobox — getClearTriggerProps", () => {
  it("type=button", () => {
    const { api } = makeApi();
    expect(api.getClearTriggerProps().type).toBe("button");
  });

  it("onClick sends CLEAR when not disabled", () => {
    const { api, send } = makeApi();
    api.getClearTriggerProps().onClick();
    expect(send).toHaveBeenCalledWith("CLEAR");
  });
});

// ---------------------------------------------------------------------------
// value / valueLabel
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
