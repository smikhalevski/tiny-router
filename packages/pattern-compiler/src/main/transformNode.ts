import {Node, NodeType} from '@tiny-router/pattern-parser';
import {Node as CompilerNode, NodeType as CompilerNodeType} from './compiler-types';

export function transformNode(node: Node): CompilerNode | null {
  switch (node.nodeType) {

    case NodeType.TEXT:
      return {
        nodeType: CompilerNodeType.STRING,
        value: node.value,
      };

    case NodeType.WILDCARD:
      return null;

    case NodeType.VARIABLE:
      let compilerNode: CompilerNode | null = null;

      if (node.constraint) {
        compilerNode = transformNode(node.constraint);
        if (compilerNode?.nodeType === CompilerNodeType.STRING) {
          return compilerNode;
        }
      }
      return {
        nodeType: CompilerNodeType.PARAM,
        name: node.name,
        constraint: compilerNode,
      };

    case NodeType.REG_EXP:
      if (node.parent?.nodeType === NodeType.VARIABLE) {
        return null;
      }
      return {
        nodeType: CompilerNodeType.PARAM,
        name: null,
        constraint: null,
      };

    case NodeType.PATH: {
      const children: CompilerNode[] = [];

      if (node.absolute) {
        children.push({nodeType: CompilerNodeType.STRING, value: '/'});
      }

      for (const child of node.children) {
        const compilerNode = transformNode(child);
        if (compilerNode === null) {
          continue;
        }
        const lastChild = children[children.length - 1];
        if (compilerNode.nodeType === CompilerNodeType.STRING && lastChild?.nodeType === CompilerNodeType.STRING) {
          lastChild.value += compilerNode.value;
          continue;
        }
        if (compilerNode.nodeType === CompilerNodeType.CONCAT) {
          if (compilerNode.children[0].nodeType === CompilerNodeType.STRING && lastChild?.nodeType === CompilerNodeType.STRING) {
            lastChild.value += compilerNode.children[0].value;
            children.push(...compilerNode.children.slice(1));
          } else {
            children.push(...compilerNode.children);
          }
          continue;
        }
        children.push(compilerNode);
      }

      if (children.length === 0) {
        return null;
      }
      if (children.length === 1) {
        return children[0];
      }
      return {
        nodeType: CompilerNodeType.CONCAT,
        children,
      };
    }

    case NodeType.SEGMENT: {
      const children: CompilerNode[] = [];

      if (node.parent?.nodeType === NodeType.PATH && node.parent.children[0] !== node) {
        children.push({
          nodeType: CompilerNodeType.STRING,
          value: '/',
        });
      }

      for (const child of node.children) {
        const compilerNode = transformNode(child);
        if (compilerNode === null) {
          continue;
        }
        const lastChild = children[children.length - 1];
        if (compilerNode.nodeType === CompilerNodeType.STRING && lastChild?.nodeType === CompilerNodeType.STRING) {
          lastChild.value += compilerNode.value;
          continue;
        }
        if (compilerNode.nodeType === CompilerNodeType.CONCAT) {
          if (compilerNode.children[0].nodeType === CompilerNodeType.STRING && lastChild?.nodeType === CompilerNodeType.STRING) {
            lastChild.value += compilerNode.children[0].value;
            children.push(...compilerNode.children.slice(1));
          } else {
            children.push(...compilerNode.children);
          }
          continue;
        }
        children.push(compilerNode);
      }

      if (children.length === 0) {
        return null;
      }
      if (children.length === 1) {
        return children[0];
      }
      return {
        nodeType: CompilerNodeType.CONCAT,
        children,
      };
    }

    case NodeType.ALT: {
      const children: CompilerNode[] = [];

      for (const child of node.children) {
        const compilerNode = transformNode(child);
        if (compilerNode === null) {
          // TODO Test wildcard in alt
          continue;
        }
        if (compilerNode.nodeType === CompilerNodeType.SELECT) {
          children.push(...compilerNode.children);
        } else {
          children.push(compilerNode);
        }
        if (children[children.length - 1].nodeType === CompilerNodeType.STRING) {
          break;
        }
      }

      if (children.length === 0) {
        return null;
      }
      if (children.length === 1) {
        return children[0];
      }
      return {
        nodeType: CompilerNodeType.SELECT,
        children,
      };
    }

  }
}
