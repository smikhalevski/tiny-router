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

  const frg: INodeToRegExpFragmentConverterOptions = {
    _groupIndex: 1,
    _varEntries: [],
    _pathSeparatorPattern: pathSeparatorPattern,
    _wildcardPattern: wildcardPattern,
    _greedyWildcardPattern: greedyWildcardPattern,
    _unconstrainedVarPattern: unconstrainedVarPattern,
  };

  const pattern = createRegExpFragment(node, frg);
  const {_groupIndex, _varEntries} = frg;

  const re = RegExp('^' + pattern, caseSensitive ? '' : 'i');

  if (_groupIndex === 1) {
    return re;
  }

  const reExec = re.exec;

  re.exec = (str) => {
    const arr = reExec.call(re, str);

    if (arr != null) {
      const groups = arr.groups ||= Object.create(null);

      for (const [name, groupIndex] of _varEntries) {
        groups[name] ||= arr[groupIndex];
      }
    }
    return arr;
  };

  return re;
}

interface INodeToRegExpFragmentConverterOptions {
  _groupIndex: number;
  _varEntries: [string, number][];
  _pathSeparatorPattern: string;
  _wildcardPattern: string;
  _greedyWildcardPattern: string;
  _unconstrainedVarPattern: string;
}

function createRegExpFragment(node: Node, options: INodeToRegExpFragmentConverterOptions): string {
  switch (node.nodeType) {

    case NodeType.PATH:
      return (node.absolute ? options._pathSeparatorPattern : '') + concatRegExpFragments(node.children, options._pathSeparatorPattern, options);

    case NodeType.SEGMENT:
      return concatRegExpFragments(node.children, '', options);

    case NodeType.VARIABLE:
      options._varEntries.push([node.name, options._groupIndex++]);

      if (node.constraint) {
        return '(' + createRegExpFragment(node.constraint, options) + ')';
      } else {
        return '(' + options._unconstrainedVarPattern + ')';
      }

    case NodeType.ALT:
      return '(?:' + concatRegExpFragments(node.children, '|', options) + ')';

    case NodeType.WILDCARD:
      return node.greedy ? options._greedyWildcardPattern : options._wildcardPattern;

    case NodeType.REG_EXP:
      options._groupIndex += node.groupCount;
      return '(?:' + node.pattern + ')';

    case NodeType.TEXT:
      return escapeRegExp(node.value);
  }
}

function concatRegExpFragments(nodes: Node[], separator: string, options: INodeToRegExpFragmentConverterOptions): string {
  if (nodes.length === 0) {
    return '';
  }
  if (nodes.length === 1) {
    return createRegExpFragment(nodes[0], options);
  }
  let src = '';
  for (let i = 0; i < nodes.length; ++i) {
    if (i > 0) {
      src += separator;
    }
    src += createRegExpFragment(nodes[i], options);
  }
  return src;
}
