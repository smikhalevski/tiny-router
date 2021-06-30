import {
  IIfNode,
  IIndexNode,
  IMetaNode,
  IPartialRouteNode,
  IRouteNode,
  Node,
  NodeType,
  RouterCallback,
} from './router-types';
import {convertNodeToRegExp, parsePattern} from '@smikhalevski/route-pattern';

/**
 * Returns an partial route node that matches path and then forwards routing of the unmatched path tail to its children.
 *
 * @param path The route path pattern.
 * @param children The list of nodes to match path remainder.
 */
export function route<Result, Context = unknown>(path: string, children: Array<Node<Result, Context>>): IPartialRouteNode<Result, Context>;

/**
 * Creates a content route node.
 *
 * @param path The route path pattern.
 * @param cb The callback that returns the route result.
 */
export function route<Result, Context = unknown>(path: string, cb: RouterCallback<Result, Context>): IRouteNode<Result, Context>;

export function route<Result, Context = unknown>(path: string, arg: Array<Node<Result, Context>> | RouterCallback<Result, Context>): IRouteNode<Result, Context> | IPartialRouteNode<Result, Context> {
  const pathNode = parsePattern(path);
  const re = convertNodeToRegExp(pathNode);

  if (Array.isArray(arg)) {
    return {
      nodeType: NodeType.PARTIAL_ROUTE,
      path,
      pathNode,
      re,
      children: arg,
    };
  }

  return {
    nodeType: NodeType.ROUTE,
    path,
    pathNode,
    re,
    cb: arg,
  };
}

/**
 * Returns a conditional routing node. It uses routes from `thenNode` if `condition` returned truthy value or routes
 * from `elseNode` otherwise.
 *
 * @param condition The callback that returns `true` if routes from `thenNode` must be used.
 * @param thenNode The node that is used for truthy condition.
 * @param elseNode The node that is used for falsy condition.
 */
export function iif<Result, Context = unknown>(condition: RouterCallback<boolean | unknown, Context>, thenNode: Node<Result, Context> | null = null, elseNode: Node<Result, Context> | null = null): IIfNode<Result, Context> {
  return {
    nodeType: NodeType.IF,
    condition,
    thenNode,
    elseNode,
  };
}

/**
 * Returns an index node that doesn't do any path matching and forwards routing to its children.
 *
 * @param children The list of nodes to match path.
 */
export function index<Result, Context = unknown>(children: Array<Node<Result, Context>>): IIndexNode<Result, Context> {
  return {
    nodeType: NodeType.INDEX,
    children,
  };
}

/**
 * Returns the meta node that holds metadata that may be useful during node tree inspection.
 *
 * @param meta The metadata stored in this node.
 * @param childNode The node to which routing is forwarded.
 */
export function meta<Result, Context = unknown>(meta: unknown, childNode: Node<Result, Context>): IMetaNode<Result, Context> {
  return {
    nodeType: NodeType.META,
    meta,
    childNode,
  };
}
