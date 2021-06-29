const { get } = require('lodash');
const { ref } = require('objection');
const { UnauthorisedError, BadRequestError } = require('@asl/service/errors');
const {
  resolved,
  autoResolved,
  awaitingEndorsement,
  endorsed,
  withInspectorate
} = require('../../flow/status');
const { canEndorse } = require('../../util');

const Messager = require('../../messager');

module.exports = settings => {
  const { Project, Profile, ProjectVersion } = settings.models;
  const messager = Messager(settings);

  const submitViaAdmin = (model) => {
    const isASRU = get(model, 'meta.user.profile.asruUser');
    return !isASRU;
  };

  function markContinuation(model) {
    const versionId = get(model, 'data.data.version');
    return Promise.resolve()
      .then(() => {
        return ProjectVersion.query().findById(versionId)
          .select(
            ref('data:project-continuation')
              .castJson()
              .as('continuation'),
            ref('data:transfer-expiring')
              .castBool()
              .as('expiring')
          );
      })
      .then(({ continuation, expiring }) => {
        if (expiring) {
          return model.patch({ continuation });
        }
      });
  }

  return model => {
    const action = get(model, 'data.action');
    const id = get(model, 'data.id');
    const changedBy = get(model, 'data.changedBy');

    switch (action) {
      case 'convert':
        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {
            if (!profile.asruUser || !profile.asruInspector) {
              throw new UnauthorisedError('Only ASRU inspectors can convert legacy stubs');
            }
            return model.setStatus(autoResolved.id);
          });

      case 'create':
        const isLegacyStub = get(model, 'data.data.isLegacyStub', false);

        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {
            if (isLegacyStub && (!profile.asruUser || !profile.asruInspector)) {
              throw new UnauthorisedError('Only ASRU inspectors can create legacy stubs');
            }
            return model.setStatus(autoResolved.id);
          });

      case 'delete':
      case 'delete-amendments':
      case 'fork':
      case 'fork-ra':
        return model.setStatus(autoResolved.id);

      // update to the licence holder
      case 'update':
        return Project.query().findById(id)
          .then(project => {
            if (project.status === 'inactive') {
              return model.setStatus(autoResolved.id);

            } else if (project.isLegacyStub) {
              return Promise.resolve()
                .then(() => Profile.query().findById(changedBy))
                .then(profile => {
                  if (!profile.asruUser || !profile.asruInspector) {
                    throw new UnauthorisedError('Only ASRU inspectors can change the licence holder of a legacy stub');
                  }
                  return model.setStatus(autoResolved.id);
                });

            } else {
              return model.setStatus(withInspectorate.id);
            }
          });

      case 'update-licence-number':
      case 'update-issue-date':
        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {
            if (!profile.asruUser) {
              throw new UnauthorisedError('Only ASRU can change this project property');
            }

            return model.setStatus(autoResolved.id);
          });

      case 'grant':
      case 'transfer':
        return Promise.resolve()
          .then(() => markContinuation(model))
          .then(() => {
            if (!submitViaAdmin(model)) {
              return messager({ ...model.data, action: 'submit-draft' })
                .then(() => model.setStatus(withInspectorate.id));
            }
            if (canEndorse(model)) {
              return model.setStatus(endorsed.id);
            }
            return model.setStatus(awaitingEndorsement.id);
          });

      case 'grant-ra':
        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {
            if (profile.asruUser) {
              return model.setStatus(resolved.id);
            }
            if (canEndorse(model)) {
              return model.setStatus(endorsed.id);
            }
            return model.setStatus(awaitingEndorsement.id);
          });
      case 'transfer-draft':
        return Promise.resolve()
          .then(() => Project.query().findById(id))
          .then(project => {
            if (project.status !== 'inactive') {
              throw new BadRequestError(`cannot perform 'transfer-draft' action for a non-draft project`);
            }
            return model.setStatus(autoResolved.id);
          });

      case 'revoke':
        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {

            if (profile.asruUser && profile.asruInspector) {
              // Project revoked by inspector, does not need review
              return model.setStatus(resolved.id);
            }

            return model.setStatus(withInspectorate.id);
          });
    }
  };
};
