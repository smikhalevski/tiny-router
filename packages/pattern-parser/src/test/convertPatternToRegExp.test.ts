import {convertPatternToRegExp} from '../main';

describe('convertPatternToRegExp', () => {

  test('ignores URI query part', () => {
    const re = convertPatternToRegExp('/**');
    const match = re.exec('/foo/bar?aaa=111&bbb=222');

    expect(match?.[0]).toEqual('/foo/bar');
  });

  test('ignores URI fragment part', () => {
    const re = convertPatternToRegExp('/**');
    const match = re.exec('/foo/bar#qux');

    expect(match?.[0]).toEqual('/foo/bar');
  });

  test('readme example', () => {
    const re = convertPatternToRegExp('/(\\d+)/:foo{ bar, qux }');
    const match = re.exec('/123/bar');

    expect(match?.groups?.foo).toBe('bar');
  });
});
