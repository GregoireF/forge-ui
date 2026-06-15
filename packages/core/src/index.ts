// Machine engine

export type {
  FocusActivityOptions,
  HideBackgroundActivityOptions,
  KeyboardActivityOptions,
  LockScrollActivityOptions,
  WatchOutsideActivityOptions,
} from "./activities/index.js";
// Activity factories
export {
  makeFocusActivity,
  makeHideBackgroundActivity,
  makeKeyboardActivity,
  makeLockScrollActivity,
  makeWatchOutsideActivity,
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
export { lockScroll } from "./utils/scroll-lock.js";
export { generateId, getDocument, getWindow, isBrowser } from "./utils/ssr.js";
