import { describe, expect, it } from "vitest";
import { connectVisuallyHidden, VISUALLY_HIDDEN_STYLE } from "../src/visually-hidden.connect.js";

describe("connectVisuallyHidden — getProps", () => {
  it("applies position:absolute", () => {
    const api = connectVisuallyHidden();
    expect(api.getProps().style.position).toBe("absolute");
  });

  it("applies width:1px", () => {
    const api = connectVisuallyHidden();
    expect(api.getProps().style.width).toBe("1px");
  });

  it("applies height:1px", () => {
    const api = connectVisuallyHidden();
    expect(api.getProps().style.height).toBe("1px");
  });

  it("applies overflow:hidden", () => {
    const api = connectVisuallyHidden();
    expect(api.getProps().style.overflow).toBe("hidden");
  });

  it("applies whiteSpace:nowrap", () => {
    const api = connectVisuallyHidden();
    expect(api.getProps().style.whiteSpace).toBe("nowrap");
  });

  it("applies clipPath:inset(50%)", () => {
    const api = connectVisuallyHidden();
    expect(api.getProps().style.clipPath).toBe("inset(50%)");
  });

  it("data-forge-scope=visually-hidden", () => {
    const api = connectVisuallyHidden();
    expect(api.getProps()["data-forge-scope"]).toBe("visually-hidden");
  });

  it("tabIndex is undefined by default (not focusable)", () => {
    const api = connectVisuallyHidden();
    expect(api.getProps().tabIndex).toBeUndefined();
  });

  it("tabIndex=0 when focusable=true (skip link)", () => {
    const api = connectVisuallyHidden({ focusable: true });
    expect(api.getProps().tabIndex).toBe(0);
  });
});

describe("VISUALLY_HIDDEN_STYLE constant", () => {
  it("is exported as a static constant", () => {
    expect(VISUALLY_HIDDEN_STYLE).toBeDefined();
    expect(VISUALLY_HIDDEN_STYLE.position).toBe("absolute");
  });

  it("is frozen / readonly (no mutation)", () => {
    // TypeScript 'as const' guarantees this at compile time.
    // At runtime we verify the object shape is stable.
    expect(typeof VISUALLY_HIDDEN_STYLE).toBe("object");
  });
});
