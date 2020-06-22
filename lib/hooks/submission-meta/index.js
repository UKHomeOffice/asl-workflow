const { get } = require('lodash');

module.exports = settings => {
  const { Certificate, Exemption } = settings.models;

  return model => {
    const type = get(model, 'data.model');
    const action = get(model, 'data.action');

    if (type !== 'pil') {
      return Promise.resolve();
    }

    if (action !== 'grant' && action !== 'transfer') {
      return Promise.resolve();
    }

    const profileId = get(model, 'data.data.profileId');

    return Promise.all([
      Certificate.query().where({ profileId }),
      Exemption.query().where({ profileId })
    ])
      .then(([ certificates, exemptions ]) => model.patch({ certificates, exemptions }));
  };
};
