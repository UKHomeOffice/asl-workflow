const { get } = require('lodash');
const { BadRequestError } = require('@asl/service/errors');
const { autoResolved, awaitingEndorsement, withLicensing } = require('../../flow/status');

module.exports = settings => {
  const { Profile } = settings.models;
  return model => {
    const action = get(model, 'data.action');
    const changedBy = get(model, 'data.changedBy');

    switch (action) {
      case 'update-conditions':
        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {
            if (!profile.asruUser) {
              throw new BadRequestError('Only ASRU users can update licence conditions');
            }
            return profile;
          })
          .then(profile => {
            if (profile.asruLicensing) {
              return model.setStatus(autoResolved.id);
            } else {
              return model.setStatus(withLicensing.id);
            }
          });
      case 'create':
        // new in-progress PIL (user hasn't submitted to NTCO yet), does not need review
        return model.setStatus(autoResolved.id);

      case 'revoke':
        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {
            if (profile.asruUser) {
              // PIL revoked by licensing, does not need review
              return model.setStatus(autoResolved.id);
            }
            // PIL revoked by establishment user - needs licensing review.
            return model.setStatus(withLicensing.id);
          });
      case 'grant':
        // PIL submitted to NTCO, needs review
        return model.setStatus(awaitingEndorsement.id);
    }
  };
};
