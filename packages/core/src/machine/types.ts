// ---------------------------------------------------------------------------
// Core FSM types — zero dependencies, fully typed, SSR-safe
// Inspired by the Zag.js architecture (zagjs.com) — our own implementation
// ---------------------------------------------------------------------------

export interface EventObject {
  type: string;
  [key: string]: unknown;
}

export type ActionParams<TContext extends object, TEvent extends EventObject> = {
  readonly context: TContext;
  readonly event: TEvent;
  setContext(updates: Partial<TContext>): void;
};

export type ActionFn<TContext extends object, TEvent extends EventObject = EventObject> = (
  params: ActionParams<TContext, TEvent>,
) => void;

export type GuardFn<TContext extends object, TEvent extends EventObject = EventObject> = (
  params: Omit<ActionParams<TContext, TEvent>, "setContext">,
) => boolean;

/**
 * Long-running effect tied to a machine state.
 * Receives the live mutable context (reads DOM refs set after activity start),
 * a send function to dispatch events, and a notify function to trigger a
 * re-render without dispatching an event (used by compute-position activities).
 * Returns an optional cleanup called when the state is exited or machine stops.
 */
export type ActivityFn<TContext extends object> = (
  ctx: TContext,
  api: { send: (event: string) => void; notify: () => void },
) => (() => void) | undefined;

export interface TransitionConfig<
  TContext extends object,
  TState extends string,
  TEvent extends EventObject,
> {
  target?: TState;
  guard?: GuardFn<TContext, TEvent>;
  actions?: ActionFn<TContext, TEvent>[];
}

export interface StateNodeConfig<
  TContext extends object,
  TState extends string,
  TEvent extends EventObject,
> {
  on?: {
    [K in TEvent["type"]]?: TransitionConfig<TContext, TState, Extract<TEvent, { type: K }>>;
  };
  entry?: ActionFn<TContext, TEvent>[];
  exit?: ActionFn<TContext, TEvent>[];
  tags?: string[];
  /** Names of activities (defined in MachineConfig.activities) to run while in this state. */
  activities?: string[];
  /**
   * Delayed auto-transitions fired after N ms in this state.
   * The machine schedules a setTimeout on entry and clears it on exit.
   * { [delayMs]: TransitionConfig }
   */
  after?: {
    [delay: number]: TransitionConfig<TContext, TState, TEvent>;
  };
}

export interface MachineConfig<
  TContext extends object,
  TState extends string,
  TEvent extends EventObject,
> {
  id: string;
  context: TContext;
  initial: TState;
  states: Record<TState, StateNodeConfig<TContext, TState, TEvent>>;
  /** Named long-running effects keyed by activity name. */
  activities?: Record<string, ActivityFn<TContext>>;
}

export interface MachineSnapshot<TContext extends object, TState extends string> {
  readonly value: TState;
  readonly context: TContext;
  readonly tags: ReadonlyArray<string>;
  matches(...values: TState[]): boolean;
  hasTag(tag: string): boolean;
}

export type SnapshotListener<TContext extends object, TState extends string> = (
  snapshot: MachineSnapshot<TContext, TState>,
) => void;

export interface MachineInstance<
  TContext extends object,
  TState extends string,
  TEvent extends EventObject,
> {
  readonly id: string;
  send(event: TEvent | TEvent["type"]): void;
  subscribe(listener: SnapshotListener<TContext, TState>): () => void;
  getSnapshot(): MachineSnapshot<TContext, TState>;
  /** Update context fields in-place without notifying subscribers (for DOM refs). */
  setContext(updates: Partial<TContext>): void;
  /** Update context fields and notify subscribers — use for controlled prop sync. */
  update(updates: Partial<TContext>): void;
  start(): void;
  stop(): void;
}
