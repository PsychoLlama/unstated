import { useMemo } from 'react';
import type { Signal, Atom } from '../index';
import type { Update } from '../store';
import useUpdateInternal from './use-update-internal';

/**
 * The equivalent of `useUpdate(...)` but if you share it with multiple
 * components, it will only call the handler once per update.
 */
export default function update<Data>(signal: Signal<Data>) {
  const updateId = Symbol('application-scoped update ID');

  return <Sources extends Array<Atom<unknown>>>(
    sources: Sources,
    handler: Update<Sources, Data>['update']
  ) => {
    const update = useMemo(
      () => ({
        signal,
        sources,
        update: handler,
        id: updateId,
      }),
      [signal, sources, handler]
    );

    useUpdateInternal(update);
  };
}
