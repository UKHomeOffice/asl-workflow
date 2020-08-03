const { get } = require('lodash');

module.exports = settings => {
  const { Certificate, PIL } = settings.models;

  return model => {
    const type = get(model, 'data.model');
    const action = get(model, 'data.action');

    if (type !== 'pil') {
      return Promise.resolve();
    }

    if (action === 'create') {
      return Promise.resolve();
    }

    const id = get(model, 'data.id');

    return Promise.resolve()
      .then(() => PIL.query().findById(id).select('profileId'))
      .then(pil => {
        const profileId = pil.profileId;
        return Certificate.query().where({ profileId });
      })
      .then(certificates => model.patch({ certificates }));
  };
};
