import type { MachineSnapshot } from "@forge-ui/core";
import { describe, expect, it, vi } from "vitest";
import { connectAvatar, getInitials } from "../src/avatar.connect.js";
import type { AvatarContext, AvatarState } from "../src/avatar.types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCtx(overrides: Partial<AvatarContext> = {}): AvatarContext {
  return {
    id: "test",
    src: undefined,
    alt: "Jane Doe",
    ...overrides,
  };
}

function makeApi(ctxOverrides: Partial<AvatarContext> = {}, state: AvatarState = "idle") {
  const ctx = makeCtx(ctxOverrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  const snapshot: MachineSnapshot<AvatarContext, AvatarState> = {
    value: state,
    context: ctx,
    matches: (...values) => values.includes(state),
    tags: [],
    hasTag: (t: string) => {
      const tagMap: Record<AvatarState, string> = {
        idle: "fallback",
        loading: "loading",
        loaded: "loaded",
        error: "fallback",
      };
      return tagMap[state] === t;
    },
  };
  const api = connectAvatar(snapshot, send, machine);
  return { api, send };
}

// ---------------------------------------------------------------------------
// getInitials utility
// ---------------------------------------------------------------------------

describe("getInitials", () => {
  it("extracts first letter of each word (max 2)", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("single name returns single initial", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("caps at 2 words", () => {
    expect(getInitials("Ana Garcia Lopez")).toBe("AG");
  });

  it("uppercases initials", () => {
    expect(getInitials("john doe")).toBe("JD");
  });

  it("collapses multiple spaces", () => {
    expect(getInitials("  John   Doe  ")).toBe("JD");
  });

  it("returns empty string for empty input", () => {
    expect(getInitials("")).toBe("");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(getInitials("   ")).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Status flags
// ---------------------------------------------------------------------------

describe("connectAvatar — status flags", () => {
  it("isIdle when state=idle", () => {
    const { api } = makeApi({}, "idle");
    expect(api.isIdle).toBe(true);
    expect(api.isLoading).toBe(false);
    expect(api.isLoaded).toBe(false);
    expect(api.hasError).toBe(false);
  });

  it("isLoading when state=loading", () => {
    const { api } = makeApi({}, "loading");
    expect(api.isLoading).toBe(true);
    expect(api.isIdle).toBe(false);
    expect(api.isLoaded).toBe(false);
    expect(api.hasError).toBe(false);
  });

  it("isLoaded when state=loaded", () => {
    const { api } = makeApi({}, "loaded");
    expect(api.isLoaded).toBe(true);
    expect(api.isLoading).toBe(false);
    expect(api.isIdle).toBe(false);
    expect(api.hasError).toBe(false);
  });

  it("hasError when state=error", () => {
    const { api } = makeApi({}, "error");
    expect(api.hasError).toBe(true);
    expect(api.isLoading).toBe(false);
    expect(api.isLoaded).toBe(false);
    expect(api.isIdle).toBe(false);
  });

  it("status reflects machine state", () => {
    expect(makeApi({}, "idle").api.status).toBe("idle");
    expect(makeApi({}, "loading").api.status).toBe("loading");
    expect(makeApi({}, "loaded").api.status).toBe("loaded");
    expect(makeApi({}, "error").api.status).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// initials
// ---------------------------------------------------------------------------

describe("connectAvatar — initials", () => {
  it("returns computed initials from context.name", () => {
    const { api } = makeApi({ name: "John Doe" });
    expect(api.initials).toBe("JD");
  });

  it("returns single initial for single name", () => {
    const { api } = makeApi({ name: "Alice" });
    expect(api.initials).toBe("A");
  });

  it("returns empty string when name is not provided", () => {
    const { api } = makeApi({ name: undefined });
    expect(api.initials).toBe("");
  });

  it("initials are uppercase", () => {
    const { api } = makeApi({ name: "bob smith" });
    expect(api.initials).toBe("BS");
  });
});

// ---------------------------------------------------------------------------
// getRootProps
// ---------------------------------------------------------------------------

describe("connectAvatar — getRootProps", () => {
  it("data-forge-scope is 'avatar'", () => {
    const { api } = makeApi();
    expect(api.getRootProps()["data-forge-scope"]).toBe("avatar");
  });

  it("data-forge-part is 'root'", () => {
    const { api } = makeApi();
    expect(api.getRootProps()["data-forge-part"]).toBe("root");
  });

  it("data-status reflects machine state", () => {
    expect(makeApi({}, "idle").api.getRootProps()["data-status"]).toBe("idle");
    expect(makeApi({}, "loading").api.getRootProps()["data-status"]).toBe("loading");
    expect(makeApi({}, "loaded").api.getRootProps()["data-status"]).toBe("loaded");
    expect(makeApi({}, "error").api.getRootProps()["data-status"]).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// getImageProps
// ---------------------------------------------------------------------------

describe("connectAvatar — getImageProps", () => {
  it("src comes from context", () => {
    const { api } = makeApi({ src: "https://example.com/img.jpg" }, "loading");
    expect(api.getImageProps().src).toBe("https://example.com/img.jpg");
  });

  it("alt comes from context", () => {
    const { api } = makeApi({ alt: "Alice" });
    expect(api.getImageProps().alt).toBe("Alice");
  });

  it("data-state matches machine state", () => {
    expect(makeApi({}, "loading").api.getImageProps()["data-state"]).toBe("loading");
    expect(makeApi({}, "loaded").api.getImageProps()["data-state"]).toBe("loaded");
    expect(makeApi({}, "error").api.getImageProps()["data-state"]).toBe("error");
    expect(makeApi({}, "idle").api.getImageProps()["data-state"]).toBe("idle");
  });

  it("data-forge-scope is 'avatar'", () => {
    const { api } = makeApi();
    expect(api.getImageProps()["data-forge-scope"]).toBe("avatar");
  });

  it("data-forge-part is 'image'", () => {
    const { api } = makeApi();
    expect(api.getImageProps()["data-forge-part"]).toBe("image");
  });

  it("onLoad sends IMAGE_LOAD", () => {
    const { api, send } = makeApi({}, "loading");
    api.getImageProps().onLoad();
    expect(send).toHaveBeenCalledWith("IMAGE_LOAD");
  });

  it("onError sends IMAGE_ERROR", () => {
    const { api, send } = makeApi({}, "loading");
    api.getImageProps().onError();
    expect(send).toHaveBeenCalledWith("IMAGE_ERROR");
  });

  it("src is undefined when no src in context", () => {
    const { api } = makeApi({ src: undefined }, "idle");
    expect(api.getImageProps().src).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getFallbackProps — base props only (no data-state / aria-hidden)
// ---------------------------------------------------------------------------

describe("connectAvatar — getFallbackProps", () => {
  it("data-forge-scope is 'avatar'", () => {
    const { api } = makeApi();
    expect(api.getFallbackProps()["data-forge-scope"]).toBe("avatar");
  });

  it("data-forge-part is 'fallback'", () => {
    const { api } = makeApi();
    expect(api.getFallbackProps()["data-forge-part"]).toBe("fallback");
  });

  it("does NOT set data-state (framework layer responsibility)", () => {
    const { api } = makeApi({}, "idle");
    // @ts-expect-error — intentionally checking absence of non-existent property
    expect(api.getFallbackProps()["data-state"]).toBeUndefined();
  });

  it("does NOT set aria-hidden (framework layer responsibility)", () => {
    const { api } = makeApi();
    // @ts-expect-error — intentionally checking absence of non-existent property
    expect(api.getFallbackProps()["aria-hidden"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// setSrc
// ---------------------------------------------------------------------------

describe("connectAvatar — setSrc", () => {
  it("sends SRC_CHANGE with provided src", () => {
    const { api, send } = makeApi();
    api.setSrc("https://example.com/img.jpg");
    expect(send).toHaveBeenCalledWith({
      type: "SRC_CHANGE",
      src: "https://example.com/img.jpg",
    });
  });

  it("sends SRC_CHANGE with undefined to clear src", () => {
    const { api, send } = makeApi({ src: "https://example.com/img.jpg" }, "loaded");
    api.setSrc(undefined);
    expect(send).toHaveBeenCalledWith({ type: "SRC_CHANGE", src: undefined });
  });
});
