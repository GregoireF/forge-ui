import { afterEach, describe, expect, it, vi } from "vitest";
import { createAvatarMachine } from "../src/avatar.machine.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let active: ReturnType<typeof createAvatarMachine>[] = [];

function make(opts: Parameters<typeof createAvatarMachine>[0] = {}) {
  const m = createAvatarMachine({ id: "test", ...opts });
  m.start();
  active.push(m);
  return m;
}

afterEach(() => {
  for (const m of active) m.stop();
  active = [];
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Initial state — no src
// ---------------------------------------------------------------------------

describe("createAvatarMachine — initial state (no src)", () => {
  it("starts in idle when no src provided", () => {
    expect(make().getSnapshot().matches("idle")).toBe(true);
  });

  it("starts in idle when src is empty string", () => {
    expect(make({ src: "" }).getSnapshot().matches("idle")).toBe(true);
  });

  it("alt defaults to empty string", () => {
    expect(make().getSnapshot().context.alt).toBe("");
  });

  it("alt is stored from options", () => {
    expect(make({ alt: "Jane Doe" }).getSnapshot().context.alt).toBe("Jane Doe");
  });

  it("name is stored from options", () => {
    expect(make({ name: "John Doe" }).getSnapshot().context.name).toBe("John Doe");
  });

  it("name is undefined when not provided", () => {
    expect(make().getSnapshot().context.name).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Initial state — with src
// ---------------------------------------------------------------------------

describe("createAvatarMachine — initial state (with src)", () => {
  it("starts in loading when src is provided", () => {
    expect(
      make({ src: "https://example.com/img.jpg" }).getSnapshot().matches("loading"),
    ).toBe(true);
  });

  it("src is stored in context", () => {
    const m = make({ src: "https://example.com/img.jpg" });
    expect(m.getSnapshot().context.src).toBe("https://example.com/img.jpg");
  });
});

// ---------------------------------------------------------------------------
// IMAGE_LOAD transition
// ---------------------------------------------------------------------------

describe("createAvatarMachine — IMAGE_LOAD", () => {
  it("transitions loading → loaded", () => {
    const m = make({ src: "https://example.com/img.jpg" });
    m.send("IMAGE_LOAD");
    expect(m.getSnapshot().matches("loaded")).toBe(true);
  });

  it("calls onStatusChange with 'loaded'", () => {
    const cb = vi.fn();
    const m = make({ src: "https://example.com/img.jpg", onStatusChange: cb });
    m.send("IMAGE_LOAD");
    expect(cb).toHaveBeenCalledWith("loaded");
  });

  it("IMAGE_LOAD ignored in idle (no src)", () => {
    const m = make();
    m.send("IMAGE_LOAD");
    expect(m.getSnapshot().matches("idle")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// IMAGE_ERROR transition
// ---------------------------------------------------------------------------

describe("createAvatarMachine — IMAGE_ERROR", () => {
  it("transitions loading → error", () => {
    const m = make({ src: "https://example.com/img.jpg" });
    m.send("IMAGE_ERROR");
    expect(m.getSnapshot().matches("error")).toBe(true);
  });

  it("calls onStatusChange with 'error'", () => {
    const cb = vi.fn();
    const m = make({ src: "https://example.com/img.jpg", onStatusChange: cb });
    m.send("IMAGE_ERROR");
    expect(cb).toHaveBeenCalledWith("error");
  });

  it("IMAGE_ERROR ignored in idle (no src)", () => {
    const m = make();
    m.send("IMAGE_ERROR");
    expect(m.getSnapshot().matches("idle")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SRC_CHANGE transitions
// ---------------------------------------------------------------------------

describe("createAvatarMachine — SRC_CHANGE", () => {
  it("idle → loading on SRC_CHANGE with valid src", () => {
    const m = make();
    m.send({ type: "SRC_CHANGE", src: "https://example.com/img.jpg" });
    expect(m.getSnapshot().matches("loading")).toBe(true);
  });

  it("loaded → loading on SRC_CHANGE", () => {
    const m = make({ src: "https://example.com/a.jpg" });
    m.send("IMAGE_LOAD");
    m.send({ type: "SRC_CHANGE", src: "https://example.com/b.jpg" });
    expect(m.getSnapshot().matches("loading")).toBe(true);
  });

  it("error → loading on SRC_CHANGE", () => {
    const m = make({ src: "https://example.com/img.jpg" });
    m.send("IMAGE_ERROR");
    m.send({ type: "SRC_CHANGE", src: "https://example.com/new.jpg" });
    expect(m.getSnapshot().matches("loading")).toBe(true);
  });

  it("loading → loading on SRC_CHANGE (src changed mid-load)", () => {
    const m = make({ src: "https://example.com/a.jpg" });
    m.send({ type: "SRC_CHANGE", src: "https://example.com/b.jpg" });
    expect(m.getSnapshot().matches("loading")).toBe(true);
    expect(m.getSnapshot().context.src).toBe("https://example.com/b.jpg");
  });

  it("updates context.src on SRC_CHANGE", () => {
    const m = make();
    m.send({ type: "SRC_CHANGE", src: "https://example.com/img.jpg" });
    expect(m.getSnapshot().context.src).toBe("https://example.com/img.jpg");
  });

  it("calls onStatusChange with 'loading' on SRC_CHANGE", () => {
    const cb = vi.fn();
    const m = make({ onStatusChange: cb });
    m.send({ type: "SRC_CHANGE", src: "https://example.com/img.jpg" });
    expect(cb).toHaveBeenCalledWith("loading");
  });

  it("SRC_CHANGE with undefined goes to loading (the image will error without src)", () => {
    const m = make({ src: "https://example.com/img.jpg" });
    m.send("IMAGE_LOAD");
    m.send({ type: "SRC_CHANGE", src: undefined });
    expect(m.getSnapshot().matches("loading")).toBe(true);
    expect(m.getSnapshot().context.src).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

describe("createAvatarMachine — tags", () => {
  it("idle state has 'fallback' tag", () => {
    expect(make().getSnapshot().hasTag("fallback")).toBe(true);
  });

  it("loading state has 'loading' tag", () => {
    expect(
      make({ src: "https://example.com/img.jpg" }).getSnapshot().hasTag("loading"),
    ).toBe(true);
  });

  it("loaded state has 'loaded' tag", () => {
    const m = make({ src: "https://example.com/img.jpg" });
    m.send("IMAGE_LOAD");
    expect(m.getSnapshot().hasTag("loaded")).toBe(true);
  });

  it("error state has 'fallback' tag", () => {
    const m = make({ src: "https://example.com/img.jpg" });
    m.send("IMAGE_ERROR");
    expect(m.getSnapshot().hasTag("fallback")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Full lifecycle
// ---------------------------------------------------------------------------

describe("createAvatarMachine — full lifecycle", () => {
  it("idle → loading → loaded flow", () => {
    const m = make();
    expect(m.getSnapshot().matches("idle")).toBe(true);
    m.send({ type: "SRC_CHANGE", src: "https://example.com/img.jpg" });
    expect(m.getSnapshot().matches("loading")).toBe(true);
    m.send("IMAGE_LOAD");
    expect(m.getSnapshot().matches("loaded")).toBe(true);
  });

  it("idle → loading → error flow", () => {
    const m = make();
    m.send({ type: "SRC_CHANGE", src: "https://example.com/bad.jpg" });
    m.send("IMAGE_ERROR");
    expect(m.getSnapshot().matches("error")).toBe(true);
  });

  it("loaded → loading → loaded (src swap)", () => {
    const m = make({ src: "https://example.com/a.jpg" });
    m.send("IMAGE_LOAD");
    m.send({ type: "SRC_CHANGE", src: "https://example.com/b.jpg" });
    expect(m.getSnapshot().matches("loading")).toBe(true);
    m.send("IMAGE_LOAD");
    expect(m.getSnapshot().matches("loaded")).toBe(true);
  });

  it("onStatusChange fires in order for full lifecycle", () => {
    const calls: string[] = [];
    const m = make({
      src: "https://example.com/img.jpg",
      onStatusChange: (s) => calls.push(s),
    });
    m.send("IMAGE_LOAD");
    m.send({ type: "SRC_CHANGE", src: "https://example.com/b.jpg" });
    m.send("IMAGE_ERROR");
    expect(calls).toEqual(["loaded", "loading", "error"]);
  });
});
