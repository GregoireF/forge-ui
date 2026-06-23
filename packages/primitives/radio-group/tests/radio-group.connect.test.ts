import { describe, expect, it, vi } from "vitest";
import { connectRadioGroup } from "../src/radio-group.connect.js";
import type { RadioGroupContext } from "../src/radio-group.types.js";

function makeCtx(overrides: Partial<RadioGroupContext> = {}): RadioGroupContext {
  return {
    value: undefined,
    disabled: false,
    required: false,
    orientation: "vertical",
    name: "my-radio",
    ...overrides,
  };
}

function makeSnapshot(ctx: RadioGroupContext) {
  return { value: "idle" as const, context: ctx, matches: (s: string) => s === "idle" };
}

function makeApi(overrides: Partial<RadioGroupContext> = {}) {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  return { api: connectRadioGroup(makeSnapshot(ctx), send, machine), send };
}

// ---------------------------------------------------------------------------
// getRootProps
// ---------------------------------------------------------------------------

describe("connectRadioGroup — getRootProps", () => {
  it("role=radiogroup", () => {
    const { api } = makeApi();
    expect(api.getRootProps().role).toBe("radiogroup");
  });

  it("data-forge-scope=radio-group", () => {
    const { api } = makeApi();
    expect(api.getRootProps()["data-forge-scope"]).toBe("radio-group");
  });

  it("data-disabled when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getRootProps()["data-disabled"]).toBe("");
  });

  it("aria-required when required", () => {
    const { api } = makeApi({ required: true });
    expect(api.getRootProps()["aria-required"]).toBe(true);
  });

  it("data-orientation reflects orientation", () => {
    const { api } = makeApi({ orientation: "horizontal" });
    expect(api.getRootProps()["data-orientation"]).toBe("horizontal");
  });

  // WAI-ARIA §6.3.2: aria-orientation tells AT the axis of navigation
  // so arrow key announcements match the physical layout.
  it("aria-orientation reflects orientation", () => {
    const { api } = makeApi({ orientation: "vertical" });
    expect(api.getRootProps()["aria-orientation"]).toBe("vertical");
  });

  it("aria-orientation=horizontal by default", () => {
    const { api } = makeApi({ orientation: "horizontal" });
    expect(api.getRootProps()["aria-orientation"]).toBe("horizontal");
  });
});

// ---------------------------------------------------------------------------
// getItemProps
// ---------------------------------------------------------------------------

describe("connectRadioGroup — getItemProps", () => {
  it("data-state=checked when item is selected", () => {
    const { api } = makeApi({ value: "a" });
    expect(api.getItemProps("a")["data-state"]).toBe("checked");
  });

  it("data-state=unchecked when item is not selected", () => {
    const { api } = makeApi({ value: "a" });
    expect(api.getItemProps("b")["data-state"]).toBe("unchecked");
  });

  it("data-disabled present when item is per-item disabled", () => {
    const { api } = makeApi();
    expect(api.getItemProps("a", true)["data-disabled"]).toBe("");
  });

  it("data-disabled absent when item is enabled", () => {
    const { api } = makeApi();
    expect(api.getItemProps("a", false)["data-disabled"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getRadioProps
// ---------------------------------------------------------------------------

describe("connectRadioGroup — getRadioProps", () => {
  it("role=radio", () => {
    const { api } = makeApi();
    expect(api.getRadioProps("a").role).toBe("radio");
  });

  it("aria-checked=true when item is selected", () => {
    const { api } = makeApi({ value: "a" });
    expect(api.getRadioProps("a")["aria-checked"]).toBe(true);
  });

  it("aria-checked=false when item is not selected", () => {
    const { api } = makeApi({ value: "b" });
    expect(api.getRadioProps("a")["aria-checked"]).toBe(false);
  });

  it("tabIndex=0 for checked item (roving tabIndex)", () => {
    const { api } = makeApi({ value: "a" });
    expect(api.getRadioProps("a").tabIndex).toBe(0);
  });

  it("tabIndex=-1 for unchecked item", () => {
    const { api } = makeApi({ value: "b" });
    expect(api.getRadioProps("a").tabIndex).toBe(-1);
  });

  it("id follows forge naming convention", () => {
    const { api } = makeApi();
    expect(api.getRadioProps("x").id).toBe("forge-radio-x");
  });

  it("onClick sends SELECT when enabled", () => {
    const { api, send } = makeApi();
    api.getRadioProps("a").onClick();
    expect(send).toHaveBeenCalledWith({ type: "SELECT", value: "a" });
  });

  it("onClick does not send when group disabled", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getRadioProps("a").onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("onClick does not send when item disabled", () => {
    const { api, send } = makeApi();
    api.getRadioProps("a", true).onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("aria-disabled when item disabled", () => {
    const { api } = makeApi();
    expect(api.getRadioProps("a", true)["aria-disabled"]).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getLabelProps
// ---------------------------------------------------------------------------

describe("connectRadioGroup — getLabelProps", () => {
  it("htmlFor matches radio id", () => {
    const { api } = makeApi();
    expect(api.getLabelProps("x").htmlFor).toBe("forge-radio-x");
  });

  it("data-state=checked when value matches", () => {
    const { api } = makeApi({ value: "x" });
    expect(api.getLabelProps("x")["data-state"]).toBe("checked");
  });
});

// ---------------------------------------------------------------------------
// getHiddenInputProps
// ---------------------------------------------------------------------------

describe("connectRadioGroup — getHiddenInputProps", () => {
  it("type=radio", () => {
    const { api } = makeApi();
    expect(api.getHiddenInputProps("a").type).toBe("radio");
  });

  it("aria-hidden=true", () => {
    const { api } = makeApi();
    expect(api.getHiddenInputProps("a")["aria-hidden"]).toBe(true);
  });

  it("checked=true when item is selected", () => {
    const { api } = makeApi({ value: "a" });
    expect(api.getHiddenInputProps("a").checked).toBe(true);
  });

  it("name reflects group name", () => {
    const { api } = makeApi({ name: "choice" });
    expect(api.getHiddenInputProps("a").name).toBe("choice");
  });

  it("name is undefined when no name set (nullish-coalescing guard)", () => {
    const { api } = makeApi({ name: undefined });
    expect(api.getHiddenInputProps("a").name).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// value / disabled exposure
// ---------------------------------------------------------------------------

describe("connectRadioGroup — value / disabled", () => {
  it("exposes current value", () => {
    const { api } = makeApi({ value: "react" });
    expect(api.value).toBe("react");
  });

  it("exposes disabled state", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.disabled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// onKeyDown — WAI-ARIA §3.18: arrow keys navigate AND select simultaneously
// Uses real DOM because navigateRadioGroup walks closest() / querySelectorAll().
// ---------------------------------------------------------------------------

describe("connectRadioGroup — onKeyDown keyboard navigation", () => {
  function buildDomAndApi(values: string[], contextOverrides: Partial<RadioGroupContext> = {}) {
    const { api, send } = makeApi(contextOverrides);

    const root = document.createElement("div");
    root.setAttribute("data-forge-scope", "radio-group");
    root.setAttribute("data-forge-part", "root");

    const radioEls: HTMLButtonElement[] = values.map((v) => {
      const item = document.createElement("div");
      item.setAttribute("data-forge-part", "item");
      item.setAttribute("data-value", v);

      const radio = document.createElement("button");
      radio.setAttribute("data-forge-part", "radio");
      item.appendChild(radio);
      root.appendChild(item);
      return radio;
    });

    document.body.appendChild(root);

    function keydownOnRadio(index: number, key: string) {
      const e = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      Object.defineProperty(e, "currentTarget", { value: radioEls[index] });
      api.getRadioProps(values[index]).onKeyDown(e);
      return e;
    }

    function cleanup() {
      document.body.removeChild(root);
    }

    return { api, send, radioEls, keydownOnRadio, cleanup };
  }

  it("ArrowDown moves to next and SELECTs it", () => {
    const { send, keydownOnRadio, cleanup } = buildDomAndApi(["a", "b", "c"]);
    keydownOnRadio(0, "ArrowDown");
    expect(send).toHaveBeenCalledWith({ type: "SELECT", value: "b" });
    cleanup();
  });

  it("ArrowRight also moves to next (both axes supported)", () => {
    const { send, keydownOnRadio, cleanup } = buildDomAndApi(["a", "b", "c"]);
    keydownOnRadio(0, "ArrowRight");
    expect(send).toHaveBeenCalledWith({ type: "SELECT", value: "b" });
    cleanup();
  });

  it("ArrowDown wraps from last to first (WAI-ARIA: circular)", () => {
    const { send, keydownOnRadio, cleanup } = buildDomAndApi(["a", "b", "c"]);
    keydownOnRadio(2, "ArrowDown");
    expect(send).toHaveBeenCalledWith({ type: "SELECT", value: "a" });
    cleanup();
  });

  it("ArrowUp moves to previous and SELECTs it", () => {
    const { send, keydownOnRadio, cleanup } = buildDomAndApi(["a", "b", "c"]);
    keydownOnRadio(2, "ArrowUp");
    expect(send).toHaveBeenCalledWith({ type: "SELECT", value: "b" });
    cleanup();
  });

  it("ArrowLeft also moves to previous (both axes supported)", () => {
    const { send, keydownOnRadio, cleanup } = buildDomAndApi(["a", "b", "c"]);
    keydownOnRadio(2, "ArrowLeft");
    expect(send).toHaveBeenCalledWith({ type: "SELECT", value: "b" });
    cleanup();
  });

  it("Space key selects the focused radio", () => {
    const { send, keydownOnRadio, cleanup } = buildDomAndApi(["a", "b"]);
    keydownOnRadio(0, " ");
    expect(send).toHaveBeenCalledWith({ type: "SELECT", value: "a" });
    cleanup();
  });

  it("disabled radio is excluded from navigation (skipped)", () => {
    const { api, send, radioEls, cleanup } = buildDomAndApi(["a", "b", "c"]);
    // Mark the middle radio as disabled in the DOM
    radioEls[1].setAttribute("disabled", "");
    const e = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true });
    Object.defineProperty(e, "currentTarget", { value: radioEls[0] });
    api.getRadioProps("a").onKeyDown(e);
    // Should skip "b" (disabled) and select "c"
    expect(send).toHaveBeenCalledWith({ type: "SELECT", value: "c" });
    cleanup();
  });

  it("onKeyDown: Enter on disabled item does NOT send SELECT (!isItemDisabled guard)", () => {
    const { api, send, radioEls, cleanup } = buildDomAndApi(["a", "b"]);
    const e = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    Object.defineProperty(e, "currentTarget", { value: radioEls[0] });
    api.getRadioProps("a", true).onKeyDown(e);
    expect(send).not.toHaveBeenCalled();
    cleanup();
  });

  // onKeydown (Vue lowercase alias) — same logic, different event name binding
  it("onKeydown (Vue alias): Space selects the focused radio", () => {
    const { api, send, radioEls, cleanup } = buildDomAndApi(["a", "b"]);
    const e = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
    Object.defineProperty(e, "currentTarget", { value: radioEls[0] });
    const props = api.getRadioProps("a") as Record<string, (e: unknown) => void>;
    props["onKeydown"](e);
    expect(send).toHaveBeenCalledWith({ type: "SELECT", value: "a" });
    cleanup();
  });

  it("onKeydown (Vue alias): Enter selects the focused radio", () => {
    const { api, send, radioEls, cleanup } = buildDomAndApi(["a", "b"]);
    const e = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    Object.defineProperty(e, "currentTarget", { value: radioEls[0] });
    const props = api.getRadioProps("a") as Record<string, (e: unknown) => void>;
    props["onKeydown"](e);
    expect(send).toHaveBeenCalledWith({ type: "SELECT", value: "a" });
    cleanup();
  });

  it("onKeydown (Vue alias): Enter on disabled item does NOT send (!isItemDisabled guard)", () => {
    const { api, send, radioEls, cleanup } = buildDomAndApi(["a", "b"]);
    const e = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    Object.defineProperty(e, "currentTarget", { value: radioEls[0] });
    const props = api.getRadioProps("a", true) as Record<string, (e: unknown) => void>;
    props["onKeydown"](e);
    expect(send).not.toHaveBeenCalled();
    cleanup();
  });

  it("onKeydown (Vue alias): ArrowDown navigates (navigateRadioGroup returns true → early return in alias)", () => {
    const { api, send, radioEls, cleanup } = buildDomAndApi(["a", "b", "c"]);
    const e = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true });
    Object.defineProperty(e, "currentTarget", { value: radioEls[0] });
    const props = api.getRadioProps("a") as Record<string, (e: unknown) => void>;
    props["onKeydown"](e);
    // navigateRadioGroup returns true (handled ArrowDown) → early return; SELECT sent via navigateRadioGroup
    expect(send).toHaveBeenCalledWith({ type: "SELECT", value: "b" });
    cleanup();
  });
});

// ---------------------------------------------------------------------------
// navigateRadioGroup branch coverage
//
// WHY: navigateRadioGroup uses closest() and querySelectorAll() to find the
// group root and sibling radios. Unit tests without a matching ancestor expose
// three branches: no-root guard, no-target guard, and missing data-value.
// ---------------------------------------------------------------------------

describe("connectRadioGroup — navigateRadioGroup branch coverage", () => {
  it("ArrowDown when radio has no parent radio-group root: returns true early (no-root guard)", () => {
    const { api, send } = makeApi();

    // Radio NOT inside [data-forge-scope="radio-group"][data-forge-part="root"]
    const radio = document.createElement("button");
    document.body.appendChild(radio);

    const e = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true });
    Object.defineProperty(e, "currentTarget", { value: radio });
    api.getRadioProps("x").onKeyDown(e);

    // navigateRadioGroup returned true without sending (no root found)
    expect(send).not.toHaveBeenCalled();
    radio.remove();
  });

  it("ArrowDown when root has no enabled radios: returns true without SELECT (no-target guard)", () => {
    const { api, send } = makeApi();

    const root = document.createElement("div");
    root.setAttribute("data-forge-scope", "radio-group");
    root.setAttribute("data-forge-part", "root");

    // Radio with disabled attr — excluded from querySelectorAll ':not([disabled])'
    const radio = document.createElement("button");
    radio.setAttribute("data-forge-part", "radio");
    radio.setAttribute("disabled", "");
    root.appendChild(radio);
    document.body.appendChild(root);

    const e = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true });
    Object.defineProperty(e, "currentTarget", { value: radio });
    api.getRadioProps("x").onKeyDown(e);

    expect(send).not.toHaveBeenCalled();
    root.remove();
  });

  it("ArrowDown when target radio has no [data-forge-part=item] parent: does not send SELECT (val guard)", () => {
    const { api, send } = makeApi();

    const root = document.createElement("div");
    root.setAttribute("data-forge-scope", "radio-group");
    root.setAttribute("data-forge-part", "root");

    // Two radios directly in root — NOT wrapped in [data-forge-part="item"]
    const radio1 = document.createElement("button");
    radio1.setAttribute("data-forge-part", "radio");
    const radio2 = document.createElement("button");
    radio2.setAttribute("data-forge-part", "radio");
    root.appendChild(radio1);
    root.appendChild(radio2);
    document.body.appendChild(root);

    const e = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true });
    Object.defineProperty(e, "currentTarget", { value: radio1 });
    api.getRadioProps("x").onKeyDown(e);

    // target found (radio2), focus moved, but closest('[data-forge-part="item"]') = null → no SELECT
    expect(send).not.toHaveBeenCalledWith(expect.objectContaining({ type: "SELECT" }));
    root.remove();
  });
});
