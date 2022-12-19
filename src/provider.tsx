import React from 'react';

// TODO: Replace `null` references with a state manager.
const Context = React.createContext(null);

/**
 * A state container for the entire application. It manages the lifecycle of
 * atoms and listens for signals.
 */
export const Provider: React.FC<Props> = ({ children }) => {
  return <Context.Provider value={null}>{children}</Context.Provider>;
};

interface Props {
  children?: React.ReactNode;
}
