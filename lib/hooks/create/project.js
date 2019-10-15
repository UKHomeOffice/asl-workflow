const { get } = require('lodash');
const { autoResolved, withLicensing, awaitingEndorsement, endorsed } = require('../../flow/status');
const { canEndorse } = require('../../util');

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

      // update to the licence holder
      case 'update':
        return Project.query().findById(id)
          .then(project => {
            if (project.status === 'inactive') {
              return model.setStatus(autoResolved.id);
            } else {
              return Promise.resolve()
                .then(() => canEndorse(model))
                .then(can => model.setStatus(can ? endorsed.id : awaitingEndorsement.id));
            }
          });

      case 'grant':
        return messager({ ...model.data, action: 'submit-draft' })
          .then(() => canEndorse(model))
          .then(can => model.setStatus(can ? endorsed.id : awaitingEndorsement.id));

      case 'revoke':
        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {
            if (!profile.asruUser) {
              // Project revoked by establishment user - needs admin review
              return Promise.resolve()
                .then(() => canEndorse(model))
                .then(can => model.setStatus(can ? endorsed.id : awaitingEndorsement.id));
            }

            if (profile.asruLicensing) {
              // Project revoked by licensing, does not need review
              return model.setStatus(autoResolved.id);
            }

            // Project revoked by other asru user - needs licensing review
            return model.setStatus(withLicensing.id);
          });
    }
  };
};
