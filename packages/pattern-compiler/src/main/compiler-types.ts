export const enum NodeType {
  CONCAT = 'CONCAT',
  SELECT = 'SELECT',
  PARAM = 'PARAM',
  WILDCARD = 'WILDCARD',
  REG_EXP = 'REG_EXP',
  STRING = 'STRING',
}

export type Node =
    | IConcatNode
    | ISelectNode
    | IParamNode
    | IWildcardNode
    | IRegExpNode
    | IStringNode;

export interface IConcatNode {
  nodeType: NodeType.CONCAT;
  children: Node[];
}

export interface ISelectNode {
  nodeType: NodeType.SELECT;
  children: Node[];
}

export interface IParamNode {
  nodeType: NodeType.PARAM;
  name: string;
  constraint: Node | null;
}

export interface IWildcardNode {
  nodeType: NodeType.WILDCARD;
  greedy: boolean;
}

export interface IRegExpNode {
  nodeType: NodeType.REG_EXP;
  pattern: string;
}

export interface IStringNode {
  nodeType: NodeType.STRING;
  value: string;
}
