const { get } = require('lodash');

module.exports = (settings, model) => {
  const data = get(model, 'data', {});

  const subject = data.subject || get(data, 'data.profileId') || get(data, 'data.licenceHolderId');

  const establishmentId = data.establishmentId ||
    get(data, 'data.establishmentId') ||
    (get(data, 'model') === 'establishment' ? get(data, 'id') : undefined);

  return model.patch({ subject, establishmentId });
};
