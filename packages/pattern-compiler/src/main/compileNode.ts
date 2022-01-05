import {IParamNode, Node, NodeType} from './compiler-types';
import {jsonStringify} from './misc';

export interface INodeCompilerOptions {
  provideParamVarName(node: IParamNode, optional: boolean): string;
}

export function compileNode(node: Node, optional: boolean, options: INodeCompilerOptions): string {
  const {provideParamVarName} = options;

  switch (node.nodeType) {

    case NodeType.CONCAT:
      return 'concat(' + node.children.map((node) => compileNode(node, optional, options)).join(',') + ')';

    case NodeType.SELECT:
      return 'select(' + node.children.map((node) => compileNode(node, true, options)).join(',') + ')';

    case NodeType.PARAM:
      const constraint = node.constraint;

      if (!constraint
          || isTerminalNode(constraint)
          || constraint.nodeType === NodeType.SELECT && constraint.children.every(isTerminalNode)
      ) {
        return provideParamVarName(node, optional);
      }
      return provideParamVarName(node, true) + '??' + compileNode(constraint, true, options);

    case NodeType.WILDCARD:
      return '""';

    case NodeType.REG_EXP:
      throw new Error('Expected regular expression to be a param constraint');

    case NodeType.STRING:
      return jsonStringify(node.value);
  }
}

function isTerminalNode(node: Node): boolean {
  return node.nodeType === NodeType.WILDCARD
      || node.nodeType === NodeType.STRING
      || node.nodeType === NodeType.REG_EXP;
}
