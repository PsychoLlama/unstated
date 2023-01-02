import Context from '../context';
import { useContext } from 'react';
import type Store from '../store';

export default function useStore(): Store {
  const store = useContext(Context);

  if (store === null) {
    throw new Error(
      'No store found. Did you forget to wrap your app in <Provider />?'
    );
  }

  return store;
}
