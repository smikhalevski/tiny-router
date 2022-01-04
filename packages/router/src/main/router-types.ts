import {IPathNode} from '@smikhalevski/route-pattern';

export type RouterCallback<R, C> = (params: Record<string, string>, context: C) => R;

export const enum NodeType {
  ROUTE,
  PARTIAL_ROUTE,
  INDEX,
  IF,
  META,
}

export type Node<R, C> =
    | IRouteNode<R, C>
    | ContainerNode<R, C>;

export type ContainerNode<R, C> =
    | IPartialRouteNode<R, C>
    | IIndexNode<R, C>
    | IIfNode<R, C>
    | IMetaNode<R, C>;

export interface INode<R, C> {
  nodeType: NodeType;
  parent: ContainerNode<R, C> | null;
}

export interface IRouteNode<R, C> extends INode<R, C> {
  nodeType: NodeType.ROUTE;
  rawPath: string;
  path: IPathNode;
  re: RegExp;
  cb: RouterCallback<R, C>;
}

export interface IPartialRouteNode<R, C> extends INode<R, C> {
  nodeType: NodeType.PARTIAL_ROUTE;
  rawPath: string;
  path: IPathNode;
  re: RegExp;
  children: Node<R, C>[];
}

export interface IIndexNode<R, C> extends INode<R, C> {
  nodeType: NodeType.INDEX;
  children: Node<R, C>[];
}

export interface IIfNode<R, C> extends INode<R, C> {
  nodeType: NodeType.IF;
  condition: RouterCallback<boolean | unknown, C>;
  then: Node<R, C> | null;
  else: Node<R, C> | null;
}

export interface IMetaNode<R, C> extends INode<R, C> {
  nodeType: NodeType.META;
  child: Node<R, C>;
  meta: any;
}
