const { get } = require('lodash');

// set the pil holder as the subject
module.exports = (settings, model) => {
  const { PIL } = settings.models;
  const action = get(model, 'data.action');
  const data = get(model, 'data');

  if (action === 'create' || action === 'transfer') {
    const subject = get(data, 'data.profileId');
    const establishmentId = get(data, 'data.establishmentId');
    return model.patch({ subject, establishmentId });
  }

  const pilId = get(data, 'id');

  return Promise.resolve()
    .then(() => PIL.query().findById(pilId))
    .then(pil => {
      const subject = pil.profileId;
      const establishmentId = pil.establishmentId;
      return model.patch({ subject, establishmentId });
    });
};
