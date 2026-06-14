import type {
  ActionFn,
  EventObject,
  MachineConfig,
  MachineInstance,
  MachineSnapshot,
  SnapshotListener,
  TransitionConfig,
} from "./types.js";

export function createMachine<
  TContext extends object,
  TState extends string,
  TEvent extends EventObject,
>(config: MachineConfig<TContext, TState, TEvent>): MachineInstance<TContext, TState, TEvent> {
  let currentState: TState = config.initial;
  // Context is a single mutable object shared with activities so they always
  // see the latest DOM refs (contentEl, triggerEl) without needing to restart.
  const context: TContext = { ...config.context };
  let running = false;

  const listeners = new Set<SnapshotListener<TContext, TState>>();
  // Maps activity name → its cleanup function (called on state exit or stop).
  const activeCleanups = new Map<string, () => void>();

  function setContext(updates: Partial<TContext>): void {
    Object.assign(context, updates);
  }

  function buildSnapshot(): MachineSnapshot<TContext, TState> {
    const value = currentState;
    const tags: ReadonlyArray<string> = config.states[currentState].tags ?? [];
    return {
      value,
      context,
      tags,
      matches: (...values) => values.includes(value),
      hasTag: (tag) => (tags as string[]).includes(tag),
    };
  }

  // Stable reference between emits — useSyncExternalStore compares with Object.is.
  let currentSnapshot: MachineSnapshot<TContext, TState> = buildSnapshot();

  function getSnapshot(): MachineSnapshot<TContext, TState> {
    return currentSnapshot;
  }

  function emit(): void {
    currentSnapshot = buildSnapshot();
    for (const listener of listeners) {
      listener(currentSnapshot);
    }
  }

  function runActions(actions: ActionFn<TContext, TEvent>[] | undefined, event: TEvent): void {
    if (!actions?.length) return;
    for (const action of actions) {
      action({ context, event, setContext });
    }
  }

  function startActivities(state: TState): void {
    const names = config.states[state].activities ?? [];
    for (const name of names) {
      const fn = config.activities?.[name];
      if (!fn) continue;
      const cleanup = fn(context, { send: sendString });
      if (cleanup) activeCleanups.set(name, cleanup);
    }
  }

  function stopActivities(state: TState): void {
    const names = config.states[state].activities ?? [];
    for (const name of names) {
      activeCleanups.get(name)?.();
      activeCleanups.delete(name);
    }
  }

  function stopAllActivities(): void {
    for (const cleanup of activeCleanups.values()) cleanup();
    activeCleanups.clear();
  }

  // Simplified send used inside activities (avoids passing complex event objects).
  function sendString(type: string): void {
    send(type as TEvent["type"]);
  }

  function resolveTransition(
    event: TEvent,
  ): TransitionConfig<TContext, TState, TEvent> | undefined {
    const transition = config.states[currentState].on?.[event.type as TEvent["type"]] as
      | TransitionConfig<TContext, TState, TEvent>
      | undefined;
    if (!transition) return undefined;
    if (transition.guard && !transition.guard({ context, event })) return undefined;
    return transition;
  }

  function send(eventOrType: TEvent | TEvent["type"]): void {
    if (!running) return;

    const event = (typeof eventOrType === "string" ? { type: eventOrType } : eventOrType) as TEvent;
    const stateNode = config.states[currentState];
    const transition = resolveTransition(event);

    if (!transition) return;

    const prevState = currentState;
    const nextState = transition.target ?? currentState;
    const isChanging = nextState !== prevState;

    // Exit: stop activities + run exit actions of current state.
    if (isChanging) stopActivities(prevState);
    runActions(stateNode.exit, event);

    // Transition actions.
    runActions(transition.actions, event);

    if (isChanging) currentState = nextState;

    // Entry: run entry actions + start activities of next state.
    runActions(config.states[currentState].entry, event);
    if (isChanging) startActivities(currentState);

    emit();
  }

  function subscribe(listener: SnapshotListener<TContext, TState>): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function start(): void {
    if (running) return;
    running = true;
    runActions(config.states[currentState].entry, { type: "@@INIT" } as TEvent);
    startActivities(currentState);
    emit();
  }

  function stop(): void {
    stopAllActivities();
    running = false;
    listeners.clear();
  }

  return { id: config.id, send, subscribe, getSnapshot, setContext, start, stop };
}
