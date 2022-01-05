import {Node as ParserNode, NodeType as ParserNodeType} from '@tiny-router/pattern-parser';
import {Node, NodeType} from './compiler-types';

/**
 * Transforms the pattern AST node into a compiler-oriented AST node.
 */
export function transformParserNode(parserNode: ParserNode, pathSeparator = '/'): Node {
  switch (parserNode.nodeType) {

    case ParserNodeType.TEXT:
      return {
        nodeType: NodeType.STRING,
        value: parserNode.value,
      };

    case ParserNodeType.WILDCARD:
      return {
        nodeType: NodeType.STRING,
        value: '',
      };

    case ParserNodeType.PARAM:
      const parserNodeConstraint = parserNode.constraint;

      let constraint: Node | null = null;

      if (parserNodeConstraint) {
        if (parserNodeConstraint.nodeType === ParserNodeType.WILDCARD) {
          constraint = {
            nodeType: NodeType.WILDCARD,
            greedy: parserNodeConstraint.greedy,
          };
        } else {
          constraint = transformParserNode(parserNodeConstraint, pathSeparator);
        }
      }
      return {
        nodeType: NodeType.PARAM,
        name: parserNode.name,
        constraint,
      };

    case ParserNodeType.REG_EXP:
      return {
        nodeType: NodeType.REG_EXP,
        pattern: parserNode.pattern,
      };

    case ParserNodeType.PATH:
    case ParserNodeType.SEGMENT: {

      if (parserNode.children.length === 0) {
        return {
          nodeType: NodeType.STRING,
          value: '',
        };
      }

      const children: Node[] = [];
      const parserNodeParent = parserNode.parent;

      if (parserNode.nodeType === ParserNodeType.PATH ? parserNode.absolute : parserNodeParent?.nodeType === ParserNodeType.PATH && parserNodeParent.children[0] !== parserNode) {
        children.push({
          nodeType: NodeType.STRING,
          value: pathSeparator,
        });
      }

      for (const parserChild of parserNode.children) {
        let child = transformParserNode(parserChild, pathSeparator);

        // Truncate select to the first string node
        if (child.nodeType === NodeType.SELECT) {
          const childChildren = child.children;

          for (let i = 0; i < childChildren.length - 1; ++i) {
            if (childChildren[i].nodeType !== NodeType.STRING) {
              continue;
            }
            if (i === 0) {
              child = childChildren[0];
            } else {
              childChildren.length = i + 1;
            }
            break;
          }
        }

        const lastChild = children[children.length - 1];

        // Join strings
        if (lastChild?.nodeType === NodeType.STRING && child.nodeType === NodeType.STRING) {
          lastChild.value += child.value;
          continue;
        }

        if (child.nodeType !== NodeType.CONCAT) {
          children.push(child);
          continue;
        }

        const childChildren = child.children;

        // Flatten nested concat nodes
        if (lastChild?.nodeType === NodeType.STRING && childChildren[0].nodeType === NodeType.STRING) {
          lastChild.value += childChildren[0].value;
          children.push(...childChildren.slice(1));
        } else {
          children.push(...childChildren);
        }
      }
      if (children.length === 1) {
        return children[0];
      }
      return {
        nodeType: NodeType.CONCAT,
        children,
      };
    }

    case ParserNodeType.ALT: {

      if (parserNode.children.length === 0) {
        return {
          nodeType: NodeType.STRING,
          value: '',
        };
      }

      const children: Node[] = [];

      for (const parserChild of parserNode.children) {
        const child = transformParserNode(parserChild, pathSeparator);

        // Flatten nested select nodes
        if (child.nodeType === NodeType.SELECT) {
          children.push(...child.children);
        } else {
          children.push(child);
        }
      }
      if (children.length === 1) {
        return children[0];
      }
      return {
        nodeType: NodeType.SELECT,
        children,
      };
    }
  }
}
