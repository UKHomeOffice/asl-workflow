const { get } = require('lodash');
const { canEndorse } = require('../../util');
const Messager = require('../../messager');
const { awaitingEndorsement, endorsed, withLicensing, resolved } = require('../../flow/status');

module.exports = settings => {
  const { Profile } = settings.models;
  const messager = Messager(settings);

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
          .then(changelog => model.patch({ id: changelog.modelId, action: 'grant' }))
          .then(() => {
            if (canEndorse(model)) {
              return model.setStatus(endorsed.id);
            }
            return model.setStatus(awaitingEndorsement.id);
          });
      case 'revoke':
        if (profile.asruUser && profile.asruLicensing) {
          return model.setStatus(resolved.id);
        }
        return model.setStatus(withLicensing.id);
    }

    return Promise.resolve();
  };
};
