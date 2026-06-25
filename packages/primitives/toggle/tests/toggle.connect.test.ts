import { describe, expect, it, vi } from "vitest";
import { connectToggle } from "../src/toggle.connect.js";
import type { ToggleContext, ToggleState } from "../src/toggle.types.js";

function makeCtx(overrides: Partial<ToggleContext> = {}): ToggleContext {
  return {
    id: "t",
    pressed: false,
    disabled: false,
    ...overrides,
  };
}

function makeSnapshot(ctx: ToggleContext, state: ToggleState = "off") {
  return { value: state, context: ctx, matches: (s: string) => s === state };
}

function makeApi(overrides: Partial<ToggleContext> = {}, state?: ToggleState) {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  const snap = makeSnapshot(ctx, state ?? (ctx.pressed ? "on" : "off"));
  return { api: connectToggle(snap, send, machine), send, ctx };
}

// ─── getRootProps ──────────────────────────────────────────────────────────

describe("connectToggle — getRootProps", () => {
  it("role=button", () => {
    const { api } = makeApi();
    expect(api.getRootProps().role).toBe("button");
  });

  it("aria-pressed=false when not pressed", () => {
    const { api } = makeApi({ pressed: false });
    expect(api.getRootProps()["aria-pressed"]).toBe(false);
  });

  it("aria-pressed=true when pressed", () => {
    const { api } = makeApi({ pressed: true });
    expect(api.getRootProps()["aria-pressed"]).toBe(true);
  });

  it("data-state=off when not pressed", () => {
    const { api } = makeApi({ pressed: false });
    expect(api.getRootProps()["data-state"]).toBe("off");
  });

  it("data-state=on when pressed", () => {
    const { api } = makeApi({ pressed: true });
    expect(api.getRootProps()["data-state"]).toBe("on");
  });

  it("data-pressed='' when pressed", () => {
    const { api } = makeApi({ pressed: true });
    expect(api.getRootProps()["data-pressed"]).toBe("");
  });

  it("data-pressed=undefined when not pressed", () => {
    const { api } = makeApi({ pressed: false });
    expect(api.getRootProps()["data-pressed"]).toBeUndefined();
  });

  it("data-disabled='' when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getRootProps()["data-disabled"]).toBe("");
  });

  it("aria-disabled=true when disabled", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.getRootProps()["aria-disabled"]).toBe(true);
  });

  it("data-value set when value provided", () => {
    const { api } = makeApi({ value: "bold" });
    expect(api.getRootProps()["data-value"]).toBe("bold");
  });

  it("data-value absent when value not provided", () => {
    const { api } = makeApi();
    expect(api.getRootProps()["data-value"]).toBeUndefined();
  });
});

// ─── onClick ──────────────────────────────────────────────────────────────

describe("connectToggle — onClick", () => {
  it("sends TOGGLE", () => {
    const { api, send } = makeApi();
    api.getRootProps().onClick();
    expect(send).toHaveBeenCalledWith({ type: "TOGGLE" });
  });

  it("disabled: does not send", () => {
    const { api, send } = makeApi({ disabled: true });
    api.getRootProps().onClick();
    expect(send).not.toHaveBeenCalled();
  });
});

// ─── keyboard ─────────────────────────────────────────────────────────────

describe("connectToggle — onKeyDown", () => {
  it("Enter sends TOGGLE", () => {
    const { api, send } = makeApi();
    const e = { key: "Enter", preventDefault: vi.fn() } as unknown as KeyboardEvent;
    api.getRootProps().onKeyDown(e);
    expect(send).toHaveBeenCalledWith({ type: "TOGGLE" });
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("Space sends TOGGLE", () => {
    const { api, send } = makeApi();
    const e = { key: " ", preventDefault: vi.fn() } as unknown as KeyboardEvent;
    api.getRootProps().onKeyDown(e);
    expect(send).toHaveBeenCalledWith({ type: "TOGGLE" });
  });

  it("disabled: Enter does not send", () => {
    const { api, send } = makeApi({ disabled: true });
    const e = { key: "Enter", preventDefault: vi.fn() } as unknown as KeyboardEvent;
    api.getRootProps().onKeyDown(e);
    expect(send).not.toHaveBeenCalled();
  });

  it("other keys are ignored", () => {
    const { api, send } = makeApi();
    const e = { key: "ArrowDown", preventDefault: vi.fn() } as unknown as KeyboardEvent;
    api.getRootProps().onKeyDown(e);
    expect(send).not.toHaveBeenCalled();
  });
});

describe("connectToggle — onKeydown (Vue alias)", () => {
  it("Enter sends TOGGLE via lowercase alias", () => {
    const { api, send } = makeApi();
    const props = api.getRootProps() as Record<string, (e: unknown) => void>;
    props["onKeydown"]({ key: "Enter", preventDefault: vi.fn() });
    expect(send).toHaveBeenCalledWith({ type: "TOGGLE" });
  });
});

// ─── exposed values ───────────────────────────────────────────────────────

describe("connectToggle — exposed values", () => {
  it("isPressed reflects pressed state", () => {
    const { api } = makeApi({ pressed: true });
    expect(api.isPressed).toBe(true);
  });

  it("isDisabled reflects disabled state", () => {
    const { api } = makeApi({ disabled: true });
    expect(api.isDisabled).toBe(true);
  });

  it("value is undefined when not set", () => {
    const { api } = makeApi();
    expect(api.value).toBeUndefined();
  });

  it("value reflects context.value", () => {
    const { api } = makeApi({ value: "italic" });
    expect(api.value).toBe("italic");
  });
});
