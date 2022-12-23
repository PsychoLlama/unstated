import type { Atom } from '../atom';

export default function useAtom<State>(atom: Atom<State>): State {
  return atom.initialState;
}
