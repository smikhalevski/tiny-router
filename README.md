# tiny-router [![build](https://github.com/smikhalevski/tiny-router/actions/workflows/master.yml/badge.svg?branch=master&event=push)](https://github.com/smikhalevski/tiny-router/actions/workflows/master.yml)

The universal router, that supports complex route patterns and conditional routing.

This package is tiny, [just 2.5 kB gzipped.](https://bundlephobia.com/package/@tiny-router/router)

```sh
npm install --save-prod @tiny-router/router
```

This library is intended only for matching paths against path patterns and invoking associated callbacks. It has neither
fancy browser history bindings nor other framework or library dependencies.

# Usage

⚠️ [API documentation is available here.](https://smikhalevski.github.io/tiny-router/)

[Read more about path pattern syntax.](./packages/pattern-parser)

```ts
import {iif, index, route, resolveRoute} from '@tiny-router/router';

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

resolveRoute(routes, '/');
// → {result: 'Landing', params: {}}

resolveRoute(routes, '/login');
// → {result: 'Login', params: {}}

resolveRoute(routes, '/product/Riding-Mower-A1B2011');
// → {result: 'Product A1B2011', params: {productSku: 'A1B2011'}}

resolveRoute(routes, '/profile');
// → {result: 'Not Found', params: {}}

resolveRoute(routes, '/profile', {loggedIn: true});
// → {result: 'Profile', params: {}}

resolveRoute(routes, '/admin/user/123');
// → {result: 'Not found', params: {}}

resolveRoute(routes, '/admin/user/123', {loggedIn: true});
// → {result: 'Forbidden', params: {}}

resolveRoute(routes, '/admin/user/123', {loggedIn: true, admin: true});
// → {result: 'User 123', params: {userId: '123'}}
```

`routes` variable holds a tree of nodes. For example, these nodes can be traversed to assemble a `sitemap.xml` file.

You can employ `meta` DSL callback to add metadata to the node tree. Meta doesn't affect the route resolution process
and can be used during the manual node tree traversal.

```ts
import {index, route, meta} from '@tiny-router/router';

const routes = index([
  meta({myMeta: true},
      route('/login', () => 'Login'),
  ),
]);
```

## Integration

Usually, you want a route callback to return a dynamic import of a component to render. For example, in React you can
define a route like this:

```tsx
// ./Hello.ts
import React from 'react';

const Hello: React.FC<{ name: string }> = ({name}) => {
  return <div>{`Hello, ${name}!`}</div>;
};

export default Hello;
```

```ts
// ./index.ts
import {index, route, resolveRoute} from '@tiny-router/router';

const routes = index<{ default: React.FC<{ name: string }> }>([

  route('/hello/:name', () => import('./Hello')),
]);

const {result, params} = resolveRoute(routes, '/hello/Bob');

const module = await result;

ReactDOM.render(
    React.createElement(module.default, {name: params.name}),
    document.body
);
// → <div>Hello, Bob!</div>
```
