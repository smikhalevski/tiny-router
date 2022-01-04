import {all, char, CharCodeChecker, ResultCode, seq, Taker, text} from 'tokenizer-dsl';
import {CharCode} from './CharCode';

const ERROR_CODE = -2;

const isSpaceChar: CharCodeChecker = (c) =>
    c === CharCode[' ']
    || c === CharCode['\t']
    || c === CharCode['\r']
    || c === CharCode['\n'];

const isVariableNameStartChar: CharCodeChecker = (c) =>
    c >= CharCode['a'] && c <= CharCode['z']
    || c >= CharCode['A'] && c <= CharCode['Z']
    || c === CharCode['$']
    || c === CharCode['_'];

const isVariableNameChar: CharCodeChecker = (c) =>
    isVariableNameStartChar(c)
    || c >= CharCode['0'] && c <= CharCode['9'];

const takeSpace = all(char(isSpaceChar));

const takeVariableName = seq(char(isVariableNameStartChar), all(char(isVariableNameChar)));

const takeAltStart = text('{');

const takeAltEnd = text('}');

const takeAltSeparator = text(',');

const takeGreedyWildcard = text('**');

const takeWildcard = text('*');

const takePathSeparator = text('/');

const takeVariable: Taker = (str, i) => {
  if (str.charCodeAt(i) !== CharCode[':']) {
    return ResultCode.NO_MATCH;
  }

  const j = takeVariableName(str, ++i);

  return j > i ? j : ERROR_CODE;
};

let lastText = '';

const takeQuotedText: Taker = (str, i) => {
  const quoteCode = str.charCodeAt(i);

  if (quoteCode !== CharCode['"'] && quoteCode !== CharCode['\'']) {
    return ResultCode.NO_MATCH;
  }
  i++;

  const charCount = str.length;
  let j = i;

  lastText = '';

  while (i < charCount) {
    switch (str.charCodeAt(i)) {

      case quoteCode:
        lastText += str.substring(j, i);
        return i + 1;

      case CharCode['\\']:
        lastText += str.substring(j, i);
        j = ++i;
        break;
    }
    i++;
  }

  lastText = '';

  return ERROR_CODE;
};

let lastGroupCount = 0;

const takeRegExp: Taker = (str, i) => {
  if (str.charCodeAt(i) !== CharCode['(']) {
    return ResultCode.NO_MATCH;
  }
  i++;

  const charCount = str.length;

  let groupDepth = 0;

  lastGroupCount = 0;
  while (i < charCount) {
    switch (str.charCodeAt(i)) {

      case CharCode['(']:
        lastGroupCount++;
        groupDepth++;
        break;

      case CharCode[')']:
        if (groupDepth === 0) {
          return i + 1;
        }
        groupDepth--;
        break;

      case CharCode['\\']:
        i++;
        break;
    }
    i++;
  }

  lastGroupCount = 0;
  return ERROR_CODE;
};

export interface IPatternTokenizeHandler {

  /**
   * Triggered when a variable declaration was read.
   */
  variable?(name: string, start: number, end: number): void;

  /**
   * Triggered when an alternation opening bracket was read.
   */
  altStart?(start: number, end: number): void;

  /**
   * Triggered when an alternation closing bracket was read.
   */
  altEnd?(start: number, end: number): void;

  /**
   * Triggered when an alternation separator was read.
   */
  altSeparator?(start: number, end: number): void;

  /**
   * Triggered when a wildcard was read.
   *
   * @param greedy `true` if wildcard captures path separators.
   * @param start The token start offset.
   * @param end The token end offset.
   */
  wildcard?(greedy: boolean, start: number, end: number): void;

  /**
   * Triggered when a regular expression was read.
   *
   * @param pattern The pattern that can be compiled as a `RegExp`.
   * @param groupCount The number of groups captured by the pattern.
   * @param start The token start offset.
   * @param end The token end offset.
   */
  regExp?(pattern: string, groupCount: number, start: number, end: number): void;

  /**
   * Triggered when a plain text fragment was read.
   */
  text?(data: string, start: number, end: number): void;

  /**
   * Triggered when a path separator was read.
   */
  pathSeparator?(start: number, end: number): void;
}

/**
 * Traverses pattern and invokes callbacks when particular token in met.
 *
 * @param str The pattern to tokenize.
 * @param handler Callbacks to invoke during tokenization.
 * @returns The number of chars that were successfully parsed in `str`.
 */
export function tokenizePattern(str: string, handler: IPatternTokenizeHandler): number {
  const {
    variable,
    altStart,
    altEnd,
    altSeparator,
    wildcard,
    regExp,
    text,
    pathSeparator,
  } = handler;

  const charCount = str.length;

  let textStart = -1;
  let textEnd = -1;

  const emitText = () => {
    if (textStart !== -1) {
      text?.(str.substring(textStart, textEnd), textStart, textEnd);
      textStart = -1;
    }
  };

  let i = 0;
  let j;

  while (i < charCount) {
    textEnd = i;

    j = takeSpace(str, i);
    if (j !== i) {
      emitText();
      i = j;
    }

    // No more tokens available.
    if (i === charCount) {
      break;
    }

    j = takeVariable(str, i);
    if (j >= 0) {
      emitText();
      variable?.(str.substring(i + 1, j), i, j);
      i = j;
      continue;
    } else if (j === ERROR_CODE) {
      return i;
    }

    j = takeAltStart(str, i);
    if (j >= 0) {
      emitText();
      altStart?.(i, j);
      i = j;
      continue;
    }

    j = takeAltEnd(str, i);
    if (j >= 0) {
      emitText();
      altEnd?.(i, j);
      i = j;
      continue;
    }

    j = takeAltSeparator(str, i);
    if (j >= 0) {
      emitText();
      altSeparator?.(i, j);
      i = j;
      continue;
    }

    j = takeGreedyWildcard(str, i);
    if (j >= 0) {
      emitText();
      wildcard?.(true, i, j);
      i = j;
      continue;
    }

    j = takeWildcard(str, i);
    if (j >= 0) {
      emitText();
      wildcard?.(false, i, j);
      i = j;
      continue;
    }

    j = takePathSeparator(str, i);
    if (j >= 0) {
      emitText();
      pathSeparator?.(i, j);
      i = j;
      continue;
    }

    j = takeQuotedText(str, i);
    if (j >= 0) {
      emitText();
      text?.(lastText, i, j);
      i = j;
      continue;
    } else if (j === ERROR_CODE) {
      return i;
    }

    j = takeRegExp(str, i);
    if (j >= 0) {
      emitText();
      regExp?.(str.substring(i + 1, j - 1), lastGroupCount, i, j);
      i = j;
      continue;
    } else if (j === ERROR_CODE) {
      return i;
    }

    // The start of the unquoted text.
    if (textStart === -1) {
      textStart = i;
    }
    i++;
    textEnd = i;
  }

  emitText();
  return i;
}
