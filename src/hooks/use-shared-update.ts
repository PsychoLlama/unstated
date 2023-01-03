import { useMemo, useEffect } from 'react';
import type { Signal, Atom } from '../index';
import type { Update } from '../store';
import useStore from './use-store';

/**
 * The equivalent of `useUpdate(...)` but if you share it with multiple
 * components, it will only call the handler once per update.
 */
export default function update<Data>(signal: Signal<Data>) {
  const updateId = Symbol('update ID');

  return <Sources extends ReadonlyArray<Atom<unknown>>>(
    sources: Sources,
    handler: Update<Sources, Data>['update']
  ) => {
    const store = useStore();
    const update = useMemo(
      () => ({
        signal,
        sources,
        update: handler,
        id: updateId,
      }),
      [sources, handler]
    );

    useEffect(() => {
      return store.registerUpdate(update);
    }, [store, update]);
  };
}
