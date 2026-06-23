import { describe, expect, it, vi } from "vitest";
import { connectAccordion } from "../src/accordion.connect.js";
import type { AccordionContext } from "../src/accordion.types.js";

function makeCtx(overrides: Partial<AccordionContext> = {}): AccordionContext {
  return {
    value: [],
    type: "single",
    collapsible: false,
    disabled: false,
    ...overrides,
  };
}

function makeSnapshot(ctx: AccordionContext) {
  return { value: "idle" as const, context: ctx, matches: (s: string) => s === "idle" };
}

function makeApi(overrides: Partial<AccordionContext> = {}) {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  return { api: connectAccordion(makeSnapshot(ctx), send, machine), send, ctx };
}

// ---------------------------------------------------------------------------
// getRootProps
// ---------------------------------------------------------------------------

describe("connectAccordion — getRootProps", () => {
  it("has data-forge-scope=accordion and data-forge-part=root", () => {
    const { api } = makeApi();
    expect(api.getRootProps()["data-forge-scope"]).toBe("accordion");
    expect(api.getRootProps()["data-forge-part"]).toBe("root");
  });

  it("sets data-disabled when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getRootProps()["data-disabled"]).toBe("");
  });

  it("does not set data-disabled when enabled", () => {
    const { api } = makeApi();
    expect(api.getRootProps()["data-disabled"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getItemProps
// ---------------------------------------------------------------------------

describe("connectAccordion — getItemProps", () => {
  it("data-state=closed when item not in value", () => {
    const { api } = makeApi({ value: [] });
    expect(api.getItemProps("a")["data-state"]).toBe("closed");
  });

  it("data-state=open when item is in value", () => {
    const { api } = makeApi({ value: ["a"] });
    expect(api.getItemProps("a")["data-state"]).toBe("open");
  });
});

// ---------------------------------------------------------------------------
// getHeaderProps
// ---------------------------------------------------------------------------

describe("connectAccordion — getHeaderProps", () => {
  it("data-forge-part=header", () => {
    const { api } = makeApi();
    expect(api.getHeaderProps("a")["data-forge-part"]).toBe("header");
  });

  it("data-state=closed when item closed", () => {
    const { api } = makeApi({ value: [] });
    expect(api.getHeaderProps("a")["data-state"]).toBe("closed");
  });

  it("data-state=open when item open", () => {
    const { api } = makeApi({ value: ["a"] });
    expect(api.getHeaderProps("a")["data-state"]).toBe("open");
  });
});

// ---------------------------------------------------------------------------
// getTriggerProps
// ---------------------------------------------------------------------------

describe("connectAccordion — getTriggerProps", () => {
  it("aria-expanded=false when item closed", () => {
    const { api } = makeApi({ value: [] });
    expect(api.getTriggerProps("a")["aria-expanded"]).toBe(false);
  });

  it("aria-expanded=true when item open", () => {
    const { api } = makeApi({ value: ["a"] });
    expect(api.getTriggerProps("a")["aria-expanded"]).toBe(true);
  });

  it("aria-controls points to content id", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps("x")["aria-controls"]).toBe("forge-accordion-content-x");
  });

  it("id follows forge naming convention", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps("x").id).toBe("forge-accordion-trigger-x");
  });

  it("onClick sends TOGGLE_ITEM", () => {
    const { api, send } = makeApi();
    api.getTriggerProps("a").onClick();
    expect(send).toHaveBeenCalledWith({ type: "TOGGLE_ITEM", value: "a" });
  });

  // WAI-ARIA: aria-disabled informs AT the trigger cannot be activated,
  // even though it remains focusable (unlike the HTML disabled attribute).
  it("aria-disabled=true when accordion is disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getTriggerProps("a")["aria-disabled"]).toBe(true);
  });

  it("aria-disabled absent when accordion is enabled", () => {
    const { api } = makeApi({ disabled: false });
    const props = api.getTriggerProps("a") as Record<string, unknown>;
    expect(props["aria-disabled"]).toBeUndefined();
  });

  it("disabled: onClick does not send", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getTriggerProps("a").onClick();
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getContentProps
// ---------------------------------------------------------------------------

describe("connectAccordion — getContentProps", () => {
  it("role=region", () => {
    const { api } = makeApi();
    expect(api.getContentProps("a").role).toBe("region");
  });

  it("aria-labelledby points to trigger id", () => {
    const { api } = makeApi();
    expect(api.getContentProps("x")["aria-labelledby"]).toBe("forge-accordion-trigger-x");
  });

  it("data-state=open when item is open", () => {
    const { api } = makeApi({ value: ["x"] });
    expect(api.getContentProps("x")["data-state"]).toBe("open");
  });

  it("data-state=closed when item is closed", () => {
    const { api } = makeApi({ value: [] });
    expect(api.getContentProps("x")["data-state"]).toBe("closed");
  });
});

// ---------------------------------------------------------------------------
// value exposure
// ---------------------------------------------------------------------------

describe("connectAccordion — value", () => {
  it("exposes current value array", () => {
    const { api } = makeApi({ value: ["foo", "bar"] });
    expect(api.value).toEqual(["foo", "bar"]);
  });

  it("is pure — different contexts return independent values", () => {
    const { api: api1 } = makeApi({ value: ["a"] });
    const { api: api2 } = makeApi({ value: ["b"] });
    expect(api1.value).toEqual(["a"]);
    expect(api2.value).toEqual(["b"]);
  });
});

// ---------------------------------------------------------------------------
// onKeyDown — WAI-ARIA §3.1: accordion header keyboard navigation
// Uses a real DOM structure because navigateAccordion walks closest() / querySelectorAll().
// ---------------------------------------------------------------------------

describe("connectAccordion — onKeyDown keyboard navigation", () => {
  function buildDomAndApi(itemValues: string[], contextOverrides: Partial<AccordionContext> = {}) {
    const { api, send } = makeApi(contextOverrides);

    const root = document.createElement("div");
    root.setAttribute("data-forge-scope", "accordion");
    root.setAttribute("data-forge-part", "root");

    const triggerEls: HTMLButtonElement[] = itemValues.map((v) => {
      const btn = document.createElement("button");
      btn.setAttribute("data-forge-part", "trigger");
      root.appendChild(btn);
      return btn;
    });

    document.body.appendChild(root);

    function keydownOnTrigger(index: number, key: string) {
      const e = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      Object.defineProperty(e, "currentTarget", { value: triggerEls[index] });
      api.getTriggerProps(itemValues[index]).onKeyDown(e);
      return e;
    }

    function cleanup() {
      document.body.removeChild(root);
    }

    return { api, send, triggerEls, keydownOnTrigger, cleanup };
  }

  it("ArrowDown moves focus to next trigger", () => {
    const { triggerEls, keydownOnTrigger, cleanup } = buildDomAndApi(["a", "b", "c"]);
    const focused = vi.spyOn(triggerEls[1], "focus");
    keydownOnTrigger(0, "ArrowDown");
    expect(focused).toHaveBeenCalled();
    cleanup();
  });

  it("ArrowDown wraps to first from last (WAI-ARIA: circular)", () => {
    const { triggerEls, keydownOnTrigger, cleanup } = buildDomAndApi(["a", "b", "c"]);
    const focused = vi.spyOn(triggerEls[0], "focus");
    keydownOnTrigger(2, "ArrowDown");
    expect(focused).toHaveBeenCalled();
    cleanup();
  });

  it("ArrowUp moves focus to previous trigger", () => {
    const { triggerEls, keydownOnTrigger, cleanup } = buildDomAndApi(["a", "b", "c"]);
    const focused = vi.spyOn(triggerEls[0], "focus");
    keydownOnTrigger(1, "ArrowUp");
    expect(focused).toHaveBeenCalled();
    cleanup();
  });

  it("Home moves focus to first trigger", () => {
    const { triggerEls, keydownOnTrigger, cleanup } = buildDomAndApi(["a", "b", "c"]);
    const focused = vi.spyOn(triggerEls[0], "focus");
    keydownOnTrigger(2, "Home");
    expect(focused).toHaveBeenCalled();
    cleanup();
  });

  it("End moves focus to last trigger", () => {
    const { triggerEls, keydownOnTrigger, cleanup } = buildDomAndApi(["a", "b", "c"]);
    const focused = vi.spyOn(triggerEls[2], "focus");
    keydownOnTrigger(0, "End");
    expect(focused).toHaveBeenCalled();
    cleanup();
  });

  it("Enter key sends TOGGLE_ITEM", () => {
    const { send, keydownOnTrigger, cleanup } = buildDomAndApi(["a", "b"]);
    keydownOnTrigger(0, "Enter");
    expect(send).toHaveBeenCalledWith({ type: "TOGGLE_ITEM", value: "a" });
    cleanup();
  });

  it("Space key sends TOGGLE_ITEM", () => {
    const { send, keydownOnTrigger, cleanup } = buildDomAndApi(["a", "b"]);
    keydownOnTrigger(1, " ");
    expect(send).toHaveBeenCalledWith({ type: "TOGGLE_ITEM", value: "b" });
    cleanup();
  });

  it("disabled accordion: Enter does NOT send TOGGLE_ITEM", () => {
    const { send, keydownOnTrigger, cleanup } = buildDomAndApi(["a", "b"], { disabled: true });
    keydownOnTrigger(0, "Enter");
    expect(send).not.toHaveBeenCalled();
    cleanup();
  });

  // onKeydown (Vue lowercase alias) — same routing, different event name binding
  it("onKeydown (Vue alias): Enter sends TOGGLE_ITEM", () => {
    const { api, send, triggerEls, cleanup } = buildDomAndApi(["a", "b"]);
    const e = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    Object.defineProperty(e, "currentTarget", { value: triggerEls[0] });
    const props = api.getTriggerProps("a") as Record<string, (e: unknown) => void>;
    props["onKeydown"](e);
    expect(send).toHaveBeenCalledWith({ type: "TOGGLE_ITEM", value: "a" });
    cleanup();
  });

  it("onKeydown (Vue alias): disabled accordion: Enter does NOT send TOGGLE_ITEM", () => {
    const { api, send, triggerEls, cleanup } = buildDomAndApi(["a", "b"], { disabled: true });
    const e = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    Object.defineProperty(e, "currentTarget", { value: triggerEls[0] });
    const props = api.getTriggerProps("a") as Record<string, (e: unknown) => void>;
    props["onKeydown"](e);
    expect(send).not.toHaveBeenCalled();
    cleanup();
  });
});
