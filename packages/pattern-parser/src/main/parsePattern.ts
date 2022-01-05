import {createPatternParser} from './createPatternParser';

/**
 * Converts pattern to an AST node.
 *
 * @param str The path pattern to parse.
 * @throws SyntaxError If unexpected syntax is met.
 * @returns The root node of the parsed AST.
 */
export const parsePattern = createPatternParser();
