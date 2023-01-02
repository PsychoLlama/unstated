import { signal } from '../';

describe('signal', () => {
  it('can create app events', () => {
    const action = signal<string>('test.action');

    expectTypeOf(action.create).parameter(0).toMatchTypeOf<string>();

    expect(action.create('some-action')).toEqual({
      type: expect.any(Symbol),
      data: 'some-action',
    });
  });

  it('maintains the same symbol identity between actions', () => {
    const action = signal<string>('test.action');

    expect(action.create('new-payload').type).toBe(
      action.create('another-payload').type
    );
  });
});
