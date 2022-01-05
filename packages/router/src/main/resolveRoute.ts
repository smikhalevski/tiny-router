import {Node, NodeType} from './router-types';

export interface IRouteResolution<R> {

  /**
   * The result returned by route callback.
   */
  result: R;

  /**
   * Params extracted from the route path.
   */
  params: Record<string, string>;
}

/**
 * Finds route in `node` that matches `path`.
 *
 * @param node The root node of the route tree.
 * @param path The path to match against routes.
 *
 * @template R The type of the result returned by route callback.
 * @template C The type of the context passed to the route callback.
 */
export function resolveRoute<R>(node: Node<R, undefined>, path: string): IRouteResolution<R> | null;

/**
 * Finds route in `node` that matches `path`.
 *
 * @param node The root node of the route tree.
 * @param path The path to match against routes.
 * @param context The context that route and condition callbacks can use.
 * @param params The mutable object that would contain params extracted from path.
 *
 * @template R The type of the result returned by route callback.
 * @template C The type of the context passed to the route callback.
 */
export function resolveRoute<R, C>(node: Node<R, C>, path: string, context: C, params?: Record<string, string>): IRouteResolution<R> | null;

export function resolveRoute(node: Node<unknown, any>, path: string, context?: unknown, params: Record<string, string> = {}): IRouteResolution<unknown> | null {
  switch (node.nodeType) {

    case NodeType.ROUTE:
    case NodeType.PARTIAL_ROUTE:

      const match = node.re.exec(path);

      if (!match) {
        return null;
      }
      if (match.groups) {
        Object.assign(params, match.groups);
      }
      path = path.substring(match[0].length);

      if (node.nodeType === NodeType.ROUTE) {
        if (path.length === 0 || path === '/') {
          return {
            result: node.cb(params, context),
            params: params,
          };
        }
        return null;
      }

    case NodeType.INDEX:
      for (const child of node.children) {
        const res = resolveRoute(child, path, context, params);
        if (res) {
          return res;
        }
      }
      return null;

    case NodeType.IF:
      if (node.condition(params, context)) {
        return node.then ? resolveRoute(node.then, path, context, params) : null;
      } else {
        return node.else ? resolveRoute(node.else, path, context, params) : null;
      }

    case NodeType.META:
      return resolveRoute(node.child, path, context, params);
  }
}
