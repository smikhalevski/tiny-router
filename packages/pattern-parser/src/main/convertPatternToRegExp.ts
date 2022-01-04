import {convertNodeToRegExp, INodeToRegExpConverterOptions} from './convertNodeToRegExp';
import {parsePattern} from './parsePattern';

/**
 * Converts pattern to `RegExp`.
 */
export function convertPatternToRegExp(str: string, options?: INodeToRegExpConverterOptions): RegExp {
  return convertNodeToRegExp(parsePattern(str), options);
}
