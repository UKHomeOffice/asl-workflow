const { get } = require('lodash');

module.exports = (settings, model) => {
  const data = get(model, 'data', {});

  data.subject = data.subject || get(data, 'data.profileId') || get(data, 'data.licenceHolderId');
  data.establishmentId = data.establishmentId || get(data, 'data.establishmentId');

  return model.update(data);
};
