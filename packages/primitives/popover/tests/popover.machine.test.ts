import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPopoverMachine } from "../src/popover.machine.js";

function makeMachine(overrides = {}) {
  const m = createPopoverMachine({ id: "test", ...overrides });
  m.start();
  return m;
}

describe("createPopoverMachine — state transitions", () => {
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

  it("ESCAPE_KEY closes popover", () => {
    const m = makeMachine();
    m.send("OPEN");
    m.send("ESCAPE_KEY");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("INTERACT_OUTSIDE closes popover", () => {
    const m = makeMachine();
    m.send("OPEN");
    m.send("INTERACT_OUTSIDE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });
});

describe("createPopoverMachine — defaults", () => {
  it("modal defaults to false (non-modal popover)", () => {
    const m = makeMachine();
    expect(m.getSnapshot().context.modal).toBe(false);
  });

  it("trapFocus/hideOthers default false when modal:false", () => {
    const m = makeMachine();
    const ctx = m.getSnapshot().context;
    expect(ctx.trapFocus).toBe(false);
    expect(ctx.hideOthers).toBe(false);
  });

  it("preventScroll defaults false regardless of modal", () => {
    const m = makeMachine({ modal: true });
    expect(m.getSnapshot().context.preventScroll).toBe(false);
  });

  it("modal:true sets trapFocus and hideOthers true", () => {
    const m = makeMachine({ modal: true });
    const ctx = m.getSnapshot().context;
    expect(ctx.trapFocus).toBe(true);
    expect(ctx.hideOthers).toBe(true);
  });
});

describe("createPopoverMachine — positioning context", () => {
  it("has default positioning values", () => {
    const m = makeMachine();
    const { positioning } = m.getSnapshot().context;
    expect(positioning.placement).toBe("bottom");
    expect(positioning.strategy).toBe("fixed");
    expect(positioning.offset).toBe(4);
  });

  it("accepts custom positioning options", () => {
    const m = makeMachine({ positioning: { placement: "top", offset: 8 } });
    const { positioning } = m.getSnapshot().context;
    expect(positioning.placement).toBe("top");
    expect(positioning.offset).toBe(8);
  });
});

describe("createPopoverMachine — context IDs", () => {
  it("generates stable IDs from id option", () => {
    const m = makeMachine({ id: "my-pop" });
    const { context } = m.getSnapshot();
    expect(context.triggerId).toBe("my-pop-trigger");
    expect(context.contentId).toBe("my-pop-content");
    expect(context.titleId).toBe("my-pop-title");
    expect(context.descriptionId).toBe("my-pop-description");
  });
});

describe("createPopoverMachine — presence registration", () => {
  it("REGISTER_TITLE sets titleRegistered:true", () => {
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

  it("REGISTER_DESCRIPTION sets descriptionRegistered:true", () => {
    const m = makeMachine();
    m.send("REGISTER_DESCRIPTION");
    expect(m.getSnapshot().context.descriptionRegistered).toBe(true);
  });
});

describe("createPopoverMachine — callbacks", () => {
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
});

describe("createPopoverMachine — keyboard activity", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
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
});
