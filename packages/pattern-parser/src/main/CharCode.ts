// This enum isn't imported in compiled code.
export const enum CharCode {

  // An enum member cannot have a numeric name but not for const enums.
  // @ts-ignore
  '0' = 48, '9' = 57,

  '\t' = 9,
  '\n' = 10,
  '\r' = 13,
  ' ' = 32,
  'A' = 65,
  'Z' = 90,
  'a' = 97,
  'z' = 122,
  '$' = 36,
  '_' = 95,
  ':' = 58,
  '\\' = 92,
  '"' = 34,
  '\'' = 39,
  '(' = 40,
  ')' = 41,
}
