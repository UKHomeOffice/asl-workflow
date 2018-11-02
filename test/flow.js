const assert = require('assert');
const { getAllSteps, getNextSteps } = require('../lib/flow');

describe('Flows', () => {

  it('can provide all the available steps for a PIL flow', () => {
    assert.deepEqual(getAllSteps('pil'), [
      'autoresolved',
      'applicant',
      'ntco',
      'licensing',
      'inspector',
      'resolved'
    ], 'all steps are returned');
  });

  it('can provide the next steps for a case', () => {
    assert.deepEqual(getNextSteps('pil', 'ntco'), [
      'applicant',
      'licensing'
    ], 'only the next steps are returned');
  });

});
