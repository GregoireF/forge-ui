import { describe, expect, it } from "vitest";
import { connectDialog } from "../src/dialog.connect.js";
import { createDialogMachine } from "../src/dialog.machine.js";

function makeApi(overrides = {}) {
  const machine = createDialogMachine({ id: "test", ...overrides });
  machine.start();
  const snapshot = machine.getSnapshot();
  const api = connectDialog(snapshot, machine.send.bind(machine), machine);
  return { machine, api };
}

function makeOpenApi(overrides = {}) {
  const machine = createDialogMachine({ id: "test", open: true, ...overrides });
  machine.start();
  const snapshot = machine.getSnapshot();
  const api = connectDialog(snapshot, machine.send.bind(machine), machine);
  return { machine, api };
}

describe("connectDialog — isOpen", () => {
  it("is false when closed", () => {
    const { api } = makeApi();
    expect(api.isOpen).toBe(false);
  });

  it("is true when open", () => {
    const { api } = makeOpenApi();
    expect(api.isOpen).toBe(true);
  });
});

describe("connectDialog — getTriggerProps", () => {
  it("has correct ARIA attributes when closed", () => {
    const { api } = makeApi();
    const props = api.getTriggerProps();
    expect(props["aria-expanded"]).toBe(false);
    expect(props["aria-haspopup"]).toBe("dialog");
    expect(props["aria-controls"]).toBe("test-content");
    expect(props["data-state"]).toBe("closed");
  });

  it("has aria-expanded=true when open", () => {
    const { api } = makeOpenApi();
    expect(api.getTriggerProps()["aria-expanded"]).toBe(true);
  });

  it("has data-forge-scope='dialog' and data-forge-part='trigger'", () => {
    const { api } = makeApi();
    const props = api.getTriggerProps();
    expect(props["data-forge-scope"]).toBe("dialog");
    expect(props["data-forge-part"]).toBe("trigger");
  });

  it("includes a ref callback that sets triggerEl on machine", () => {
    const { machine, api } = makeApi();
    const el = document.createElement("button");
    api.getTriggerProps().ref(el);
    expect(machine.getSnapshot().context.triggerEl).toBe(el);
  });

  it("onClick sends TOGGLE", () => {
    const { machine, api } = makeApi();
    api.getTriggerProps().onClick();
    expect(machine.getSnapshot().matches("open")).toBe(true);
  });
});

describe("connectDialog — getContentProps", () => {
  it("has correct ARIA attributes", () => {
    const { api } = makeOpenApi();
    const props = api.getContentProps();
    expect(props.role).toBe("dialog");
    expect(props["aria-modal"]).toBe(true);
    expect(props["aria-labelledby"]).toBe("test-title");
    expect(props["aria-describedby"]).toBe("test-description");
    expect(props["data-state"]).toBe("open");
  });

  it("role reflects context.role ('alertdialog')", () => {
    const machine = createDialogMachine({ id: "test", open: true, role: "alertdialog" });
    machine.start();
    const snapshot = machine.getSnapshot();
    const api = connectDialog(snapshot, machine.send.bind(machine), machine);
    expect(api.getContentProps().role).toBe("alertdialog");
  });

  it("has data-forge-scope='dialog' and data-forge-part='content'", () => {
    const { api } = makeOpenApi();
    const props = api.getContentProps();
    expect(props["data-forge-scope"]).toBe("dialog");
    expect(props["data-forge-part"]).toBe("content");
  });

  it("includes a ref callback that sets contentEl on machine", () => {
    const { machine, api } = makeOpenApi();
    const el = document.createElement("div");
    api.getContentProps().ref(el);
    expect(machine.getSnapshot().context.contentEl).toBe(el);
  });

  it("has no onKeyDown (keyboard handled by machine activity)", () => {
    const { api } = makeOpenApi();
    expect((api.getContentProps() as Record<string, unknown>).onKeyDown).toBeUndefined();
  });
});

describe("connectDialog — getOverlayProps / getBackdropProps", () => {
  it("getOverlayProps is aria-hidden", () => {
    const { api } = makeApi();
    expect(api.getOverlayProps()["aria-hidden"]).toBe(true);
  });

  it("getOverlayProps has data-forge-part='overlay'", () => {
    const { api } = makeApi();
    expect(api.getOverlayProps()["data-forge-part"]).toBe("overlay");
  });

  it("getBackdropProps is an alias for getOverlayProps", () => {
    const { api } = makeApi();
    expect(api.getBackdropProps()["aria-hidden"]).toBe(true);
    expect(api.getBackdropProps()["data-forge-part"]).toBe("overlay");
  });

  it("has no onClick (interact-outside handled by machine activity)", () => {
    const { api } = makeApi();
    expect((api.getOverlayProps() as Record<string, unknown>).onClick).toBeUndefined();
  });
});

describe("connectDialog — getCloseProps", () => {
  it("onClick sends CLOSE", () => {
    const { machine, api } = makeOpenApi();
    api.getCloseProps().onClick();
    expect(machine.getSnapshot().matches("closed")).toBe(true);
  });

  it("has data-forge-scope='dialog' and data-forge-part='close'", () => {
    const { api } = makeApi();
    const props = api.getCloseProps();
    expect(props["data-forge-scope"]).toBe("dialog");
    expect(props["data-forge-part"]).toBe("close");
  });
});

describe("connectDialog — getTitleProps / getDescriptionProps", () => {
  it("title has correct id", () => {
    const { api } = makeApi();
    expect(api.getTitleProps().id).toBe("test-title");
  });

  it("title has data-forge-scope and data-forge-part", () => {
    const { api } = makeApi();
    expect(api.getTitleProps()["data-forge-scope"]).toBe("dialog");
    expect(api.getTitleProps()["data-forge-part"]).toBe("title");
  });

  it("description has correct id", () => {
    const { api } = makeApi();
    expect(api.getDescriptionProps().id).toBe("test-description");
  });
});
