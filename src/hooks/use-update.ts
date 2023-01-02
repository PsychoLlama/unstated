import { useMemo } from 'react';
import type { Signal, Atom } from '../index';
import type { Update } from '../store';
import useUpdateInternal from './use-update-internal';

export default function useUpdate<Sources extends Array<Atom<unknown>>, Data>(
  signal: Signal<Data>,
  sources: Sources,
  handler: Update<Sources, Data>['update']
) {
  const updateId = useMemo(() => Symbol('component-scoped update ID'), []);

  const update = useMemo(
    () => ({
      signal,
      sources,
      update: handler,
      id: updateId,
    }),
    [signal, sources, handler]
  );

  // Note: this will re-register if the update function changes.
  useUpdateInternal(update);
}
