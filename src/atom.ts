/**
 * An atom holds a single value. It can only be changed in response to
 * a signal.
 */
export default function atom<State>(name: string, initialState: State) {
  return {
    name,
    initialState,
  };
}

export interface Atom<State> {
  /** A human-friendly name. */
  name: string;

  /** The initial state of the atom. */
  initialState: State;
}
