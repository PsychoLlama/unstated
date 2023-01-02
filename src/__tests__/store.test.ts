import Store from '../store';
import { atom, signal } from '../index';

const counter = atom('counter', 0);
const increment = signal<number>('increment');

describe('Store', () => {
  it('keeps atoms in the store if you have a retainer', () => {
    const store = new Store();
    store.retain(counter);

    expect(store.resolveAtom(counter)).toBe(store.resolveAtom(counter));
  });

  it('drops the atom context when all retainers are gone', () => {
    const store = new Store();
    const release1 = store.retain(counter);
    const context = store.resolveAtom(counter);

    expect(store.resolveAtom(counter)).toBe(context);

    const release2 = store.retain(counter);
    release1();
    expect(store.resolveAtom(counter)).toBe(context);

    release2();
    expect(store.resolveAtom(counter)).not.toBe(context);
  });

  it('can receive events', () => {
    const store = new Store();

    // TODO: Delete this test when we have a way to change state in response.
    expect(() => store.commit(increment.create(1))).not.toThrow();
  });
});
