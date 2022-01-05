import {IPatternTokenizeHandler, tokenizePattern} from '../main';

describe('tokenizePattern', () => {

  const paramMock = jest.fn();
  const altStartMock = jest.fn();
  const altEndMock = jest.fn();
  const altSeparatorMock = jest.fn();
  const wildcardMock = jest.fn();
  const regExpMock = jest.fn();
  const textMock = jest.fn();
  const pathSeparatorMock = jest.fn();

  const handler: IPatternTokenizeHandler = {
    param: paramMock,
    altStart: altStartMock,
    altEnd: altEndMock,
    altSeparator: altSeparatorMock,
    wildcard: wildcardMock,
    regExp: regExpMock,
    text: textMock,
    pathSeparator: pathSeparatorMock,
  };

  beforeEach(() => {
    paramMock.mockReset();
    altStartMock.mockReset();
    altEndMock.mockReset();
    altSeparatorMock.mockReset();
    wildcardMock.mockReset();
    regExpMock.mockReset();
    textMock.mockReset();
    pathSeparatorMock.mockReset();
  });

  test('does not call callbacks on blank string', () => {
    expect(tokenizePattern('', handler)).toBe(0);
    expect(tokenizePattern('  ', handler)).toBe(2);
    expect(tokenizePattern('\t', handler)).toBe(1);
    expect(tokenizePattern('\n', handler)).toBe(1);
    expect(tokenizePattern('\r', handler)).toBe(1);

    expect(paramMock).not.toHaveBeenCalled();
    expect(altStartMock).not.toHaveBeenCalled();
    expect(altEndMock).not.toHaveBeenCalled();
    expect(altSeparatorMock).not.toHaveBeenCalled();
    expect(wildcardMock).not.toHaveBeenCalled();
    expect(regExpMock).not.toHaveBeenCalled();
    expect(textMock).not.toHaveBeenCalled();
    expect(pathSeparatorMock).not.toHaveBeenCalled();
  });

  test('parses params', () => {
    expect(tokenizePattern(':foo', handler)).toBe(4);

    expect(paramMock).toHaveBeenCalledTimes(1);
    expect(paramMock).toHaveBeenCalledWith('foo', 0, 4);
  });

  test('does not parse param names that start with a number', () => {
    expect(tokenizePattern(':123foo', handler)).toBe(0);

    expect(paramMock).not.toHaveBeenCalled();
    expect(textMock).not.toHaveBeenCalled();
  });

  test('parses param names that contain numbers', () => {
    expect(tokenizePattern(':foo123', handler)).toBe(7);

    expect(paramMock).toHaveBeenCalledTimes(1);
    expect(paramMock).toHaveBeenCalledWith('foo123', 0, 7);
  });

  test('parses alternation start', () => {
    expect(tokenizePattern('{', handler)).toBe(1);

    expect(altStartMock).toHaveBeenCalledTimes(1);
    expect(altStartMock).toHaveBeenCalledWith(0, 1);
  });

  test('parses alternation end', () => {
    expect(tokenizePattern('}', handler)).toBe(1);

    expect(altEndMock).toHaveBeenCalledTimes(1);
    expect(altEndMock).toHaveBeenCalledWith(0, 1);
  });

  test('parses alternation separator', () => {
    expect(tokenizePattern(',', handler)).toBe(1);

    expect(altSeparatorMock).toHaveBeenCalledTimes(1);
    expect(altSeparatorMock).toHaveBeenCalledWith(0, 1);
  });

  test('parses greedy wildcard', () => {
    expect(tokenizePattern('**', handler)).toBe(2);

    expect(wildcardMock).toHaveBeenCalledTimes(1);
    expect(wildcardMock).toHaveBeenCalledWith(true, 0, 2);
  });

  test('parses wildcard', () => {
    expect(tokenizePattern('*', handler)).toBe(1);

    expect(wildcardMock).toHaveBeenCalledTimes(1);
    expect(wildcardMock).toHaveBeenCalledWith(false, 0, 1);
  });

  test('parses empty reg exp', () => {
    expect(tokenizePattern('()', handler)).toBe(2);

    expect(regExpMock).toHaveBeenCalledTimes(1);
    expect(regExpMock).toHaveBeenCalledWith('', 0, 0, 2);
  });

  test('parses reg exp with groups', () => {
    expect(tokenizePattern('((a)((b)c))', handler)).toBe(11);

    expect(regExpMock).toHaveBeenCalledTimes(1);
    expect(regExpMock).toHaveBeenCalledWith('(a)((b)c)', 3, 0, 11);
  });

  test('parses reg exp with escaped open brackets', () => {
    expect(tokenizePattern('(\\()', handler)).toBe(4);

    expect(regExpMock).toHaveBeenCalledTimes(1);
    expect(regExpMock).toHaveBeenCalledWith('\\(', 0, 0, 4);
  });

  test('parses reg exp with escaped close brackets', () => {
    expect(tokenizePattern('(\\))', handler)).toBe(4);

    expect(regExpMock).toHaveBeenCalledTimes(1);
    expect(regExpMock).toHaveBeenCalledWith('\\)', 0, 0, 4);
  });

  test('stops parsing if reg exp is not closed', () => {
    expect(tokenizePattern('(foo', handler)).toBe(0);

    expect(regExpMock).not.toHaveBeenCalled();
  });

  test('parses text', () => {
    expect(tokenizePattern('\'foo\'', handler)).toBe(5);

    expect(textMock).toHaveBeenCalledTimes(1);
    expect(textMock).toHaveBeenCalledWith('foo', 0, 5);
  });

  test('parses text in quotes', () => {
    expect(tokenizePattern('"foo"', handler)).toBe(5);

    expect(textMock).toHaveBeenCalledTimes(1);
    expect(textMock).toHaveBeenCalledWith('foo', 0, 5);
  });

  test('respects escape char in text', () => {
    expect(tokenizePattern('"fo\\"o"', handler)).toBe(7);

    expect(textMock).toHaveBeenCalledTimes(1);
    expect(textMock).toHaveBeenCalledWith('fo"o', 0, 7);
  });

  test('parses unquoted text', () => {
    expect(tokenizePattern('foo', handler)).toBe(3);

    expect(textMock).toHaveBeenCalledTimes(1);
    expect(textMock).toHaveBeenCalledWith('foo', 0, 3);
  });

  test('ignores spaces around unquoted text', () => {
    expect(tokenizePattern('  \nfoo\t', handler)).toBe(7);

    expect(textMock).toHaveBeenCalledTimes(1);
    expect(textMock).toHaveBeenCalledWith('foo', 3, 6);
  });

  test('ignores spaces between unquoted text', () => {
    expect(tokenizePattern('  \nfoo  bar\t', handler)).toBe(12);

    expect(textMock).toHaveBeenCalledTimes(2);
    expect(textMock).toHaveBeenNthCalledWith(1, 'foo', 3, 6);
    expect(textMock).toHaveBeenNthCalledWith(2, 'bar', 8, 11);
  });

  test('stops parsing if text closing quote is missing', () => {
    expect(tokenizePattern('"foo', handler)).toBe(0);

    expect(textMock).not.toHaveBeenCalled();
  });

  test('parses path separators', () => {
    expect(tokenizePattern('//', handler)).toBe(2);

    expect(pathSeparatorMock).toHaveBeenCalledTimes(2);
    expect(pathSeparatorMock).toHaveBeenNthCalledWith(1, 0, 1);
    expect(pathSeparatorMock).toHaveBeenNthCalledWith(2, 1, 2);
  });

  test('parses complex expressions', () => {
    expect(tokenizePattern('/aaa/{ :foo (\\d+) , :baz "qqq" }/**', handler)).toBe(35);

    expect(pathSeparatorMock).toHaveBeenCalledTimes(3);
    expect(pathSeparatorMock).toHaveBeenNthCalledWith(1, 0, 1);
    expect(pathSeparatorMock).toHaveBeenNthCalledWith(2, 4, 5);
    expect(pathSeparatorMock).toHaveBeenNthCalledWith(3, 32, 33);

    expect(textMock).toHaveBeenCalledTimes(2);
    expect(textMock).toHaveBeenNthCalledWith(1, 'aaa', 1, 4);
    expect(textMock).toHaveBeenNthCalledWith(2, 'qqq', 25, 30);

    expect(paramMock).toHaveBeenCalledTimes(2);
    expect(paramMock).toHaveBeenNthCalledWith(1, 'foo', 7, 11);
    expect(paramMock).toHaveBeenNthCalledWith(2, 'baz', 20, 24);

    expect(regExpMock).toHaveBeenCalledTimes(1);
    expect(regExpMock).toHaveBeenCalledWith('\\d+', 0, 12, 17);

    expect(altStartMock).toHaveBeenCalledTimes(1);
    expect(altStartMock).toHaveBeenCalledWith(5, 6);

    expect(altEndMock).toHaveBeenCalledTimes(1);
    expect(altEndMock).toHaveBeenCalledWith(31, 32);

    expect(altSeparatorMock).toHaveBeenCalledTimes(1);
    expect(altSeparatorMock).toHaveBeenCalledWith(18, 19);

    expect(wildcardMock).toHaveBeenCalledTimes(1);
    expect(wildcardMock).toHaveBeenCalledWith(true, 33, 35);
  });

  test('stops stops parsing complex expressions', () => {
    expect(tokenizePattern('/aaa/{ :foo (\\d+', handler)).toBe(12);

    expect(pathSeparatorMock).toHaveBeenCalledTimes(2);
    expect(pathSeparatorMock).toHaveBeenNthCalledWith(1, 0, 1);
    expect(pathSeparatorMock).toHaveBeenNthCalledWith(2, 4, 5);

    expect(altStartMock).toHaveBeenCalledTimes(1);
    expect(altStartMock).toHaveBeenCalledWith(5, 6);

    expect(paramMock).toHaveBeenCalledTimes(1);
    expect(paramMock).toHaveBeenNthCalledWith(1, 'foo', 7, 11);

    expect(regExpMock).not.toHaveBeenCalled();
  });

  test('parses weird chars as text', () => {
    expect(tokenizePattern('!@#$%^&', handler)).toBe(7);

    expect(textMock).toHaveBeenCalledTimes(1);
    expect(textMock).toHaveBeenNthCalledWith(1, '!@#$%^&', 0, 7);
  });

  test('parses newline as a space char', () => {
    expect(tokenizePattern('foo\nbar', handler)).toBe(7);

    expect(textMock).toHaveBeenCalledTimes(2);
    expect(textMock).toHaveBeenNthCalledWith(1, 'foo', 0, 3);
    expect(textMock).toHaveBeenNthCalledWith(2, 'bar', 4, 7);
  });
});
