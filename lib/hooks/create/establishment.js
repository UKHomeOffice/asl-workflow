const { get } = require('lodash');
const { BadRequestError } = require('@asl/service/errors');
const { autoResolved, withLicensing } = require('../../flow/status');

module.exports = settings => {
  const { Profile } = settings.models;

  return model => {
    const changedBy = get(model, 'data.changedBy');
    const action = get(model, 'data.action');

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
      case 'update':
        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {
            if (profile.asruUser && profile.asruLicensing) {
              return model.setStatus(autoResolved.id);
            } else {
              return model.setStatus(withLicensing.id);
            }
          });
      default:
        return model.setStatus(withLicensing.id);
    }
  };
};
