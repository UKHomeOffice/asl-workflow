const { expect } = require('chai');
const { getAllSteps, getNextSteps } = require('../lib/flow');
const {
  returnedToApplicant,
  withNtco,
  ntcoEndorsed,
  withLicensing,
  referredToInspector,
  inspectorRecommended,
  inspectorRejected
} = require('../lib/flow/status');

describe('Flows', () => {

  it('can provide all the available steps', () => {
    expect(getAllSteps()).to.have.members([
      returnedToApplicant,
      withNtco,
      ntcoEndorsed,
      withLicensing,
      referredToInspector,
      inspectorRecommended,
      inspectorRejected
    ]);
  });

  it('can provide the next steps for a case', () => {
    expect(getNextSteps(withNtco)).to.have.members([ntcoEndorsed, returnedToApplicant]);
  });

  it('returns an empty array of next steps if the step is not known', () => {
    /* eslint-disable no-unused-expressions */
    expect(getNextSteps('not-a-step')).to.be.an('array').that.is.empty;
    /* eslint-enable no-unused-expressions */
  });
});
