import {IPathNode} from 'route-pattern';

export type RouterCallback<Result, Context> = (vars: Record<string, string>, context: Context) => Result;

export const enum NodeType {
  ROUTE,
  IF,
  INDEX,
  META,
}

export type Node<Result, Context> =
    | IRouteNode<Result, Context>
    | IIfNode<Result, Context>
    | IIndexNode<Result, Context>
    | IMetaNode<Result, Context>;

export interface IRouteNode<Result, Context> {
  nodeType: NodeType.ROUTE;
  pathNode: IPathNode;
  re: RegExp;
  varMap: Record<string, number>;
  cb: RouterCallback<Result, Context>;
}

export interface IIfNode<Result, Context> {
  nodeType: NodeType.IF;
  condition: RouterCallback<boolean, Context>;
  thenNode?: Node<Result, Context>;
  elseNode?: Node<Result, Context>;
}

export interface IIndexNode<Result, Context> {
  nodeType: NodeType.INDEX;
  pathNode?: IPathNode;
  re?: RegExp;
  varMap?: Record<string, number>;
  children: Array<Node<Result, Context>>;
}

export interface IMetaNode<Result, Context> {
  nodeType: NodeType.META;
  meta: any;
  childNode: Node<Result, Context>;
}
