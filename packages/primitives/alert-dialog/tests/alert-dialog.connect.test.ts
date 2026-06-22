import { describe, expect, it, vi } from "vitest";
import { connectAlertDialog } from "../src/alert-dialog.connect.js";
import type { DialogContext, DialogState } from "@forge-ui/dialog";

function makeCtx(overrides: Partial<DialogContext> = {}): DialogContext {
  return {
    id: "test-alert",
    open: false,
    role: "alertdialog",
    modal: true,
    trapFocus: true,
    preventScroll: true,
    hideOthers: true,
    contentEl: null,
    triggerEl: null,
    triggerId: "test-alert-trigger",
    contentId: "test-alert-content",
    titleId: "test-alert-title",
    descriptionId: "test-alert-description",
    titleRegistered: false,
    descriptionRegistered: false,
    ...overrides,
  };
}

function makeSnapshot(ctx: DialogContext, state: DialogState = "closed") {
  return { value: state, context: ctx, matches: (s: string) => s === state };
}

function makeApi(overrides: Partial<DialogContext> = {}, state: DialogState = "closed") {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  return { api: connectAlertDialog(makeSnapshot(ctx, state), send, machine), send };
}

// ---------------------------------------------------------------------------
// isOpen
// ---------------------------------------------------------------------------

describe("connectAlertDialog — isOpen", () => {
  it("isOpen=false when state=closed", () => {
    const { api } = makeApi({}, "closed");
    expect(api.isOpen).toBe(false);
  });

  it("isOpen=true when state=open", () => {
    const { api } = makeApi({}, "open");
    expect(api.isOpen).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getTriggerProps — interaction (delegated to dialog connect)
// ---------------------------------------------------------------------------

describe("connectAlertDialog — getTriggerProps interactions", () => {
  it("onClick sends TOGGLE (dialog connect uses TOGGLE, not OPEN)", () => {
    const { api, send } = makeApi({}, "closed");
    api.getTriggerProps().onClick();
    expect(send).toHaveBeenCalledWith("TOGGLE");
  });

  it("data-state=open when open", () => {
    const { api } = makeApi({}, "open");
    expect(api.getTriggerProps()["data-state"]).toBe("open");
  });

  it("data-state=closed when closed", () => {
    const { api } = makeApi({}, "closed");
    expect(api.getTriggerProps()["data-state"]).toBe("closed");
  });
});

// ---------------------------------------------------------------------------
// scope — ALL parts must be "alert-dialog"
// ---------------------------------------------------------------------------

describe("connectAlertDialog — data-forge-scope", () => {
  it("getTriggerProps has scope=alert-dialog", () => {
    const { api } = makeApi();
    expect(api.getTriggerProps()["data-forge-scope"]).toBe("alert-dialog");
  });

  it("getContentProps has scope=alert-dialog", () => {
    const { api } = makeApi();
    expect(api.getContentProps()["data-forge-scope"]).toBe("alert-dialog");
  });

  it("getOverlayProps has scope=alert-dialog", () => {
    const { api } = makeApi();
    expect(api.getOverlayProps()["data-forge-scope"]).toBe("alert-dialog");
  });

  it("getTitleProps has scope=alert-dialog", () => {
    const { api } = makeApi();
    expect(api.getTitleProps()["data-forge-scope"]).toBe("alert-dialog");
  });

  it("getDescriptionProps has scope=alert-dialog", () => {
    const { api } = makeApi();
    expect(api.getDescriptionProps()["data-forge-scope"]).toBe("alert-dialog");
  });

  it("getCancelProps has scope=alert-dialog", () => {
    const { api } = makeApi();
    expect(api.getCancelProps()["data-forge-scope"]).toBe("alert-dialog");
  });

  it("getActionProps has scope=alert-dialog", () => {
    const { api } = makeApi();
    expect(api.getActionProps()["data-forge-scope"]).toBe("alert-dialog");
  });
});

// ---------------------------------------------------------------------------
// getCancelProps
// ---------------------------------------------------------------------------

describe("connectAlertDialog — getCancelProps", () => {
  it("data-forge-part=cancel", () => {
    const { api } = makeApi();
    expect(api.getCancelProps()["data-forge-part"]).toBe("cancel");
  });

  it("onClick sends CLOSE", () => {
    const { api, send } = makeApi();
    api.getCancelProps().onClick();
    expect(send).toHaveBeenCalledWith("CLOSE");
  });
});

// ---------------------------------------------------------------------------
// getActionProps
// ---------------------------------------------------------------------------

describe("connectAlertDialog — getActionProps", () => {
  it("data-forge-part=action", () => {
    const { api } = makeApi();
    expect(api.getActionProps()["data-forge-part"]).toBe("action");
  });

  it("type=button", () => {
    const { api } = makeApi();
    expect(api.getActionProps().type).toBe("button");
  });

  it("does NOT auto-close — no onClick send", () => {
    // Action button intentionally has no onClick handler that closes
    const { api } = makeApi();
    const actionProps = api.getActionProps();
    // Only scope / part / type are defined — no onClick
    expect("onClick" in actionProps).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getContentProps — role
// ---------------------------------------------------------------------------

describe("connectAlertDialog — getContentProps role", () => {
  it("role=alertdialog (from dialog context role)", () => {
    const { api } = makeApi({ role: "alertdialog" });
    expect(api.getContentProps().role).toBe("alertdialog");
  });

  it("aria-modal is set", () => {
    const { api } = makeApi({ modal: true });
    expect(api.getContentProps()["aria-modal"]).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// aria-labelledby / aria-describedby — conditional on registration
// ---------------------------------------------------------------------------

describe("connectAlertDialog — conditional ARIA", () => {
  it("aria-labelledby present when titleRegistered", () => {
    const { api } = makeApi({ titleRegistered: true, titleId: "my-title" });
    expect(api.getContentProps()["aria-labelledby"]).toBe("my-title");
  });

  it("aria-labelledby absent when titleRegistered=false", () => {
    const { api } = makeApi({ titleRegistered: false });
    expect(api.getContentProps()["aria-labelledby"]).toBeUndefined();
  });

  it("aria-describedby present when descriptionRegistered", () => {
    const { api } = makeApi({ descriptionRegistered: true, descriptionId: "my-desc" });
    expect(api.getContentProps()["aria-describedby"]).toBe("my-desc");
  });
});
