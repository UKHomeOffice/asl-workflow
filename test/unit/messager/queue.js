const assert = require('assert');
const queue = require('../../../lib/messager/queue');

describe('Messager Queue', () => {

  it('exports a function that returns a function', () => {
    assert.equal(typeof queue, 'function');
    assert.equal(typeof queue({}), 'function');
  });

  it('returns a promise', () => {
    assert(queue({})({}) instanceof Promise);
  });

});
