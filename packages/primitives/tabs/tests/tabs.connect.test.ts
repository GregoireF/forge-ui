import { describe, expect, it, vi } from "vitest";
import { connectTabs } from "../src/tabs.connect.js";
import type { TabsContext } from "../src/tabs.types.js";

function makeCtx(overrides: Partial<TabsContext> = {}): TabsContext {
  return {
    value: "tab1",
    orientation: "horizontal",
    activationMode: "automatic",
    disabled: false,
    ...overrides,
  };
}

function makeSnapshot(ctx: TabsContext) {
  return { value: "idle" as const, context: ctx, matches: (s: string) => s === "idle" };
}

function makeApi(overrides: Partial<TabsContext> = {}) {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  return { api: connectTabs(makeSnapshot(ctx), send, machine), send };
}

// ---------------------------------------------------------------------------
// getRootProps
// ---------------------------------------------------------------------------

describe("connectTabs — getRootProps", () => {
  it("has data-forge-scope=tabs", () => {
    const { api } = makeApi();
    expect(api.getRootProps()["data-forge-scope"]).toBe("tabs");
  });

  it("data-orientation reflects orientation", () => {
    const { api } = makeApi({ orientation: "vertical" });
    expect(api.getRootProps()["data-orientation"]).toBe("vertical");
  });
});

// ---------------------------------------------------------------------------
// getListProps
// ---------------------------------------------------------------------------

describe("connectTabs — getListProps", () => {
  it("role=tablist", () => {
    const { api } = makeApi();
    expect(api.getListProps().role).toBe("tablist");
  });

  it("aria-orientation reflects orientation", () => {
    const { api } = makeApi({ orientation: "vertical" });
    expect(api.getListProps()["aria-orientation"]).toBe("vertical");
  });
});

// ---------------------------------------------------------------------------
// getTriggerProps
// ---------------------------------------------------------------------------

describe("connectTabs — getTriggerProps", () => {
  it("role=tab", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps("tab1").role).toBe("tab");
  });

  it("aria-selected=true for active tab", () => {
    const { api } = makeApi({ value: "tab1" });
    expect(api.getTriggerProps("tab1")["aria-selected"]).toBe(true);
  });

  it("aria-selected=false for inactive tab", () => {
    const { api } = makeApi({ value: "tab1" });
    expect(api.getTriggerProps("tab2")["aria-selected"]).toBe(false);
  });

  it("tabIndex=0 for selected tab", () => {
    const { api } = makeApi({ value: "tab1" });
    expect(api.getTriggerProps("tab1").tabIndex).toBe(0);
  });

  it("tabIndex=-1 for non-selected tab", () => {
    const { api } = makeApi({ value: "tab1" });
    expect(api.getTriggerProps("tab2").tabIndex).toBe(-1);
  });

  it("aria-controls points to panel id", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps("tab1")["aria-controls"]).toBe("forge-tabs-panel-tab1");
  });

  it("id follows forge naming convention", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps("tab1").id).toBe("forge-tabs-trigger-tab1");
  });

  it("data-state=active for selected tab", () => {
    const { api } = makeApi({ value: "tab1" });
    expect(api.getTriggerProps("tab1")["data-state"]).toBe("active");
  });

  it("data-state=inactive for non-selected tab", () => {
    const { api } = makeApi({ value: "tab1" });
    expect(api.getTriggerProps("tab2")["data-state"]).toBe("inactive");
  });

  it("onClick sends SELECT_TAB when not disabled", () => {
    const { api, send } = makeApi();
    api.getTriggerProps("tab2").onClick();
    expect(send).toHaveBeenCalledWith({ type: "SELECT_TAB", value: "tab2" });
  });

  it("onClick does NOT send SELECT_TAB when disabled", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getTriggerProps("tab2").onClick();
    expect(send).not.toHaveBeenCalled();
  });

  // WAI-ARIA: a disabled tab trigger must expose aria-disabled so AT announces
  // the tab cannot be activated, while remaining in the focus order.
  it("aria-disabled=true when tab is globally disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getTriggerProps("tab2")["aria-disabled"]).toBe(true);
  });

  it("aria-disabled absent when tab is enabled", () => {
    const { api } = makeApi({ disabled: false });
    const props = api.getTriggerProps("tab2") as Record<string, unknown>;
    expect(props["aria-disabled"]).toBeUndefined();
  });

  it("onFocus sends SELECT_TAB in automatic mode (WAI-ARIA §3.26 auto-activation)", () => {
    const { api, send } = makeApi({ activationMode: "automatic" });
    api.getTriggerProps("tab2").onFocus();
    expect(send).toHaveBeenCalledWith({ type: "SELECT_TAB", value: "tab2" });
  });

  it("onFocus does NOT send SELECT_TAB in manual mode", () => {
    const { api, send } = makeApi({ activationMode: "manual" });
    api.getTriggerProps("tab2").onFocus();
    expect(send).not.toHaveBeenCalled();
  });

  it("globally disabled: onFocus does NOT send SELECT_TAB even in automatic mode", () => {
    const { api, send } = makeApi({ activationMode: "automatic", disabled: true });
    api.getTriggerProps("tab2").onFocus();
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getPanelProps
// ---------------------------------------------------------------------------

describe("connectTabs — getPanelProps", () => {
  it("role=tabpanel", () => {
    const { api } = makeApi();
    expect(api.getPanelProps("tab1").role).toBe("tabpanel");
  });

  it("aria-labelledby points to trigger id", () => {
    const { api } = makeApi();
    expect(api.getPanelProps("tab1")["aria-labelledby"]).toBe("forge-tabs-trigger-tab1");
  });

  it("data-state=active for selected panel", () => {
    const { api } = makeApi({ value: "tab1" });
    expect(api.getPanelProps("tab1")["data-state"]).toBe("active");
  });

  it("data-state=inactive for non-selected panel", () => {
    const { api } = makeApi({ value: "tab1" });
    expect(api.getPanelProps("tab2")["data-state"]).toBe("inactive");
  });

  it("id matches aria-controls from trigger", () => {
    const { api } = makeApi();
    expect(api.getPanelProps("tab1").id).toBe(api.getTriggerProps("tab1")["aria-controls"]);
  });
});

// ---------------------------------------------------------------------------
// value exposure
// ---------------------------------------------------------------------------

describe("connectTabs — value", () => {
  it("exposes the current tab value", () => {
    const { api } = makeApi({ value: "tab2" });
    expect(api.value).toBe("tab2");
  });
});

// ---------------------------------------------------------------------------
// onKeyDown — WAI-ARIA §3.26: arrow key navigation in tablist
// Uses a real DOM structure (happy-dom) because navigateTabs walks the DOM.
// ---------------------------------------------------------------------------

describe("connectTabs — onKeyDown keyboard navigation", () => {
  function buildDomAndApi(values: string[], activeValue: string, overrides: Partial<TabsContext> = {}) {
    const { api, send } = makeApi({ value: activeValue, ...overrides });

    const list = document.createElement("div");
    list.setAttribute("data-forge-part", "list");

    const triggerEls: HTMLButtonElement[] = values.map((v) => {
      const btn = document.createElement("button");
      btn.setAttribute("data-forge-part", "trigger");
      btn.setAttribute("data-value", v);
      list.appendChild(btn);
      return btn;
    });

    document.body.appendChild(list);

    function keydownOnTrigger(index: number, key: string) {
      const e = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      Object.defineProperty(e, "currentTarget", { value: triggerEls[index] });
      api.getTriggerProps(values[index]).onKeyDown(e);
      return e;
    }

    function cleanup() {
      document.body.removeChild(list);
    }

    return { api, send, triggerEls, keydownOnTrigger, cleanup };
  }

  it("ArrowRight from first tab sends SELECT_TAB for second (automatic mode)", () => {
    const { send, keydownOnTrigger, cleanup } = buildDomAndApi(["a", "b", "c"], "a");
    keydownOnTrigger(0, "ArrowRight");
    expect(send).toHaveBeenCalledWith({ type: "SELECT_TAB", value: "b" });
    cleanup();
  });

  it("ArrowRight from last tab wraps to first (WAI-ARIA: circular)", () => {
    const { send, keydownOnTrigger, cleanup } = buildDomAndApi(["a", "b", "c"], "c");
    keydownOnTrigger(2, "ArrowRight");
    expect(send).toHaveBeenCalledWith({ type: "SELECT_TAB", value: "a" });
    cleanup();
  });

  it("ArrowLeft from second tab goes to first", () => {
    const { send, keydownOnTrigger, cleanup } = buildDomAndApi(["a", "b", "c"], "b");
    keydownOnTrigger(1, "ArrowLeft");
    expect(send).toHaveBeenCalledWith({ type: "SELECT_TAB", value: "a" });
    cleanup();
  });

  it("Home key goes to first tab", () => {
    const { send, keydownOnTrigger, cleanup } = buildDomAndApi(["a", "b", "c"], "c");
    keydownOnTrigger(2, "Home");
    expect(send).toHaveBeenCalledWith({ type: "SELECT_TAB", value: "a" });
    cleanup();
  });

  it("End key goes to last tab", () => {
    const { send, keydownOnTrigger, cleanup } = buildDomAndApi(["a", "b", "c"], "a");
    keydownOnTrigger(0, "End");
    expect(send).toHaveBeenCalledWith({ type: "SELECT_TAB", value: "c" });
    cleanup();
  });

  it("manual mode: ArrowRight moves focus without selecting (no SELECT_TAB)", () => {
    const { send, keydownOnTrigger, cleanup } = buildDomAndApi(["a", "b", "c"], "a", { activationMode: "manual" });
    keydownOnTrigger(0, "ArrowRight");
    expect(send).not.toHaveBeenCalledWith(expect.objectContaining({ type: "SELECT_TAB" }));
    cleanup();
  });

  it("vertical mode: ArrowDown navigates forward", () => {
    const { send, keydownOnTrigger, cleanup } = buildDomAndApi(["a", "b", "c"], "a", { orientation: "vertical" });
    keydownOnTrigger(0, "ArrowDown");
    expect(send).toHaveBeenCalledWith({ type: "SELECT_TAB", value: "b" });
    cleanup();
  });

  it("vertical mode: ArrowUp navigates backward", () => {
    const { send, keydownOnTrigger, cleanup } = buildDomAndApi(["a", "b", "c"], "b", { orientation: "vertical" });
    keydownOnTrigger(1, "ArrowUp");
    expect(send).toHaveBeenCalledWith({ type: "SELECT_TAB", value: "a" });
    cleanup();
  });

  it("Enter key selects the focused tab (manual activation)", () => {
    const { send, keydownOnTrigger, cleanup } = buildDomAndApi(["a", "b"], "b", { activationMode: "manual" });
    keydownOnTrigger(0, "Enter");
    expect(send).toHaveBeenCalledWith({ type: "SELECT_TAB", value: "a" });
    cleanup();
  });

  it("Space key selects the focused tab (manual activation)", () => {
    const { send, keydownOnTrigger, cleanup } = buildDomAndApi(["a", "b"], "b", { activationMode: "manual" });
    keydownOnTrigger(0, " ");
    expect(send).toHaveBeenCalledWith({ type: "SELECT_TAB", value: "a" });
    cleanup();
  });

  it("Enter when disabled: does NOT send SELECT_TAB (onKeyDown !isDisabled guard)", () => {
    const { send, keydownOnTrigger, cleanup } = buildDomAndApi(["a", "b"], "b", { disabled: true, activationMode: "manual" });
    keydownOnTrigger(0, "Enter");
    expect(send).not.toHaveBeenCalled();
    cleanup();
  });

  it("ArrowRight with trigger that has no data-value: no SELECT_TAB sent (val guard)", () => {
    const { api, send } = makeApi({ value: "a", activationMode: "automatic" });

    const list = document.createElement("div");
    list.setAttribute("data-forge-part", "list");

    // Trigger WITHOUT data-value attribute → target.dataset.value = undefined → if (val) FALSE
    const trigger1 = document.createElement("button");
    trigger1.setAttribute("data-forge-part", "trigger");
    const trigger2 = document.createElement("button");
    trigger2.setAttribute("data-forge-part", "trigger");
    list.appendChild(trigger1);
    list.appendChild(trigger2);
    document.body.appendChild(list);

    const e = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true });
    Object.defineProperty(e, "currentTarget", { value: trigger1 });
    api.getTriggerProps("a").onKeyDown(e);

    // target=trigger2 found, focus() called, but trigger2 has no data-value → no SELECT_TAB
    expect(send).not.toHaveBeenCalledWith(expect.objectContaining({ type: "SELECT_TAB" }));
    list.remove();
  });

  // onKeydown (Vue lowercase alias) — same logic, different event name binding
  it("onKeydown (Vue alias): ArrowRight sends SELECT_TAB for next tab (automatic)", () => {
    const { api, send, triggerEls, cleanup } = buildDomAndApi(["a", "b", "c"], "a");
    const e = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true });
    Object.defineProperty(e, "currentTarget", { value: triggerEls[0] });
    const props = api.getTriggerProps("a") as Record<string, (e: unknown) => void>;
    props["onKeydown"](e);
    expect(send).toHaveBeenCalledWith({ type: "SELECT_TAB", value: "b" });
    cleanup();
  });

  it("onKeydown (Vue alias): Enter selects tab in manual mode", () => {
    const { api, send, triggerEls, cleanup } = buildDomAndApi(["a", "b"], "b", { activationMode: "manual" });
    const e = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    Object.defineProperty(e, "currentTarget", { value: triggerEls[0] });
    const props = api.getTriggerProps("a") as Record<string, (e: unknown) => void>;
    props["onKeydown"](e);
    expect(send).toHaveBeenCalledWith({ type: "SELECT_TAB", value: "a" });
    cleanup();
  });

  it("onKeydown (Vue alias): Enter when disabled does NOT send SELECT_TAB", () => {
    const { api, send, triggerEls, cleanup } = buildDomAndApi(["a", "b"], "b", { activationMode: "manual", disabled: true });
    const e = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    Object.defineProperty(e, "currentTarget", { value: triggerEls[0] });
    const props = api.getTriggerProps("a") as Record<string, (e: unknown) => void>;
    props["onKeydown"](e);
    expect(send).not.toHaveBeenCalled();
    cleanup();
  });

  it("onKeydown (Vue alias): Space selects focused tab in manual mode", () => {
    const { api, send, triggerEls, cleanup } = buildDomAndApi(["a", "b"], "b", { activationMode: "manual" });
    const e = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
    Object.defineProperty(e, "currentTarget", { value: triggerEls[0] });
    const props = api.getTriggerProps("a") as Record<string, (e: unknown) => void>;
    props["onKeydown"](e);
    expect(send).toHaveBeenCalledWith({ type: "SELECT_TAB", value: "a" });
    cleanup();
  });

  it("onKeydown (Vue alias): ArrowRight navigates (navigateTabs returns true → early return in onKeydown)", () => {
    const { api, send, triggerEls, cleanup } = buildDomAndApi(["a", "b", "c"], "a", { activationMode: "manual" });
    const e = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true });
    Object.defineProperty(e, "currentTarget", { value: triggerEls[0] });
    const props = api.getTriggerProps("a") as Record<string, (e: unknown) => void>;
    props["onKeydown"](e);
    // navigateTabs returns true (handled) → early return; no SELECT_TAB in manual mode
    expect(send).not.toHaveBeenCalledWith(expect.objectContaining({ type: "SELECT_TAB" }));
    cleanup();
  });
});

// ---------------------------------------------------------------------------
// onFocusin — Vue alias for onFocus (native DOM event name)
// Vue fires "focusin" on the host element rather than React's synthetic onFocus.
// Both handlers must be present so focus-to-activate works in both frameworks.
// ---------------------------------------------------------------------------

describe("connectTabs — onFocusin (Vue alias for onFocus)", () => {
  it("onFocusin sends SELECT_TAB in automatic mode", () => {
    const { api, send } = makeApi({ activationMode: "automatic" });
    const props = api.getTriggerProps("tab2") as Record<string, () => void>;
    props["onFocusin"]();
    expect(send).toHaveBeenCalledWith({ type: "SELECT_TAB", value: "tab2" });
  });

  it("onFocusin does NOT send SELECT_TAB in manual mode", () => {
    const { api, send } = makeApi({ activationMode: "manual" });
    const props = api.getTriggerProps("tab2") as Record<string, () => void>;
    props["onFocusin"]();
    expect(send).not.toHaveBeenCalled();
  });

  it("onFocusin does NOT send SELECT_TAB when globally disabled", () => {
    const { api, send } = makeApi({ activationMode: "automatic", disabled: true });
    const props = api.getTriggerProps("tab2") as Record<string, () => void>;
    props["onFocusin"]();
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// navigateTabs branch coverage
//
// WHY: navigateTabs uses closest() to find the list and querySelectorAll() to
// find sibling triggers. Both can return null/empty in unit tests because no
// real DOM is built — covering the guard branches (no-list, no-triggers).
// ---------------------------------------------------------------------------

describe("connectTabs — navigateTabs branch coverage", () => {
  it("ArrowRight when trigger has no parent list: returns true without focusing (no-list guard)", () => {
    const { api, send } = makeApi({ value: "a", activationMode: "automatic" });

    // Trigger element with NO [data-forge-part="list"] ancestor
    const trigger = document.createElement("button");
    trigger.setAttribute("data-forge-part", "trigger");
    trigger.setAttribute("data-value", "a");
    document.body.appendChild(trigger);

    const e = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true });
    Object.defineProperty(e, "currentTarget", { value: trigger });
    api.getTriggerProps("a").onKeyDown(e);

    // navigateTabs returned true (handled the key) but no tab was selected
    expect(send).not.toHaveBeenCalled();
    trigger.remove();
  });

  it("ArrowRight when only trigger is disabled: target is undefined, no SELECT_TAB sent", () => {
    const { api, send } = makeApi({ value: "a", activationMode: "automatic" });

    const list = document.createElement("div");
    list.setAttribute("data-forge-part", "list");

    // Single trigger with [disabled] → excluded from querySelectorAll ':not([disabled])'
    // → triggers=[], target=undefined → if (target) FALSE branch
    const trigger = document.createElement("button");
    trigger.setAttribute("data-forge-part", "trigger");
    trigger.setAttribute("data-value", "a");
    trigger.setAttribute("disabled", "");
    list.appendChild(trigger);
    document.body.appendChild(list);

    const e = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true });
    Object.defineProperty(e, "currentTarget", { value: trigger });
    api.getTriggerProps("a").onKeyDown(e);

    expect(send).not.toHaveBeenCalled();
    list.remove();
  });
});

// ---------------------------------------------------------------------------
// getListProps — aria-label (WAI-ARIA §4.5: tablist must have accessible name
// when not labelled by a visible element)
// WHY: Radix Tabs does not expose aria-label on the tablist; forge-ui adds it
// via the `label` prop. AT users get the list's purpose even without a heading.
// ---------------------------------------------------------------------------

describe("connectTabs — getListProps aria-label", () => {
  it("aria-label absent when label option is not set", () => {
    const { api } = makeApi();
    expect((api.getListProps() as Record<string, unknown>)["aria-label"]).toBeUndefined();
  });

  it("aria-label=label when label option is set", () => {
    const { api } = makeApi({ label: "Settings tabs" });
    expect((api.getListProps() as Record<string, unknown>)["aria-label"]).toBe("Settings tabs");
  });
});

