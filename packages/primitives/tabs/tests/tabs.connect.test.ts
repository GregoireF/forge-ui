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
});
