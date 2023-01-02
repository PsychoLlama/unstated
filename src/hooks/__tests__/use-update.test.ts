import { renderHook } from '@testing-library/react-hooks';
import { Provider, signal, atom, useSignal, useUpdate } from '../../';
import useStore from '../use-store';

const counter = atom('counter', 0);
const increment = signal<number>('counter.increment');

describe('useUpdate', () => {
  function setup() {
    const handler = vi.fn();

    const hook = renderHook(
      () => ({
        store: useStore(),
        increment: useSignal(increment),
        update: useUpdate(increment, [counter], handler),
      }),
      { wrapper: Provider }
    );

    return {
      hook,
      result: hook.result,
      handler,
    };
  }

  it('receives signals', () => {
    const { hook, handler } = setup();

    expect(handler).not.toHaveBeenCalled();
    hook.result.current.increment(5);
    expect(handler).toHaveBeenCalled();
  });
});
