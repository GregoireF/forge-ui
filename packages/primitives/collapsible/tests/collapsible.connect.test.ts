import { describe, expect, it, vi } from "vitest";
import { connectCollapsible } from "../src/collapsible.connect.js";
import type { CollapsibleContext, CollapsibleState } from "../src/collapsible.types.js";

function makeCtx(overrides: Partial<CollapsibleContext> = {}): CollapsibleContext {
  return {
    id: "test-collapsible",
    open: false,
    disabled: false,
    ...overrides,
  };
}

function makeSnapshot(ctx: CollapsibleContext, state: CollapsibleState = "idle") {
  return { value: state, context: ctx, matches: (s: string) => s === state };
}

function makeApi(overrides: Partial<CollapsibleContext> = {}) {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  return { api: connectCollapsible(makeSnapshot(ctx), send, machine), send, ctx };
}

// ---------------------------------------------------------------------------
// getRootProps
// ---------------------------------------------------------------------------

describe("connectCollapsible — getRootProps", () => {
  it("has data-forge-scope=collapsible", () => {
    const { api } = makeApi();
    expect(api.getRootProps()["data-forge-scope"]).toBe("collapsible");
  });

  it("data-state=closed when not open", () => {
    const { api } = makeApi({ open: false });
    expect(api.getRootProps()["data-state"]).toBe("closed");
  });

  it("data-state=open when open", () => {
    const { api } = makeApi({ open: true });
    expect(api.getRootProps()["data-state"]).toBe("open");
  });

  it("sets data-disabled when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getRootProps()["data-disabled"]).toBe("");
  });
});

// ---------------------------------------------------------------------------
// getTriggerProps
// ---------------------------------------------------------------------------

describe("connectCollapsible — getTriggerProps", () => {
  it("aria-expanded=false when closed", () => {
    const { api } = makeApi({ open: false });
    expect(api.getTriggerProps()["aria-expanded"]).toBe(false);
  });

  it("aria-expanded=true when open", () => {
    const { api } = makeApi({ open: true });
    expect(api.getTriggerProps()["aria-expanded"]).toBe(true);
  });

  it("aria-controls points to content id", () => {
    const { api } = makeApi({ id: "my-collapse" });
    expect(api.getTriggerProps()["aria-controls"]).toBe("forge-collapsible-content-my-collapse");
  });

  it("data-state=closed when not open", () => {
    const { api } = makeApi({ open: false });
    expect(api.getTriggerProps()["data-state"]).toBe("closed");
  });

  it("data-state=open when open", () => {
    const { api } = makeApi({ open: true });
    expect(api.getTriggerProps()["data-state"]).toBe("open");
  });

  it("onClick sends TOGGLE", () => {
    const { api, send } = makeApi();
    api.getTriggerProps().onClick();
    expect(send).toHaveBeenCalledWith({ type: "TOGGLE" });
  });

  it("disabled: onClick does not send", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getTriggerProps().onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("disabled: aria-disabled is set", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getTriggerProps()["aria-disabled"]).toBe(true);
  });

  // WAI-ARIA: keyboard users activate with Enter or Space
  it("Enter key sends TOGGLE", () => {
    const { api, send } = makeApi();
    const e = { key: "Enter", preventDefault: vi.fn() } as unknown as KeyboardEvent;
    api.getTriggerProps().onKeyDown(e);
    expect(send).toHaveBeenCalledWith({ type: "TOGGLE" });
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("Space key sends TOGGLE", () => {
    const { api, send } = makeApi();
    const e = { key: " ", preventDefault: vi.fn() } as unknown as KeyboardEvent;
    api.getTriggerProps().onKeyDown(e);
    expect(send).toHaveBeenCalledWith({ type: "TOGGLE" });
  });

  it("disabled: Enter does not send TOGGLE", () => {
    const { api, send } = makeApi({ disabled: true });
    const e = { key: "Enter", preventDefault: vi.fn() } as unknown as KeyboardEvent;
    api.getTriggerProps().onKeyDown(e);
    expect(send).not.toHaveBeenCalled();
  });

  it("other keys are ignored", () => {
    const { api, send } = makeApi();
    const e = { key: "ArrowDown", preventDefault: vi.fn() } as unknown as KeyboardEvent;
    api.getTriggerProps().onKeyDown(e);
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getContentProps
// ---------------------------------------------------------------------------

describe("connectCollapsible — getContentProps", () => {
  it("id matches aria-controls from trigger", () => {
    const { api } = makeApi({ id: "test" });
    expect(api.getContentProps().id).toBe("forge-collapsible-content-test");
  });

  it("data-state=open when open", () => {
    const { api } = makeApi({ open: true });
    expect(api.getContentProps()["data-state"]).toBe("open");
  });

  it("data-state=closed when not open", () => {
    const { api } = makeApi({ open: false });
    expect(api.getContentProps()["data-state"]).toBe("closed");
  });

  it("has data-forge-scope=collapsible", () => {
    const { api } = makeApi();
    expect(api.getContentProps()["data-forge-scope"]).toBe("collapsible");
  });
});

// ---------------------------------------------------------------------------
// isOpen / disabled
// ---------------------------------------------------------------------------

describe("connectCollapsible — isOpen / disabled", () => {
  it("isOpen reflects context.open", () => {
    const { api } = makeApi({ open: true });
    expect(api.isOpen).toBe(true);
  });

  it("disabled reflects context.disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.disabled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// onKeydown — Vue lowercase alias (mirrors onKeyDown)
// React uses camelCase onKeyDown; Vue fires the native event name onKeydown.
// Both must be present so keyboard activation works in both frameworks.
// ---------------------------------------------------------------------------

describe("connectCollapsible — onKeydown (Vue alias for onKeyDown)", () => {
  it("Enter sends TOGGLE", () => {
    const { api, send } = makeApi();
    const props = api.getTriggerProps() as Record<string, (e: unknown) => void>;
    props["onKeydown"]({ key: "Enter", preventDefault: vi.fn() });
    expect(send).toHaveBeenCalledWith({ type: "TOGGLE" });
  });

  it("Space sends TOGGLE", () => {
    const { api, send } = makeApi();
    const props = api.getTriggerProps() as Record<string, (e: unknown) => void>;
    props["onKeydown"]({ key: " ", preventDefault: vi.fn() });
    expect(send).toHaveBeenCalledWith({ type: "TOGGLE" });
  });

  it("disabled: Enter does not send TOGGLE", () => {
    const { api, send } = makeApi({ disabled: true });
    const props = api.getTriggerProps() as Record<string, (e: unknown) => void>;
    props["onKeydown"]({ key: "Enter", preventDefault: vi.fn() });
    expect(send).not.toHaveBeenCalled();
  });

  it("other keys: no-op", () => {
    const { api, send } = makeApi();
    const props = api.getTriggerProps() as Record<string, (e: unknown) => void>;
    props["onKeydown"]({ key: "Tab", preventDefault: vi.fn() });
    expect(send).not.toHaveBeenCalled();
  });
});
