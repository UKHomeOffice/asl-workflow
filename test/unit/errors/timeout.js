const assert = require('assert');
const TimeoutError = require('../../../lib/errors/timeout');

describe('TimeoutError', () => {

  it('extends Error', () => {
    const e = new TimeoutError();
    assert.ok(e instanceof Error);
  });

  it('has a `status` of 504', () => {
    const e = new TimeoutError();
    assert.equal(e.status, 504);
  });

});
