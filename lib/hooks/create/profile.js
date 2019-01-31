const { get } = require('lodash');
const { autoResolved, withLicensing } = require('../../flow/status');

module.exports = settings => {
  const { Profile } = settings.models;

  return model => {
    const action = get(model, 'data.action');
    const id = get(model, 'data.id');
    const data = get(model, 'data.data');

    switch (action) {
      case 'create':
      case 'revoke':
      case 'grant':
        return model.setStatus(autoResolved.id);

      case 'update':
        return Promise.resolve()
          .then(() => Profile.get({ id }))
          .then(profile => {
            // changes to name or DOB need to be approved by licensing if the user is a named user or holds a PIL or PPL
            if (data.firstName !== profile.firstName || data.lastName !== profile.lastName || data.dob !== profile.dob) {
              if (profile.roles.length || profile.pil || profile.projects.length) {
                return model.setStatus(withLicensing.id);
              }
            }

            return model.setStatus(autoResolved.id);
          });
    }
  };
};
