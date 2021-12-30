import {Node, NodeType} from './router-types';

export interface IRouteResolution<Result> {

  /**
   * The result returned by route callback.
   */
  result: Result;

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
 */
export function resolveRoute<Result>(node: Node<Result, undefined>, path: string): IRouteResolution<Result> | null;

/**
 * Finds route in `node` that matches `path`.
 *
 * @param node The root node of the route tree.
 * @param path The path to match against routes.
 * @param context The context that route and condition callbacks can use.
 * @param params The initial params.
 */
export function resolveRoute<Result, Context>(node: Node<Result, Context>, path: string, context: Context, params?: Record<string, string>): IRouteResolution<Result> | null;

export function resolveRoute(node: Node<unknown, any>, path: string, context?: unknown, params: Record<string, string> = {}): IRouteResolution<unknown> | null {
  switch (node.nodeType) {

    case NodeType.ROUTE:
    case NodeType.PARTIAL_ROUTE:
      const match = node.re.exec(path);
      if (!match) {
        return null;
      }
      if (match.groups) {
        params = Object.assign({}, params, match.groups);
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
      for (let i = 0; i < node.children.length; i++) {
        const res = resolveRoute(node.children[i], path, context, params);
        if (res) {
          return res;
        }
      }
      return null;

    case NodeType.IF:
      if (node.condition(params, context)) {
        return node.thenNode ? resolveRoute(node.thenNode, path, context, params) : null;
      } else {
        return node.elseNode ? resolveRoute(node.elseNode, path, context, params) : null;
      }

    case NodeType.META:
      return resolveRoute(node.childNode, path, context, params);
  }
}
