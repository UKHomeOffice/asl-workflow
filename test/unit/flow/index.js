const assert = require('assert');
const { withASRU } = require('../../../lib/flow');

describe('flow', () => {

  it('returns the correct statuses for withASRU', () => {
    const expected = [
      'with-licensing',
      'with-inspectorate',
      'referred-to-inspector',
      'inspector-recommended',
      'inspector-rejected'
    ];
    assert.deepEqual(withASRU(), expected, 'failed to return the correct statuses for withASRU');
  });

});
