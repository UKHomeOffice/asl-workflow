const { get } = require('lodash');
const { autoResolved, withInspectorate } = require('../../flow/status');

const isNamedUser = profile => profile.roles.length;

const hasActivePil = profile => profile.pil && profile.pil.status === 'active';

const hasActiveProject = profile => profile.projects.some(project => project.status === 'active');

module.exports = settings => {
  const { Profile } = settings.models;

  return model => {
    const action = get(model, 'data.action');
    const id = get(model, 'data.id');
    const data = get(model, 'data.data');

    switch (action) {
      case 'create':
        return model.setStatus(autoResolved.id);

      case 'update':
        return Promise.resolve()
          .then(() => Profile.get({ id }))
          .then(profile => {
            // changes to name or DOB need to be approved by licensing if the user is a named user or holds a PIL or PPL
            if (data.firstName !== profile.firstName || data.lastName !== profile.lastName || data.dob !== profile.dob) {
              if (isNamedUser(profile) || hasActivePil(profile) || hasActiveProject(profile)) {
                return model.setStatus(withInspectorate.id);
              }
            }

            return model.setStatus(autoResolved.id);
          });
    }
  };
};
