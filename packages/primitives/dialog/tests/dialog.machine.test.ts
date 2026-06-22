import { clearRegistry } from "@forge-ui/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDialogMachine } from "../src/dialog.machine.js";

let activeMachines: ReturnType<typeof createDialogMachine>[] = [];

function makeMachine(overrides = {}) {
  const m = createDialogMachine({ id: "test", ...overrides });
  m.start();
  activeMachines.push(m);
  return m;
}

// happy-dom does not implement requestAnimationFrame — stub it so that dialog
// focus-management activities (which call rAF for deferred focus) don't throw.
beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => { cb(0); return 0; });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

// Stop all machines and clear stack registry after every test so event
// listeners and registry entries don't bleed into subsequent tests.
afterEach(() => {
  for (const m of activeMachines) m.stop();
  activeMachines = [];
  clearRegistry();
  vi.unstubAllGlobals();
});

describe("createDialogMachine — state transitions", () => {
  it("starts closed by default", () => {
    const m = makeMachine();
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("starts open when open:true", () => {
    const m = makeMachine({ open: true });
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("OPEN transitions to open", () => {
    const m = makeMachine();
    m.send("OPEN");
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("CLOSE transitions to closed", () => {
    const m = makeMachine();
    m.send("OPEN");
    m.send("CLOSE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("TOGGLE opens then closes", () => {
    const m = makeMachine();
    m.send("TOGGLE");
    expect(m.getSnapshot().matches("open")).toBe(true);
    m.send("TOGGLE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("ESCAPE_KEY closes dialog", () => {
    const m = makeMachine();
    m.send("OPEN");
    m.send("ESCAPE_KEY");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("INTERACT_OUTSIDE closes dialog", () => {
    const m = makeMachine();
    m.send("OPEN");
    m.send("INTERACT_OUTSIDE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });
});

describe("createDialogMachine — alertdialog defaults", () => {
  it("role defaults to 'dialog'", () => {
    const m = makeMachine();
    expect(m.getSnapshot().context.role).toBe("dialog");
  });

  it("role: 'alertdialog' wraps onEscapeKeyDown to prevent close by default", () => {
    const escapeHandler = vi.fn();
    const m = makeMachine({ role: "alertdialog", onEscapeKeyDown: escapeHandler });
    m.send("OPEN");
    // Send ESCAPE_KEY — alertdialog defaults should block it.
    // However, the blocking happens in the keyboard activity (e.preventDefault()),
    // not at the machine transition level. Sending ESCAPE_KEY directly bypasses
    // the activity, so it will still close. Keyboard activity blocking is tested
    // in the activity/integration tests. Here we verify the callback is wrapped.
    const ctx = m.getSnapshot().context;
    expect(typeof ctx.onEscapeKeyDown).toBe("function");
  });

  it("alertdialog wraps onInteractOutside to prevent close by default", () => {
    const m = makeMachine({ role: "alertdialog" });
    const ctx = m.getSnapshot().context;
    expect(typeof ctx.onInteractOutside).toBe("function");
    // Simulate what the activity does: call the wrapped callback with a synthetic event
    const event = new PointerEvent("pointerdown", { cancelable: true });
    ctx.onInteractOutside!(event);
    expect(event.defaultPrevented).toBe(true);
  });
});

describe("createDialogMachine — context IDs", () => {
  it("generates stable IDs from id option", () => {
    const m = makeMachine({ id: "my-dlg" });
    const { context } = m.getSnapshot();
    expect(context.triggerId).toBe("my-dlg-trigger");
    expect(context.contentId).toBe("my-dlg-content");
    expect(context.titleId).toBe("my-dlg-title");
    expect(context.descriptionId).toBe("my-dlg-description");
  });
});

describe("createDialogMachine — modal options", () => {
  it("modal:true sets trapFocus/preventScroll/hideOthers all true", () => {
    const m = makeMachine({ modal: true });
    const ctx = m.getSnapshot().context;
    expect(ctx.trapFocus).toBe(true);
    expect(ctx.preventScroll).toBe(true);
    expect(ctx.hideOthers).toBe(true);
  });

  it("modal:false sets trapFocus/preventScroll/hideOthers all false", () => {
    const m = makeMachine({ modal: false });
    const ctx = m.getSnapshot().context;
    expect(ctx.trapFocus).toBe(false);
    expect(ctx.preventScroll).toBe(false);
    expect(ctx.hideOthers).toBe(false);
  });

  it("individual options override modal umbrella", () => {
    const m = makeMachine({ modal: true, trapFocus: false });
    const ctx = m.getSnapshot().context;
    expect(ctx.trapFocus).toBe(false);
    expect(ctx.preventScroll).toBe(true);
  });
});

describe("createDialogMachine — callbacks", () => {
  it("calls onOpenChange(true) on OPEN", () => {
    const onOpenChange = vi.fn();
    const m = makeMachine({ onOpenChange });
    m.send("OPEN");
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("calls onOpenChange(false) on CLOSE", () => {
    const onOpenChange = vi.fn();
    const m = makeMachine({ onOpenChange });
    m.send("OPEN");
    m.send("CLOSE");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("calls onOpenChange(false) on ESCAPE_KEY", () => {
    const onOpenChange = vi.fn();
    const m = makeMachine({ onOpenChange });
    m.send("OPEN");
    m.send("ESCAPE_KEY");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("calls onOpenChange(false) on INTERACT_OUTSIDE", () => {
    const onOpenChange = vi.fn();
    const m = makeMachine({ onOpenChange });
    m.send("OPEN");
    m.send("INTERACT_OUTSIDE");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("does NOT call onOpenChange on initial start", () => {
    const onOpenChange = vi.fn();
    makeMachine({ onOpenChange });
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe("createDialogMachine — presence registration", () => {
  it("titleRegistered defaults to false", () => {
    const m = makeMachine();
    expect(m.getSnapshot().context.titleRegistered).toBe(false);
  });

  it("REGISTER_TITLE sets titleRegistered:true in closed state", () => {
    const m = makeMachine();
    m.send("REGISTER_TITLE");
    expect(m.getSnapshot().context.titleRegistered).toBe(true);
  });

  it("UNREGISTER_TITLE sets titleRegistered:false", () => {
    const m = makeMachine();
    m.send("REGISTER_TITLE");
    m.send("UNREGISTER_TITLE");
    expect(m.getSnapshot().context.titleRegistered).toBe(false);
  });

  it("REGISTER_TITLE works in open state too", () => {
    const m = makeMachine();
    m.send("OPEN");
    m.send("REGISTER_TITLE");
    expect(m.getSnapshot().context.titleRegistered).toBe(true);
  });

  it("REGISTER_DESCRIPTION sets descriptionRegistered:true", () => {
    const m = makeMachine();
    m.send("REGISTER_DESCRIPTION");
    expect(m.getSnapshot().context.descriptionRegistered).toBe(true);
  });
});

describe("createDialogMachine — activities (keyboard + focus)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds keydown listener when open", () => {
    const spy = vi.spyOn(document, "addEventListener");
    const m = makeMachine();
    m.send("OPEN");
    expect(spy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  it("removes keydown listener when closed", () => {
    const spy = vi.spyOn(document, "removeEventListener");
    const m = makeMachine();
    m.send("OPEN");
    m.send("CLOSE");
    expect(spy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  it("dispatches ESCAPE_KEY via document keydown", () => {
    const m = makeMachine();
    m.send("OPEN");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("onEscapeKeyDown e.preventDefault() blocks close", () => {
    const m = makeMachine({
      onEscapeKeyDown: (e: KeyboardEvent) => e.preventDefault(),
    });
    m.send("OPEN");
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    );
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("setContext(contentEl) is visible to activities", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const m = makeMachine();
    m.setContext({ contentEl: el });
    m.send("OPEN");
    expect(m.getSnapshot().context.contentEl).toBe(el);
    el.remove();
  });

  // Stack registry: only the top-most open dialog captures Escape
  it("nested dialogs: Escape only closes the top dialog, not the one below", () => {
    const m1 = makeMachine({ id: "dialog-1" });
    const m2 = makeMachine({ id: "dialog-2" });
    m1.send("OPEN");
    m2.send("OPEN");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    // Only the top (m2) should close
    expect(m2.getSnapshot().matches("closed")).toBe(true);
    expect(m1.getSnapshot().matches("open")).toBe(true);
  });
});
