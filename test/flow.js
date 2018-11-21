const { expect } = require('chai');
const { getNextSteps } = require('../lib/flow');
const {
  returnedToApplicant,
  withNtco,
  ntcoEndorsed,
  referredToInspector,
  inspectorRecommended,
  inspectorRejected
} = require('../lib/flow/status');

describe('Flows', () => {

  it('can provide the next steps for a case', () => {
    expect(getNextSteps(withNtco.id)).to.have.members([ntcoEndorsed, returnedToApplicant]);
    expect(getNextSteps(referredToInspector.id)).to.have.members([inspectorRecommended, inspectorRejected]);
  });

  it('returns an empty array of next steps if the step is not known', () => {
    /* eslint-disable no-unused-expressions */
    expect(getNextSteps('not-a-step')).to.be.an('array').that.is.empty;
    /* eslint-enable no-unused-expressions */
  });
});
