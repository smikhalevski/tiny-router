import {Node, NodeType} from './router-types';

export interface IRouteResolution<Result> {

  /**
   * The result returned by route callback.
   */
  result: Result;

  /**
   * Values extracted from the route path.
   */
  vars: Record<string, string>;
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
 * @param vars The initial vars.
 */
export function resolveRoute<Result, Context>(node: Node<Result, Context>, path: string, context: Context, vars?: Record<string, string>): IRouteResolution<Result> | null;

export function resolveRoute(node: Node<unknown, any>, path: string, context?: unknown, vars: Record<string, string> = {}): IRouteResolution<unknown> | null {
  switch (node.nodeType) {

    case NodeType.ROUTE:
      const arr = node.re.exec(path);

      if (arr == null || arr[0] !== path) {
        return null;
      }
      if (arr.groups) {
        vars = Object.assign({}, vars, arr.groups);
      }
      return {
        result: node.cb(vars, context),
        vars,
      };

    case NodeType.INDEX:
      if (node.re != null) {
        const arr = node.re.exec(path);

        if (arr == null) {
          return null;
        }
        path = path.substring(arr[0].length);
        if (arr.groups) {
          vars = Object.assign({}, vars, arr.groups);
        }
      }

      for (let i = 0; i < node.children.length; i++) {
        const res = resolveRoute(node.children[i], path, context, vars);

        if (res !== null) {
          return res;
        }
      }
      return null;

    case NodeType.IF:
      if (node.condition(vars, context)) {
        return node.thenNode ? resolveRoute(node.thenNode, path, context, vars) : null;
      } else {
        return node.elseNode ? resolveRoute(node.elseNode, path, context, vars) : null;
      }

    case NodeType.META:
      return resolveRoute(node.childNode, path, context, vars);
  }
}
