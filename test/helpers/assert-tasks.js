const assert = require('assert');
const { difference } = require('lodash');
const seeds = require('../data/tasks');

const assertTasks = (expected, actual) => {
  const names = actual.map(task => task.data.data.name);
  const all = seeds.map(task => task.data.data.name);
  const nopes = difference(all, expected);

  expected.forEach(name => assert(names.includes(name), `[${names.join(', ')}] should include "${name}"`));
  nopes.forEach(name => assert(!names.includes(name), `[${names.join(', ')}] should not include "${name}"`));

  assert.equal(actual.length, expected.length, `Expected ${expected.length} records. Received ${actual.length}`);
};

assertTasks.exact = assertTasks;

assertTasks.includes = (expected, actual) => {
  const names = actual.map(task => task.data.data.name);
  expected.forEach(name => assert(names.includes(name), `[${names.join(', ')}] should include "${name}"`));
};
assertTasks.excludes = (expected, actual) => {
  const names = actual.map(task => task.data.data.name);
  expected.forEach(name => assert(!names.includes(name), `[${names.join(', ')}] should not include "${name}"`));
};

module.exports = assertTasks;
