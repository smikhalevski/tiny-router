import {IStringNode, Node, NodeType} from './compiler-types';
import {compileNode} from './compileNode';
import {createMap, jsonStringify} from './misc';

export interface IFunctionCompilerOptions {

  functionName: string;

  interfaceName: string;

  paramsVarName: string;

  renameParam(name: string): string;
}

export function compileFunction(node: Node, options: IFunctionCompilerOptions): string {
  const {
    functionName,
    interfaceName,
    paramsVarName,
    renameParam,
  } = options;

  const paramTypeMap = createMap<{ type: string, optional: boolean }>();

  let src = compileNode(node, false, {

    provideParamVarName(node, optional) {
      const nodeConstraint = node.constraint;
      const name = renameParam(node.name);

      const paramType = paramTypeMap[name] ||= {type: 'string', optional};

      if (nodeConstraint?.nodeType === NodeType.SELECT && nodeConstraint.children.every(isStringNode)) {
        paramType.type = nodeConstraint.children.map((node) => jsonStringify((node as IStringNode).value)).join('|');
      }
      if (isStringNode(nodeConstraint)) {
        paramType.type = jsonStringify(nodeConstraint);
      }

      return paramsVarName + '.' + name;
    },
  });

  const paramEntries = Object.entries(paramTypeMap);

  src = `export function ${functionName}(${paramEntries.length === 0 ? '' : paramsVarName + ':' + interfaceName}):string|null{`
      + 'return ' + src + ';'
      + '}';

  if (paramEntries.length) {
    src = `export interface ${interfaceName}{`
        + paramEntries.map(([name, paramType]) => name + (paramType.optional ? '?:' : ':') + paramType.type + ';').join('')
        + '}'
        + src;
  }

  return src;
}

export function isStringNode(node: Node | null | undefined): boolean {
  return node?.nodeType === NodeType.STRING;
}
