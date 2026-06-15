// Machine engine

export type {
  FocusActivityOptions,
  HideBackgroundActivityOptions,
  KeyboardActivityOptions,
  LayerActivityOptions,
  LockScrollActivityOptions,
  WatchOutsideActivityOptions,
} from "./activities/index.js";
// Activity factories
export {
  makeFocusActivity,
  makeHideBackgroundActivity,
  makeKeyboardActivity,
  makeLayerActivity,
  makeLockScrollActivity,
  makeWatchOutsideActivity,
  updateLayerContentEl,
} from "./activities/index.js";
export { createMachine } from "./machine/machine.js";
export type {
  ActionFn,
  ActionParams,
  ActivityFn,
  EventObject,
  GuardFn,
  MachineConfig,
  MachineInstance,
  MachineSnapshot,
  SnapshotListener,
  StateNodeConfig,
  TransitionConfig,
} from "./machine/types.js";

// Utilities
export { hideOthers } from "./utils/aria-hidden.js";
export { focusFirst, getFocusableElements, trapFocus } from "./utils/focus-trap.js";
export { interactOutside } from "./utils/interact-outside.js";
export { mergeRefs } from "./utils/merge-refs.js";
export type { WatchPresenceOptions } from "./utils/presence.js";
export { watchPresence } from "./utils/presence.js";
export { lockScroll } from "./utils/scroll-lock.js";
export { generateId, getDocument, getWindow, isBrowser } from "./utils/ssr.js";
export {
  clearRegistry,
  getLayerContentEls,
  isTopLayer,
  popLayer,
  pushLayer,
  updateLayerContentEl as updateLayerEl,
} from "./utils/stack-registry.js";
