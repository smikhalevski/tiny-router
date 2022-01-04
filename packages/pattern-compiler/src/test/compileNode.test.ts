import {parsePattern} from '@tiny-router/pattern-parser';
import {compilerParserNode} from '../main';

describe('compilerParserNode', () => {

  test('compiles an empty path', () => {
    expect(compilerParserNode(parsePattern(''))).toBeNull();
  });

  test('compiles absolute path', () => {
    expect(compilerParserNode(parsePattern('/bar'))).toBe('"/bar"');
  });

  test('compiles path segments', () => {
    expect(compilerParserNode(parsePattern('foo/bar'))).toBe('"foo/bar"');
  });

  test('compiles text as is', () => {
    expect(compilerParserNode(parsePattern('bar'))).toBe('"bar"');
  });

  test('compiles reg exps', () => {
    expect(compilerParserNode(parsePattern('(bar)'))).toBe('re1');
  });

  test('compiles reg exps in path segments', () => {
    expect(compilerParserNode(parsePattern('(bar)/foo'))).toBe('concat(re1,"/foo")');
    expect(compilerParserNode(parsePattern('(bar)/foo/baz'))).toBe('concat(re1,"/foo/baz")');
    expect(compilerParserNode(parsePattern('/foo/(bar)/baz'))).toBe('concat("/foo/",re1,"/baz")');
  });

  test('compiles variables with text constraint', () => {
    expect(compilerParserNode(parsePattern(':foo bar'))).toBe('"bar"');
    expect(compilerParserNode(parsePattern('/baz/:foo bar'))).toBe('"/baz/bar"');
  });

  test('compiles variables with wildcard constraint', () => {
    expect(compilerParserNode(parsePattern(':foo **'))).toBe('foo');
  });

  test('compiles variables with reg exp constraint', () => {
    expect(compilerParserNode(parsePattern(':foo(\\d)'))).toBe('foo');
  });

  test('compiles static alternation', () => {
    expect(compilerParserNode(parsePattern('{foo,bar}'))).toBe('"foo"');
  });

  test('compiles dynamic alternation', () => {
    expect(compilerParserNode(parsePattern('{foo/:bar}'))).toBe('concat("foo/",bar)');
    expect(compilerParserNode(parsePattern('{:foo,bar}'))).toBe('select(foo,"bar")');
    expect(compilerParserNode(parsePattern('{foo/:bar,baz}'))).toBe('select(concat("foo/",bar),"baz")');
  });

});
