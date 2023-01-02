import { useCallback } from 'react';
import type { Signal } from '../signal';
import useStore from './use-store';

/**
 * Returns a function that dispatches events to the store. Update handlers
 * can watch for these events and change state in response.
 */
export default function useSignal<Data>(
  signal: Signal<Data>
): (data: Data) => void {
  const store = useStore();

  return useCallback(
    (data: Data) => {
      const event = signal.create(data);
      store.commit(event);
    },
    [signal, store]
  );
}
