import { describe, expect, it, vi } from "vitest";
import { connectToggleGroup } from "../src/toggle-group.connect.js";
import type { ToggleGroupContext, ToggleGroupState } from "../src/toggle-group.types.js";

function makeCtx(overrides: Partial<ToggleGroupContext> = {}): ToggleGroupContext {
  return {
    id: "g",
    type: "multiple",
    value: [],
    disabled: false,
    orientation: "horizontal",
    rovingFocus: true,
    loop: true,
    ...overrides,
  };
}

function makeSnapshot(ctx: ToggleGroupContext, state: ToggleGroupState = "idle") {
  return { value: state, context: ctx, matches: (s: string) => s === state };
}

function makeApi(overrides: Partial<ToggleGroupContext> = {}) {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  return {
    api: connectToggleGroup(makeSnapshot(ctx), send, machine),
    send,
    ctx,
  };
}

// ─── getRootProps ──────────────────────────────────────────────────────────

describe("connectToggleGroup — getRootProps", () => {
  it("role=toolbar (WAI-ARIA APG toolbar pattern)", () => {
    const { api } = makeApi();
    expect(api.getRootProps().role).toBe("toolbar");
  });

  it("aria-orientation=horizontal by default", () => {
    const { api } = makeApi();
    expect(api.getRootProps()["aria-orientation"]).toBe("horizontal");
  });

  it("aria-orientation=vertical when orientation=vertical", () => {
    const { api } = makeApi({ orientation: "vertical" });
    expect(api.getRootProps()["aria-orientation"]).toBe("vertical");
  });

  it("data-forge-scope=toggle-group", () => {
    const { api } = makeApi();
    expect(api.getRootProps()["data-forge-scope"]).toBe("toggle-group");
  });

  it("data-disabled='' when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getRootProps()["data-disabled"]).toBe("");
  });

  it("aria-disabled=true when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getRootProps()["aria-disabled"]).toBe(true);
  });
});

// ─── getItemProps ─────────────────────────────────────────────────────────

describe("connectToggleGroup — getItemProps", () => {
  it("role=button", () => {
    const { api } = makeApi();
    expect(api.getItemProps("bold").role).toBe("button");
  });

  it("aria-pressed=false when not in value", () => {
    const { api } = makeApi({ value: [] });
    expect(api.getItemProps("bold")["aria-pressed"]).toBe(false);
  });

  it("aria-pressed=true when in value", () => {
    const { api } = makeApi({ value: ["bold"] });
    expect(api.getItemProps("bold")["aria-pressed"]).toBe(true);
  });

  it("data-state=on when pressed", () => {
    const { api } = makeApi({ value: ["bold"] });
    expect(api.getItemProps("bold")["data-state"]).toBe("on");
  });

  it("data-state=off when not pressed", () => {
    const { api } = makeApi();
    expect(api.getItemProps("bold")["data-state"]).toBe("off");
  });

  it("data-pressed='' when pressed", () => {
    const { api } = makeApi({ value: ["bold"] });
    expect(api.getItemProps("bold")["data-pressed"]).toBe("");
  });

  it("data-value matches item value", () => {
    const { api } = makeApi();
    expect(api.getItemProps("italic")["data-value"]).toBe("italic");
  });

  it("tabIndex=0 for first pressed item (roving tabindex)", () => {
    const { api } = makeApi({ value: ["bold", "italic"] });
    expect(api.getItemProps("bold").tabIndex).toBe(0);
    expect(api.getItemProps("italic").tabIndex).toBe(-1);
  });

  it("tabIndex=-1 for non-first items when value is set", () => {
    const { api } = makeApi({ value: ["bold"] });
    expect(api.getItemProps("italic").tabIndex).toBe(-1);
  });

  it("onClick sends PRESS_ITEM", () => {
    const { api, send } = makeApi();
    api.getItemProps("bold").onClick();
    expect(send).toHaveBeenCalledWith({ type: "PRESS_ITEM", value: "bold" });
  });

  it("disabled root: onClick does not send", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getItemProps("bold").onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("itemDisabled=true: onClick does not send", () => {
    const { api, send } = makeApi();
    api.getItemProps("bold", true).onClick();
    expect(send).not.toHaveBeenCalled();
  });

  it("Enter sends PRESS_ITEM", () => {
    const { api, send } = makeApi();
    const e = { key: "Enter", preventDefault: vi.fn() } as unknown as KeyboardEvent;
    api.getItemProps("bold").onKeyDown(e);
    expect(send).toHaveBeenCalledWith({ type: "PRESS_ITEM", value: "bold" });
  });

  it("Space sends PRESS_ITEM", () => {
    const { api, send } = makeApi();
    const e = { key: " ", preventDefault: vi.fn() } as unknown as KeyboardEvent;
    api.getItemProps("bold").onKeyDown(e);
    expect(send).toHaveBeenCalledWith({ type: "PRESS_ITEM", value: "bold" });
  });
});

// ─── isItemPressed ────────────────────────────────────────────────────────

describe("connectToggleGroup — isItemPressed", () => {
  it("returns true for values in the array", () => {
    const { api } = makeApi({ value: ["bold"] });
    expect(api.isItemPressed("bold")).toBe(true);
  });

  it("returns false for values not in the array", () => {
    const { api } = makeApi({ value: ["bold"] });
    expect(api.isItemPressed("italic")).toBe(false);
  });
});

// ─── Vue onKeydown alias ──────────────────────────────────────────────────

describe("connectToggleGroup — onKeydown (Vue alias)", () => {
  it("Enter sends PRESS_ITEM via lowercase alias", () => {
    const { api, send } = makeApi();
    const props = api.getItemProps("bold") as Record<string, (e: unknown) => void>;
    props["onKeydown"]({ key: "Enter", preventDefault: vi.fn() });
    expect(send).toHaveBeenCalledWith({ type: "PRESS_ITEM", value: "bold" });
  });
});
