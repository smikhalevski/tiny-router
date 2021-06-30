import {IPathNode} from '@smikhalevski/route-pattern';

export type RouterCallback<Result, Context> = (params: Record<string, string>, context: Context) => Result;

export const enum NodeType {
  ROUTE,
  PARTIAL_ROUTE,
  INDEX,
  IF,
  META,
}

export type Node<Result, Context> =
    | IRouteNode<Result, Context>
    | IPartialRouteNode<Result, Context>
    | IIndexNode<Result, Context>
    | IIfNode<Result, Context>
    | IMetaNode<Result, Context>;

export interface IRouteNode<Result, Context> {
  nodeType: NodeType.ROUTE;
  path: string;
  pathNode: IPathNode;
  re: RegExp;
  cb: RouterCallback<Result, Context>;
}

export interface IPartialRouteNode<Result, Context> {
  nodeType: NodeType.PARTIAL_ROUTE;
  path: string;
  pathNode: IPathNode;
  re: RegExp;
  children: Array<Node<Result, Context>>;
}

export interface IIndexNode<Result, Context> {
  nodeType: NodeType.INDEX;
  children: Array<Node<Result, Context>>;
}

export interface IIfNode<Result, Context> {
  nodeType: NodeType.IF;
  condition: RouterCallback<boolean | unknown, Context>;
  thenNode: Node<Result, Context> | null;
  elseNode: Node<Result, Context> | null;
}

export interface IMetaNode<Result, Context> {
  nodeType: NodeType.META;
  meta: any;
  childNode: Node<Result, Context>;
}
