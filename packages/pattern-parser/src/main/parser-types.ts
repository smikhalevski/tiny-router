export const enum NodeType {
  PATH = 'PATH',
  SEGMENT = 'SEGMENT',
  ALT = 'ALT',
  PARAM = 'PARAM',
  WILDCARD = 'WILDCARD',
  REG_EXP = 'REG_EXP',
  TEXT = 'TEXT',
}

export type Node =
    | IPathNode
    | ISegmentNode
    | IAltNode
    | IParamNode
    | IWildcardNode
    | IRegExpNode
    | ITextNode;

export interface INode {
  parent: Node | null;
  start: number;
  end: number;
}

export interface IPathNode extends INode {
  nodeType: NodeType.PATH;
  children: Node[];
  absolute: boolean;
}

export interface ISegmentNode extends INode {
  nodeType: NodeType.SEGMENT;
  children: Node[];
}

export interface IAltNode extends INode {
  nodeType: NodeType.ALT;
  children: Node[];
}

export interface IParamNode extends INode {
  nodeType: NodeType.PARAM;
  name: string;
  constraint: Node | null;
}

export interface IWildcardNode extends INode {
  nodeType: NodeType.WILDCARD;
  greedy: boolean;
}

export interface IRegExpNode extends INode {
  nodeType: NodeType.REG_EXP;
  pattern: string;
  groupCount: number;
}

export interface ITextNode extends INode {
  nodeType: NodeType.TEXT;
  value: string;
}
