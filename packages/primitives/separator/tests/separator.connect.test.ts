import { describe, expect, it } from "vitest";
import { connectSeparator } from "../src/separator.connect.js";

describe("connectSeparator — semantic (default)", () => {
  it("role=separator by default", () => {
    const api = connectSeparator();
    expect(api.getSeparatorProps().role).toBe("separator");
  });

  it("aria-orientation=horizontal by default", () => {
    const api = connectSeparator();
    expect(api.getSeparatorProps()["aria-orientation"]).toBe("horizontal");
  });

  it("aria-orientation=vertical when specified", () => {
    const api = connectSeparator({ orientation: "vertical" });
    expect(api.getSeparatorProps()["aria-orientation"]).toBe("vertical");
  });

  it("aria-hidden is undefined for semantic separator", () => {
    const api = connectSeparator();
    expect(api.getSeparatorProps()["aria-hidden"]).toBeUndefined();
  });

  it("data-forge-scope=separator", () => {
    const api = connectSeparator();
    expect(api.getSeparatorProps()["data-forge-scope"]).toBe("separator");
  });

  it("data-orientation=horizontal by default", () => {
    const api = connectSeparator();
    expect(api.getSeparatorProps()["data-orientation"]).toBe("horizontal");
  });
});

describe("connectSeparator — decorative", () => {
  it("role=none when decorative=true", () => {
    const api = connectSeparator({ decorative: true });
    expect(api.getSeparatorProps().role).toBe("none");
  });

  it("aria-hidden=true when decorative", () => {
    const api = connectSeparator({ decorative: true });
    expect(api.getSeparatorProps()["aria-hidden"]).toBe(true);
  });

  it("aria-orientation is undefined when decorative (role=none has no orientation)", () => {
    const api = connectSeparator({ decorative: true });
    expect(api.getSeparatorProps()["aria-orientation"]).toBeUndefined();
  });

  it("data-orientation still set even when decorative", () => {
    const api = connectSeparator({ decorative: true, orientation: "vertical" });
    expect(api.getSeparatorProps()["data-orientation"]).toBe("vertical");
  });
});
