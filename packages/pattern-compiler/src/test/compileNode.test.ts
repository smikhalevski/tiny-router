import {parsePattern} from '@tiny-router/pattern-parser';
import {compileNode, INodeCompilerOptions, transformParserNode} from '../main';

describe('compileNode', () => {

  const options: INodeCompilerOptions = {
    provideParamVarName: (node) => node.name,
  };

  const compile = (str: string) => compileNode(transformParserNode(parsePattern(str)), false, options);

  test('compiles an empty path', () => {
    expect(compile('')).toBe('""');
  });

  test('compiles absolute path', () => {
    expect(compile('/bar')).toBe('"/bar"');
  });

  test('compiles path segments', () => {
    expect(compile('foo/bar')).toBe('"foo/bar"');
  });

  test('compiles literal as is', () => {
    expect(compile('bar')).toBe('"bar"');
  });

  test('throws on reg exps outside of param constraint', () => {
    expect(() => compile('(bar)')).toThrow();
  });

  test('compiles reg exps as param constraints', () => {
    expect(compile(':foo(bar)')).toBe('foo');
  });

  test('compiles params with literal constraint', () => {
    expect(compile(':foo bar')).toBe('foo');
    expect(compile('/baz/:foo bar')).toBe('concat("/baz/",foo)');
  });

  test('compiles an unconstrained param', () => {
    expect(compile(':foo')).toBe('foo');
  });

  test('compiles params with wildcard constraint', () => {
    expect(compile(':foo **')).toBe('foo');
  });

  test('compiles params that were nested through alternation', () => {
    expect(compile(':foo{:bar{:qux}}')).toBe('foo??bar??qux');
  });

  test('compiles params with reg exp constraint', () => {
    expect(compile(':foo(\\d)')).toBe('foo');
  });

  test('compiles a static alternation', () => {
    expect(compile('{foo,bar}')).toBe('"foo"');
  });

  test('compiles an alternation', () => {
    expect(compile('{foo/:bar}')).toBe('concat("foo/",bar)');
    expect(compile('{:foo,bar}')).toBe('select(foo,"bar")');
    expect(compile('{foo/:bar,baz}')).toBe('select(concat("foo/",bar),"baz")');
  });

  test('truncates an alternation to first string', () => {
    expect(compile('{:foo,bar,baz}')).toBe('select(foo,"bar")');
  });

  test('truncates an alternation to first wildcard', () => {
    expect(compile('{:foo,**,bar}')).toBe('select(foo,"")');
  });

});
