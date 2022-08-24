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

  const requiresEndorsement = (model) => {
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

  function conditionalEndorsement(model) {
    if (!requiresEndorsement(model)) {
      return model.setStatus(withInspectorate.id);
    }
    if (canEndorse(model)) {
      return model.setStatus(endorsed.id);
    }
    return model.setStatus(awaitingEndorsement.id);
  }

  return async model => {
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
        const project = await Project.query().findById(id);
        if (project.status === 'inactive') {
          return model.setStatus(autoResolved.id);
        }

        if (project.isLegacyStub) {
          const profile = await Profile.query().findById(changedBy);
          if (!profile.asruUser || !profile.asruInspector) {
            throw new UnauthorisedError('Only ASRU inspectors can change the licence holder of a legacy stub');
          }
          return model.setStatus(autoResolved.id);
        }

        return conditionalEndorsement(model);

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
          .then(() => messager({ ...model.data, action: 'sync-training' }))
          .then(() => {
            if (!requiresEndorsement(model)) {
              return messager({ ...model.data, action: 'submit-draft' });
            }
          })
          .then(() => conditionalEndorsement(model));

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

      case 'suspend':
      case 'reinstate':
        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {
            if (!profile.asruUser || !profile.asruInspector) {
              throw new BadRequestError('Only inspectors can suspend / reinstate licences');
            }
            // licence suspensions / reinstatements are instantly resolved
            return model.setStatus(resolved.id);
          });
    }
  };
};
