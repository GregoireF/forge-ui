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

describe("connectDialog — getBackdropProps", () => {
  it("is aria-hidden", () => {
    const { api } = makeApi();
    expect(api.getBackdropProps()["aria-hidden"]).toBe(true);
  });

  it("has no onClick (interact-outside handled by machine activity)", () => {
    const { api } = makeApi();
    expect((api.getBackdropProps() as Record<string, unknown>).onClick).toBeUndefined();
  });
});

describe("connectDialog — getCloseProps", () => {
  it("onClick sends CLOSE", () => {
    const { machine, api } = makeOpenApi();
    api.getCloseProps().onClick();
    expect(machine.getSnapshot().matches("closed")).toBe(true);
  });
});

describe("connectDialog — getTitleProps / getDescriptionProps", () => {
  it("title has correct id", () => {
    const { api } = makeApi();
    expect(api.getTitleProps().id).toBe("test-title");
  });

  it("description has correct id", () => {
    const { api } = makeApi();
    expect(api.getDescriptionProps().id).toBe("test-description");
  });
});
