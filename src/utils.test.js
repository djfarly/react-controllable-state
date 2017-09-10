import { valueFrom } from './utils';

describe('valueFrom', () => {
  test('returns result value function with attr', () => {
    const attr = 5;
    const valueFunction = attr => attr * 2;
    expect(valueFrom(valueFunction, attr)).toBe(10);
  });

  test("returns value if it isn't a func, ignores attr", () => {
    const attr = 5;
    const preComputedValue = 10;
    expect(valueFrom(preComputedValue, attr)).toBe(10);
  });
});
