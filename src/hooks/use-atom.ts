import type { Atom } from '../atom';

export function useAtom<State>(atom: Atom<State>): State {
  return atom.initialState;
}
