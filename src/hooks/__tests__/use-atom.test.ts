import { renderHook } from '@testing-library/react-hooks';
import { Provider, atom, signal, useAtom, useSignal, update } from '../../';

const counter = atom('counter', { value: 0 });
const increment = signal('increment');
const useIncrement = update(increment);

describe('useAtom', () => {
  function setup() {
    const hook = renderHook(
      () => ({
        state: useAtom(counter),
        increment: useSignal(increment),
        update: useIncrement([counter], ([counter]) => {
          counter.value++;
        }),
      }),
      { wrapper: Provider }
    );

    return {
      hook,
    };
  }

  it('initializes the atom to its initial state', () => {
    const { hook } = setup();

    expect(hook.result.current.state.value).toBe(0);
  });

  it('reacts when the atom state changes', () => {
    const { hook } = setup();

    hook.result.current.increment();
    hook.rerender();

    expect(hook.result.current.state.value).toBe(1);
  });
});
