const assert = require('assert');
const decorator = require('../../../lib/decorators/normalise-training');

describe('normalise-training decorator', () => {

  it('does not add an exemption if none exist', () => {
    const input = {
      data: {
        certificates: [],
        exemptions: []
      }
    };
    const decorate = decorator({});
    assert.deepEqual(decorate(input).data.certificates, []);
  });

});
