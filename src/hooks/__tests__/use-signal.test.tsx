import { renderHook } from '@testing-library/react-hooks';
import { Provider, signal, useSignal } from '../../';
import useStore from '../use-store';

describe('useSignal', () => {
  function setup() {
    const incrementSignal = signal<number>('test.increment');

    const hook = renderHook(
      () => {
        const increment = useSignal(incrementSignal);
        const store = useStore();
        return { increment, store };
      },
      {
        wrapper: Provider,
      }
    );

    return {
      hook,
      result: hook.result,
      incrementSignal,
    };
  }

  it('uses the same function between renders', () => {
    const { hook } = setup();

    const first = hook.result.current.increment;
    hook.rerender();
    const second = hook.result.current.increment;

    expect(second).toBe(first);
  });

  it('dispatches events to the store', () => {
    const { hook, incrementSignal } = setup();

    vi.spyOn(hook.result.current.store, 'dispatch');
    hook.result.current.increment(5);

    expect(hook.result.current.store.dispatch).toHaveBeenCalledWith(
      incrementSignal.create(5)
    );
  });
});
