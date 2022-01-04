import {Node} from '@tiny-router/pattern-parser';
import {transformNode} from './transformNode';
import {compileNode} from './compileNode';

export function compilerParserNode(node: Node): string | null {
  const compilerNode = transformNode(node);
  return compilerNode != null ? compileNode(compilerNode) : null;
}
