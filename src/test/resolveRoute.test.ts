import {resolveRoute} from '../main/resolveRoute';
import {iif, index, meta, route} from '../main/router-dsl';

describe('resolveRoute', () => {

  test('resolves route', () => {
    const cbMock = jest.fn(() => 111);

    expect(resolveRoute(route('/foo', cbMock), '/foo'))
        .toEqual({result: 111, vars: {}});

    expect(cbMock).toHaveBeenCalledTimes(1);
    expect(cbMock).toHaveBeenCalledWith({}, undefined);
  });

  test('does not resolve with partially matched route', () => {
    const cbMock = jest.fn(() => 111);

    expect(resolveRoute(route('/foo', cbMock), '/foo/bar')).toBeNull();
    expect(cbMock).not.toHaveBeenCalled();

    expect(resolveRoute(route('/foo', cbMock), '/foobar')).toBeNull();
    expect(cbMock).not.toHaveBeenCalled();
  });

  test('propagates context to route', () => {
    const cbMock = jest.fn(() => 111);

    expect(resolveRoute(route('/foo', cbMock), '/foo', {bar: 222}))
        .toEqual({result: 111, vars: {}});

    expect(cbMock).toHaveBeenCalledTimes(1);
    expect(cbMock).toHaveBeenCalledWith({}, {bar: 222});
  });

  test('propagates vars to route', () => {
    const cbMock = jest.fn(() => 111);

    expect(resolveRoute(route('/:foo', cbMock), '/bar', null, {aaa: 'bbb'}))
        .toEqual({result: 111, vars: {aaa: 'bbb', foo: 'bar'}});

    expect(cbMock).toHaveBeenCalledTimes(1);
    expect(cbMock).toHaveBeenCalledWith({aaa: 'bbb', foo: 'bar'}, null);
  });

  test('delegates routing to index children', () => {
    const cbMock = jest.fn(() => 111);

    expect(resolveRoute(index([route('/foo', cbMock)]), '/foo'))
        .toEqual({result: 111, vars: {}});

    expect(cbMock).toHaveBeenCalledTimes(1);
    expect(cbMock).toHaveBeenCalledWith({}, undefined);
  });

  test('index chops off leading path', () => {
    const cbMock = jest.fn(() => 111);

    expect(resolveRoute(index('/foo', [route('/bar', cbMock)]), '/foo/bar'))
        .toEqual({result: 111, vars: {}});

    expect(cbMock).toHaveBeenCalledTimes(1);
    expect(cbMock).toHaveBeenCalledWith({}, undefined);
  });

  test('index delegates vars to routes', () => {
    const cbMock = jest.fn(() => 111);

    expect(resolveRoute(index('/:foo', [route('/:bar', cbMock)]), '/aaa/bbb'))
        .toEqual({result: 111, vars: {foo: 'aaa', bar: 'bbb'}});

    expect(cbMock).toHaveBeenCalledTimes(1);
    expect(cbMock).toHaveBeenCalledWith({foo: 'aaa', bar: 'bbb'}, undefined);
  });

  test('stops on the first matched route', () => {
    const cbMock1 = jest.fn();
    const cbMock2 = jest.fn();

    resolveRoute(
        index([
          route('/bar', cbMock1),
          route('/bar', cbMock2),
        ]),
        '/bar',
    );

    expect(cbMock1).toHaveBeenCalledTimes(1);
    expect(cbMock2).not.toHaveBeenCalled();
  });

  test('routes with truthy condition', () => {
    const conditionMock = jest.fn(() => true);
    const trueMock = jest.fn();
    const falseMock = jest.fn();

    resolveRoute(
        iif(
            conditionMock,
            route('/foo', trueMock),
            route('/bar', falseMock),
        ),
        '/foo',
    );

    expect(conditionMock).toHaveBeenCalledTimes(1);
    expect(trueMock).toHaveBeenCalledTimes(1);
    expect(falseMock).not.toHaveBeenCalled();
  });

  test('returns null is truthy condition branch is absent', () => {
    const falseMock = jest.fn();

    expect(resolveRoute(
        iif(
            () => true,
            undefined,
            route('/foo', falseMock),
        ),
        '/foo',
    )).toBeNull();

    expect(falseMock).not.toHaveBeenCalled();
  });

  test('returns null is falsy condition branch is absent', () => {
    const trueMock = jest.fn();

    expect(resolveRoute(
        iif(
            () => false,
            route('/foo', trueMock),
            undefined,
        ),
        '/foo',
    )).toBeNull();

    expect(trueMock).not.toHaveBeenCalled();
  });

  test('routes with falsy condition', () => {
    const conditionMock = jest.fn(() => false);
    const trueMock = jest.fn();
    const falseMock = jest.fn();

    resolveRoute(
        iif(
            conditionMock,
            route('/foo', trueMock),
            route('/bar', falseMock),
        ),
        '/bar',
    );

    expect(conditionMock).toHaveBeenCalledTimes(1);
    expect(trueMock).not.toHaveBeenCalled();
    expect(falseMock).toHaveBeenCalledTimes(1);
  });

  test('meta nodes do not affect route matching', () => {
    const cbMock = jest.fn();

    resolveRoute(
        meta({qqq: 123}, route('/foo', cbMock)),
        '/foo',
    );

    expect(cbMock).toHaveBeenCalledTimes(1);
  });

  test('resolves complex routes', () => {

    const routes = index<number | string>('/foo', [
      route('/bar', () => 111),
      iif(
          () => true,
          index('/bar', [
            route('/:baz{aaa, bbb}', (vars) => vars.baz + 222),
          ]),
      ),
    ]);

    expect(resolveRoute(routes, '/foo/bar/aaa')).toEqual({
      result: 'aaa222',
      vars: {baz: 'aaa'},
    });
  });

  test('readme example', () => {
    interface IMyContext {
      loggedIn?: boolean;
      admin?: boolean;
    }

    const routes = index<string, IMyContext | undefined>([

      route('/', () => 'Landing'),
      route('/login', () => 'Login'),
      route('/search', () => 'Search'),

      iif(
          (vars, context) => context?.loggedIn,

          index([

            route('/profile', () => 'Profile'),
            route('/cart', () => 'Cart'),

            iif(
                (vars, context) => context?.admin,

                index('/admin', [
                  route('/user/:userId(\\d+)', (vars) => 'User ' + vars.userId),
                  route('/product/:productSku', (vars) => 'Product ' + vars.productSku),
                ]),
            ),
          ]),
      ),

      route('**', () => 'Not Found'),
    ]);

    expect(resolveRoute(routes, '/')).toEqual({result: 'Landing', vars: {}});

    expect(resolveRoute(routes, '/login')).toEqual({result: 'Login', vars: {}});

    expect(resolveRoute(routes, '/profile')).toEqual({result: 'Not Found', vars: {}});

    expect(resolveRoute(routes, '/profile', {loggedIn: true}))
        .toEqual({result: 'Profile', vars: {}});

    expect(resolveRoute(routes, '/admin/user/123'))
        .toEqual({result: 'Not Found', vars: {}});

    expect(resolveRoute(routes, '/admin/user/123', {loggedIn: true, admin: true}))
        .toEqual({result: 'User 123', vars: {userId: '123'}});
  });
});
