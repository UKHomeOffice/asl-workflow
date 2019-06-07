const assert = require('assert');

module.exports = (expected, actual) => {
  assert.equal(actual.length, expected.length, `Expected ${expected.length} records. Received ${actual.length}`);
  expected.forEach(item => {
    if (typeof item === 'object') {
      Object.keys(item).forEach(key => {
        assert(actual.find(task => task.data.data[key] === item[key]), `Expected to find ${item.toString()}`);
      });
    } else {
      assert(actual.find(task => task.data.data.name === item), `Expected [${expected.join(', ')}] to include "${item}"`);
    }
  });
};
