import React from 'react';
import Context from './context';
import Store from './store';

/**
 * A state container for the entire application. It manages the lifecycle of
 * atoms and listens for signals.
 */
export const Provider: React.FC<Props> = ({ children }) => {
  const storeRef = React.useRef(new Store());

  return (
    <Context.Provider value={storeRef.current}>{children}</Context.Provider>
  );
};

interface Props {
  children?: React.ReactNode;
}
