import { describe, expect, it } from "vitest";
import { connectPopover } from "../src/popover.connect.js";
import { createPopoverMachine } from "../src/popover.machine.js";

function makeApi(overrides = {}) {
  const machine = createPopoverMachine({ id: "test", ...overrides });
  machine.start();
  const snapshot = machine.getSnapshot();
  const api = connectPopover(snapshot, machine.send.bind(machine), machine);
  return { machine, api };
}

function makeOpenApi(overrides = {}) {
  const machine = createPopoverMachine({ id: "test", open: true, ...overrides });
  machine.start();
  const snapshot = machine.getSnapshot();
  const api = connectPopover(snapshot, machine.send.bind(machine), machine);
  return { machine, api };
}

describe("connectPopover — isOpen", () => {
  it("is false when closed", () => {
    const { api } = makeApi();
    expect(api.isOpen).toBe(false);
  });

  it("is true when open", () => {
    const { api } = makeOpenApi();
    expect(api.isOpen).toBe(true);
  });
});

describe("connectPopover — getTriggerProps", () => {
  it("has correct ARIA attributes", () => {
    const { api } = makeApi();
    const props = api.getTriggerProps();
    expect(props["aria-expanded"]).toBe(false);
    expect(props["aria-haspopup"]).toBe("dialog");
    expect(props["aria-controls"]).toBe("test-content");
    expect(props["data-forge-scope"]).toBe("popover");
    expect(props["data-forge-part"]).toBe("trigger");
  });

  it("onClick sends TOGGLE", () => {
    const { machine, api } = makeApi();
    api.getTriggerProps().onClick();
    expect(machine.getSnapshot().matches("open")).toBe(true);
  });

  it("ref callback sets triggerEl", () => {
    const { machine, api } = makeApi();
    const el = document.createElement("button");
    api.getTriggerProps().ref(el);
    expect(machine.getSnapshot().context.triggerEl).toBe(el);
  });
});

describe("connectPopover — getContentProps", () => {
  it("has role=dialog and aria-modal", () => {
    const { api } = makeOpenApi();
    const props = api.getContentProps();
    expect(props.role).toBe("dialog");
    expect(props["aria-modal"]).toBe(false); // modal defaults false for popover
  });

  it("omits aria-labelledby when title is not registered", () => {
    const { api } = makeOpenApi();
    expect(api.getContentProps()["aria-labelledby"]).toBeUndefined();
  });

  it("emits aria-labelledby when title is registered", () => {
    const { machine } = makeOpenApi();
    machine.send("REGISTER_TITLE");
    const snapshot = machine.getSnapshot();
    const updated = connectPopover(snapshot, machine.send.bind(machine), machine);
    expect(updated.getContentProps()["aria-labelledby"]).toBe("test-title");
  });

  it("has data-forge-scope='popover'", () => {
    const { api } = makeOpenApi();
    expect(api.getContentProps()["data-forge-scope"]).toBe("popover");
  });

  it("ref callback sets contentEl", () => {
    const { machine, api } = makeOpenApi();
    const el = document.createElement("div");
    api.getContentProps().ref(el);
    expect(machine.getSnapshot().context.contentEl).toBe(el);
  });

  it("has data-side and data-placement from currentPlacement", () => {
    const { api } = makeOpenApi();
    const props = api.getContentProps();
    expect(props["data-side"]).toBe("bottom"); // default placement
    expect(props["data-placement"]).toBe("bottom");
  });

  it("exposes CSS custom property for transform-origin", () => {
    const { api } = makeOpenApi();
    const style = api.getContentProps().style as Record<string, string>;
    expect(style["--forge-popover-content-transform-origin"]).toBeDefined();
  });
});

describe("connectPopover — getPositionerProps", () => {
  it("has position:fixed by default", () => {
    const { api } = makeOpenApi();
    const style = api.getPositionerProps().style;
    expect(style.position).toBe("fixed");
  });

  it("has data-forge-part='positioner'", () => {
    const { api } = makeOpenApi();
    expect(api.getPositionerProps()["data-forge-part"]).toBe("positioner");
  });
});

describe("connectPopover — getAnchorProps", () => {
  it("ref callback sets anchorEl", () => {
    const { machine, api } = makeApi();
    const el = document.createElement("div");
    api.getAnchorProps().ref(el);
    expect(machine.getSnapshot().context.anchorEl).toBe(el);
  });

  it("has data-forge-part='anchor'", () => {
    const { api } = makeApi();
    expect(api.getAnchorProps()["data-forge-part"]).toBe("anchor");
  });
});

describe("connectPopover — getArrowProps", () => {
  it("ref callback sets arrowEl", () => {
    const { machine, api } = makeApi();
    const el = document.createElement("div");
    api.getArrowProps().ref(el);
    expect(machine.getSnapshot().context.arrowEl).toBe(el);
  });

  it("has data-forge-part='arrow'", () => {
    const { api } = makeApi();
    expect(api.getArrowProps()["data-forge-part"]).toBe("arrow");
  });
});

describe("connectPopover — getCloseProps", () => {
  it("onClick sends CLOSE", () => {
    const { machine, api } = makeOpenApi();
    api.getCloseProps().onClick();
    expect(machine.getSnapshot().matches("closed")).toBe(true);
  });
});

describe("connectPopover — getTitleProps / getDescriptionProps", () => {
  it("title has correct id", () => {
    const { api } = makeApi();
    expect(api.getTitleProps().id).toBe("test-title");
  });

  it("description has correct id", () => {
    const { api } = makeApi();
    expect(api.getDescriptionProps().id).toBe("test-description");
  });
});
