import { Immutable, Draft, produce } from 'immer';
import type { Atom } from './atom';
import type { AppEvent, Signal } from './signal';

/**
 * Holds the state for all atoms and orchestrates changes. Individual atoms
 * are managed by the `AtomContext` class.
 */
export default class Store {
  private contexts = new Map<Atom<unknown>, AtomContext<unknown>>();
  private updates = new Map<symbol, UpdateManager>();
  private subscribers = new Map<Atom<unknown>, Set<() => void>>();

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
  registerUpdate<Data, Sources extends ReadonlyArray<Atom<unknown>>>(
    update: Update<Sources, Data>
  ): Release {
    const updateManager = this.getOrCreateUpdateManager(update.signal.type);
    const release = updateManager.retain(
      update as Update<ReadonlyArray<Atom<unknown>>, unknown>
    );

    return () => {
      release();

      // No more updates for this signal type? Remove the set.
      if (updateManager.inUse() === false) {
        this.updates.delete(update.signal.type);
      }
    };
  }

  /**
   * Propagates an event to all update handlers in the store.
   */
  commit<Data>(event: AppEvent<Data>): void {
    const changeset = new Set<Atom<unknown>>();

    this.getUpdateManagerForSignal(event.type).forEachUpdate((transaction) => {
      const oldStates = transaction.sources.map((atom) =>
        this.resolveAtom(atom).getSnapshot()
      );

      const newStates = produce(oldStates, (drafts) => {
        transaction.update(drafts, event.data);
      });

      transaction.sources.forEach((atom, index) => {
        const changed = this.resolveAtom(atom).replaceState(newStates[index]);

        if (changed) {
          changeset.add(atom);
        }
      });
    });

    changeset.forEach((atom) => {
      this.getSubscribers(atom).forEach((callback) => callback());
    });
  }

  /**
   * Register a listener for changes to an atom.
   */
  watch(atom: Atom<unknown>, callback: () => void): Release {
    const subscribers = this.getOrCreateSubscribers(atom);
    subscribers.add(callback);

    return () => {
      subscribers.delete(callback);

      if (subscribers.size === 0) {
        this.subscribers.delete(atom);
      }
    };
  }

  private getAtomContext<State>(atom: Atom<State>): AtomContext<State> {
    return (
      (this.contexts.get(atom) as AtomContext<State>) ?? new AtomContext(atom)
    );
  }

  private getOrCreateAtomContext<State>(atom: Atom<State>) {
    const context = this.getAtomContext(atom);
    this.contexts.set(atom, context);

    return context;
  }

  private getUpdateManagerForSignal(signalType: symbol): UpdateManager {
    return this.updates.get(signalType) ?? new UpdateManager(signalType);
  }

  private getOrCreateUpdateManager(signalType: symbol) {
    const updates = this.getUpdateManagerForSignal(signalType);
    this.updates.set(signalType, updates);

    return updates;
  }

  private getSubscribers(atom: Atom<unknown>) {
    return this.subscribers.get(atom) ?? new Set();
  }

  private getOrCreateSubscribers(atom: Atom<unknown>) {
    const subscribers = this.getSubscribers(atom);
    this.subscribers.set(atom, subscribers);

    return subscribers;
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

  replaceState(newState: Immutable<State>): boolean {
    const changed = this.currentState !== newState;
    this.currentState = newState;

    return changed;
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

/**
 * Manages updates subscribed to a single signal type. Each signal can have
 * multiple updates targeting different atoms, and each instance of an update
 * might have multiple components depending on it.
 */
class UpdateManager {
  /** Every update subscribed to the signal. */
  private updates = new Map<
    symbol,
    Update<ReadonlyArray<Atom<unknown>>, unknown>
  >();

  /**
   * Each update is identified by a symbol. If two components use the same
   * update, we deduplicate the subscriber, but remember how many components
   * still depend on it (a retainer count). The subscriber is removed when
   * retainers drop to zero.
   */
  private retainers = new Map<symbol, Set<symbol>>();

  constructor(private signalType: symbol) {
    // Empty
  }

  forEachUpdate(callback: Parameters<typeof this.updates.forEach>[0]): void {
    this.updates.forEach(callback);
  }

  retain(update: Update<ReadonlyArray<Atom<unknown>>, unknown>): Release {
    const retainers = this.getOrCreateRetainersForUpdate(update.id);
    const updateHandle = Symbol('update retainer');

    // Each update blows out the last, and that's okay. The update ID
    // semantically implies these are the same functions. We always want to
    // replace it because the older one might have a stale closure.
    this.updates.set(update.id, update);
    retainers.add(updateHandle);

    // Enforce the "one atom lock per signal" invariant.
    if (process.env.NODE_ENV !== 'production') {
      const lockedAtoms = new Set<Atom<unknown>>();

      // Create a set of all atoms in use.
      this.updates.forEach((otherUpdate) => {
        if (otherUpdate.id === update.id) return;

        otherUpdate.sources.forEach((atom: Atom<unknown>) =>
          lockedAtoms.add(atom)
        );
      });

      const lockedAtom = update.sources.find((atom) => lockedAtoms.has(atom));

      if (lockedAtom) {
        throw new Error(
          `Two updates want to change the same atom ("${lockedAtom.name}") on the same signal ("${this.signalType.description}"). This is not allowed.`
        );
      }
    }

    return () => {
      retainers.delete(updateHandle);

      if (retainers.size === 0) {
        this.retainers.delete(update.id);
        this.updates.delete(update.id);
      }
    };
  }

  inUse(): boolean {
    return this.updates.size !== 0;
  }

  private getOrCreateRetainersForUpdate(updateId: symbol) {
    const retainers = this.retainers.get(updateId) ?? new Set<symbol>();
    this.retainers.set(updateId, retainers);

    return retainers;
  }
}

/** Callback to release a resource. */
interface Release {
  (): void;
}

export interface Update<Sources extends ReadonlyArray<Atom<unknown>>, Data> {
  /** When to run the transaction. */
  signal: Signal<Data>;

  /** What atoms should be taken as mutable. */
  sources: Sources;

  /** The code that applies the transaction. */
  update: (states: Drafts<Sources>, data: Data) => void;

  /**
   * A unique handle that identifies the update. This is useful if multiple
   * components depend on the same update, incidentally creating duplicates.
   *
   * NOTE: the signal is not a useful identifier. Multiple updates can handle
   * the same signal but have different purposes.
   */
  id: symbol;
}

type Drafts<Sources extends ReadonlyArray<Atom<unknown>>> = {
  [Index in keyof Sources]: Draft<Sources[Index]['initialState']>;
};
