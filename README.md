# tiny-router [![Build Status](https://travis-ci.com/smikhalevski/tiny-router.svg?branch=main)](https://travis-ci.com/smikhalevski/tiny-router)

The universal router, that supports complex route patterns and conditional routing.

This package is tiny and has no
dependencies. [Just 3 kB gzipped.](https://bundlephobia.com/package/@smikhalevski/tiny-router)

```sh
npm install --save-prod @smikhalevski/tiny-router
```

# Usage

This library is intended only for matching paths against path patterns and invoking associated callbacks. It has neither
fancy browser history bindings nor other framework or library dependencies.

[Read more about path pattern syntax.](https://github.com/smikhalevski/route-pattern)

```ts
import {iif, index, route, resolveRoute} from '@smikhalevski/tiny-router';

interface IMyContext {
  loggedIn?: boolean;
  admin?: boolean;
}

const routes = index<string, IMyContext | undefined>([

  route('/', () => 'Landing'),
  route('/login', () => 'Login'),
  route('/product/*:productSku(A\\dB\\d{4})', (vars) => 'Product ' + vars.productSku),

  iif((vars, context) => context?.loggedIn,
      index([

        route('/profile', () => 'Profile'),

        iif((vars, context) => context?.admin,

            // context.admin == true
            index('/admin', [

              route('/user/:userId(\\d+)', (vars) => 'User ' + vars.userId),
            ]),

            // context.admin == false
            route('**', () => 'Forbidden'),
        ),
      ]),
  ),

  route('**', () => 'Not Found'),
]);

resolveRoute(routes, '/'); // → {result: 'Landing', vars: {}}

resolveRoute(routes, '/login'); // → {result: 'Login', vars: {}}

resolveRoute(routes, '/product/Riding-Mower-A1B2011');
// → {result: 'Product A1B2011', vars: {productSku: 'A1B2011'}}

resolveRoute(routes, '/profile'); // → {result: 'Not Found', vars: {}}

resolveRoute(routes, '/profile', {loggedIn: true}); // → {result: 'Profile', vars: {}}

resolveRoute(routes, '/admin/user/123'); // → {result: 'Not found', vars: {}}

resolveRoute(routes, '/admin/user/123', {loggedIn: true}); // → {result: 'Forbidden', vars: {}}

resolveRoute(routes, '/admin/user/123', {loggedIn: true, admin: true});
// → {result: 'User 123', vars: {userId: '123'}}
```
