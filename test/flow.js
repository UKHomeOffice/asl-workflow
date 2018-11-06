const assert = require('assert');
const { expect } = require('chai');
const { getAllSteps, getNextSteps } = require('../lib/flow');

describe('Flows', () => {

  it('supports models that only ever autoresolve', () => {
    expect(getAllSteps('certificate')).to.have.members(['autoresolved']);
    expect(getAllSteps('exemption')).to.have.members(['autoresolved']);
    expect(getAllSteps('invitation')).to.have.members(['autoresolved']);
    expect(getAllSteps('profile')).to.have.members(['autoresolved']);
  });

  it('inherits the default flow', () => {
    expect(getAllSteps('establishment')).to.include.members([
      'autoresolved',
      'applicant',
      'licensing',
      'inspector',
      'resolved'
    ]);
  });

  it('can provide all the available steps for a PIL flow', () => {
    expect(getAllSteps('pil')).to.have.members([
      'autoresolved',
      'applicant',
      'ntco',
      'licensing',
      'inspector',
      'resolved'
    ]);
  });

  it('can provide the next steps for a case', () => {
    expect(getNextSteps('pil', 'ntco')).to.have.members([
      'applicant',
      'licensing'
    ]);
  });

  it('does not fall over if there is no flow defined for a model', () => {
    assert.deepEqual(getAllSteps('not-a-model'), []);
    assert.deepEqual(getNextSteps('pil', 'not-a-step'), []);
    assert.deepEqual(getNextSteps('not-a-model', 'not-a-step'), []);
  });

});
