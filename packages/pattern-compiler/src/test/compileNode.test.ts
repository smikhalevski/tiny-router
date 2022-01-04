import {parsePattern} from '@tiny-router/pattern-parser';
import {compileParserNode} from '../main';

describe('compileParserNode', () => {

  test('compiles an empty path', () => {
    expect(compileParserNode(parsePattern(''))).toBeNull();
  });

  test('compiles absolute path', () => {
    expect(compileParserNode(parsePattern('/bar'))).toBe('"/bar"');
  });

  test('compiles path segments', () => {
    expect(compileParserNode(parsePattern('foo/bar'))).toBe('"foo/bar"');
  });

  test('compiles text as is', () => {
    expect(compileParserNode(parsePattern('bar'))).toBe('"bar"');
  });

  test('compiles reg exps', () => {
    expect(compileParserNode(parsePattern('(bar)'))).toBe('re1');
  });

  test('compiles reg exps in path segments', () => {
    expect(compileParserNode(parsePattern('(bar)/foo'))).toBe('concat(re1,"/foo")');
    expect(compileParserNode(parsePattern('(bar)/foo/baz'))).toBe('concat(re1,"/foo/baz")');
    expect(compileParserNode(parsePattern('/foo/(bar)/baz'))).toBe('concat("/foo/",re1,"/baz")');
  });

  test('compiles variables with text constraint', () => {
    expect(compileParserNode(parsePattern(':foo bar'))).toBe('"bar"');
    expect(compileParserNode(parsePattern('/baz/:foo bar'))).toBe('"/baz/bar"');
  });

  test('compiles variables with wildcard constraint', () => {
    expect(compileParserNode(parsePattern(':foo **'))).toBe('foo');
  });

  test('compiles variables with reg exp constraint', () => {
    expect(compileParserNode(parsePattern(':foo(\\d)'))).toBe('foo');
  });

  test('compiles static alternation', () => {
    expect(compileParserNode(parsePattern('{foo,bar}'))).toBe('"foo"');
  });

  test('compiles dynamic alternation', () => {
    expect(compileParserNode(parsePattern('{foo/:bar}'))).toBe('concat("foo/",bar)');
    expect(compileParserNode(parsePattern('{:foo,bar}'))).toBe('select(foo,"bar")');
    expect(compileParserNode(parsePattern('{foo/:bar,baz}'))).toBe('select(concat("foo/",bar),"baz")');
  });

});
