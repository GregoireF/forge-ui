import type { InjectionKey } from "vue";
import type { useHoverCard } from "./use-hover-card.js";

export type HoverCardApi = ReturnType<typeof useHoverCard>;

export const hoverCardKey = Symbol("forge-hover-card") as InjectionKey<HoverCardApi>;
