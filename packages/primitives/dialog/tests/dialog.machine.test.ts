import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDialogMachine } from "../src/dialog.machine.js";

function makeMachine(overrides = {}) {
  const m = createDialogMachine({ id: "test", ...overrides });
  m.start();
  return m;
}

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

  it("ESCAPE_KEY closes when closeOnEscapeKey=true (default)", () => {
    const m = makeMachine();
    m.send("OPEN");
    m.send("ESCAPE_KEY");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("ESCAPE_KEY blocked when closeOnEscapeKey=false", () => {
    const m = makeMachine({ closeOnEscapeKey: false });
    m.send("OPEN");
    m.send("ESCAPE_KEY");
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("INTERACT_OUTSIDE closes when closeOnInteractOutside=true (default)", () => {
    const m = makeMachine();
    m.send("OPEN");
    m.send("INTERACT_OUTSIDE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("INTERACT_OUTSIDE blocked when closeOnInteractOutside=false", () => {
    const m = makeMachine({ closeOnInteractOutside: false });
    m.send("OPEN");
    m.send("INTERACT_OUTSIDE");
    expect(m.getSnapshot().matches("open")).toBe(true);
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

describe("createDialogMachine — callbacks", () => {
  it("calls onOpen when transitioning to open", () => {
    const onOpen = vi.fn();
    const m = makeMachine({ onOpen });
    m.send("OPEN");
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when transitioning to closed", () => {
    const onClose = vi.fn();
    const m = makeMachine({ onClose });
    m.send("OPEN");
    m.send("CLOSE");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenChange(true) on open", () => {
    const onOpenChange = vi.fn();
    const m = makeMachine({ onOpenChange });
    m.send("OPEN");
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("calls onOpenChange(false) on close", () => {
    const onOpenChange = vi.fn();
    const m = makeMachine({ onOpenChange });
    m.send("OPEN");
    m.send("CLOSE");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("does NOT call onClose on initial start", () => {
    const onClose = vi.fn();
    makeMachine({ onClose });
    expect(onClose).not.toHaveBeenCalled();
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

  it("setContext(contentEl) is visible to activities", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const m = makeMachine();
    m.setContext({ contentEl: el });
    m.send("OPEN");
    expect(m.getSnapshot().context.contentEl).toBe(el);
    el.remove();
  });
});
