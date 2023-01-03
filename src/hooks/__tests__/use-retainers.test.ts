import { renderHook } from '@testing-library/react-hooks';
import useRetainers from '../use-retainers';
import useStore from '../use-store';
import { atom, Provider } from '../../index';

const counter = atom('counter', 0);

describe('useRetainer', () => {
  function setup() {
    const release = vi.fn();

    const { result, unmount } = renderHook(
      () => {
        const store = useStore();
        vi.spyOn(store, 'retain').mockReturnValue(release);

        useRetainers([counter]);
        return store;
      },
      { wrapper: Provider }
    );

    return {
      release,
      result,
      unmount,
    };
  }

  it('keeps a retainer for the atom', () => {
    const { result, release, unmount } = setup();

    expect(result.current.retain).toHaveBeenCalledWith(counter);
    expect(release).not.toHaveBeenCalled();

    unmount();
    expect(release).toHaveBeenCalled();
  });
});
