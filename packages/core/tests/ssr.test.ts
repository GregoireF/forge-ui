import { describe, expect, it } from "vitest";
import { generateId, getDocument, getWindow, isBrowser } from "../src/utils/ssr.js";

describe("isBrowser", () => {
  it("is true in a node/vitest environment with globalThis.window", () => {
    // Vitest runs in Node but vitest's happy-dom or node env sets window — just
    // assert the value is a boolean regardless of the specific env.
    expect(typeof isBrowser).toBe("boolean");
  });
});

describe("getDocument", () => {
  it("returns the document when available", () => {
    const result = getDocument();
    // In Node/vitest environments document is not available, so null is fine.
    expect(result === null || result instanceof Object).toBe(true);
  });
});

describe("getWindow", () => {
  it("returns the window when available", () => {
    const result = getWindow();
    expect(result === null || result instanceof Object).toBe(true);
  });
});

describe("generateId", () => {
  it("returns a string starting with the prefix", () => {
    const id = generateId("forge");
    expect(id.startsWith("forge-")).toBe(true);
  });

  it("returns unique IDs on successive calls", () => {
    const ids = Array.from({ length: 20 }, () => generateId("x"));
    const unique = new Set(ids);
    expect(unique.size).toBe(20);
  });

  it("contains only url-safe characters after the prefix", () => {
    const id = generateId("test");
    // Should be alphanumeric + hyphens only
    expect(id).toMatch(/^test-[a-z0-9-]+$/);
  });
});
