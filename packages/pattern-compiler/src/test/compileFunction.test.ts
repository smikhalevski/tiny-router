import {parsePattern} from '@tiny-router/pattern-parser';
import {compileFunction, IFunctionCompilerOptions, transformParserNode} from '../main';

describe('compileFunction', () => {

  const options: IFunctionCompilerOptions = {
    functionName: 'f',
    interfaceName: 'IParams',
    paramsVarName: 'params',
    renameParam: (name) => name,
  };

  const compile = (str: string) => compileFunction(transformParserNode(parsePattern(str)), options);

  test('compiles an empty path', () => {
    expect(compile('')).toBe('export function f():string|null{return "";}');
  });

  test('compiles a literal path', () => {
    expect(compile('/foo/bar')).toBe('export function f():string|null{return "/foo/bar";}');
  });

  test('compiles a param', () => {
    expect(compile('/:foo/bar')).toBe(
        'export interface IParams{'
        + 'foo:string;'
        + '}'
        + 'export function f(params:IParams):string|null{'
        + 'return concat("/",params.foo,"/bar");'
        + '}',
    );
  });

  test('compiles nested params', () => {
    expect(compile('/:foo{baz/:bar}')).toBe(
        'export interface IParams{'
        + 'foo?:string;'
        + 'bar?:string;'
        + '}'
        + 'export function f(params:IParams):string|null{'
        + 'return concat("/",params.foo??concat("baz/",params.bar));'
        + '}',
    );
  });

  test('compiles params constrained by an alternation', () => {
    expect(compile('/:foo{bar/baz,qux}')).toBe(
        'export interface IParams{' +
        'foo:"bar/baz"|"qux";' +
        '}' +
        'export function f(params:IParams):string|null{' +
        'return concat("/",params.foo);' +
        '}',
    );
  });

  test('compiles an unconstrained param', () => {
    expect(compile(':foo')).toBe(
        'export interface IParams{'
        + 'foo:string;'
        + '}'
        + 'export function f(params:IParams):string|null{'
        + 'return params.foo;'
        + '}',
    );
  });

});
