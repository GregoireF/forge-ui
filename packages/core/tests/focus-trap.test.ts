// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { focusFirst, getFocusableElements, trapFocus } from "../src/utils/focus-trap.js";

let container: HTMLElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.innerHTML = "";
});

// ---------------------------------------------------------------------------
// getFocusableElements
// ---------------------------------------------------------------------------

describe("getFocusableElements", () => {
  it("returns buttons", () => {
    container.innerHTML = `<button>A</button><button>B</button>`;
    expect(getFocusableElements(container)).toHaveLength(2);
  });

  it("returns anchors with href", () => {
    container.innerHTML = `<a href="#">link</a><a>no-href</a>`;
    const els = getFocusableElements(container);
    expect(els).toHaveLength(1);
    expect(els[0]?.tagName).toBe("A");
  });

  it("returns inputs and selects and textareas", () => {
    container.innerHTML = `<input /><select><option>x</option></select><textarea></textarea>`;
    expect(getFocusableElements(container)).toHaveLength(3);
  });

  it("excludes disabled buttons", () => {
    container.innerHTML = `<button>A</button><button disabled>B</button>`;
    expect(getFocusableElements(container)).toHaveLength(1);
  });

  it("excludes disabled inputs", () => {
    container.innerHTML = `<input /><input disabled />`;
    expect(getFocusableElements(container)).toHaveLength(1);
  });

  it("includes elements with tabindex >= 0", () => {
    container.innerHTML = `<div tabindex="0">focusable</div><div tabindex="-1">not</div>`;
    const els = getFocusableElements(container);
    expect(els).toHaveLength(1);
    expect(els[0]?.textContent).toBe("focusable");
  });

  it("excludes elements inside [hidden] ancestors", () => {
    container.innerHTML = `<button>visible</button><div hidden><button>hidden</button></div>`;
    expect(getFocusableElements(container)).toHaveLength(1);
  });

  it("excludes elements inside [inert] ancestors", () => {
    container.innerHTML = `<button>visible</button><div inert><button>inert</button></div>`;
    expect(getFocusableElements(container)).toHaveLength(1);
  });

  it("returns empty array when no focusable elements", () => {
    container.innerHTML = `<div>nothing focusable</div>`;
    expect(getFocusableElements(container)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// focusFirst
// ---------------------------------------------------------------------------

describe("focusFirst", () => {
  it("focuses the first focusable element", () => {
    container.innerHTML = `<button id="a">A</button><button id="b">B</button>`;
    focusFirst(container);
    expect(document.activeElement?.id).toBe("a");
  });

  it("does nothing when no focusable elements", () => {
    container.innerHTML = `<div>nothing</div>`;
    expect(() => focusFirst(container)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// trapFocus
// ---------------------------------------------------------------------------

describe("trapFocus", () => {
  function makeEvent(opts: { shiftKey?: boolean }): KeyboardEvent {
    return new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
      shiftKey: opts.shiftKey ?? false,
    });
  }

  it("wraps focus from last to first on Tab", () => {
    container.innerHTML = `<button id="a">A</button><button id="b">B</button>`;
    const [a, b] = container.querySelectorAll("button") as NodeListOf<HTMLButtonElement>;
    b.focus();
    const event = makeEvent({});
    const preventDefault = vi.spyOn(event, "preventDefault");
    trapFocus(container, event);
    expect(preventDefault).toHaveBeenCalled();
    expect(document.activeElement?.id).toBe("a");
  });

  it("wraps focus from first to last on Shift+Tab", () => {
    container.innerHTML = `<button id="a">A</button><button id="b">B</button>`;
    const [a, b] = container.querySelectorAll("button") as NodeListOf<HTMLButtonElement>;
    a.focus();
    const event = makeEvent({ shiftKey: true });
    const preventDefault = vi.spyOn(event, "preventDefault");
    trapFocus(container, event);
    expect(preventDefault).toHaveBeenCalled();
    expect(document.activeElement?.id).toBe("b");
  });

  it("does not intercept Tab when focus is not at a boundary", () => {
    container.innerHTML = `<button id="a">A</button><button id="b">B</button><button id="c">C</button>`;
    const [a, b] = container.querySelectorAll("button") as NodeListOf<HTMLButtonElement>;
    a.focus();
    const event = makeEvent({});
    const preventDefault = vi.spyOn(event, "preventDefault");
    trapFocus(container, event);
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("calls preventDefault when no focusable elements exist", () => {
    container.innerHTML = `<div>nothing</div>`;
    const event = makeEvent({});
    const preventDefault = vi.spyOn(event, "preventDefault");
    trapFocus(container, event);
    expect(preventDefault).toHaveBeenCalled();
  });
});
