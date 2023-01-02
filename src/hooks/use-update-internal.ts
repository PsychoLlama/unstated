import { useEffect } from 'react';
import type { Atom } from '../atom';
import type { Update } from '../store';
import useStore from './use-store';

/**
 * Registers an update handler with the store. Leaves the allocation of an
 * update ID to the caller.
 */
export default function useUpdateInternal<
  Sources extends Array<Atom<unknown>>,
  Data
>(update: Update<Sources, Data>) {
  const store = useStore();

  useEffect(() => {
    return store.registerUpdate(update);
  }, [store, update]);
}
