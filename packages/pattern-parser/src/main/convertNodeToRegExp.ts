import {visitNode} from './visitNode';
import {escapeRegExp} from './escapeRegExp';
import {Node, NodeType} from './parser-types';

export interface INodeToRegExpConverterOptions {

  /**
   * If `true` then the regexp is case sensitive.
   *
   * @default false
   */
  caseSensitive?: boolean;

  /**
   * The pattern that matches the path separator.
   *
   * @default "/"
   */
  pathSeparatorPattern?: string;

  /**
   * The pattern that matches a non-greedy wildcard.
   *
   * @default "[^/]*"
   */
  wildcardPattern?: string;

  /**
   * The pattern that matches a greedy wildcard.
   *
   * @default ".*"
   */
  greedyWildcardPattern?: string;

  /**
   * The pattern that matches a value of an unconstrained variable.
   *
   * @default "[^/]*"
   */
  unconstrainedVarPattern?: string;
}

/**
 * Converts pattern AST node to regular expression.
 *
 * @param node The node to convert to `RegExp`.
 * @param options Other options.
 */
export function convertNodeToRegExp(node: Node, options: INodeToRegExpConverterOptions = {}): RegExp {
  const {
    caseSensitive,
    pathSeparatorPattern = '/',
    wildcardPattern = '[^/]*',
    greedyWildcardPattern = '.*',
    unconstrainedVarPattern = '[^/]*',
  } = options;

  let pattern = '';
  let groupIndex = 1;

  const varEntries: [string, number][] = [];

  visitNode(node, {

    path(node, next) {
      const parent = node.parent;
      if (parent?.nodeType === NodeType.ALT && parent.children[0] !== node) {
        pattern += '|';
      }
      next();
    },

    segment(node, next) {
      const parent = node.parent;
      if (parent?.nodeType === NodeType.PATH && (parent.children[0] !== node || parent.absolute)) {
        pattern += pathSeparatorPattern;
      }
      next();
    },

    alt(node, next) {
      pattern += '(?:';
      next();
      pattern += ')';
    },

    variable(node, next) {
      varEntries.push([node.name, groupIndex++]);

      pattern += '(';
      if (node.constraint) {
        next();
      } else {
        pattern += unconstrainedVarPattern;
      }
      pattern += ')';
    },

    wildcard(node) {
      pattern += node.greedy ? greedyWildcardPattern : wildcardPattern;
    },

    regExp(node) {
      groupIndex += node.groupCount;
      pattern += '(?:' + node.pattern + ')';
    },

    text(node) {
      pattern += escapeRegExp(node.value);
    },
  });

  const re = RegExp('^' + pattern, caseSensitive ? '' : 'i');

  if (groupIndex === 1) {
    return re;
  }

  const reExec = re.exec;

  re.exec = (str) => {
    const arr = reExec.call(re, str);

    if (arr != null) {
      const groups = arr.groups ||= Object.create(null);

      for (const [name, groupIndex] of varEntries) {
        groups[name] ||= arr[groupIndex];
      }
    }
    return arr;
  };

  return re;
}
