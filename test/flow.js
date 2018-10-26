const assert = require('assert');
const { getAllSteps, getNextSteps } = require('../lib/flow');

describe('Flows', () => {

  it('can provide all the available steps for a PIL flow', () => {
    assert.deepEqual(getAllSteps('pil'), [
      'autoresolved',
      'with_applicant',
      'with_ntco',
      'with_licensing',
      'with_inspector',
      'resolved'
    ], 'all steps are returned');
  });

  it('can provide the next steps for a case', () => {
    assert.deepEqual(getNextSteps('pil', 'with_ntco'), [
      'with_applicant',
      'with_licensing'
    ], 'only the next steps are returned');
  });

});
