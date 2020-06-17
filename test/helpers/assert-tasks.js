const assert = require('assert');
const { difference } = require('lodash');
const seeds = require('../data/tasks');

module.exports = (expected, actual) => {
  const names = actual.map(task => task.data.data.name);
  const all = seeds.map(task => task.data.data.name);
  const nopes = difference(all, names);

  names.forEach(name => assert(expected.includes(name), `[${expected.join(', ')}] should include "${name}"`));
  nopes.forEach(name => assert(!names.includes(name), `[${actual.join(', ')}] should not include "${name}"`));

  assert.equal(actual.length, expected.length, `Expected ${expected.length} records. Received ${actual.length}`);
};
