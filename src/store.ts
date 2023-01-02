import { Immutable, Draft, produce } from 'immer';
import type { Atom } from './atom';
import type { AppEvent, Signal } from './signal';

/**
 * Holds the state for all atoms and orchestrates changes. Individual atoms
 * are managed by the `AtomContext` class.
 */
export default class Store {
  private contexts = new Map<Atom<unknown>, AtomContext<unknown>>();
  private updates = new Map<
    symbol,
    Set<Update<Array<Atom<unknown>>, unknown>>
  >();

  resolveAtom<State>(atom: Atom<State>): AtomContext<State> {
    return this.getAtomContext(atom);
  }

  retain(atom: Atom<unknown>): Release {
    const context = this.getOrCreateAtomContext(atom);
    const release = context.retain();

    return () => {
      release();

      if (!context.inUse()) {
        this.contexts.delete(atom);
      }
    };
  }

  /**
   * Attaches a function that listens for a specific signal and updates a set
   * of atoms in response.
   *
   * NOTE: Two updates cannot mutate the same atom in response to the same
   * signal.
   */
  registerUpdate<Data, Sources extends Array<Atom<unknown>>>(
    update: Update<Sources, Data>
  ): Release {
    const updatesForSignal = this.getOrCreateUpdatesForSignal(
      update.signal.type
    );

    updatesForSignal.add(update as Update<Array<Atom<unknown>>, unknown>);

    return () => {
      updatesForSignal.delete(update as Update<Array<Atom<unknown>>, unknown>);

      // No more updates for this signal type? Remove the set.
      if (updatesForSignal.size === 0) {
        this.updates.delete(update.signal.type);
      }
    };
  }

  /**
   * Propagates an event to all update handlers in the store.
   */
  commit<Data>(event: AppEvent<Data>): void {
    this.getUpdatesForSignal(event.type).forEach((transaction) => {
      const oldStates = transaction.sources.map((atom) =>
        this.resolveAtom(atom).getSnapshot()
      );

      const newStates = produce(oldStates, (drafts) => {
        transaction.update(drafts, event.data);
      });

      transaction.sources.forEach((atom, index) => {
        this.resolveAtom(atom).replaceState(newStates[index]);
      });
    });

    // TODO: Keep track of which atoms changed.
  }

  private getAtomContext<State>(atom: Atom<State>): AtomContext<State> {
    return (
      (this.contexts.get(atom) as AtomContext<State>) ?? new AtomContext(atom)
    );
  }

  private getOrCreateAtomContext<State>(atom: Atom<State>) {
    const context = this.getAtomContext(atom);

    // If it isn't already saved, add it to the store.
    if (this.contexts.has(atom) === false) {
      this.contexts.set(atom, context);
    }

    return context;
  }

  private getUpdatesForSignal(
    signalType: symbol
  ): Set<Update<Array<Atom<unknown>>, unknown>> {
    return this.updates.get(signalType) ?? new Set();
  }

  private getOrCreateUpdatesForSignal(signalType: symbol) {
    const updates = this.getUpdatesForSignal(signalType);

    // If this is the first update for this signal type, add the set to the
    // store.
    if (this.updates.has(signalType) === false) {
      this.updates.set(signalType, updates);
    }

    return updates;
  }
}

/** Manages the lifecycle of a single atom. */
class AtomContext<State> {
  private retainers = new Set<symbol>();
  private currentState: Immutable<State>;

  constructor(atom: Atom<State>) {
    this.currentState = atom.initialState;
  }

  getSnapshot(): Immutable<State> {
    return this.currentState;
  }

  replaceState(newState: Immutable<State>): void {
    this.currentState = newState;
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

interface Update<Sources extends Array<Atom<unknown>>, Data> {
  /** When to run the transaction. */
  signal: Signal<Data>;

  /** What atoms should be taken as mutable. */
  sources: Sources;

  /** The code that applies the transaction. */
  update: (states: Drafts<Sources>, data: Data) => void;
}

type Drafts<Sources extends Array<Atom<unknown>>> = {
  [Index in keyof Sources]: Draft<Sources[Index]['initialState']>;
};
