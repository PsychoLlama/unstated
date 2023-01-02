import { renderHook } from '@testing-library/react-hooks';
import { Provider, signal, atom, useSignal } from '../../';
import useStore from '../use-store';
import useUpdateInternal from '../use-update-internal';

const counter = atom('counter', { value: 0 });
const increment = signal<number>('counter.increment');

describe('useUpdateInternal', () => {
  function setup() {
    const updateId = Symbol('update ID');
    const handler = vi.fn();

    const hook = renderHook(
      () => ({
        store: useStore(),
        increment: useSignal(increment),
        update: useUpdateInternal({
          id: updateId,
          signal: increment,
          sources: [counter],
          update: handler,
        }),
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

  it('removes the update handler when unmounted', () => {
    const { hook, handler } = setup();

    hook.unmount();
    hook.result.current.increment(5);
    expect(handler).not.toHaveBeenCalled();
  });
});
