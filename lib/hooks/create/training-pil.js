const { get } = require('lodash');
const { canEndorse } = require('../../util');
const Messager = require('../../messager');
const { awaitingEndorsement, endorsed, withInspectorate, resolved } = require('../../flow/status');

module.exports = settings => {
  const { Profile, TrainingPil } = settings.models;
  const messager = Messager(settings);

  function constrainProjectParams(builder) {
    return builder.select('title', 'licenceNumber');
  }

  function constrainEstablishmentParams(builder) {
    return builder.select('name');
  }

  function attachModelData(model, id) {
    id = id || get(model, 'data.id');
    return TrainingPil.query().findById(id)
      .withGraphFetched('[profile.[pil.establishment, trainingPils.trainingCourse.[establishment(constrainEstablishmentParams), project(constrainProjectParams)]], trainingCourse.[establishment(constrainEstablishmentParams), project(constrainProjectParams)]]')
      .modifiers({ constrainProjectParams, constrainEstablishmentParams })
      .then(modelData => model.patch({ modelData }));
  }

  return async model => {
    const action = get(model, 'data.action');
    const data = get(model, 'data.data');
    const changedBy = get(model, 'data.changedBy');

    const profile = await Profile.query().findById(changedBy);

    function createInactiveTrainingPil(model) {
      return messager({
        data,
        changedBy,
        action: 'create',
        model: 'trainingPil'
      });
    }

    switch (action) {
      case 'create':
        return Promise.resolve()
          .then(() => createInactiveTrainingPil(model))
          .then(changelog => {
            return Promise.resolve()
              .then(() => model.patch({ id: changelog.modelId, action: 'grant', subject: changelog.state.profileId }))
              .then(() => attachModelData(model, changelog.modelId));
          })
          .then(() => {
            if (canEndorse(model)) {
              return model.setStatus(endorsed.id);
            }
            return model.setStatus(awaitingEndorsement.id);
          });
      case 'grant':
        if (canEndorse(model)) {
          return model.setStatus(endorsed.id);
        }
        return model.setStatus(awaitingEndorsement.id);
      case 'revoke':
        return Promise.resolve()
          .then(() => attachModelData(model))
          .then(() => {
            if (profile.asruUser && profile.asruInspector) {
              return model.setStatus(resolved.id);
            }
            return model.setStatus(withInspectorate.id);
          });
    }

    return Promise.resolve();
  };
};
