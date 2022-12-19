import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { Provider, atom, useAtom } from '../../';

describe('React context', () => {
  function setup() {
    const counterAtom = atom('test.counter', 0);

    const { result } = renderHook(() => useAtom(counterAtom), {
      wrapper: Provider,
    });

    return {
      result,
      counterAtom,
    };
  }

  it('initializes the atom to its initial state', () => {
    const { result } = setup();

    expect(result.current).toBe(0);
  });
});
