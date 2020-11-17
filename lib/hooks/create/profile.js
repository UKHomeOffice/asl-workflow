const { get } = require('lodash');
const { autoResolved, withInspectorate } = require('../../flow/status');

const isNamedUser = profile => profile.roles.length;

const hasActivePil = profile => profile.pil && profile.pil.status === 'active';

const hasActiveProject = profile => profile.projects.some(project => project.status === 'active');

const hasChangedName = (profile, data) => data.firstName !== profile.firstName || data.lastName !== profile.lastName;

const hasChangedDOB = (profile, data) => profile.dob && profile.dob !== data.dob;

module.exports = settings => {
  const { Profile } = settings.models;

  return model => {
    const action = get(model, 'data.action');
    const id = get(model, 'data.id');
    const data = get(model, 'data.data');

    switch (action) {
      case 'create':
      case 'merge':
      case 'confirm-email':
      case 'resend-email':
        return model.setStatus(autoResolved.id);

      case 'update':
        return Promise.resolve()
          .then(() => Profile.get({ id }))
          .then(profile => {
            // if user is only changing email address then autoresolve
            if (data.email && !data.firstName && !data.lastName && !data.dob) {
              return model.setStatus(autoResolved.id);
            }
            // changes to name or DOB need to be approved by licensing if the user is a named user or holds a PIL or PPL
            if (hasChangedName(profile, data) || hasChangedDOB(profile, data)) {
              if (isNamedUser(profile) || hasActivePil(profile) || hasActiveProject(profile)) {
                return model.setStatus(withInspectorate.id);
              }
            }

            return model.setStatus(autoResolved.id);
          });
    }
  };
};
