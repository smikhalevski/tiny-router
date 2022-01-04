# tiny-router [![build](https://github.com/smikhalevski/tiny-router/actions/workflows/master.yml/badge.svg?branch=master&event=push)](https://github.com/smikhalevski/tiny-router/actions/workflows/master.yml)

This repository contains a set of packages that make routing within a SPA uncompromisingly simple.

[@tiny-router/router](./packages/router) is the universal router, that supports complex route patterns and conditional
routing.

[@tiny-router/pattern-parser](./packages/pattern-parser) is the path pattern parser and RegExp compiler, that supports
named variables, variable constraints, bash-like alternation, regular expressions, and wildcards.

[@tiny-router/pattern-compiler](./packages/pattern-compiler) compiles path patterns to path factory functions.

[@tiny-router/cli](./packages/cli) is the CLI that compiles routes from your app to a module with path factory
functions.
