import {Node, NodeType} from './compiler-types';

export function compileNode(node: Node): string {
  switch (node.nodeType) {
    case NodeType.STRING:
      return JSON.stringify(node.value);

    case NodeType.PARAM:
      return node.name || 're1';

    case NodeType.CONCAT:
      return 'concat(' + node.children.map(compileNode).join(',') + ')';

    case NodeType.SELECT:
      return 'select(' + node.children.map(compileNode).join(',') + ')';
  }
}
