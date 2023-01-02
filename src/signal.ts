/**
 * A signal represents an event in your application. Updates listen for these
 * signals and update models in response.
 *
 * @param name - A human-friendly name
 *
 * @example
 * const increment = signal<number>('count.increment');
 */
export default function signal<Data = void>(name: string): Signal<Data> {
  const type = Symbol(name);

  return {
    create: (data: Data): AppEvent<Data> => ({ type, data }),
    name,
    type,
  };
}

export interface Signal<Data> {
  /** Create an event payload. */
  create: ActionDispatcher<Data>;
  name: string;
  type: symbol;
}

interface ActionDispatcher<Data> {
  (data: Data): AppEvent<Data>;
}

export interface AppEvent<Data> {
  /**
   * A unique identifier for the signal. The symbol's description is
   * human-friendly, but not used as any kind of identifier.
   */
  type: symbol;

  /** Data carried with the event. */
  data: Data;
}
