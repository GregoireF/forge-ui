import { clearRegistry } from "@forge-ui/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAlertDialogMachine } from "../src/alert-dialog.machine.js";

let active: ReturnType<typeof createAlertDialogMachine>[] = [];

function make(opts: Partial<Parameters<typeof createAlertDialogMachine>[0]> = {}) {
  const m = createAlertDialogMachine({ id: "test", ...opts });
  m.start();
  active.push(m);
  return m;
}

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => { cb(0); return 0; });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  for (const m of active) m.stop();
  active = [];
  clearRegistry();
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Initial state — delegates to dialog machine
// ---------------------------------------------------------------------------

describe("createAlertDialogMachine — initial state", () => {
  it("starts closed by default", () => {
    const m = make();
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("defaultOpen=true starts open", () => {
    const m = make({ defaultOpen: true });
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("role is 'alertdialog' (WAI-ARIA §3.2: must not be 'dialog')", () => {
    const m = make();
    expect(m.getSnapshot().context.role).toBe("alertdialog");
  });

  it("IDs derived from id option", () => {
    const m = createAlertDialogMachine({ id: "confirm" });
    m.start();
    active.push(m);
    const ctx = m.getSnapshot().context;
    expect(ctx.titleId).toBe("confirm-title");
    expect(ctx.descriptionId).toBe("confirm-description");
  });
});

// ---------------------------------------------------------------------------
// OPEN / CLOSE — same as dialog
// ---------------------------------------------------------------------------

describe("createAlertDialogMachine — OPEN / CLOSE", () => {
  it("OPEN transitions closed → open", () => {
    const m = make();
    m.send("OPEN");
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("CLOSE transitions open → closed", () => {
    const m = make({ defaultOpen: true });
    m.send("CLOSE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// WAI-ARIA §3.2: AlertDialog MUST block Escape and outside clicks
// The machine wraps both callbacks so e.preventDefault() is ALWAYS called.
// ---------------------------------------------------------------------------

describe("createAlertDialogMachine — WAI-ARIA Escape prevention", () => {
  it("context.onEscapeKeyDown always calls e.preventDefault() (blocks dismiss)", () => {
    const m = make();
    const handler = m.getSnapshot().context.onEscapeKeyDown;
    expect(handler).toBeDefined();

    const e = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
    handler!(e);
    expect(e.defaultPrevented).toBe(true);
  });

  it("user's onEscapeKeyDown is still called before preventDefault", () => {
    const userCb = vi.fn();
    const m = make({ onEscapeKeyDown: userCb });
    const handler = m.getSnapshot().context.onEscapeKeyDown;

    const e = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
    handler!(e);
    expect(userCb).toHaveBeenCalledWith(e);
    expect(e.defaultPrevented).toBe(true);
  });

  it("works correctly when no user onEscapeKeyDown is provided", () => {
    const m = make();
    const handler = m.getSnapshot().context.onEscapeKeyDown;

    const e = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
    expect(() => handler!(e)).not.toThrow();
    expect(e.defaultPrevented).toBe(true);
  });
});

describe("createAlertDialogMachine — WAI-ARIA outside interaction prevention", () => {
  it("context.onInteractOutside always calls e.preventDefault() (blocks dismiss)", () => {
    const m = make();
    const handler = m.getSnapshot().context.onInteractOutside;
    expect(handler).toBeDefined();

    const e = new PointerEvent("pointerdown", { cancelable: true });
    handler!(e);
    expect(e.defaultPrevented).toBe(true);
  });

  it("user's onInteractOutside is still called before preventDefault", () => {
    const userCb = vi.fn();
    const m = make({ onInteractOutside: userCb });
    const handler = m.getSnapshot().context.onInteractOutside;

    const e = new PointerEvent("pointerdown", { cancelable: true });
    handler!(e);
    expect(userCb).toHaveBeenCalledWith(e);
    expect(e.defaultPrevented).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// onOpenChange callback
// ---------------------------------------------------------------------------

describe("createAlertDialogMachine — onOpenChange", () => {
  it("called with true on OPEN", () => {
    const cb = vi.fn();
    const m = make({ onOpenChange: cb });
    m.send("OPEN");
    expect(cb).toHaveBeenCalledWith(true);
  });

  it("called with false on CLOSE", () => {
    const cb = vi.fn();
    const m = make({ defaultOpen: true, onOpenChange: cb });
    m.send("CLOSE");
    expect(cb).toHaveBeenCalledWith(false);
  });

  it("NOT called on initial start", () => {
    const cb = vi.fn();
    make({ defaultOpen: true, onOpenChange: cb });
    expect(cb).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Focus management — WAI-ARIA alert dialog must manage focus identically to
// dialog (delegated to createDialogMachine under the hood)
// ---------------------------------------------------------------------------

describe("createAlertDialogMachine — focus management (WAI-ARIA §6.2)", () => {
  function makeElements(): {
    trigger: HTMLButtonElement;
    content: HTMLDivElement;
    inside: HTMLButtonElement;
  } {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    const content = document.createElement("div");
    const inside = document.createElement("button");
    content.appendChild(inside);
    document.body.appendChild(content);
    return { trigger, content, inside };
  }

  it("restores focus to previously focused element on close", () => {
    const { trigger, content, inside } = makeElements();
    trigger.focus();
    const m = make();
    m.setContext({ contentEl: content });
    m.send("OPEN");
    expect(document.activeElement).toBe(inside);
    m.send("CLOSE");
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
    content.remove();
  });

  it("moves focus into content on open via initialFocusEl", () => {
    const { trigger, content } = makeElements();
    const btn2 = document.createElement("button");
    content.appendChild(btn2);
    trigger.focus();
    const m = make({ initialFocusEl: () => btn2 });
    m.setContext({ contentEl: content });
    m.send("OPEN");
    expect(document.activeElement).toBe(btn2);
    trigger.remove();
    content.remove();
  });

  it("onCloseAutoFocus e.preventDefault() prevents focus restoration", () => {
    const { trigger, content, inside } = makeElements();
    trigger.focus();
    const m = make({ onCloseAutoFocus: (e: Event) => e.preventDefault() });
    m.setContext({ contentEl: content });
    m.send("OPEN");
    inside.focus();
    m.send("CLOSE");
    expect(document.activeElement).not.toBe(trigger);
    trigger.remove();
    content.remove();
  });
});
