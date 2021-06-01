import {resolveRoute} from '../main/resolveRoute';
import {index, route} from '../main/router-dsl';

describe('resolveRoute', () => {

  test('resolves route with variables', () => {
    const result = resolveRoute<number>(
        index('/foo', [
          route('/bar', () => 123),
          index('/bar', [
            route('/:baz{aaa, bbb}', () => 456),
          ]),
        ]),
        '/foo/bar/aaa',
    );
    expect(result).toEqual({
      result: 456,
      vars: {baz: 'aaa'},
    });
  });
});
