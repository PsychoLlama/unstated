import type { Signal } from '../signal';

export default function useSignal<Data>(
  signal: Signal<Data>
): typeof signal.create {
  return (data: Data) => {
    const event = signal.create(data);

    // TODO: Send to the React context.

    return event;
  };
}
