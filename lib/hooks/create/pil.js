const { get } = require('lodash');
const { BadRequestError } = require('@asl/service/errors');
const { autoResolved, awaitingEndorsement, withLicensing } = require('../../flow/status');

module.exports = settings => {
  return model => {
    const action = get(model, 'data.action');
    const profile = get(model, 'meta.user.profile', {});
    const isAmendment = get(model, 'data.modelData.status') === 'active';

    switch (action) {
      case 'update-conditions':
        if (!profile.asruUser) {
          throw new BadRequestError('Only ASRU users can update licence conditions');
        }
        if (profile.asruLicensing) {
          return model.setStatus(autoResolved.id);
        }
        return model.setStatus(withLicensing.id);
      case 'create':
        // new in-progress PIL (user hasn't submitted to NTCO yet), does not need review
        return model.setStatus(autoResolved.id);

      case 'revoke':
        if (profile.asruUser) {
          // PIL revoked by licensing, does not need review
          return model.setStatus(autoResolved.id);
        }
        // PIL revoked by establishment user - needs licensing review.
        return model.setStatus(withLicensing.id);
      case 'grant':
        if (profile.asruUser && isAmendment) {
          if (profile.asruLicensing) {
            return model.setStatus(autoResolved.id);
          }
          return model.setStatus(withLicensing.id);
        }
        // PIL submitted to NTCO, needs review
        return model.setStatus(awaitingEndorsement.id);
    }
  };
};
