import { atom } from '../';

describe('atom', () => {
  it('can create atom definitions', () => {
    const count = atom('count', 0);

    expect(count.initialState).toBe(0);
  });
});
