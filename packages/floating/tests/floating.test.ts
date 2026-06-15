import { describe, expect, it } from "vitest";
import { getAlignFromPlacement, getSideFromPlacement, getTransformOrigin } from "../src/types.js";

describe("getSideFromPlacement", () => {
  it("extracts side from simple placement", () => {
    expect(getSideFromPlacement("top")).toBe("top");
    expect(getSideFromPlacement("bottom")).toBe("bottom");
    expect(getSideFromPlacement("left")).toBe("left");
    expect(getSideFromPlacement("right")).toBe("right");
  });

  it("extracts side from placement with align", () => {
    expect(getSideFromPlacement("top-start")).toBe("top");
    expect(getSideFromPlacement("bottom-end")).toBe("bottom");
    expect(getSideFromPlacement("left-start")).toBe("left");
    expect(getSideFromPlacement("right-end")).toBe("right");
  });
});

describe("getAlignFromPlacement", () => {
  it("returns 'center' for simple placements", () => {
    expect(getAlignFromPlacement("top")).toBe("center");
    expect(getAlignFromPlacement("bottom")).toBe("center");
  });

  it("extracts align from placement", () => {
    expect(getAlignFromPlacement("top-start")).toBe("start");
    expect(getAlignFromPlacement("top-end")).toBe("end");
    expect(getAlignFromPlacement("bottom-start")).toBe("start");
    expect(getAlignFromPlacement("right-end")).toBe("end");
  });
});

describe("getTransformOrigin", () => {
  it("top → origin at bottom", () => {
    expect(getTransformOrigin("top")).toBe("50% 100%");
    expect(getTransformOrigin("top-start")).toBe("0% 100%");
    expect(getTransformOrigin("top-end")).toBe("100% 100%");
  });

  it("bottom → origin at top", () => {
    expect(getTransformOrigin("bottom")).toBe("50% 0%");
    expect(getTransformOrigin("bottom-start")).toBe("0% 0%");
    expect(getTransformOrigin("bottom-end")).toBe("100% 0%");
  });

  it("left → origin at right", () => {
    expect(getTransformOrigin("left")).toBe("100% 50%");
    expect(getTransformOrigin("left-start")).toBe("100% 0%");
  });

  it("right → origin at left", () => {
    expect(getTransformOrigin("right")).toBe("0% 50%");
    expect(getTransformOrigin("right-end")).toBe("0% 100%");
  });
});
