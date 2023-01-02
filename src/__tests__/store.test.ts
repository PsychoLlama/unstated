import Store from '../store';
import { atom, signal } from '../index';

const counter = atom('counter', { value: 0 });
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

  it('sends events through update handlers', () => {
    const store = new Store();

    store.retain(counter);
    store.registerUpdate({
      signal: increment,
      sources: [counter],
      update([counter], quantity) {
        expectTypeOf(counter).toEqualTypeOf<{ value: number }>();
        counter.value += quantity;
      },
    });

    store.commit(increment.create(5));

    expect(store.resolveAtom(counter).getSnapshot()).toEqual({ value: 5 });
  });

  it('drops the update handler when you release it', () => {
    const store = new Store();
    store.retain(counter);

    const release = store.registerUpdate({
      signal: increment,
      sources: [counter],
      update([counter], quantity) {
        expectTypeOf(counter).toEqualTypeOf<{ value: number }>();
        counter.value += quantity;
      },
    });

    store.commit(increment.create(5));
    expect(store.resolveAtom(counter).getSnapshot()).toEqual({ value: 5 });

    release();
    store.commit(increment.create(5));
    expect(store.resolveAtom(counter).getSnapshot()).toEqual({ value: 5 });
  });
});
