import {IPathNode, Node, NodeType} from './parser-types';
import {die} from './misc';
import {IPatternTokenizeHandler, tokenizePattern} from './tokenizePattern';

/**
 * Creates a callback that converts a path pattern to a AST.
 */
export function createPatternParser(): (str: string) => IPathNode {

  let parentNode: Node;
  let altDepth: number;

  const pushNode = (node: Node): void => {

    if (parentNode.nodeType === NodeType.PARAM) {
      if (parentNode.constraint) {
        parentNode = parentNode.parent || die();
      } else {
        parentNode.constraint = node;
        setEnd(node.end);
        parentNode = parentNode.parent || die();
        return;
      }
    }

    if (parentNode.nodeType === NodeType.PATH) {
      const segmentNode: Node = {
        nodeType: NodeType.SEGMENT,
        children: [node],
        parent: parentNode,
        start: node.start,
        end: 0,
      };

      if (parentNode.children.length === 0) {
        parentNode.start = node.start;
      }

      node.parent = segmentNode;
      parentNode.children.push(segmentNode);
      parentNode = segmentNode;
      setEnd(node.end);
      return;
    }

    if (parentNode.nodeType === NodeType.SEGMENT) {
      parentNode.children.push(node);
      setEnd(node.end);
      return;
    }

    die('Unexpected syntax', node.start);
  };

  const setEnd = (end: number): void => {
    for (let node: Node | null = parentNode; node !== null; node = node.parent) {
      node.end = end;
    }
  };

  const handler: IPatternTokenizeHandler = {

    param(name, start, end) {
      if (parentNode.nodeType === NodeType.PARAM) {
        parentNode = parentNode.parent || die();
      }
      const node: Node = {
        nodeType: NodeType.PARAM,
        name,
        constraint: null,
        parent: parentNode,
        start,
        end,
      };

      pushNode(node);
      parentNode = node;
    },

    altStart(start, end) {
      altDepth++;

      const altNode: Node = {
        nodeType: NodeType.ALT,
        children: [],
        parent: parentNode,
        start,
        end,
      };

      const pathNode: Node = {
        nodeType: NodeType.PATH,
        absolute: false,
        children: [],
        parent: altNode,
        start: end,
        end,
      };

      altNode.children.push(pathNode);
      pushNode(altNode);
      parentNode = pathNode;
    },

    altEnd(start, end) {
      altDepth--;

      while (parentNode.nodeType !== NodeType.ALT) {
        parentNode = parentNode.parent || die('Unexpected alternation end', start);
      }
      setEnd(end);
      parentNode = parentNode.parent || die();
    },

    altSeparator(start, end) {
      while (parentNode.nodeType !== NodeType.ALT) {
        parentNode = parentNode.parent || die('Unexpected alternation separator', start);
      }

      const node: Node = {
        nodeType: NodeType.PATH,
        absolute: false,
        children: [],
        parent: parentNode,
        start: end,
        end,
      };

      parentNode.children.push(node);
      parentNode = node;
      setEnd(end);
    },

    wildcard(greedy, start, end) {
      pushNode({
        nodeType: NodeType.WILDCARD,
        greedy,
        parent: parentNode,
        start,
        end,
      });
    },

    regExp(pattern, groupCount, start, end) {
      pushNode({
        nodeType: NodeType.REG_EXP,
        pattern,
        groupCount,
        parent: parentNode,
        start,
        end,
      });
    },

    text(value, start, end) {
      pushNode({
        nodeType: NodeType.TEXT,
        value,
        parent: parentNode,
        start,
        end,
      });
    },

    pathSeparator(start, end) {
      while (parentNode.nodeType !== NodeType.PATH) {
        parentNode = parentNode.parent || die();
      }

      if (parentNode.children.length === 0) {
        parentNode.absolute = true;
        parentNode.start = start;
      }

      const node: Node = {
        nodeType: NodeType.SEGMENT,
        children: [],
        parent: parentNode,
        start,
        end,
      };

      parentNode.children.push(node);
      parentNode = node;
      setEnd(end);
    },
  };

  return (str) => {

    const rootNode = parentNode = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 0,
    };

    altDepth = 0;

    const length = tokenizePattern(str, handler);

    if (length !== str.length) {
      die('Unexpected syntax', length);
    }
    if (altDepth !== 0) {
      die('Unterminated alternation', length);
    }

    return rootNode;
  };
}
