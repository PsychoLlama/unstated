import { useEffect } from 'react';
import type { Atom } from '../index';
import useStore from './use-store';

/** Ensures atom state lives at least as long as the calling component. */
export default function useRetainer(atom: Atom<unknown>) {
  const store = useStore();

  useEffect(() => {
    const releaseCallback = store.retain(atom);

    return releaseCallback;
  }, [store, atom]);
}
