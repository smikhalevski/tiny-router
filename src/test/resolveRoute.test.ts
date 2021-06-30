import {IRouteResolution, resolveRoute} from '../main/resolveRoute';
import {iif, index, meta, route} from '../main/router-dsl';

describe('resolveRoute', () => {

  test('resolves route', () => {
    const cbMock = jest.fn(() => 111);

    expect(resolveRoute(route('/foo', cbMock), '/foo'))
        .toEqual<IRouteResolution<number>>({result: 111, params: {}});

    expect(cbMock).toHaveBeenCalledTimes(1);
    expect(cbMock).toHaveBeenCalledWith({}, undefined);
  });

  test('ignores trailing path separator', () => {
    const cbMock = jest.fn(() => 111);

    expect(resolveRoute(route('/foo', cbMock), '/foo/'))
        .toEqual<IRouteResolution<number>>({result: 111, params: {}});

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
        .toEqual<IRouteResolution<number>>({result: 111, params: {}});

    expect(cbMock).toHaveBeenCalledTimes(1);
    expect(cbMock).toHaveBeenCalledWith({}, {bar: 222});
  });

  test('propagates params to route', () => {
    const cbMock = jest.fn(() => 111);

    expect(resolveRoute(route('/:foo', cbMock), '/bar', null, {aaa: 'bbb'}))
        .toEqual<IRouteResolution<number>>({result: 111, params: {aaa: 'bbb', foo: 'bar'}});

    expect(cbMock).toHaveBeenCalledTimes(1);
    expect(cbMock).toHaveBeenCalledWith({aaa: 'bbb', foo: 'bar'}, null);
  });

  test('delegates routing to index children', () => {
    const cbMock = jest.fn(() => 111);

    expect(resolveRoute(index([route('/foo', cbMock)]), '/foo'))
        .toEqual<IRouteResolution<number>>({result: 111, params: {}});

    expect(cbMock).toHaveBeenCalledTimes(1);
    expect(cbMock).toHaveBeenCalledWith({}, undefined);
  });

  test('partial route chops off leading path', () => {
    const cbMock = jest.fn(() => 111);

    expect(resolveRoute(route('/foo', [route('/bar', cbMock)]), '/foo/bar'))
        .toEqual<IRouteResolution<number>>({result: 111, params: {}});

    expect(cbMock).toHaveBeenCalledTimes(1);
    expect(cbMock).toHaveBeenCalledWith({}, undefined);
  });

  test('partial route delegates params to routes', () => {
    const cbMock = jest.fn(() => 111);

    expect(resolveRoute(route('/:foo', [route('/:bar', cbMock)]), '/aaa/bbb'))
        .toEqual<IRouteResolution<number>>({result: 111, params: {foo: 'aaa', bar: 'bbb'}});

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

    const routes = route<number | string>('/foo', [
      route('/bar', () => 111),
      iif(
          () => true,
          route('/bar', [
            route('/:baz{aaa, bbb}', (params) => params.baz + 222),
          ]),
      ),
    ]);

    expect(resolveRoute(routes, '/foo/bar/aaa')).toEqual({
      result: 'aaa222',
      params: {baz: 'aaa'},
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
      route('/product/*:productSku(A\\dB\\d{4})', (params) => 'Product ' + params.productSku),

      iif((params, context) => context?.loggedIn,
          index([

            route('/profile', () => 'Profile'),

            iif((params, context) => context?.admin,

                // context.admin == true
                route('/admin', [

                  route('/user/:userId(\\d+)', (params) => 'User ' + params.userId),
                ]),

                // context.admin == false
                route('**', () => 'Forbidden'),
            ),
          ]),
      ),

      route('**', () => 'Not Found'),
    ]);

    expect(resolveRoute(routes, '/')).toEqual({result: 'Landing', params: {}});

    expect(resolveRoute(routes, '/login')).toEqual({result: 'Login', params: {}});

    expect(resolveRoute(routes, '/product/Riding-Mower-A1B2011'))
        .toEqual({result: 'Product A1B2011', params: {productSku: 'A1B2011'}});

    expect(resolveRoute(routes, '/profile')).toEqual({result: 'Not Found', params: {}});

    expect(resolveRoute(routes, '/profile', {loggedIn: true}))
        .toEqual({result: 'Profile', params: {}});

    expect(resolveRoute(routes, '/admin/user/123'))
        .toEqual({result: 'Not Found', params: {}});

    expect(resolveRoute(routes, '/admin/user/123', {loggedIn: true}))
        .toEqual({result: 'Forbidden', params: {}});

    expect(resolveRoute(routes, '/admin/user/123', {loggedIn: true, admin: true}))
        .toEqual({result: 'User 123', params: {userId: '123'}});
  });
});
