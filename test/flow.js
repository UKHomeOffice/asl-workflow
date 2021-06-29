const { expect } = require('chai');
const { getNextSteps } = require('../lib/flow');
const {
  returnedToApplicant,
  withNtco,
  endorsed,
  withInspectorate,
  resolved,
  rejected
} = require('../lib/flow/status');

describe('Flows', () => {

  it('can provide the next steps for a case', () => {
    expect(getNextSteps({ status: withNtco.id })).to.have.members([endorsed, returnedToApplicant]);
    expect(getNextSteps({ status: withInspectorate.id })).to.have.members([resolved, rejected, returnedToApplicant]);
  });

  it('returns an empty array of next steps if the step is not known', () => {
    /* eslint-disable no-unused-expressions */
    expect(getNextSteps({ status: 'not-a-step' })).to.be.an('array').that.is.empty;
    /* eslint-enable no-unused-expressions */
  });
});
