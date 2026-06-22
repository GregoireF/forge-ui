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

  // WAI-ARIA §3.14: aria-valuetext provides a human-readable description
  // of the current value. For indeterminate state it must say "loading"
  // (or similar) because aria-valuenow is absent.
  it('aria-valuetext is "loading" when indeterminate', () => {
    const api = connectProgress({ value: null });
    expect(api.getRootProps()["aria-valuetext"]).toBe("loading");
  });

  it("aria-valuetext shows percentage string when value is set", () => {
    const api = connectProgress({ value: 42 });
    expect(api.getRootProps()["aria-valuetext"]).toBe("42%");
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
// getTrackProps
// ---------------------------------------------------------------------------

describe("connectProgress — getTrackProps", () => {
  it("data-forge-part=track", () => {
    expect(connectProgress({ value: 50 }).getTrackProps()["data-forge-part"]).toBe("track");
  });

  it("data-state=loading when value is set", () => {
    expect(connectProgress({ value: 50 }).getTrackProps()["data-state"]).toBe("loading");
  });

  it("data-state=indeterminate when value is null", () => {
    expect(connectProgress({ value: null }).getTrackProps()["data-state"]).toBe("indeterminate");
  });

  it("data-state=complete when value equals max", () => {
    expect(connectProgress({ value: 100 }).getTrackProps()["data-state"]).toBe("complete");
  });

  it("data-value reflects current value", () => {
    expect(connectProgress({ value: 42 }).getTrackProps()["data-value"]).toBe(42);
  });

  it("data-max reflects max", () => {
    expect(connectProgress({ value: 50, max: 200 }).getTrackProps()["data-max"]).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// getLabelProps
// ---------------------------------------------------------------------------

describe("connectProgress — getLabelProps", () => {
  it("data-forge-part=label", () => {
    expect(connectProgress({ value: 50 }).getLabelProps()["data-forge-part"]).toBe("label");
  });

  it("data-forge-scope=progress", () => {
    expect(connectProgress({ value: 50 }).getLabelProps()["data-forge-scope"]).toBe("progress");
  });
});

// ---------------------------------------------------------------------------
// Accessible name contract
// ---------------------------------------------------------------------------

// WAI-ARIA §3.14: role=progressbar MUST have an accessible name.
// The connect does not wire aria-labelledby — consumers must pass aria-label
// (or aria-labelledby) on Progress.Root via prop passthrough (...rest / ...attrs).
describe("connectProgress — accessible name contract", () => {
  it("no built-in accessible name — consumer must provide aria-label via prop passthrough", () => {
    const props = connectProgress({ value: 50 }).getRootProps() as Record<string, unknown>;
    expect(props["aria-label"]).toBeUndefined();
    expect(props["aria-labelledby"]).toBeUndefined();
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
