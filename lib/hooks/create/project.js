const { get } = require('lodash');
const { autoResolved, withInspectorate, withLicensing } = require('../../flow/status');

const Messager = require('../../messager');

module.exports = settings => {
  const { Project, Profile } = settings.models;
  const messager = Messager(settings);

  return model => {
    const action = get(model, 'data.action');
    const id = get(model, 'data.id');
    const changedBy = get(model, 'data.changedBy');

    switch (action) {
      case 'create':
      case 'delete':
      case 'delete-amendments':
      case 'fork':
        return model.setStatus(autoResolved.id);

      case 'update':
        return Project.query().findById(id)
          .then(project => {
            if (project.status === 'inactive') {
              return model.setStatus(autoResolved.id);
            } else {
              return model.setStatus(withInspectorate.id);
            }
          });

      case 'grant':
        return messager({ ...model.data, action: 'submit-draft' })
          .then(() => model.setStatus(withInspectorate.id));

      case 'revoke':
        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {
            if (!profile.asruUser) {
              // Project revoked by establishment user - needs inspector review
              return model.setStatus(withInspectorate.id);
            }

            if (profile.asruLicensing) {
              // Project revoked by licensing, does not need review
              return model.setStatus(autoResolved.id);
            }

            // Project revoked by inspector - needs licensing review
            return model.setStatus(withLicensing.id);
          });
    }
  };
};
