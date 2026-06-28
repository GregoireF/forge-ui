import { clearRegistry } from "@forge-ui/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createMenuMachine } from "../src/menu.machine.js";

let active: ReturnType<typeof createMenuMachine>[] = [];

function make(opts: Partial<Parameters<typeof createMenuMachine>[0]> = {}) {
  const m = createMenuMachine({ id: "test", ...opts });
  m.start();
  active.push(m);
  return m;
}

afterEach(() => {
  for (const m of active) m.stop();
  active = [];
  clearRegistry();
});

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe("createMenuMachine — initial state", () => {
  it("starts closed by default", () => {
    const m = make();
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("defaultOpen=true starts open", () => {
    const m = make({ defaultOpen: true });
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("open=true (controlled) starts open", () => {
    const m = make({ open: true });
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("highlighted starts null", () => {
    expect(make().getSnapshot().context.highlighted).toBeNull();
  });

  it("highlightSource defaults to 'pointer'", () => {
    expect(make().getSnapshot().context.highlightSource).toBe("pointer");
  });

  it("items starts empty", () => {
    expect(make().getSnapshot().context.items).toEqual([]);
  });

  it("loop defaults to true", () => {
    expect(make().getSnapshot().context.loop).toBe(true);
  });

  it("modal defaults to true", () => {
    expect(make().getSnapshot().context.modal).toBe(true);
  });

  it("modal=false is stored", () => {
    expect(make({ modal: false }).getSnapshot().context.modal).toBe(false);
  });

  it("isContextMenu defaults to false", () => {
    expect(make().getSnapshot().context.isContextMenu).toBe(false);
  });

  it("anchorEl starts null", () => {
    expect(make().getSnapshot().context.anchorEl).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Open / Close transitions
// ---------------------------------------------------------------------------

describe("createMenuMachine — OPEN / CLOSE / TOGGLE", () => {
  it("OPEN transitions closed → open", () => {
    const m = make();
    m.send("OPEN");
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("CLOSE transitions open → closed", () => {
    const m = make({ defaultOpen: true });
    m.send("CLOSE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("TOGGLE closes when open", () => {
    const m = make({ defaultOpen: true });
    m.send("TOGGLE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("TOGGLE opens when closed", () => {
    const m = make();
    m.send("TOGGLE");
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("ESCAPE_KEY closes the menu", () => {
    const m = make({ defaultOpen: true });
    m.send("ESCAPE_KEY");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("INTERACT_OUTSIDE closes the menu", () => {
    const m = make({ defaultOpen: true });
    m.send("INTERACT_OUTSIDE");
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("CLOSE clears highlighted", () => {
    const m = make({ defaultOpen: true });
    m.send({ type: "HIGHLIGHT_ITEM", value: "a" });
    m.send("CLOSE");
    expect(m.getSnapshot().context.highlighted).toBeNull();
  });

  it("ESCAPE_KEY clears highlighted", () => {
    const m = make({ defaultOpen: true });
    m.send({ type: "HIGHLIGHT_ITEM", value: "a" });
    m.send("ESCAPE_KEY");
    expect(m.getSnapshot().context.highlighted).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// onOpenChange callback
// ---------------------------------------------------------------------------

describe("createMenuMachine — onOpenChange", () => {
  it("fires with true when menu opens via OPEN", () => {
    const cb = vi.fn();
    const m = make({ onOpenChange: cb });
    m.send("OPEN");
    expect(cb).toHaveBeenCalledWith(true);
  });

  it("fires with false when menu closes via CLOSE", () => {
    const cb = vi.fn();
    const m = make({ defaultOpen: true, onOpenChange: cb });
    m.send("CLOSE");
    expect(cb).toHaveBeenCalledWith(false);
  });

  it("fires with false when menu closes via ESCAPE_KEY", () => {
    const cb = vi.fn();
    const m = make({ defaultOpen: true, onOpenChange: cb });
    m.send("ESCAPE_KEY");
    expect(cb).toHaveBeenCalledWith(false);
  });

  it("fires with true then false on TOGGLE TOGGLE", () => {
    const cb = vi.fn();
    const m = make({ onOpenChange: cb });
    m.send("TOGGLE");
    m.send("TOGGLE");
    expect(cb).toHaveBeenNthCalledWith(1, true);
    expect(cb).toHaveBeenNthCalledWith(2, false);
  });
});

// ---------------------------------------------------------------------------
// Item registration
// ---------------------------------------------------------------------------

describe("createMenuMachine — REGISTER_ITEM / UNREGISTER_ITEM", () => {
  it("registers a new item", () => {
    const m = make();
    m.send({ type: "REGISTER_ITEM", item: { value: "a", label: "A" } });
    expect(m.getSnapshot().context.items).toEqual([{ value: "a", label: "A" }]);
  });

  it("does not register duplicate values", () => {
    const m = make();
    m.send({ type: "REGISTER_ITEM", item: { value: "a", label: "A" } });
    m.send({ type: "REGISTER_ITEM", item: { value: "a", label: "A2" } });
    expect(m.getSnapshot().context.items).toHaveLength(1);
  });

  it("unregisters an item", () => {
    const m = make();
    m.send({ type: "REGISTER_ITEM", item: { value: "a", label: "A" } });
    m.send({ type: "UNREGISTER_ITEM", value: "a" });
    expect(m.getSnapshot().context.items).toHaveLength(0);
  });

  it("unregistering unknown value is a no-op", () => {
    const m = make();
    m.send({ type: "REGISTER_ITEM", item: { value: "a", label: "A" } });
    m.send({ type: "UNREGISTER_ITEM", value: "b" });
    expect(m.getSnapshot().context.items).toHaveLength(1);
  });

  it("registers while open", () => {
    const m = make({ defaultOpen: true });
    m.send({ type: "REGISTER_ITEM", item: { value: "x", label: "X" } });
    expect(m.getSnapshot().context.items).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Highlight navigation
// ---------------------------------------------------------------------------

describe("createMenuMachine — highlight navigation", () => {
  function withItems(opts: Partial<Parameters<typeof createMenuMachine>[0]> = {}) {
    const m = make({ defaultOpen: true, ...opts });
    m.send({ type: "REGISTER_ITEM", item: { value: "a", label: "A" } });
    m.send({ type: "REGISTER_ITEM", item: { value: "b", label: "B" } });
    m.send({ type: "REGISTER_ITEM", item: { value: "c", label: "C", disabled: true } });
    m.send({ type: "REGISTER_ITEM", item: { value: "d", label: "D" } });
    return m;
  }

  it("FIRST_ITEM highlights the first enabled item", () => {
    const m = withItems();
    m.send("FIRST_ITEM");
    expect(m.getSnapshot().context.highlighted).toBe("a");
  });

  it("LAST_ITEM highlights the last enabled item (skips disabled)", () => {
    const m = withItems();
    m.send("LAST_ITEM");
    expect(m.getSnapshot().context.highlighted).toBe("d");
  });

  it("NEXT_ITEM advances highlight", () => {
    const m = withItems();
    m.send("FIRST_ITEM");
    m.send("NEXT_ITEM");
    expect(m.getSnapshot().context.highlighted).toBe("b");
  });

  it("NEXT_ITEM skips disabled items", () => {
    const m = withItems();
    m.send("FIRST_ITEM");
    m.send("NEXT_ITEM"); // b
    m.send("NEXT_ITEM"); // skip c (disabled) → d
    expect(m.getSnapshot().context.highlighted).toBe("d");
  });

  it("PREV_ITEM goes backwards", () => {
    const m = withItems();
    m.send("LAST_ITEM");
    m.send("PREV_ITEM"); // skip c (disabled) → b
    expect(m.getSnapshot().context.highlighted).toBe("b");
  });

  it("NEXT_ITEM wraps to first when loop=true (default)", () => {
    const m = withItems();
    m.send("LAST_ITEM"); // d
    m.send("NEXT_ITEM"); // wraps → a
    expect(m.getSnapshot().context.highlighted).toBe("a");
  });

  it("NEXT_ITEM stays at last when loop=false", () => {
    const m = withItems({ loop: false });
    m.send("LAST_ITEM"); // d
    m.send("NEXT_ITEM"); // stays at d (no wrap)
    expect(m.getSnapshot().context.highlighted).toBe("d");
  });

  it("PREV_ITEM wraps to last when loop=true (default)", () => {
    const m = withItems();
    m.send("FIRST_ITEM"); // a
    m.send("PREV_ITEM"); // wraps → d
    expect(m.getSnapshot().context.highlighted).toBe("d");
  });

  it("HIGHLIGHT_ITEM sets arbitrary value", () => {
    const m = withItems();
    m.send({ type: "HIGHLIGHT_ITEM", value: "b" });
    expect(m.getSnapshot().context.highlighted).toBe("b");
  });

  it("HIGHLIGHT_ITEM with null clears highlight", () => {
    const m = withItems();
    m.send({ type: "HIGHLIGHT_ITEM", value: "a" });
    m.send({ type: "HIGHLIGHT_ITEM", value: null });
    expect(m.getSnapshot().context.highlighted).toBeNull();
  });

  it("FIRST_ITEM sets highlightSource=keyboard", () => {
    const m = withItems();
    m.send("FIRST_ITEM");
    expect(m.getSnapshot().context.highlightSource).toBe("keyboard");
  });

  it("HIGHLIGHT_ITEM without source defaults to 'pointer'", () => {
    const m = withItems();
    m.send({ type: "HIGHLIGHT_ITEM", value: "a" });
    expect(m.getSnapshot().context.highlightSource).toBe("pointer");
  });

  it("HIGHLIGHT_ITEM with source='keyboard' stores it", () => {
    const m = withItems();
    m.send({ type: "HIGHLIGHT_ITEM", value: "a", source: "keyboard" });
    expect(m.getSnapshot().context.highlightSource).toBe("keyboard");
  });
});

// ---------------------------------------------------------------------------
// onHighlightChange callback
// ---------------------------------------------------------------------------

describe("createMenuMachine — onHighlightChange", () => {
  it("fires when highlight changes via FIRST_ITEM", () => {
    const cb = vi.fn();
    const m = make({ defaultOpen: true, onHighlightChange: cb });
    m.send({ type: "REGISTER_ITEM", item: { value: "a", label: "A" } });
    m.send("FIRST_ITEM");
    expect(cb).toHaveBeenCalledWith("a");
  });

  it("fires with null via HIGHLIGHT_ITEM null", () => {
    const cb = vi.fn();
    const m = make({ defaultOpen: true, onHighlightChange: cb });
    m.send({ type: "HIGHLIGHT_ITEM", value: null });
    expect(cb).toHaveBeenCalledWith(null);
  });
});

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

describe("createMenuMachine — selection", () => {
  it("SELECT_ITEM closes the menu", () => {
    const m = make({ defaultOpen: true });
    m.send({ type: "REGISTER_ITEM", item: { value: "a", label: "A" } });
    m.send({ type: "SELECT_ITEM", value: "a" });
    expect(m.getSnapshot().matches("closed")).toBe(true);
  });

  it("SELECT_ITEM calls onSelect with value", () => {
    const cb = vi.fn();
    const m = make({ defaultOpen: true, onSelect: cb });
    m.send({ type: "REGISTER_ITEM", item: { value: "a", label: "A" } });
    m.send({ type: "SELECT_ITEM", value: "a" });
    expect(cb).toHaveBeenCalledWith("a");
  });

  it("SELECT_HIGHLIGHTED selects highlighted and closes", () => {
    const cb = vi.fn();
    const m = make({ defaultOpen: true, onSelect: cb });
    m.send({ type: "REGISTER_ITEM", item: { value: "a", label: "A" } });
    m.send("FIRST_ITEM");
    m.send("SELECT_HIGHLIGHTED");
    expect(m.getSnapshot().matches("closed")).toBe(true);
    expect(cb).toHaveBeenCalledWith("a");
  });

  it("SELECT_HIGHLIGHTED does not call onSelect when nothing highlighted", () => {
    const cb = vi.fn();
    const m = make({ defaultOpen: true, onSelect: cb });
    m.send("SELECT_HIGHLIGHTED");
    // transition to closed still happens; onSelect is skipped
    expect(cb).not.toHaveBeenCalled();
  });

  it("SELECT_ITEM clears highlighted", () => {
    const m = make({ defaultOpen: true });
    m.send({ type: "REGISTER_ITEM", item: { value: "a", label: "A" } });
    m.send({ type: "HIGHLIGHT_ITEM", value: "a" });
    m.send({ type: "SELECT_ITEM", value: "a" });
    expect(m.getSnapshot().context.highlighted).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Context menu mode
// ---------------------------------------------------------------------------

describe("createMenuMachine — CONTEXT_MENU", () => {
  it("CONTEXT_MENU event opens the menu", () => {
    const m = make({ isContextMenu: true });
    m.send({ type: "CONTEXT_MENU", x: 100, y: 200 });
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("CONTEXT_MENU stores cursor coordinates", () => {
    const m = make({ isContextMenu: true });
    m.send({ type: "CONTEXT_MENU", x: 100, y: 200 });
    const ctx = m.getSnapshot().context;
    expect(ctx.contextMenuX).toBe(100);
    expect(ctx.contextMenuY).toBe(200);
  });

  it("CONTEXT_MENU while open updates coordinates (re-trigger)", () => {
    const m = make({ isContextMenu: true });
    m.send({ type: "CONTEXT_MENU", x: 100, y: 200 });
    m.send({ type: "CONTEXT_MENU", x: 300, y: 400 });
    const ctx = m.getSnapshot().context;
    expect(ctx.contextMenuX).toBe(300);
    expect(ctx.contextMenuY).toBe(400);
    expect(m.getSnapshot().matches("open")).toBe(true);
  });

  it("CONTEXT_MENU resets highlighted to null", () => {
    const m = make({ isContextMenu: true });
    m.send({ type: "CONTEXT_MENU", x: 0, y: 0 });
    m.send({ type: "REGISTER_ITEM", item: { value: "a", label: "A" } });
    m.send({ type: "HIGHLIGHT_ITEM", value: "a" });
    m.send({ type: "CONTEXT_MENU", x: 0, y: 0 });
    expect(m.getSnapshot().context.highlighted).toBeNull();
  });
});
