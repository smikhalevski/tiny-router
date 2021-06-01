import {IIfNode, IIndexNode, IMetaNode, IRouteNode, Node, NodeType, RouterCallback} from './router-types';
import {convertNodeToRegExp, parsePattern} from 'route-pattern';

export function route<Result, Context>(path: string, cb: RouterCallback<Result, Context>): IRouteNode<Result, Context> {
  const pathNode = parsePattern(path);
  const {re, varMap} = convertNodeToRegExp(pathNode);
  return {
    nodeType: NodeType.ROUTE,
    pathNode,
    re,
    varMap,
    cb,
  };
}

export function iif<Result, Context>(condition: RouterCallback<boolean, Context>, thenNode?: Node<Result, Context>, elseNode?: Node<Result, Context>): IIfNode<Result, Context> {
  return {
    nodeType: NodeType.IF,
    condition,
    thenNode,
    elseNode,
  };
}

export function index<Result, Context>(children: Array<Node<Result, Context>>): IIndexNode<Result, Context>;

export function index<Result, Context>(path: string, children: Array<Node<Result, Context>>): IIndexNode<Result, Context>;

export function index<Result, Context>(path: string | Array<Node<Result, Context>>, children?: Array<Node<Result, Context>>): IIndexNode<Result, Context> {
  if (typeof path === 'string') {
    const pathNode = parsePattern(path);
    const {re, varMap} = convertNodeToRegExp(pathNode);
    return {
      nodeType: NodeType.INDEX,
      children: children!,
      pathNode,
      re,
      varMap,
    };
  }
  return {
    nodeType: NodeType.INDEX,
    children: path,
  };
}

export function meta<Result, Context>(meta: any, childNode: Node<Result, Context>): IMetaNode<Result, Context> {
  return {
    nodeType: NodeType.META,
    meta,
    childNode,
  };
}
