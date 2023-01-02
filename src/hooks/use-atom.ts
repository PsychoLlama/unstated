import { Immutable } from 'immer';
import type { Atom } from '../atom';

export default function useAtom<State>(atom: Atom<State>): Immutable<State> {
  return atom.initialState;
}
