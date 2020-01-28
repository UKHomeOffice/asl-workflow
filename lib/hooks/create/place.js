const { get, set } = require('lodash');
const { autoResolved, withInspectorate, withLicensing } = require('../../flow/status');

module.exports = settings => {
  return model => {
    const changedBy = get(model, 'data.changedBy');
    const { Profile } = settings.models;

    return Promise.resolve()
      .then(() => Profile.query().findById(changedBy))
      .then(profile => {
        if (profile.asruUser) {
          return Promise.resolve()
            .then(() => {
              const meta = get(model, 'data.meta');
              if (meta.changesToRestrictions) {
                const data = get(model, 'data');
                set(data, 'data.restrictions', meta.changesToRestrictions);
                return model.update(data);
              }
            })
            .then(() => {
              if (profile.asruLicensing) {
                return model.setStatus(autoResolved.id);
              }
              return model.setStatus(withLicensing.id);
            });
        }
        return model.setStatus(withInspectorate.id);
      });
  };
};
