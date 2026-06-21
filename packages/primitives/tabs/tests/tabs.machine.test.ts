import { afterEach, describe, expect, it, vi } from "vitest";
import { createTabsMachine } from "../src/tabs.machine.js";

let active: ReturnType<typeof createTabsMachine>[] = [];

function make(opts: Partial<Parameters<typeof createTabsMachine>[0]> = {}) {
  const m = createTabsMachine({ id: "test", ...opts });
  m.start();
  active.push(m);
  return m;
}

afterEach(() => {
  for (const m of active) m.stop();
  active = [];
});

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe("createTabsMachine — initial state", () => {
  it("value defaults to undefined (uncontrolled, no selection)", () => {
    const m = make();
    expect(m.getSnapshot().context.value).toBeUndefined();
  });

  it("defaultValue sets initial tab", () => {
    const m = make({ defaultValue: "tab-b" });
    expect(m.getSnapshot().context.value).toBe("tab-b");
  });

  it("value option (controlled) sets initial tab", () => {
    const m = make({ value: "tab-c" });
    expect(m.getSnapshot().context.value).toBe("tab-c");
  });

  it("orientation defaults to 'horizontal'", () => {
    const m = make();
    expect(m.getSnapshot().context.orientation).toBe("horizontal");
  });

  it("activationMode defaults to 'automatic'", () => {
    const m = make();
    expect(m.getSnapshot().context.activationMode).toBe("automatic");
  });

  it("always in idle state", () => {
    const m = make();
    expect(m.getSnapshot().matches("idle")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SELECT_TAB — WAI-ARIA §3.26: tab selection
// ---------------------------------------------------------------------------

describe("createTabsMachine — SELECT_TAB", () => {
  it("selects the given tab", () => {
    const m = make();
    m.send({ type: "SELECT_TAB", value: "tab-a" });
    expect(m.getSnapshot().context.value).toBe("tab-a");
  });

  it("switching tabs updates value", () => {
    const m = make({ defaultValue: "tab-a" });
    m.send({ type: "SELECT_TAB", value: "tab-b" });
    expect(m.getSnapshot().context.value).toBe("tab-b");
  });

  it("selecting the current tab is idempotent", () => {
    const m = make({ defaultValue: "tab-a" });
    m.send({ type: "SELECT_TAB", value: "tab-a" });
    expect(m.getSnapshot().context.value).toBe("tab-a");
  });
});

// ---------------------------------------------------------------------------
// Disabled guard — the machine checks context.disabled (group-level only)
// Per-item disabled is enforced in the connect layer, not the machine.
// ---------------------------------------------------------------------------

describe("createTabsMachine — disabled guard (group level)", () => {
  it("SELECT_TAB is a no-op when group disabled=true", () => {
    const m = make({ defaultValue: "tab-a", disabled: true });
    m.send({ type: "SELECT_TAB", value: "tab-b" });
    expect(m.getSnapshot().context.value).toBe("tab-a");
  });

  it("SELECT_TAB works normally when group disabled=false", () => {
    const m = make({ disabled: false });
    m.send({ type: "SELECT_TAB", value: "tab-a" });
    expect(m.getSnapshot().context.value).toBe("tab-a");
  });
});

// ---------------------------------------------------------------------------
// SET_VALUE — controlled update
// ---------------------------------------------------------------------------

describe("createTabsMachine — SET_VALUE", () => {
  it("updates the active tab", () => {
    const m = make({ defaultValue: "tab-a" });
    m.send({ type: "SET_VALUE", value: "tab-b" });
    expect(m.getSnapshot().context.value).toBe("tab-b");
  });

  it("can set to undefined (deselect)", () => {
    const m = make({ defaultValue: "tab-a" });
    m.send({ type: "SET_VALUE", value: undefined });
    expect(m.getSnapshot().context.value).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// onValueChange callback
// ---------------------------------------------------------------------------

describe("createTabsMachine — onValueChange", () => {
  it("called when SELECT_TAB changes value", () => {
    const cb = vi.fn();
    const m = make({ onValueChange: cb });
    m.send({ type: "SELECT_TAB", value: "tab-a" });
    expect(cb).toHaveBeenCalledWith("tab-a");
  });

  it("NOT called when group is disabled", () => {
    const cb = vi.fn();
    const m = make({ defaultValue: "tab-a", disabled: true, onValueChange: cb });
    m.send({ type: "SELECT_TAB", value: "tab-b" });
    expect(cb).not.toHaveBeenCalled();
  });

  it("NOT called on SET_VALUE (machine design: SET_VALUE is a silent controlled update)", () => {
    const cb = vi.fn();
    const m = make({ defaultValue: "tab-a", onValueChange: cb });
    m.send({ type: "SET_VALUE", value: "tab-b" });
    // SET_VALUE is for controlled updates — it sets value without firing the user callback
    expect(cb).not.toHaveBeenCalled();
  });

  it("NOT called on initial start", () => {
    const cb = vi.fn();
    make({ defaultValue: "tab-a", onValueChange: cb });
    expect(cb).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Context defaults — verified exhaustively
// IDs (listId, triggerId, panelId) are derived in the connect layer, not in context.
// ---------------------------------------------------------------------------

describe("createTabsMachine — context defaults", () => {
  it("orientation defaults to 'horizontal'", () => {
    const m = make();
    expect(m.getSnapshot().context.orientation).toBe("horizontal");
  });

  it("activationMode defaults to 'automatic'", () => {
    const m = make();
    expect(m.getSnapshot().context.activationMode).toBe("automatic");
  });

  it("disabled defaults to false", () => {
    const m = make();
    expect(m.getSnapshot().context.disabled).toBe(false);
  });

  it("orientation='vertical' is stored in context", () => {
    const m = make({ orientation: "vertical" });
    expect(m.getSnapshot().context.orientation).toBe("vertical");
  });

  it("activationMode='manual' is stored in context", () => {
    const m = make({ activationMode: "manual" });
    expect(m.getSnapshot().context.activationMode).toBe("manual");
  });
});
