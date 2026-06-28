import { describe, expect, it, vi } from "vitest";
import { connectMenu } from "../src/menu.connect.js";
import type { MenuContext, MenuState } from "../src/menu.types.js";

const BASE_POSITIONING: MenuContext["positioning"] = {
  placement: "bottom-start",
  strategy: "fixed",
  offset: 4,
  alignOffset: 0,
  shiftPadding: 8,
  sameWidth: false,
  avoidCollisions: true,
  hideWhenDetached: false,
  disableAutoUpdate: false,
};

function makeCtx(overrides: Partial<MenuContext> = {}): MenuContext {
  return {
    id: "test-menu",
    items: [],
    highlighted: null,
    highlightSource: "pointer",
    isContextMenu: false,
    contextMenuX: 0,
    contextMenuY: 0,
    loop: true,
    modal: true,
    x: 0,
    y: 0,
    positioned: false,
    currentPlacement: "bottom-start",
    positioning: BASE_POSITIONING,
    contentEl: null,
    arrowEl: null,
    triggerEl: null,
    anchorEl: null,
    triggerId: "test-menu-trigger",
    contentId: "test-menu-content",
    ...overrides,
  };
}

function makeSnapshot(ctx: MenuContext, state: MenuState = "closed") {
  return { value: state, context: ctx, matches: (s: string) => s === state };
}

function makeApi(overrides: Partial<MenuContext> = {}, state: MenuState = "closed") {
  const ctx = makeCtx(overrides);
  const send = vi.fn();
  const machine = { setContext: vi.fn() };
  return { api: connectMenu(makeSnapshot(ctx, state), send, machine), send, machine };
}

// ---------------------------------------------------------------------------
// isOpen
// ---------------------------------------------------------------------------

describe("connectMenu — isOpen", () => {
  it("false when state=closed", () => {
    expect(makeApi({}, "closed").api.isOpen).toBe(false);
  });

  it("true when state=open", () => {
    expect(makeApi({}, "open").api.isOpen).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getTriggerProps
// ---------------------------------------------------------------------------

describe("connectMenu — getTriggerProps", () => {
  it("type=button", () => {
    expect(makeApi().api.getTriggerProps().type).toBe("button");
  });

  it("aria-haspopup=menu", () => {
    expect(makeApi().api.getTriggerProps()["aria-haspopup"]).toBe("menu");
  });

  it("aria-expanded=false when closed", () => {
    expect(makeApi({}, "closed").api.getTriggerProps()["aria-expanded"]).toBe(false);
  });

  it("aria-expanded=true when open", () => {
    expect(makeApi({}, "open").api.getTriggerProps()["aria-expanded"]).toBe(true);
  });

  it("aria-controls undefined when closed", () => {
    expect(makeApi({}, "closed").api.getTriggerProps()["aria-controls"]).toBeUndefined();
  });

  it("aria-controls=contentId when open", () => {
    expect(
      makeApi({ contentId: "my-menu-content" }, "open").api.getTriggerProps()["aria-controls"],
    ).toBe("my-menu-content");
  });

  it("id=triggerId", () => {
    expect(makeApi({ triggerId: "my-trigger" }).api.getTriggerProps().id).toBe("my-trigger");
  });

  it("data-state=closed when closed", () => {
    expect(makeApi({}, "closed").api.getTriggerProps()["data-state"]).toBe("closed");
  });

  it("data-state=open when open", () => {
    expect(makeApi({}, "open").api.getTriggerProps()["data-state"]).toBe("open");
  });

  it("disabled=undefined when not disabled", () => {
    expect(makeApi().api.getTriggerProps().disabled).toBeUndefined();
  });

  it("disabled=true when disabled", () => {
    expect(makeApi().api.getTriggerProps({ disabled: true }).disabled).toBe(true);
  });

  it("data-disabled='' when disabled", () => {
    expect(makeApi().api.getTriggerProps({ disabled: true })["data-disabled"]).toBe("");
  });

  it("onClick sends TOGGLE", () => {
    const { api, send } = makeApi();
    (api.getTriggerProps().onClick as () => void)();
    expect(send).toHaveBeenCalledWith("TOGGLE");
  });

  it("onClick does nothing when disabled", () => {
    const { api, send } = makeApi();
    (api.getTriggerProps({ disabled: true }).onClick as () => void)();
    expect(send).not.toHaveBeenCalled();
  });

  it("onKeyDown=undefined when disabled", () => {
    expect(makeApi().api.getTriggerProps({ disabled: true }).onKeyDown).toBeUndefined();
  });

  it("sets triggerEl via ref callback", () => {
    const { api, machine } = makeApi();
    const el = document.createElement("button");
    (api.getTriggerProps().ref as (el: unknown) => void)(el);
    expect(machine.setContext).toHaveBeenCalledWith({ triggerEl: el });
  });
});

// ---------------------------------------------------------------------------
// getContentProps
// ---------------------------------------------------------------------------

describe("connectMenu — getContentProps", () => {
  it("role=menu", () => {
    expect(makeApi().api.getContentProps().role).toBe("menu");
  });

  it("id=contentId", () => {
    expect(makeApi({ contentId: "my-content" }).api.getContentProps().id).toBe("my-content");
  });

  it("tabIndex=-1", () => {
    expect(makeApi().api.getContentProps().tabIndex).toBe(-1);
  });

  it("aria-modal=true when modal=true", () => {
    expect(makeApi({ modal: true }).api.getContentProps()["aria-modal"]).toBe(true);
  });

  it("aria-modal=undefined when modal=false", () => {
    expect(makeApi({ modal: false }).api.getContentProps()["aria-modal"]).toBeUndefined();
  });

  it("data-state=closed when closed", () => {
    expect(makeApi({}, "closed").api.getContentProps()["data-state"]).toBe("closed");
  });

  it("data-state=open when open", () => {
    expect(makeApi({}, "open").api.getContentProps()["data-state"]).toBe("open");
  });

  it("data-forge-scope=menu", () => {
    expect(makeApi().api.getContentProps()["data-forge-scope"]).toBe("menu");
  });

  it("data-forge-part=content", () => {
    expect(makeApi().api.getContentProps()["data-forge-part"]).toBe("content");
  });

  it("ArrowDown sends NEXT_ITEM", () => {
    const { api, send } = makeApi();
    const handler = api.getContentProps().onKeyDown!;
    const event = {
      key: "ArrowDown",
      ctrlKey: false,
      altKey: false,
      metaKey: false,
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).toHaveBeenCalledWith("NEXT_ITEM");
  });

  it("ArrowUp sends PREV_ITEM", () => {
    const { api, send } = makeApi();
    const handler = api.getContentProps().onKeyDown!;
    const event = {
      key: "ArrowUp",
      ctrlKey: false,
      altKey: false,
      metaKey: false,
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).toHaveBeenCalledWith("PREV_ITEM");
  });

  it("Home sends FIRST_ITEM", () => {
    const { api, send } = makeApi();
    const handler = api.getContentProps().onKeyDown!;
    const event = {
      key: "Home",
      ctrlKey: false,
      altKey: false,
      metaKey: false,
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).toHaveBeenCalledWith("FIRST_ITEM");
  });

  it("End sends LAST_ITEM", () => {
    const { api, send } = makeApi();
    const handler = api.getContentProps().onKeyDown!;
    const event = {
      key: "End",
      ctrlKey: false,
      altKey: false,
      metaKey: false,
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).toHaveBeenCalledWith("LAST_ITEM");
  });

  it("Enter sends SELECT_HIGHLIGHTED when an item is highlighted", () => {
    const { api, send } = makeApi({ highlighted: "a" });
    const handler = api.getContentProps().onKeyDown!;
    const event = {
      key: "Enter",
      ctrlKey: false,
      altKey: false,
      metaKey: false,
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).toHaveBeenCalledWith("SELECT_HIGHLIGHTED");
  });

  it("Escape sends ESCAPE_KEY", () => {
    const { api, send } = makeApi();
    const handler = api.getContentProps().onKeyDown!;
    const event = {
      key: "Escape",
      ctrlKey: false,
      altKey: false,
      metaKey: false,
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).toHaveBeenCalledWith("ESCAPE_KEY");
  });

  it("Tab sends CLOSE", () => {
    const { api, send } = makeApi();
    const handler = api.getContentProps().onKeyDown!;
    const event = {
      key: "Tab",
      ctrlKey: false,
      altKey: false,
      metaKey: false,
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).toHaveBeenCalledWith("CLOSE");
  });
});

// ---------------------------------------------------------------------------
// getItemProps
// ---------------------------------------------------------------------------

describe("connectMenu — getItemProps", () => {
  it("role=menuitem", () => {
    expect(makeApi().api.getItemProps("a").role).toBe("menuitem");
  });

  it("id follows getItemId pattern", () => {
    const { api } = makeApi({ id: "m" });
    expect(api.getItemProps("my-item").id).toBe("m-item-my-item");
  });

  it("tabIndex=-1 when not highlighted", () => {
    expect(makeApi({ highlighted: null }).api.getItemProps("a").tabIndex).toBe(-1);
  });

  it("tabIndex=0 when highlighted", () => {
    expect(makeApi({ highlighted: "a" }).api.getItemProps("a").tabIndex).toBe(0);
  });

  it("data-highlighted='' when highlighted", () => {
    expect(makeApi({ highlighted: "a" }).api.getItemProps("a")["data-highlighted"]).toBe("");
  });

  it("data-highlighted=undefined when not highlighted", () => {
    expect(makeApi({ highlighted: "b" }).api.getItemProps("a")["data-highlighted"]).toBeUndefined();
  });

  it("aria-disabled=undefined when enabled", () => {
    expect(makeApi().api.getItemProps("a", false)["aria-disabled"]).toBeUndefined();
  });

  it("aria-disabled=true when disabled", () => {
    expect(makeApi().api.getItemProps("a", true)["aria-disabled"]).toBe(true);
  });

  it("data-disabled='' when disabled", () => {
    expect(makeApi().api.getItemProps("a", true)["data-disabled"]).toBe("");
  });

  it("onClick sends SELECT_ITEM", () => {
    const { api, send } = makeApi();
    (api.getItemProps("a").onClick as () => void)();
    expect(send).toHaveBeenCalledWith({ type: "SELECT_ITEM", value: "a" });
  });

  it("onClick does nothing when disabled", () => {
    const { api, send } = makeApi();
    (api.getItemProps("a", true).onClick as () => void)();
    expect(send).not.toHaveBeenCalled();
  });

  it("onMouseEnter sends HIGHLIGHT_ITEM", () => {
    const { api, send } = makeApi();
    (api.getItemProps("a").onMouseEnter as () => void)();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_ITEM", value: "a" });
  });

  it("onMouseLeave sends HIGHLIGHT_ITEM null", () => {
    const { api, send } = makeApi();
    (api.getItemProps("a").onMouseLeave as () => void)();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_ITEM", value: null });
  });
});

// ---------------------------------------------------------------------------
// getRadioItemProps
// ---------------------------------------------------------------------------

describe("connectMenu — getRadioItemProps", () => {
  it("role=menuitemradio", () => {
    expect(makeApi().api.getRadioItemProps({ value: "a", checked: false }).role).toBe(
      "menuitemradio",
    );
  });

  it("aria-checked=true when checked", () => {
    expect(makeApi().api.getRadioItemProps({ value: "a", checked: true })["aria-checked"]).toBe(
      true,
    );
  });

  it("aria-checked=false when unchecked", () => {
    expect(makeApi().api.getRadioItemProps({ value: "a", checked: false })["aria-checked"]).toBe(
      false,
    );
  });

  it("data-state=checked when checked", () => {
    expect(makeApi().api.getRadioItemProps({ value: "a", checked: true })["data-state"]).toBe(
      "checked",
    );
  });

  it("data-state=unchecked when not checked", () => {
    expect(makeApi().api.getRadioItemProps({ value: "a", checked: false })["data-state"]).toBe(
      "unchecked",
    );
  });

  it("onClick sends SELECT_ITEM when closeOnSelect=true (default)", () => {
    const { api, send } = makeApi();
    (api.getRadioItemProps({ value: "a", checked: false }).onClick as () => void)();
    expect(send).toHaveBeenCalledWith({ type: "SELECT_ITEM", value: "a" });
  });

  it("onClick does NOT send when closeOnSelect=false", () => {
    const { api, send } = makeApi();
    (
      api.getRadioItemProps({ value: "a", checked: false, closeOnSelect: false })
        .onClick as () => void
    )();
    expect(send).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getCheckboxItemProps
// ---------------------------------------------------------------------------

describe("connectMenu — getCheckboxItemProps", () => {
  it("role=menuitemcheckbox", () => {
    expect(makeApi().api.getCheckboxItemProps({ value: "a", checked: false }).role).toBe(
      "menuitemcheckbox",
    );
  });

  it("aria-checked=true when checked=true", () => {
    expect(makeApi().api.getCheckboxItemProps({ value: "a", checked: true })["aria-checked"]).toBe(
      true,
    );
  });

  it("aria-checked='mixed' when checked='indeterminate'", () => {
    expect(
      makeApi().api.getCheckboxItemProps({ value: "a", checked: "indeterminate" })["aria-checked"],
    ).toBe("mixed");
  });

  it("data-state=indeterminate when checked='indeterminate'", () => {
    expect(
      makeApi().api.getCheckboxItemProps({ value: "a", checked: "indeterminate" })["data-state"],
    ).toBe("indeterminate");
  });

  it("data-state=checked when checked=true", () => {
    expect(makeApi().api.getCheckboxItemProps({ value: "a", checked: true })["data-state"]).toBe(
      "checked",
    );
  });

  it("data-state=unchecked when checked=false", () => {
    expect(makeApi().api.getCheckboxItemProps({ value: "a", checked: false })["data-state"]).toBe(
      "unchecked",
    );
  });

  it("onClick does NOT send by default (closeOnSelect=false default)", () => {
    const { api, send } = makeApi();
    (api.getCheckboxItemProps({ value: "a", checked: false }).onClick as () => void)();
    expect(send).not.toHaveBeenCalled();
  });

  it("onClick sends SELECT_ITEM when closeOnSelect=true", () => {
    const { api, send } = makeApi();
    (
      api.getCheckboxItemProps({ value: "a", checked: false, closeOnSelect: true })
        .onClick as () => void
    )();
    expect(send).toHaveBeenCalledWith({ type: "SELECT_ITEM", value: "a" });
  });
});

// ---------------------------------------------------------------------------
// getSubTriggerProps
// ---------------------------------------------------------------------------

describe("connectMenu — getSubTriggerProps", () => {
  it("role=menuitem", () => {
    expect(makeApi().api.getSubTriggerProps("sub", false).role).toBe("menuitem");
  });

  it("aria-haspopup=menu", () => {
    expect(makeApi().api.getSubTriggerProps("sub", false)["aria-haspopup"]).toBe("menu");
  });

  it("aria-expanded=false when sub closed", () => {
    expect(makeApi().api.getSubTriggerProps("sub", false)["aria-expanded"]).toBe(false);
  });

  it("aria-expanded=true when sub open", () => {
    expect(makeApi().api.getSubTriggerProps("sub", true)["aria-expanded"]).toBe(true);
  });

  it("aria-controls=undefined when sub closed", () => {
    expect(makeApi().api.getSubTriggerProps("sub", false)["aria-controls"]).toBeUndefined();
  });

  it("aria-controls=subMenuId-content when sub open", () => {
    expect(makeApi().api.getSubTriggerProps("sub", true)["aria-controls"]).toBe("sub-content");
  });

  it("data-state=closed when sub closed", () => {
    expect(makeApi().api.getSubTriggerProps("sub", false)["data-state"]).toBe("closed");
  });

  it("data-state=open when sub open", () => {
    expect(makeApi().api.getSubTriggerProps("sub", true)["data-state"]).toBe("open");
  });

  it("tabIndex=0 when this sub-trigger is highlighted", () => {
    expect(makeApi({ highlighted: "sub" }).api.getSubTriggerProps("sub", false).tabIndex).toBe(0);
  });

  it("tabIndex=-1 when not highlighted", () => {
    expect(makeApi({ highlighted: null }).api.getSubTriggerProps("sub", false).tabIndex).toBe(-1);
  });
});

// ---------------------------------------------------------------------------
// getAnchorProps
// ---------------------------------------------------------------------------

describe("connectMenu — getAnchorProps", () => {
  it("data-forge-scope=menu", () => {
    expect(makeApi().api.getAnchorProps()["data-forge-scope"]).toBe("menu");
  });

  it("data-forge-part=anchor", () => {
    expect(makeApi().api.getAnchorProps()["data-forge-part"]).toBe("anchor");
  });

  it("ref callback calls setContext with anchorEl", () => {
    const { api, machine } = makeApi();
    const el = document.createElement("span");
    (api.getAnchorProps().ref as (el: unknown) => void)(el);
    expect(machine.setContext).toHaveBeenCalledWith({ anchorEl: el });
  });

  it("ref callback with null clears anchorEl", () => {
    const { api, machine } = makeApi();
    (api.getAnchorProps().ref as (el: unknown) => void)(null);
    expect(machine.setContext).toHaveBeenCalledWith({ anchorEl: null });
  });
});

// ---------------------------------------------------------------------------
// getSeparatorProps / getLabelProps / getGroupProps
// ---------------------------------------------------------------------------

describe("connectMenu — getSeparatorProps", () => {
  it("role=separator", () => {
    expect(makeApi().api.getSeparatorProps().role).toBe("separator");
  });

  it("aria-orientation=horizontal", () => {
    expect(makeApi().api.getSeparatorProps()["aria-orientation"]).toBe("horizontal");
  });
});

describe("connectMenu — getLabelProps", () => {
  it("role=none", () => {
    expect(makeApi().api.getLabelProps().role).toBe("none");
  });

  it("data-forge-part=label", () => {
    expect(makeApi().api.getLabelProps()["data-forge-part"]).toBe("label");
  });
});

describe("connectMenu — getGroupProps", () => {
  it("role=group", () => {
    expect(makeApi().api.getGroupProps("g1").role).toBe("group");
  });

  it("aria-labelledby=groupId", () => {
    expect(makeApi().api.getGroupProps("g1")["aria-labelledby"]).toBe("g1");
  });
});

// ---------------------------------------------------------------------------
// getItemIndicatorProps
// ---------------------------------------------------------------------------

describe("connectMenu — getItemIndicatorProps", () => {
  it("data-state=checked when true", () => {
    expect(makeApi().api.getItemIndicatorProps(true)["data-state"]).toBe("checked");
  });

  it("data-state=unchecked when false", () => {
    expect(makeApi().api.getItemIndicatorProps(false)["data-state"]).toBe("unchecked");
  });

  it("data-state=indeterminate when 'indeterminate'", () => {
    expect(makeApi().api.getItemIndicatorProps("indeterminate")["data-state"]).toBe(
      "indeterminate",
    );
  });
});

// ---------------------------------------------------------------------------
// getContextMenuTriggerProps
// ---------------------------------------------------------------------------

describe("connectMenu — getContextMenuTriggerProps", () => {
  it("data-forge-part=context-menu-trigger", () => {
    expect(makeApi().api.getContextMenuTriggerProps()["data-forge-part"]).toBe(
      "context-menu-trigger",
    );
  });

  it("onContextMenu calls preventDefault and sends CONTEXT_MENU", () => {
    const { api, send } = makeApi();
    const event = { clientX: 100, clientY: 200, preventDefault: vi.fn() };
    (api.getContextMenuTriggerProps().onContextMenu as (e: typeof event) => void)(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith({ type: "CONTEXT_MENU", x: 100, y: 200 });
  });
});

// ---------------------------------------------------------------------------
// getPositionerProps — context menu mode
// ---------------------------------------------------------------------------

describe("connectMenu — getPositionerProps (context menu mode)", () => {
  it("uses fixed position at contextMenuX/Y", () => {
    const { api } = makeApi({ isContextMenu: true, contextMenuX: 150, contextMenuY: 300 });
    const style = api.getPositionerProps().style as Record<string, string>;
    expect(style.position).toBe("fixed");
    expect(style.top).toBe("300px");
    expect(style.left).toBe("150px");
  });
});

// ---------------------------------------------------------------------------
// getPositionerProps — floating mode
// ---------------------------------------------------------------------------

describe("connectMenu — getPositionerProps (floating mode)", () => {
  it("position matches positioning.strategy", () => {
    const { api } = makeApi({
      positioning: { ...BASE_POSITIONING, strategy: "absolute" },
      isContextMenu: false,
    });
    const style = api.getPositionerProps().style as Record<string, string>;
    expect(style.position).toBe("absolute");
  });

  it("top/left match x/y context values", () => {
    const { api } = makeApi({ x: 80, y: 120, isContextMenu: false });
    const style = api.getPositionerProps().style as Record<string, string>;
    expect(style.top).toBe("120px");
    expect(style.left).toBe("80px");
  });

  it("pointerEvents=none when not yet positioned", () => {
    const { api } = makeApi({ positioned: false, isContextMenu: false });
    const style = api.getPositionerProps().style as Record<string, string>;
    expect(style.pointerEvents).toBe("none");
  });

  it("pointerEvents absent when positioned=true", () => {
    const { api } = makeApi({ positioned: true, isContextMenu: false });
    const style = api.getPositionerProps().style as Record<string, unknown>;
    expect(style.pointerEvents).toBeUndefined();
  });

  it("data-side reflects currentPlacement side", () => {
    const { api } = makeApi({ currentPlacement: "top-start", isContextMenu: false });
    expect(api.getPositionerProps()["data-side"]).toBe("top");
  });

  it("data-align reflects currentPlacement alignment", () => {
    const { api } = makeApi({ currentPlacement: "bottom-end", isContextMenu: false });
    expect(api.getPositionerProps()["data-align"]).toBe("end");
  });

  it("data-forge-part=positioner", () => {
    expect(makeApi().api.getPositionerProps()["data-forge-part"]).toBe("positioner");
  });
});

// ---------------------------------------------------------------------------
// getArrowProps / getArrowTipProps
// ---------------------------------------------------------------------------

describe("connectMenu — getArrowProps", () => {
  it("data-forge-scope=menu", () => {
    expect(makeApi().api.getArrowProps()["data-forge-scope"]).toBe("menu");
  });

  it("data-forge-part=arrow", () => {
    expect(makeApi().api.getArrowProps()["data-forge-part"]).toBe("arrow");
  });

  it("data-side reflects currentPlacement", () => {
    const { api } = makeApi({ currentPlacement: "right-start" });
    expect(api.getArrowProps()["data-side"]).toBe("right");
  });

  it("ref callback calls setContext with arrowEl", () => {
    const { api, machine } = makeApi();
    const el = document.createElement("span");
    (api.getArrowProps().ref as (el: unknown) => void)(el);
    expect(machine.setContext).toHaveBeenCalledWith({ arrowEl: el });
  });
});

describe("connectMenu — getArrowTipProps", () => {
  it("data-forge-part=arrow-tip", () => {
    expect(makeApi().api.getArrowTipProps()["data-forge-part"]).toBe("arrow-tip");
  });

  it("data-forge-scope=menu", () => {
    expect(makeApi().api.getArrowTipProps()["data-forge-scope"]).toBe("menu");
  });
});

// ---------------------------------------------------------------------------
// getRadioGroupProps / getRadioGroupLabelProps
// ---------------------------------------------------------------------------

describe("connectMenu — getRadioGroupProps", () => {
  it("role=group", () => {
    expect(makeApi().api.getRadioGroupProps("theme").role).toBe("group");
  });

  it("data-forge-part=radio-group", () => {
    expect(makeApi().api.getRadioGroupProps("theme")["data-forge-part"]).toBe("radio-group");
  });

  it("aria-labelledby references the group label id", () => {
    const { api } = makeApi({ id: "m" });
    expect(api.getRadioGroupProps("theme")["aria-labelledby"]).toBe("m-rg-label-theme");
  });
});

describe("connectMenu — getRadioGroupLabelProps", () => {
  it("role=presentation", () => {
    expect(makeApi().api.getRadioGroupLabelProps("theme").role).toBe("presentation");
  });

  it("id matches the aria-labelledby from getRadioGroupProps", () => {
    const { api } = makeApi({ id: "m" });
    expect(api.getRadioGroupLabelProps("theme").id).toBe("m-rg-label-theme");
  });

  it("data-forge-part=radio-group-label", () => {
    expect(makeApi().api.getRadioGroupLabelProps("theme")["data-forge-part"]).toBe(
      "radio-group-label",
    );
  });
});

// ---------------------------------------------------------------------------
// getGroupLabelProps
// ---------------------------------------------------------------------------

describe("connectMenu — getGroupLabelProps", () => {
  it("id=groupId", () => {
    expect(makeApi().api.getGroupLabelProps("edit-g").id).toBe("edit-g");
  });

  it("role=presentation", () => {
    expect(makeApi().api.getGroupLabelProps("edit-g").role).toBe("presentation");
  });

  it("data-forge-part=group-label", () => {
    expect(makeApi().api.getGroupLabelProps("edit-g")["data-forge-part"]).toBe("group-label");
  });
});

// ---------------------------------------------------------------------------
// contentKeyDown — Space key + typeahead
// ---------------------------------------------------------------------------

describe("connectMenu — contentKeyDown Space key", () => {
  it("Space sends SELECT_HIGHLIGHTED when item highlighted", () => {
    const { api, send } = makeApi({ highlighted: "a" });
    const handler = api.getContentProps().onKeyDown!;
    const event = {
      key: " ",
      ctrlKey: false,
      altKey: false,
      metaKey: false,
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).toHaveBeenCalledWith("SELECT_HIGHLIGHTED");
  });

  it("Space does not send when nothing highlighted", () => {
    const { api, send } = makeApi({ highlighted: null });
    const handler = api.getContentProps().onKeyDown!;
    const event = {
      key: " ",
      ctrlKey: false,
      altKey: false,
      metaKey: false,
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).not.toHaveBeenCalled();
  });
});

describe("connectMenu — contentKeyDown typeahead", () => {
  it("printable char triggers HIGHLIGHT_ITEM via typeahead", () => {
    const items = [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
    ];
    const { api, send } = makeApi({ items, highlighted: null });
    const handler = api.getContentProps().onKeyDown!;
    const event = {
      key: "a",
      ctrlKey: false,
      altKey: false,
      metaKey: false,
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).toHaveBeenCalledWith({
      type: "HIGHLIGHT_ITEM",
      value: "apple",
      source: "keyboard",
    });
  });

  it("Ctrl+key does not trigger typeahead", () => {
    const items = [{ value: "a", label: "A" }];
    const { api, send } = makeApi({ items });
    const handler = api.getContentProps().onKeyDown!;
    const event = {
      key: "a",
      ctrlKey: true,
      altKey: false,
      metaKey: false,
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).not.toHaveBeenCalled();
  });

  it("multi-char key (like ArrowDown) does not trigger typeahead", () => {
    const items = [{ value: "a", label: "A" }];
    const { api, send } = makeApi({ items });
    const handler = api.getContentProps().onKeyDown!;
    const event = {
      key: "ArrowDown",
      ctrlKey: false,
      altKey: false,
      metaKey: false,
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    // ArrowDown sends NEXT_ITEM, NOT a typeahead HIGHLIGHT_ITEM
    expect(send).toHaveBeenCalledWith("NEXT_ITEM");
    expect(send).not.toHaveBeenCalledWith(expect.objectContaining({ source: "keyboard" }));
  });
});

// ---------------------------------------------------------------------------
// triggerKeyDown — ArrowDown/Enter opens the menu
// ---------------------------------------------------------------------------

describe("connectMenu — triggerKeyDown", () => {
  it("ArrowDown sends OPEN when menu is closed", () => {
    const { api, send } = makeApi({}, "closed");
    const props = api.getTriggerProps();
    const handler = props.onKeyDown!;
    const event = {
      key: "ArrowDown",
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).toHaveBeenCalledWith("OPEN");
  });

  it("Enter sends OPEN when menu is closed", () => {
    const { api, send } = makeApi({}, "closed");
    const handler = api.getTriggerProps().onKeyDown!;
    const event = {
      key: "Enter",
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).toHaveBeenCalledWith("OPEN");
  });

  it("ArrowDown does NOT send OPEN when menu is already open", () => {
    const { api, send } = makeApi({}, "open");
    const handler = api.getTriggerProps().onKeyDown!;
    const event = {
      key: "ArrowDown",
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).not.toHaveBeenCalledWith("OPEN");
  });

  it("Escape sends ESCAPE_KEY when menu is open", () => {
    const { api, send } = makeApi({}, "open");
    const handler = api.getTriggerProps().onKeyDown!;
    const event = {
      key: "Escape",
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).toHaveBeenCalledWith("ESCAPE_KEY");
  });

  it("Escape does nothing when menu is closed", () => {
    const { api, send } = makeApi({}, "closed");
    const handler = api.getTriggerProps().onKeyDown!;
    const event = {
      key: "Escape",
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).not.toHaveBeenCalled();
  });

  it("ArrowUp sends OPEN when menu is closed", () => {
    const { api, send } = makeApi({}, "closed");
    const handler = api.getTriggerProps().onKeyDown!;
    const event = {
      key: "ArrowUp",
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).toHaveBeenCalledWith("OPEN");
  });

  it("ArrowUp queues LAST_ITEM via setTimeout when opening", () => {
    vi.useFakeTimers();
    const { api, send } = makeApi({}, "closed");
    const handler = api.getTriggerProps().onKeyDown!;
    const event = {
      key: "ArrowUp",
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).toHaveBeenCalledWith("OPEN");
    vi.runAllTimers();
    expect(send).toHaveBeenCalledWith("LAST_ITEM");
    vi.useRealTimers();
  });

  it("ArrowUp does NOT send OPEN when menu is already open", () => {
    const { api, send } = makeApi({}, "open");
    const handler = api.getTriggerProps().onKeyDown!;
    const event = {
      key: "ArrowUp",
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).not.toHaveBeenCalledWith("OPEN");
  });
});

// ---------------------------------------------------------------------------
// focus helpers
// ---------------------------------------------------------------------------

describe("connectMenu — focus helpers", () => {
  it("focusContent calls contentEl.focus()", () => {
    const contentEl = { focus: vi.fn() } as unknown as HTMLElement;
    const { api } = makeApi({ contentEl });
    api.focusContent();
    expect(contentEl.focus).toHaveBeenCalled();
  });

  it("focusContent is a no-op when contentEl is null", () => {
    const { api } = makeApi({ contentEl: null });
    expect(() => api.focusContent()).not.toThrow();
  });

  it("focusTrigger calls triggerEl.focus()", () => {
    const triggerEl = { focus: vi.fn() } as unknown as HTMLElement;
    const { api } = makeApi({ triggerEl });
    api.focusTrigger();
    expect(triggerEl.focus).toHaveBeenCalled();
  });

  it("focusTrigger is a no-op when triggerEl is null", () => {
    const { api } = makeApi({ triggerEl: null });
    expect(() => api.focusTrigger()).not.toThrow();
  });

  it("focusHighlightedItem focuses the item element in DOM", () => {
    const content = document.createElement("div");
    const itemEl = document.createElement("div");
    itemEl.id = "test-menu-item-apple";
    content.appendChild(itemEl);
    const focusMock = vi.fn();
    itemEl.focus = focusMock;
    const { api } = makeApi({ highlighted: "apple", contentEl: content });
    api.focusHighlightedItem();
    expect(focusMock).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("focusHighlightedItem is a no-op when highlighted is null", () => {
    const content = document.createElement("div");
    const { api } = makeApi({ highlighted: null, contentEl: content });
    expect(() => api.focusHighlightedItem()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// getContextMenuTriggerProps — ref callback + onContextMenu
// ---------------------------------------------------------------------------

describe("connectMenu — getContextMenuTriggerProps", () => {
  it("ref callback sets triggerEl on machine", () => {
    const { api, machine } = makeApi();
    const el = document.createElement("div");
    (api.getContextMenuTriggerProps().ref as (el: unknown) => void)(el);
    expect(machine.setContext).toHaveBeenCalledWith({ triggerEl: el });
  });

  it("ref callback with null clears triggerEl", () => {
    const { api, machine } = makeApi();
    (api.getContextMenuTriggerProps().ref as (el: unknown) => void)(null);
    expect(machine.setContext).toHaveBeenCalledWith({ triggerEl: null });
  });

  it("onContextMenu calls preventDefault and sends CONTEXT_MENU with coords", () => {
    const { api, send } = makeApi();
    const event = { clientX: 100, clientY: 200, preventDefault: vi.fn() };
    (api.getContextMenuTriggerProps().onContextMenu as (e: typeof event) => void)(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith({ type: "CONTEXT_MENU", x: 100, y: 200 });
  });
});

// ---------------------------------------------------------------------------
// getContentProps — ref callback
// ---------------------------------------------------------------------------

describe("connectMenu — getContentProps ref callback", () => {
  it("ref callback sets contentEl on machine", () => {
    const { api, machine } = makeApi();
    const el = document.createElement("div");
    (api.getContentProps().ref as (el: unknown) => void)(el);
    expect(machine.setContext).toHaveBeenCalledWith(expect.objectContaining({ contentEl: el }));
  });

  it("ref callback with null clears contentEl", () => {
    const { api, machine } = makeApi();
    (api.getContentProps().ref as (el: unknown) => void)(null);
    expect(machine.setContext).toHaveBeenCalledWith(expect.objectContaining({ contentEl: null }));
  });
});

// ---------------------------------------------------------------------------
// getItemProps — mouse events (onMousemove + onMouseleave camelCase aliases)
// ---------------------------------------------------------------------------

describe("connectMenu — getItemProps mouse events", () => {
  it("onMousemove sends HIGHLIGHT_ITEM for enabled item", () => {
    const { api, send } = makeApi();
    const props = api.getItemProps("cut");
    (props.onMousemove as () => void)();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_ITEM", value: "cut" });
  });

  it("onMousemove is a no-op for disabled item", () => {
    const { api, send } = makeApi();
    const props = api.getItemProps("cut", true);
    (props.onMousemove as () => void)();
    expect(send).not.toHaveBeenCalled();
  });

  it("onMouseleave (lowercase) sends HIGHLIGHT_ITEM with null", () => {
    const { api, send } = makeApi({ highlighted: "cut" });
    const props = api.getItemProps("cut");
    (props.onMouseleave as () => void)();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_ITEM", value: null });
  });
});

// ---------------------------------------------------------------------------
// getRadioItemProps — mouse events
// ---------------------------------------------------------------------------

describe("connectMenu — getRadioItemProps mouse events", () => {
  const radioOpts = { value: "dark", checked: false, groupId: "theme" };

  it("onMouseEnter sends HIGHLIGHT_ITEM for enabled radio item", () => {
    const { api, send } = makeApi();
    (api.getRadioItemProps(radioOpts).onMouseEnter as () => void)();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_ITEM", value: "dark" });
  });

  it("onMouseEnter is a no-op for disabled radio item", () => {
    const { api, send } = makeApi();
    (api.getRadioItemProps({ ...radioOpts, disabled: true }).onMouseEnter as () => void)();
    expect(send).not.toHaveBeenCalled();
  });

  it("onMouseLeave sends HIGHLIGHT_ITEM with null", () => {
    const { api, send } = makeApi({ highlighted: "dark" });
    (api.getRadioItemProps(radioOpts).onMouseLeave as () => void)();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_ITEM", value: null });
  });

  it("onMousemove sends HIGHLIGHT_ITEM for enabled radio item", () => {
    const { api, send } = makeApi();
    (api.getRadioItemProps(radioOpts).onMousemove as () => void)();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_ITEM", value: "dark" });
  });

  it("onMouseleave (lowercase) sends HIGHLIGHT_ITEM with null", () => {
    const { api, send } = makeApi({ highlighted: "dark" });
    (api.getRadioItemProps(radioOpts).onMouseleave as () => void)();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_ITEM", value: null });
  });
});

// ---------------------------------------------------------------------------
// getCheckboxItemProps — mouse events
// ---------------------------------------------------------------------------

describe("connectMenu — getCheckboxItemProps mouse events", () => {
  const chkOpts = { value: "grid", checked: false };

  it("onMouseEnter sends HIGHLIGHT_ITEM for enabled checkbox item", () => {
    const { api, send } = makeApi();
    (api.getCheckboxItemProps(chkOpts).onMouseEnter as () => void)();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_ITEM", value: "grid" });
  });

  it("onMouseEnter is a no-op for disabled checkbox item", () => {
    const { api, send } = makeApi();
    (api.getCheckboxItemProps({ ...chkOpts, disabled: true }).onMouseEnter as () => void)();
    expect(send).not.toHaveBeenCalled();
  });

  it("onMouseLeave sends HIGHLIGHT_ITEM with null", () => {
    const { api, send } = makeApi({ highlighted: "grid" });
    (api.getCheckboxItemProps(chkOpts).onMouseLeave as () => void)();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_ITEM", value: null });
  });

  it("onMousemove sends HIGHLIGHT_ITEM for enabled checkbox item", () => {
    const { api, send } = makeApi();
    (api.getCheckboxItemProps(chkOpts).onMousemove as () => void)();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_ITEM", value: "grid" });
  });

  it("onMouseleave (lowercase) sends HIGHLIGHT_ITEM with null", () => {
    const { api, send } = makeApi({ highlighted: "grid" });
    (api.getCheckboxItemProps(chkOpts).onMouseleave as () => void)();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_ITEM", value: null });
  });
});

// ---------------------------------------------------------------------------
// getSubTriggerProps — mouse events
// ---------------------------------------------------------------------------

describe("connectMenu — getSubTriggerProps mouse events", () => {
  it("onMouseEnter sends HIGHLIGHT_ITEM for enabled sub-trigger", () => {
    const { api, send } = makeApi();
    (api.getSubTriggerProps("share-sub", false).onMouseEnter as () => void)();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_ITEM", value: "share-sub" });
  });

  it("onMouseEnter is a no-op for disabled sub-trigger", () => {
    const { api, send } = makeApi();
    (api.getSubTriggerProps("share-sub", false, true).onMouseEnter as () => void)();
    expect(send).not.toHaveBeenCalled();
  });

  it("onMousemove sends HIGHLIGHT_ITEM for enabled sub-trigger", () => {
    const { api, send } = makeApi();
    (api.getSubTriggerProps("share-sub", false).onMousemove as () => void)();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_ITEM", value: "share-sub" });
  });

  it("onMouseLeave sends HIGHLIGHT_ITEM with null", () => {
    const { api, send } = makeApi({ highlighted: "share-sub" });
    (api.getSubTriggerProps("share-sub", false).onMouseLeave as () => void)();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_ITEM", value: null });
  });

  it("onMouseleave (lowercase) sends HIGHLIGHT_ITEM with null", () => {
    const { api, send } = makeApi({ highlighted: "share-sub" });
    (api.getSubTriggerProps("share-sub", false).onMouseleave as () => void)();
    expect(send).toHaveBeenCalledWith({ type: "HIGHLIGHT_ITEM", value: null });
  });
});

// ---------------------------------------------------------------------------
// Typeahead — cycling through multiple matches
// ---------------------------------------------------------------------------

describe("connectMenu — typeahead cycling", () => {
  it("cycles to next match when current item is first in matches", () => {
    const items = [
      { value: "apple", label: "Apple" },
      { value: "avocado", label: "Avocado" },
    ];
    const { api, send } = makeApi({ items, highlighted: "apple" });
    const handler = api.getContentProps().onKeyDown!;
    const event = {
      key: "a",
      ctrlKey: false,
      altKey: false,
      metaKey: false,
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).toHaveBeenCalledWith({
      type: "HIGHLIGHT_ITEM",
      value: "avocado",
      source: "keyboard",
    });
  });

  it("wraps to first match when current item is last in matches", () => {
    const items = [
      { value: "apple", label: "Apple" },
      { value: "avocado", label: "Avocado" },
    ];
    const { api, send } = makeApi({ items, highlighted: "avocado" });
    const handler = api.getContentProps().onKeyDown!;
    const event = {
      key: "a",
      ctrlKey: false,
      altKey: false,
      metaKey: false,
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    (handler as (e: typeof event) => void)(event);
    expect(send).toHaveBeenCalledWith({
      type: "HIGHLIGHT_ITEM",
      value: "apple",
      source: "keyboard",
    });
  });

  it("second consecutive char press triggers clearTimeout (timerId defined path)", () => {
    const items = [{ value: "apple", label: "Apple" }];
    const { api } = makeApi({ items, highlighted: null });
    const handler = api.getContentProps().onKeyDown!;
    const ev = (k: string) => ({
      key: k,
      ctrlKey: false,
      altKey: false,
      metaKey: false,
      defaultPrevented: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });
    (handler as (e: ReturnType<typeof ev>) => void)(ev("a"));
    expect(() => (handler as (e: ReturnType<typeof ev>) => void)(ev("p"))).not.toThrow();
  });
});
