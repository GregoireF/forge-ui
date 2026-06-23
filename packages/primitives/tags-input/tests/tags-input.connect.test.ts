import { describe, expect, it, vi } from "vitest";
import { connectTagsInput } from "../src/tags-input.connect.js";
import type { TagsInputContext, TagsInputState } from "../src/tags-input.types.js";
import { defaultTagsInputTranslations } from "../src/tags-input.types.js";

function makeCtx(overrides: Partial<TagsInputContext> = {}): TagsInputContext {
  return {
    id: "test-tags",
    inputId: "test-tags-input",
    labelId: "test-tags-label",
    value: [],
    inputValue: "",
    disabled: false,
    readOnly: false,
    required: false,
    invalid: false,
    allowDuplicates: false,
    translations: defaultTagsInputTranslations,
    ...overrides,
  };
}

function makeSnapshot(ctx: TagsInputContext, state: TagsInputState = "idle") {
  return { value: state, context: ctx, matches: (s: string) => s === state };
}

function makeApi(overrides: Partial<TagsInputContext> = {}, state: TagsInputState = "idle") {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  return { api: connectTagsInput(makeSnapshot(ctx, state), send, machine), send };
}

// ---------------------------------------------------------------------------
// value / derived state
// ---------------------------------------------------------------------------

describe("connectTagsInput — value", () => {
  it("exposes current value array", () => {
    const { api } = makeApi({ value: ["a", "b"] });
    expect(api.value).toEqual(["a", "b"]);
  });

  it("isEmpty=true when value is empty", () => {
    const { api } = makeApi({ value: [] });
    expect(api.isEmpty).toBe(true);
  });

  it("isEmpty=false when value has items", () => {
    const { api } = makeApi({ value: ["x"] });
    expect(api.isEmpty).toBe(false);
  });

  it("canAddMore=true when under maxTags", () => {
    const { api } = makeApi({ value: ["a"], maxTags: 3 });
    expect(api.canAddMore).toBe(true);
  });

  it("canAddMore=false when at maxTags", () => {
    const { api } = makeApi({ value: ["a", "b", "c"], maxTags: 3 });
    expect(api.canAddMore).toBe(false);
  });

  it("canAddMore=true when maxTags is undefined", () => {
    const { api } = makeApi({ value: ["a", "b", "c"] });
    expect(api.canAddMore).toBe(true);
  });

  it("isFocused=true when state=focused", () => {
    const { api } = makeApi({}, "focused");
    expect(api.isFocused).toBe(true);
  });

  it("isFocused=false when state=idle", () => {
    const { api } = makeApi({}, "idle");
    expect(api.isFocused).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getRootProps
// ---------------------------------------------------------------------------

describe("connectTagsInput — getRootProps", () => {
  it("data-forge-scope=tags-input", () => {
    const { api } = makeApi();
    expect(api.getRootProps()["data-forge-scope"]).toBe("tags-input");
  });

  it("data-focused when focused", () => {
    const { api } = makeApi({}, "focused");
    expect(api.getRootProps()["data-focused"]).toBe("");
  });

  it("no data-focused when idle", () => {
    const { api } = makeApi({}, "idle");
    expect(api.getRootProps()["data-focused"]).toBeUndefined();
  });

  it("data-disabled when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getRootProps()["data-disabled"]).toBe("");
  });

  it("data-readonly when readOnly", () => {
    const { api } = makeApi({ readOnly: true });
    expect(api.getRootProps()["data-readonly"]).toBe("");
  });

  it("no data-readonly when not readOnly", () => {
    const { api } = makeApi({ readOnly: false });
    expect(api.getRootProps()["data-readonly"]).toBeUndefined();
  });

  it("data-invalid when invalid", () => {
    expect(makeApi({ invalid: true }).api.getRootProps()["data-invalid"]).toBe("");
  });

  it("no data-invalid when not invalid", () => {
    expect(makeApi({ invalid: false }).api.getRootProps()["data-invalid"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getInputProps
// ---------------------------------------------------------------------------

describe("connectTagsInput — getInputProps", () => {
  it("type=text", () => {
    const { api } = makeApi();
    expect(api.getInputProps().type).toBe("text");
  });

  it("id matches context inputId", () => {
    const { api } = makeApi({ inputId: "my-input" });
    expect(api.getInputProps().id).toBe("my-input");
  });

  it("readOnly=true sets readOnly attribute on input", () => {
    const { api } = makeApi({ readOnly: true });
    expect(api.getInputProps().readOnly).toBe(true);
  });

  it("readOnly=false does NOT set readOnly attribute", () => {
    const { api } = makeApi({ readOnly: false });
    expect((api.getInputProps() as Record<string, unknown>).readOnly).toBeUndefined();
  });

  it("disabled=true sets disabled attribute on input (line 52)", () => {
    const { api } = makeApi({ disabled: true });
    expect((api.getInputProps() as Record<string, unknown>).disabled).toBe(true);
  });

  it("disabled=false does NOT set disabled attribute", () => {
    const { api } = makeApi({ disabled: false });
    expect((api.getInputProps() as Record<string, unknown>).disabled).toBeUndefined();
  });

  // WAI-ARIA: the input must be labelled so AT can announce what the field is.
  it("aria-labelledby points to the label id", () => {
    const { api } = makeApi({ labelId: "my-label" });
    expect(api.getInputProps()["aria-labelledby"]).toBe("my-label");
  });

  it("aria-invalid=true when invalid", () => {
    expect(makeApi({ invalid: true }).api.getInputProps()["aria-invalid"]).toBe(true);
  });

  it("aria-invalid absent when not invalid", () => {
    expect((makeApi({ invalid: false }).api.getInputProps() as Record<string, unknown>)["aria-invalid"]).toBeUndefined();
  });

  it("aria-required=true when required", () => {
    expect(makeApi({ required: true }).api.getInputProps()["aria-required"]).toBe(true);
  });

  it("onKeyDown Enter sends ADD_TAG", () => {
    const { api, send } = makeApi();
    const e = { key: "Enter", preventDefault: vi.fn(), target: { value: "newtag" } as HTMLInputElement };
    api.getInputProps().onKeyDown(e as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "ADD_TAG" });
  });

  it("onKeyDown Backspace on empty input sends REMOVE_LAST_TAG", () => {
    const { api, send } = makeApi({ inputValue: "" });
    const e = { key: "Backspace", preventDefault: vi.fn(), target: { value: "" } as HTMLInputElement };
    api.getInputProps().onKeyDown(e as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "REMOVE_LAST_TAG" });
  });

  it("onKeyDown Backspace with text in input does NOT send REMOVE_LAST_TAG", () => {
    const { api, send } = makeApi();
    const e = { key: "Backspace", preventDefault: vi.fn(), target: { value: "abc" } as HTMLInputElement };
    api.getInputProps().onKeyDown(e as unknown as KeyboardEvent);
    expect(send).not.toHaveBeenCalledWith({ type: "REMOVE_LAST_TAG" });
  });

  it("onKeyDown delimiter key sends ADD_TAG", () => {
    const { api, send } = makeApi({ delimiter: "," });
    const e = { key: ",", preventDefault: vi.fn(), target: { value: "mytag," } as HTMLInputElement };
    api.getInputProps().onKeyDown(e as unknown as KeyboardEvent);
    expect(send).toHaveBeenCalledWith({ type: "ADD_TAG" });
  });

  // onFocus / onBlur lifecycle events
  it("onFocus sends FOCUS", () => {
    const { api, send } = makeApi();
    api.getInputProps().onFocus();
    expect(send).toHaveBeenCalledWith({ type: "FOCUS" });
  });

  it("onBlur with text in input sends ADD_TAG then BLUR", () => {
    const { api, send } = makeApi();
    const e = { target: { value: "mytag" } as HTMLInputElement } as FocusEvent;
    api.getInputProps().onBlur(e);
    expect(send).toHaveBeenCalledWith({ type: "ADD_TAG" });
    expect(send).toHaveBeenCalledWith({ type: "BLUR" });
  });

  it("onBlur with empty input sends only BLUR (no ADD_TAG)", () => {
    const { api, send } = makeApi();
    const e = { target: { value: "" } as HTMLInputElement } as FocusEvent;
    api.getInputProps().onBlur(e);
    expect(send).not.toHaveBeenCalledWith({ type: "ADD_TAG" });
    expect(send).toHaveBeenCalledWith({ type: "BLUR" });
  });

  it("onInput sends INPUT_CHANGE with the current input value", () => {
    const { api, send } = makeApi();
    const e = { target: { value: "typed text" } as HTMLInputElement } as Event;
    (api.getInputProps() as Record<string, (e: Event) => void>)["onInput"](e);
    expect(send).toHaveBeenCalledWith({ type: "INPUT_CHANGE", value: "typed text" });
  });
});

// ---------------------------------------------------------------------------
// getTagProps
// ---------------------------------------------------------------------------

describe("connectTagsInput — getTagProps", () => {
  it("data-forge-scope=tags-input", () => {
    const { api } = makeApi();
    expect(api.getTagProps("x")["data-forge-scope"]).toBe("tags-input");
  });

  it("data-forge-part=tag", () => {
    const { api } = makeApi();
    expect(api.getTagProps("x")["data-forge-part"]).toBe("tag");
  });

  it("aria-label matches tag value", () => {
    const { api } = makeApi();
    expect(api.getTagProps("TypeScript")["aria-label"]).toBe("TypeScript");
  });

  it("data-value reflects tag value", () => {
    const { api } = makeApi();
    expect(api.getTagProps("hello")["data-value"]).toBe("hello");
  });
});

// ---------------------------------------------------------------------------
// getTagDeleteProps
// ---------------------------------------------------------------------------

describe("connectTagsInput — getTagDeleteProps", () => {
  it("type=button", () => {
    const { api } = makeApi();
    expect(api.getTagDeleteProps("x").type).toBe("button");
  });

  it("onClick sends REMOVE_TAG", () => {
    const { api, send } = makeApi();
    api.getTagDeleteProps("x").onClick();
    expect(send).toHaveBeenCalledWith({ type: "REMOVE_TAG", value: "x" });
  });

  // WAI-ARIA: the delete button must have an accessible name containing the tag value
  // so screen readers announce which tag will be deleted ("Remove TypeScript").
  it("aria-label default (EN): 'Remove <value>'", () => {
    const { api } = makeApi();
    expect(api.getTagDeleteProps("TypeScript")["aria-label"]).toBe("Remove TypeScript");
  });

  it("aria-label uses custom deleteTag translation", () => {
    const { api } = makeApi({
      translations: { deleteTag: (v) => `Supprimer ${v}` },
    });
    expect(api.getTagDeleteProps("TypeScript")["aria-label"]).toBe("Supprimer TypeScript");
  });
});

// ---------------------------------------------------------------------------
// getLabelProps
// ---------------------------------------------------------------------------

describe("connectTagsInput — getLabelProps", () => {
  it("htmlFor matches inputId", () => {
    const { api } = makeApi({ inputId: "the-input", labelId: "the-label" });
    expect(api.getLabelProps().id).toBe("the-label");
    expect(api.getLabelProps().htmlFor).toBe("the-input");
  });
});

// ---------------------------------------------------------------------------
// getHiddenInputProps (form integration)
// ---------------------------------------------------------------------------

describe("connectTagsInput — getHiddenInputProps", () => {
  it("type=hidden", () => {
    expect(makeApi().api.getHiddenInputProps().type).toBe("hidden");
  });

  it("aria-hidden=true (not exposed to a11y tree)", () => {
    expect(makeApi().api.getHiddenInputProps()["aria-hidden"]).toBe(true);
  });

  it("name equals the context id", () => {
    const { api } = makeApi({ id: "my-tags" });
    expect(api.getHiddenInputProps().name).toBe("my-tags");
  });

  it("value is comma-joined tags", () => {
    const { api } = makeApi({ value: ["react", "vue", "angular"] });
    expect(api.getHiddenInputProps().value).toBe("react,vue,angular");
  });

  it("value is empty string when no tags", () => {
    expect(makeApi({ value: [] }).api.getHiddenInputProps().value).toBe("");
  });
});

// ---------------------------------------------------------------------------
// getLiveRegionProps (WAI-ARIA live announcer)
// ---------------------------------------------------------------------------

describe("connectTagsInput — getLiveRegionProps", () => {
  // WAI-ARIA: a polite live region lets AT announce tag add/remove without
  // interrupting the user. The framework layer sets the text content
  // imperatively when api.value changes (add → "X added", remove → "X removed").
  it("role=status", () => {
    expect(makeApi().api.getLiveRegionProps().role).toBe("status");
  });

  it("aria-live=polite (non-interrupting)", () => {
    expect(makeApi().api.getLiveRegionProps()["aria-live"]).toBe("polite");
  });

  it("aria-atomic=true (read the full message)", () => {
    expect(makeApi().api.getLiveRegionProps()["aria-atomic"]).toBe(true);
  });

  it("data-forge-part=live-region", () => {
    expect(makeApi().api.getLiveRegionProps()["data-forge-part"]).toBe("live-region");
  });
});
