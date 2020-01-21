const { get } = require('lodash');
const { autoResolved, withInspectorate, withLicensing } = require('../../flow/status');

module.exports = settings => {
  return model => {
    const changedBy = get(model, 'data.changedBy');
    const { Profile } = settings.models;

    return Promise.resolve()
      .then(() => Profile.query().findById(changedBy))
      .then(profile => {
        if (profile.asruUser && profile.asruLicensing) {
          return model.setStatus(autoResolved.id);
        }
        if (profile.asruUser) {
          return model.setStatus(withLicensing.id);
        }
        return model.setStatus(withInspectorate.id);
      });
  };
};
