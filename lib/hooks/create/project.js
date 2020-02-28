const { get } = require('lodash');
const { UnauthorisedError } = require('@asl/service/errors');
const { autoResolved, withLicensing, awaitingEndorsement, endorsed, withInspectorate } = require('../../flow/status');
const { canEndorse } = require('../../util');

const Messager = require('../../messager');

module.exports = settings => {
  const { Project, Profile } = settings.models;
  const messager = Messager(settings);

  const needsEndorsement = (model) => {
    // don't require re-endorsing
    if (get(model, 'data.meta.authority', 'no').toLowerCase() === 'yes') {
      return false;
    }
    // don't require endorsement on amendments
    if (get(model, 'data.modelData.status', 'inactive') === 'active') {
      return false;
    }
    return true;
  };

  return model => {
    const action = get(model, 'data.action');
    const id = get(model, 'data.id');
    const changedBy = get(model, 'data.changedBy');

    switch (action) {
      case 'convert':
        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {
            if (!profile.asruUser || !profile.asruLicensing) {
              throw new UnauthorisedError('Only ASRU LOs can convert legacy stubs');
            }
            return model.setStatus(autoResolved.id);
          });

      case 'create':
        const isLegacyStub = get(model, 'data.data.isLegacyStub', false);

        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {
            if (isLegacyStub && (!profile.asruUser || !profile.asruLicensing)) {
              throw new UnauthorisedError('Only ASRU LOs can create legacy stubs');
            }
            return model.setStatus(autoResolved.id);
          });

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
              return model.setStatus(withInspectorate.id);
            }
          });

      case 'update-issue-date':
        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {
            if (!profile.asruUser) {
              throw new UnauthorisedError('Only ASRU can change the granted date');
            }

            return model.setStatus(autoResolved.id);
          });

      case 'grant':
        return Promise.resolve()
          .then(() => {
            if (!needsEndorsement(model)) {
              return messager({ ...model.data, action: 'submit-draft' })
                .then(() => model.setStatus(withInspectorate.id));
            }
            if (canEndorse(model)) {
              return model.setStatus(endorsed.id);
            }
            return model.setStatus(awaitingEndorsement.id);
          });

      case 'revoke':
        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {
            if (!profile.asruUser) {
              // Project revoked by establishment user - needs inspector review
              return model.setStatus(withInspectorate.id);
            }

            if (profile.asruUser && profile.asruLicensing) {
              // Project revoked by licensing, does not need review
              return model.setStatus(autoResolved.id);
            }

            // Project revoked by other asru user - needs licensing review
            return model.setStatus(withLicensing.id);
          });
    }
  };
};
