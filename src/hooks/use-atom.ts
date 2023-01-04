import { useCallback, useMemo } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { Immutable } from 'immer';
import type { Atom } from '../atom';
import useStore from './use-store';
import useRetainers from './use-retainers';

export default function useAtom<State>(atom: Atom<State>): Immutable<State> {
  const store = useStore();

  // Don't let the atom's state get garbage collected.
  const retainers = useMemo(() => [atom], [atom]);
  useRetainers(retainers);

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
