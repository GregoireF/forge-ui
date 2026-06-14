// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { hideOthers } from "../src/utils/aria-hidden.js";

let root: HTMLElement;

beforeEach(() => {
  root = document.createElement("div");
  document.body.appendChild(root);
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("hideOthers", () => {
  it("sets aria-hidden on siblings of the container", () => {
    const sibling = document.createElement("div");
    const container = document.createElement("div");
    root.appendChild(sibling);
    root.appendChild(container);
    document.body.appendChild(root);

    hideOthers(container);

    expect(sibling.getAttribute("aria-hidden")).toBe("true");
    expect(container.getAttribute("aria-hidden")).toBeNull();
  });

  it("hides siblings at every ancestor level up to body", () => {
    const uncle = document.createElement("nav");
    document.body.appendChild(uncle);

    const parent = document.createElement("main");
    const aunt = document.createElement("aside");
    root.appendChild(aunt);
    root.appendChild(parent);

    const container = document.createElement("div");
    parent.appendChild(container);

    hideOthers(container);

    expect(uncle.getAttribute("aria-hidden")).toBe("true");
    expect(aunt.getAttribute("aria-hidden")).toBe("true");
    expect(parent.getAttribute("aria-hidden")).toBeNull();
    expect(container.getAttribute("aria-hidden")).toBeNull();
  });

  it("cleanup removes aria-hidden attributes that were added", () => {
    const sibling = document.createElement("div");
    const container = document.createElement("div");
    root.appendChild(sibling);
    root.appendChild(container);

    const cleanup = hideOthers(container);
    expect(sibling.getAttribute("aria-hidden")).toBe("true");

    cleanup();
    expect(sibling.getAttribute("aria-hidden")).toBeNull();
  });

  it("cleanup restores a pre-existing aria-hidden value", () => {
    const sibling = document.createElement("div");
    sibling.setAttribute("aria-hidden", "true");
    const container = document.createElement("div");
    root.appendChild(sibling);
    root.appendChild(container);

    const cleanup = hideOthers(container);
    cleanup();

    expect(sibling.getAttribute("aria-hidden")).toBe("true");
  });

  it("does not hide document.body itself", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    hideOthers(container);

    expect(document.body.getAttribute("aria-hidden")).toBeNull();
  });
});
