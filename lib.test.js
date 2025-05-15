const noMoreSpace = require('./lib')

test('noMoreSpace returns true on empty board', () => {
  expect(noMoreSpace([[]])).toBe(true);
});