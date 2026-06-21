import { describe, expect, it } from "vitest";
import { connectProgress } from "../src/progress.connect.js";

// ---------------------------------------------------------------------------
// getRootProps — role / ARIA
// ---------------------------------------------------------------------------

describe("connectProgress — getRootProps", () => {
  it("has role=progressbar", () => {
    const api = connectProgress({ value: 50 });
    expect(api.getRootProps().role).toBe("progressbar");
  });

  it("aria-valuemin defaults to 0", () => {
    const api = connectProgress({ value: 50 });
    expect(api.getRootProps()["aria-valuemin"]).toBe(0);
  });

  it("aria-valuemax defaults to 100", () => {
    const api = connectProgress({ value: 50 });
    expect(api.getRootProps()["aria-valuemax"]).toBe(100);
  });

  it("aria-valuenow reflects value", () => {
    const api = connectProgress({ value: 42 });
    expect(api.getRootProps()["aria-valuenow"]).toBe(42);
  });

  it("aria-valuenow is undefined when indeterminate", () => {
    const api = connectProgress({ value: null });
    expect(api.getRootProps()["aria-valuenow"]).toBeUndefined();
  });

  it("has data-forge-scope=progress", () => {
    const api = connectProgress({ value: 50 });
    expect(api.getRootProps()["data-forge-scope"]).toBe("progress");
  });
});

// ---------------------------------------------------------------------------
// state calculation
// ---------------------------------------------------------------------------

describe("connectProgress — state", () => {
  it("state=indeterminate when value=null", () => {
    const api = connectProgress({ value: null });
    expect(api.state).toBe("indeterminate");
  });

  it("state=complete when value=max", () => {
    const api = connectProgress({ value: 100, max: 100 });
    expect(api.state).toBe("complete");
  });

  it("state=loading when value between min and max", () => {
    const api = connectProgress({ value: 50 });
    expect(api.state).toBe("loading");
  });

  it("state=loading when value=0 (min)", () => {
    const api = connectProgress({ value: 0 });
    expect(api.state).toBe("loading");
  });

  it("data-state on root matches computed state", () => {
    expect(connectProgress({ value: null }).getRootProps()["data-state"]).toBe("indeterminate");
    expect(connectProgress({ value: 100 }).getRootProps()["data-state"]).toBe("complete");
    expect(connectProgress({ value: 50 }).getRootProps()["data-state"]).toBe("loading");
  });
});

// ---------------------------------------------------------------------------
// percent calculation
// ---------------------------------------------------------------------------

describe("connectProgress — percent", () => {
  it("percent is 50 for value=50, max=100", () => {
    const api = connectProgress({ value: 50 });
    expect(api.percent).toBe(50);
  });

  it("percent is 0 for value=0", () => {
    const api = connectProgress({ value: 0 });
    expect(api.percent).toBe(0);
  });

  it("percent is 100 for value=max", () => {
    const api = connectProgress({ value: 100, max: 100 });
    expect(api.percent).toBe(100);
  });

  it("percent is undefined when indeterminate", () => {
    const api = connectProgress({ value: null });
    expect(api.percent).toBeUndefined();
  });

  it("fill width style reflects percent", () => {
    const api = connectProgress({ value: 42 });
    expect(api.getFillProps().style.width).toBe("42%");
  });

  it("fill width style is undefined when indeterminate", () => {
    const api = connectProgress({ value: null });
    expect(api.getFillProps().style.width).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// custom min / max
// ---------------------------------------------------------------------------

describe("connectProgress — custom min/max", () => {
  it("respects custom max", () => {
    const api = connectProgress({ value: 1, max: 10 });
    expect(api.getRootProps()["aria-valuemax"]).toBe(10);
    expect(api.percent).toBe(10);
  });

  it("respects custom min", () => {
    const api = connectProgress({ value: 5, min: 0, max: 10 });
    expect(api.getRootProps()["aria-valuemin"]).toBe(0);
    expect(api.percent).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// getValueTextProps
// ---------------------------------------------------------------------------

describe("connectProgress — getValueTextProps", () => {
  it("is aria-hidden", () => {
    const api = connectProgress({ value: 50 });
    expect(api.getValueTextProps()["aria-hidden"]).toBe(true);
  });

  it("has data-forge-part=value-text", () => {
    const api = connectProgress({ value: 50 });
    expect(api.getValueTextProps()["data-forge-part"]).toBe("value-text");
  });
});
