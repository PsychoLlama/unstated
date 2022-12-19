/**
 * A signal represents an event in your application. Updates listen for these
 * signals and update models in response.
 *
 * @param name - A human-friendly name
 *
 * @example
 * const increment = signal<number>('count.increment');
 */
export default function signal<Data>(name: string) {
  const type = Symbol(name);

  return {
    /** Create an event payload. */
    create: (data: Data): AppEvent<Data> => ({ type, data }),
    name,
  };
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
