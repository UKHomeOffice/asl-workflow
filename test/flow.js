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
      'returned-to-applicant',
      'with-licensing',
      'referred-to-inspector',
      'resolved'
    ]);
  });

  it('can provide all the available steps for a PIL flow', () => {
    expect(getAllSteps('pil')).to.have.members([
      'autoresolved',
      'returned-to-applicant',
      'submitted-to-ntco',
      'with-licensing',
      'referred-to-inspector',
      'resolved'
    ]);
  });

  it('can provide the next steps for a case', () => {
    expect(getNextSteps('pil', 'submitted-to-ntco')).to.have.members([
      'returned-to-applicant',
      'with-licensing'
    ]);
  });

  it('returns the default flow if there is no flow defined for a model', () => {
    expect(getAllSteps('not-a-model')).to.have.members([
      'autoresolved',
      'returned-to-applicant',
      'with-licensing',
      'referred-to-inspector',
      'resolved'
    ]);
  });

  it('returns an empty array of next steps if the step is not known', () => {
    /* eslint-disable no-unused-expressions */
    expect(getNextSteps('pil', 'not-a-step')).to.be.an('array').that.is.empty;
    expect(getNextSteps('not-a-model', 'not-a-step')).to.be.an('array').that.is.empty;
    /* eslint-enable no-unused-expressions */
  });
});
