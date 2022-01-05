import {convertNodeToRegExp, INodeToRegExpConverterOptions} from './convertNodeToRegExp';
import {parsePattern} from './parsePattern';

/**
 * Converts pattern to `RegExp`.
 *
 * @param str The path pattern to convert.
 * @param options The converter options.
 * @returns The `RegExp` that matches paths described by the pattern.
 */
export function convertPatternToRegExp(str: string, options?: INodeToRegExpConverterOptions): RegExp {
  return convertNodeToRegExp(parsePattern(str), options);
}
