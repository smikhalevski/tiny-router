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
 *
 * @template R The type of the result returned by route callback.
 * @template C The type of the context passed to the route callback.
 */
export function route<R, C = unknown>(path: string, children: Node<R, C>[]): IPartialRouteNode<R, C>;

/**
 * Creates a content route node.
 *
 * @param path The route path pattern.
 * @param cb The callback that returns the route result.
 *
 * @template R The type of the result returned by route callback.
 * @template C The type of the context passed to the route callback.
 */
export function route<R, C = unknown>(path: string, cb: RouterCallback<R, C>): IRouteNode<R, C>;

export function route<R, C = unknown>(path: string, childrenOrCb: Node<R, C>[] | RouterCallback<R, C>): IRouteNode<R, C> | IPartialRouteNode<R, C> {
  const pathNode = parsePattern(path);
  const re = convertNodeToRegExp(pathNode);

  if (Array.isArray(childrenOrCb)) {
    const node: IPartialRouteNode<R, C> = {
      nodeType: NodeType.PARTIAL_ROUTE,
      parent: null,
      rawPath: path,
      path: pathNode,
      re,
      children: childrenOrCb,
    };
    for (const child of childrenOrCb) {
      child.parent = node;
    }
    return node;
  }

  return {
    nodeType: NodeType.ROUTE,
    parent: null,
    rawPath: path,
    path: pathNode,
    re,
    cb: childrenOrCb,
  };
}

/**
 * Returns a conditional routing node. It uses routes from `thenNode` if `condition` returned truthy value or routes
 * from `elseNode` otherwise.
 *
 * @param condition The callback that returns `true` if routes from `thenNode` must be used.
 * @param thenNode The node that is used for truthy condition.
 * @param elseNode The node that is used for falsy condition.
 *
 * @template R The type of the result returned by route callback.
 * @template C The type of the context passed to the route callback.
 */
export function iif<R, C = unknown>(condition: RouterCallback<boolean | unknown, C>, thenNode: Node<R, C> | null = null, elseNode: Node<R, C> | null = null): IIfNode<R, C> {
  return {
    nodeType: NodeType.IF,
    parent: null,
    condition,
    then: thenNode,
    else: elseNode,
  };
}

/**
 * Returns an index node that doesn't do any path matching and forwards routing to its children.
 *
 * @param children The list of nodes to match path.
 *
 * @template R The type of the result returned by route callback.
 * @template C The type of the context passed to the route callback.
 */
export function index<R, C = unknown>(children: Node<R, C>[]): IIndexNode<R, C> {
  const node: IIndexNode<R, C> = {
    nodeType: NodeType.INDEX,
    parent: null,
    children,
  };
  for (const child of children) {
    child.parent = node;
  }
  return node;
}

/**
 * Returns the meta node that holds metadata that may be useful during the node tree traversal.
 *
 * ```ts
 * meta({name: 'Landing'}, route('/landing', () => import('./landing-page.ts')));
 * ```
 *
 * @param meta The metadata stored in this node.
 * @param child The node to which routing is forwarded.
 *
 * @template R The type of the result returned by route callback.
 * @template C The type of the context passed to the route callback.
 */
export function meta<R, C = unknown>(meta: unknown, child: Node<R, C>): IMetaNode<R, C> {
  return child.parent = {
    nodeType: NodeType.META,
    parent: null,
    meta,
    child,
  };
}
