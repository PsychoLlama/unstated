import { renderHook } from '@testing-library/react-hooks';
import { Provider, signal, atom, useSignal, update } from '../../';
import useStore from '../use-store';

const counter = atom('counter', 0);
const increment = signal<number>('counter.increment');
const useIncrement = update(increment);

describe('useSharedUpdate', () => {
  function setup() {
    const handler = vi.fn();
    const hook = renderHook(
      () => ({
        store: useStore(),
        increment: useSignal(increment),
        update1: useIncrement([counter], handler),
        update2: useIncrement([counter], handler),
      }),
      { wrapper: Provider }
    );

    return {
      hook,
      result: hook.result,
      handler,
    };
  }

  it('deduplicates updates', () => {
    const { hook, handler } = setup();

    expect(handler).not.toHaveBeenCalled();
    hook.result.current.increment(5);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('removes the update handler when unmounted', () => {
    const { hook, handler } = setup();

    hook.unmount();
    hook.result.current.increment(5);
    expect(handler).not.toHaveBeenCalled();
  });
});
