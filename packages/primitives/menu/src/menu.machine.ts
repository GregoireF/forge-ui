import {
  createMachine,
  makeLayerActivity,
  makeWatchOutsideActivity,
} from "@forge-ui/core";
import type { FloatingPositioning } from "@forge-ui/floating";
import { makeComputePositionActivity } from "@forge-ui/floating";
import type { MenuContext, MenuEvent, MenuItem, MenuState } from "./menu.types.js";

// ---------------------------------------------------------------------------
// Item helpers
// ---------------------------------------------------------------------------

function getEnabled(items: MenuItem[]): MenuItem[] {
  return items.filter((i) => !i.disabled);
}

function getNextHighlighted(items: MenuItem[], current: string | null, loop: boolean): string | null {
  const enabled = getEnabled(items);
  if (enabled.length === 0) return null;
  if (current === null) return enabled[0]?.value ?? null;
  const idx = enabled.findIndex((i) => i.value === current);
  if (idx === -1) return enabled[0]?.value ?? null;
  const nextIdx = idx + 1;
  if (nextIdx >= enabled.length) return loop ? (enabled[0]?.value ?? null) : (enabled[idx]?.value ?? null);
  return enabled[nextIdx]?.value ?? null;
}

function getPrevHighlighted(items: MenuItem[], current: string | null, loop: boolean): string | null {
  const enabled = getEnabled(items);
  if (enabled.length === 0) return null;
  if (current === null) return enabled[enabled.length - 1]?.value ?? null;
  const idx = enabled.findIndex((i) => i.value === current);
  if (idx === -1) return enabled[enabled.length - 1]?.value ?? null;
  const prevIdx = idx - 1;
  if (prevIdx < 0) return loop ? (enabled[enabled.length - 1]?.value ?? null) : (enabled[0]?.value ?? null);
  return enabled[prevIdx]?.value ?? null;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function invokeOnOpenChange(open: boolean) {
  return ({ context }: { context: MenuContext }) => {
    context.onOpenChange?.(open);
  };
}

function invokeOnHighlightChange({ context }: { context: MenuContext }) {
  context.onHighlightChange?.(context.highlighted);
}

function setHighlightFirst({ context, setContext }: { context: MenuContext; setContext: (u: Partial<MenuContext>) => void }) {
  const first = getEnabled(context.items)[0]?.value ?? null;
  setContext({ highlighted: first, highlightSource: "keyboard" });
}

function setHighlightLast({ context, setContext }: { context: MenuContext; setContext: (u: Partial<MenuContext>) => void }) {
  const enabled = getEnabled(context.items);
  setContext({ highlighted: enabled[enabled.length - 1]?.value ?? null, highlightSource: "keyboard" });
}

function highlightNext({ context, setContext }: { context: MenuContext; setContext: (u: Partial<MenuContext>) => void }) {
  setContext({ highlighted: getNextHighlighted(context.items, context.highlighted, context.loop), highlightSource: "keyboard" });
}

function highlightPrev({ context, setContext }: { context: MenuContext; setContext: (u: Partial<MenuContext>) => void }) {
  setContext({ highlighted: getPrevHighlighted(context.items, context.highlighted, context.loop), highlightSource: "keyboard" });
}

function clearHighlight({ setContext }: { setContext: (u: Partial<MenuContext>) => void }) {
  setContext({ highlighted: null });
}

const registerItemAction = ({ context, setContext, event }: { context: MenuContext; setContext: (u: Partial<MenuContext>) => void; event: MenuEvent }) => {
  if (event.type !== "REGISTER_ITEM") return;
  const exists = context.items.some((i) => i.value === event.item.value);
  if (!exists) setContext({ items: [...context.items, event.item] });
};

const unregisterItemAction = ({ context, setContext, event }: { context: MenuContext; setContext: (u: Partial<MenuContext>) => void; event: MenuEvent }) => {
  if (event.type !== "UNREGISTER_ITEM") return;
  setContext({ items: context.items.filter((i) => i.value !== event.value) });
};

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

const registerLayer = makeLayerActivity<MenuContext>({
  getId: (ctx) => ctx.id,
  getContentEl: (ctx) => ctx.contentEl,
});

const computePosition = makeComputePositionActivity<MenuContext>();

function makeMenuWatchOutside(isContextMenu: boolean) {
  return makeWatchOutsideActivity<MenuContext>({
    getId: (ctx) => ctx.id,
    getContainers: (ctx) => isContextMenu
      ? [ctx.contentEl]
      : [ctx.contentEl, ctx.triggerEl],
    sendClose: "INTERACT_OUTSIDE",
    getOnInteractOutside: (ctx) => ctx.onInteractOutside,
    getOnPointerDownOutside: (ctx) => ctx.onPointerDownOutside,
    getOnFocusOutside: (ctx) => ctx.onFocusOutside,
  });
}

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface CreateMenuMachineOptions {
  id: string;
  defaultOpen?: boolean;
  open?: boolean;
  isContextMenu?: boolean;
  /** @default true */
  loop?: boolean;
  /**
   * When true, the menu sets `aria-modal` on its content and the framework
   * renders a transparent pointer-events overlay behind the positioner.
   * @default true — matches Radix/Ark/Reka defaults for full WCAG compliance.
   */
  modal?: boolean;
  positioning?: FloatingPositioning;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (value: string) => void;
  onHighlightChange?: (value: string | null) => void;
  onInteractOutside?: (e: PointerEvent | FocusEvent) => void;
  onPointerDownOutside?: (e: PointerEvent) => void;
  onFocusOutside?: (e: FocusEvent) => void;
  onEscapeKeyDown?: (e: { key: string; defaultPrevented: boolean; preventDefault(): void }) => void;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createMenuMachine(options: CreateMenuMachineOptions) {
  const { id } = options;
  const isContextMenu = options.isContextMenu ?? false;
  const loop = options.loop ?? true;
  const modal = options.modal ?? true;
  const pos = options.positioning ?? {};
  const initialOpen = options.open ?? options.defaultOpen ?? false;
  const watchOutside = makeMenuWatchOutside(isContextMenu);

  return createMachine<MenuContext, MenuState, MenuEvent>({
    id: `forge-menu:${id}`,
    context: {
      id,
      items: [],
      highlighted: null,
      highlightSource: "pointer" as const,
      isContextMenu,
      contextMenuX: 0,
      contextMenuY: 0,
      loop,
      modal,
      x: 0,
      y: 0,
      positioned: false,
      currentPlacement: pos.placement ?? "bottom-start",
      positioning: {
        placement: pos.placement ?? "bottom-start",
        strategy: pos.strategy ?? "fixed",
        offset: pos.offset ?? 4,
        alignOffset: pos.alignOffset ?? 0,
        shiftPadding: pos.shiftPadding ?? 8,
        sameWidth: false,
        avoidCollisions: pos.avoidCollisions ?? true,
        hideWhenDetached: pos.hideWhenDetached ?? false,
        disableAutoUpdate: pos.disableAutoUpdate ?? false,
        ...(pos.boundary !== undefined && { boundary: pos.boundary }),
        ...(pos.middleware !== undefined && { middleware: pos.middleware }),
      },
      contentEl: null,
      arrowEl: null,
      triggerEl: null,
      anchorEl: null,
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
      ...(options.onOpenChange !== undefined && { onOpenChange: options.onOpenChange }),
      ...(options.onSelect !== undefined && { onSelect: options.onSelect }),
      ...(options.onHighlightChange !== undefined && { onHighlightChange: options.onHighlightChange }),
      ...(options.onInteractOutside !== undefined && { onInteractOutside: options.onInteractOutside }),
      ...(options.onPointerDownOutside !== undefined && { onPointerDownOutside: options.onPointerDownOutside }),
      ...(options.onFocusOutside !== undefined && { onFocusOutside: options.onFocusOutside }),
      ...(options.onEscapeKeyDown !== undefined && { onEscapeKeyDown: options.onEscapeKeyDown }),
    },
    initial: initialOpen ? "open" : "closed",

    states: {
      closed: {
        tags: ["closed"],
        on: {
          // Note: OPEN does NOT call setHighlightFirst here.
          // Items may not be mounted yet (Portal renders after open).
          // The Content component sends FIRST_ITEM via useEffect once items are registered.
          OPEN: { target: "open", actions: [invokeOnOpenChange(true)] },
          TOGGLE: { target: "open", actions: [invokeOnOpenChange(true)] },
          CONTEXT_MENU: {
            target: "open",
            actions: [
              ({ setContext, event }) => {
                if (event.type !== "CONTEXT_MENU") return;
                setContext({ contextMenuX: event.x, contextMenuY: event.y, highlighted: null });
              },
              invokeOnOpenChange(true),
            ],
          },
          REGISTER_ITEM: { actions: [registerItemAction] },
          UNREGISTER_ITEM: { actions: [unregisterItemAction] },
        },
      },

      open: {
        tags: ["open"],
        activities: isContextMenu
          ? ["registerLayer", "watchOutside"]
          : ["registerLayer", "computePosition", "watchOutside"],
        on: {
          CLOSE: { target: "closed", actions: [clearHighlight, invokeOnOpenChange(false)] },
          TOGGLE: { target: "closed", actions: [clearHighlight, invokeOnOpenChange(false)] },
          ESCAPE_KEY: { target: "closed", actions: [clearHighlight, invokeOnOpenChange(false)] },
          INTERACT_OUTSIDE: { target: "closed", actions: [clearHighlight, invokeOnOpenChange(false)] },

          SELECT_ITEM: {
            target: "closed",
            actions: [
              ({ context, event }) => {
                if (event.type !== "SELECT_ITEM") return;
                context.onSelect?.(event.value);
              },
              clearHighlight,
              invokeOnOpenChange(false),
            ],
          },

          SELECT_HIGHLIGHTED: {
            target: "closed",
            actions: [
              ({ context }) => {
                if (context.highlighted !== null) context.onSelect?.(context.highlighted);
              },
              clearHighlight,
              invokeOnOpenChange(false),
            ],
          },

          HIGHLIGHT_ITEM: {
            actions: [
              ({ setContext, event }) => {
                if (event.type !== "HIGHLIGHT_ITEM") return;
                setContext({ highlighted: event.value, highlightSource: event.source ?? "pointer" });
              },
              invokeOnHighlightChange,
            ],
          },
          NEXT_ITEM: { actions: [highlightNext, invokeOnHighlightChange] },
          PREV_ITEM: { actions: [highlightPrev, invokeOnHighlightChange] },
          FIRST_ITEM: { actions: [setHighlightFirst, invokeOnHighlightChange] },
          LAST_ITEM: { actions: [setHighlightLast, invokeOnHighlightChange] },

          REGISTER_ITEM: { actions: [registerItemAction] },
          UNREGISTER_ITEM: { actions: [unregisterItemAction] },

          CONTEXT_MENU: {
            actions: [
              ({ setContext, event }) => {
                if (event.type !== "CONTEXT_MENU") return;
                setContext({ contextMenuX: event.x, contextMenuY: event.y, highlighted: null });
              },
            ],
          },
        },
      },
    },

    activities: { registerLayer, computePosition, watchOutside },
  });
}
