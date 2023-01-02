import { renderHook } from '@testing-library/react-hooks';
import { Provider, signal, useSignal } from '../../';

describe('useSignal', () => {
  function setup() {
    const incrementSignal = signal<number>('test.increment');

    const { result } = renderHook(() => useSignal(incrementSignal), {
      wrapper: Provider,
    });

    return {
      result,
      incrementSignal,
    };
  }

  it('returns an action dispatcher', () => {
    const { result } = setup();

    const event = result.current(1);

    expect(event).toMatchObject({
      type: expect.any(Symbol),
      data: 1,
    });
  });
});
