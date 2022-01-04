export const enum NodeType {
  CONCAT,
  SELECT,
  STRING,
  PARAM,
}

export type Node =
    | IConcatNode
    | ISelectNode
    | IStringNode
    | IParamNode;

export interface IConcatNode {
  nodeType: NodeType.CONCAT;
  children: Node[];
}

export interface ISelectNode {
  nodeType: NodeType.SELECT;
  children: Node[];
}

export interface IStringNode {
  nodeType: NodeType.STRING;
  value: string;
}

export interface IParamNode {
  nodeType: NodeType.PARAM;
  name: string | null;
  constraint: Node | null;
}
