import { createContext } from 'react';
import Store from './store';

/**
 * The store keeps the entire app's state. It does not have a default value
 * because that would risk bleeding state between unit tests.
 */
export default createContext<null | Store>(null);
