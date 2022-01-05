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
   * The `RegExp` pattern that should be used to match the path separator.
   *
   * **Note:** Must not contain capturing groups.
   *
   * @default "/"
   */
  pathSeparatorPattern?: string;

  /**
   * The `RegExp` pattern that should be used to match a non-greedy wildcard.
   *
   * **Note:** Must not contain capturing groups.
   *
   * @default "[^/?#]*"
   */
  wildcardPattern?: string;

  /**
   * The `RegExp` pattern that should be used to match a greedy wildcard.
   *
   * **Note:** Must not contain capturing groups.
   *
   * @default "[^?#]*"
   */
  greedyWildcardPattern?: string;

  /**
   * The `RegExp` pattern that should be used to match a value of an unconstrained param.
   *
   * **Note:** Must not contain capturing groups.
   *
   * @default "[^/?#]*"
   */
  unconstrainedParamPattern?: string;
}

/**
 * Converts pattern AST node to regular expression.
 *
 * @param node The node to convert to `RegExp`.
 * @param options The converter options.
 */
export function convertNodeToRegExp(node: Node, options: INodeToRegExpConverterOptions = {}): RegExp {
  const {
    caseSensitive,
    pathSeparatorPattern = '/',
    wildcardPattern = '[^/?#]*',
    greedyWildcardPattern = '[^?#]*',
    unconstrainedParamPattern = '[^/?#]*',
  } = options;

  const patternOptions: IRegExpPatternOptions = {
    _groupCount: 0,
    _paramGroupIndices: [],
    _pathSeparatorPattern: pathSeparatorPattern,
    _wildcardPattern: wildcardPattern,
    _greedyWildcardPattern: greedyWildcardPattern,
    _unconstrainedParamPattern: unconstrainedParamPattern,
  };

  const pattern = createRegExpPattern(node, patternOptions);
  const {_groupCount, _paramGroupIndices} = patternOptions;

  const re = RegExp('^' + pattern, caseSensitive ? '' : 'i');

  if (_groupCount === 0) {
    return re;
  }

  const reExec = re.exec;

  re.exec = (str) => {
    const arr = reExec.call(re, str);

    if (arr != null) {
      const groups = arr.groups ||= Object.create(null);

      for (const [name, groupIndex] of _paramGroupIndices) {
        groups[name] ||= arr[groupIndex];
      }
    }
    return arr;
  };

  return re;
}

interface IRegExpPatternOptions {

  /**
   * The total number of capturing groups in the pattern (in-out parameter).
   */
  _groupCount: number;

  /**
   * The mutable list of param name and corresponding capturing group index pairs (in-out parameter).
   */
  _paramGroupIndices: [string, number][];
  _pathSeparatorPattern: string;
  _wildcardPattern: string;
  _greedyWildcardPattern: string;
  _unconstrainedParamPattern: string;
}

/**
 * Converts an AST node to a `RegExp` pattern.
 */
function createRegExpPattern(node: Node, options: IRegExpPatternOptions): string {
  switch (node.nodeType) {

    case NodeType.PATH:
      return (node.absolute ? options._pathSeparatorPattern : '') + concatRegExpPatterns(node.children, options._pathSeparatorPattern, options);

    case NodeType.SEGMENT:
      return concatRegExpPatterns(node.children, '', options);

    case NodeType.PARAM:
      options._paramGroupIndices.push([node.name, ++options._groupCount]);
      return '(' + (node.constraint ? createRegExpPattern(node.constraint, options) : options._unconstrainedParamPattern) + ')';

    case NodeType.ALT:
      return '(?:' + concatRegExpPatterns(node.children, '|', options) + ')';

    case NodeType.WILDCARD:
      return node.greedy ? options._greedyWildcardPattern : options._wildcardPattern;

    case NodeType.REG_EXP:
      options._groupCount += node.groupCount;
      return '(?:' + node.pattern + ')';

    case NodeType.TEXT:
      return escapeRegExp(node.value);
  }
}

/**
 * Converts nodes to `RegExp` patterns and concatenates them with a separator.
 */
function concatRegExpPatterns(nodes: Node[], separator: string, options: IRegExpPatternOptions): string {
  let src = '';
  for (let i = 0; i < nodes.length; ++i) {
    if (i > 0) {
      src += separator;
    }
    src += createRegExpPattern(nodes[i], options);
  }
  return src;
}
