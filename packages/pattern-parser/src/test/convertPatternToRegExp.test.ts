import {convertPatternToRegExp} from '../main';

describe('convertPatternToRegExp', () => {

  test('readme example', () => {
    const re = convertPatternToRegExp('/(\\d+)/:foo{ bar, qux }');
    const match = re.exec('/123/bar');

    expect(match?.groups?.foo).toBe('bar');
  });
});
