const assert = require('assert');

module.exports = (expected, actual) => {
  assert.equal(actual.length, expected.length, `Expected ${expected.length} records. Received ${actual.length}`);
  const names = actual.map(task => task.data.data.name);
  names.forEach(name => assert(expected.includes(name), `Expected [${expected.join(', ')}] to include "${name}"`));
};
