import { useSyncExternalStore, useCallback } from 'react';
import { Immutable } from 'immer';
import type { Atom } from '../atom';
import useStore from './use-store';
import useRetainer from './use-retainer';

export default function useAtom<State>(atom: Atom<State>): Immutable<State> {
  const store = useStore();

  // Don't let the atom's state get garbage collected.
  useRetainer(atom);

  const subscribe = useCallback(
    (onChange: () => void) => store.watch(atom, onChange),
    [store, atom]
  );

  const getSnapshot = useCallback(
    () => store.resolveAtom(atom).getSnapshot(),
    [store, atom]
  );

  return useSyncExternalStore(subscribe, getSnapshot);
}
