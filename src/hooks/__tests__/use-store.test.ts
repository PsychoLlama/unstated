import { renderHook } from '@testing-library/react-hooks';
import { Provider, signal } from '../../';
import useStore from '../use-store';
import Store from '../../store';

describe('useStore', () => {
  function setup() {
    const incrementSignal = signal<number>('test.increment');

    const { result } = renderHook(() => useStore(), {
      wrapper: Provider,
    });

    return {
      result,
      incrementSignal,
    };
  }

  it('returns the current store', () => {
    const { result } = setup();

    expect(result.current).toBeInstanceOf(Store);
  });

  it('throws an error if used without a provider', () => {
    const { result } = renderHook(() => useStore());

    expect(result.error).toBeInstanceOf(Error);
  });
});
