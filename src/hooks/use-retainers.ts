import { useEffect } from 'react';
import type { Atom } from '../index';
import useStore from './use-store';

/** Ensures atom state lives at least as long as the calling component. */
export default function useRetainers(atoms: ReadonlyArray<Atom<unknown>>) {
  const store = useStore();

  useEffect(() => {
    const releaseCallbacks = atoms.map((atom) => store.retain(atom));

    return () => {
      releaseCallbacks.forEach((release) => release());
    };
  }, [store, atoms]);
}
