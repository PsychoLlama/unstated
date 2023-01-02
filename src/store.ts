import { Immutable } from 'immer';
import type { Atom } from './atom';
import type { AppEvent } from './signal';

/**
 * Holds the state for all atoms and orchestrates changes. Individual atoms
 * are managed by the `AtomContext` class.
 */
export default class Store {
  private contexts: Map<Atom<unknown>, AtomContext<unknown>> = new Map();

  resolveAtom<State>(atom: Atom<State>): AtomContext<State> {
    return this.getOrCreateAtomContext(atom);
  }

  retain(atom: Atom<unknown>): Release {
    const context = this.getOrCreateAtomContext(atom);
    const release = context.retain();

    // If this is the first retainer, add the context to the store.
    if (this.contexts.has(atom) === false) {
      this.contexts.set(atom, context);
    }

    return () => {
      release();

      if (!context.inUse()) {
        this.contexts.delete(atom);
      }
    };
  }

  /**
   * Propagates an event to all update handlers in the store.
   */
  commit<Data>(event: AppEvent<Data>): void {
    // TODO: Implement the update handler.
  }

  private getOrCreateAtomContext<State>(atom: Atom<State>): AtomContext<State> {
    return (
      (this.contexts.get(atom) as AtomContext<State>) ?? new AtomContext(atom)
    );
  }
}

/** Manages the lifecycle of a single atom. */
class AtomContext<State> {
  private retainers = new Set<symbol>();
  private currentState: Immutable<State>;

  constructor(atom: Atom<State>) {
    this.currentState = atom.initialState;
  }

  /**
   * Keep the atom context alive. Returns a function that releases the
   * reference. If all references to the atom are released, the atom context
   * will be dropped.
   */
  retain(): Release {
    const handle = Symbol('atom context retainer');
    this.retainers.add(handle);

    return () => {
      this.retainers.delete(handle);
    };
  }

  /**
   * An atom context lives as long as there are retainers. This indicates if
   * anyone is using the atom.
   */
  inUse(): boolean {
    return this.retainers.size !== 0;
  }
}

interface Release {
  (): void;
}
