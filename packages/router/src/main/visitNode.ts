import {IIfNode, IIndexNode, IMetaNode, IPartialRouteNode, IRouteNode, Node, NodeType} from './router-types';

export interface INodeVisitor<R, C> {
  route?(node: IRouteNode<R, C>): void;
  partialRoute?(node: IPartialRouteNode<R, C>, next: () => void): void;
  index?(node: IIndexNode<R, C>, next: () => void): void;
  if?(node: IIfNode<R, C>, nextThen: () => void, nextElse: () => void): void;
  meta?(node: IMetaNode<R, C>, next: () => void): void;
}

/**
 * The pattern AST visitor.
 *
 * @param node The pattern AST root node to visit.
 * @param visitor The set of callbacks to invoke when particular node is visited.
 */
export function visitNode<R, C>(node: Node<R, C> | null | undefined, visitor: INodeVisitor<R, C>): void {
  switch (node?.nodeType) {

    case NodeType.ROUTE:
      visitor.route?.(node);
      break;

    case NodeType.PARTIAL_ROUTE:
      visitor.partialRoute?.(node, () => visitChildren(node.children, visitor));
      break;

    case NodeType.INDEX:
      visitor.index?.(node, () => visitChildren(node.children, visitor));
      break;

    case NodeType.IF:
      visitor.if?.(node, () => visitNode(node?.then, visitor), () => visitNode(node?.else, visitor));
      break;

    case NodeType.META:
      visitor.meta?.(node, () => visitNode(node.child, visitor));
      break;
  }
}

function visitChildren<R, C>(nodes: Node<R, C>[], visitor: INodeVisitor<R, C>): void {
  for (let i = 0; i < nodes.length; i++) {
    visitNode(nodes[i], visitor);
  }
}
