const { get } = require('lodash');

module.exports = (settings, model) => {
  const action = get(model, 'data.action');
  const data = get(model, 'data');

  if (action === 'create') {
    data.subject = get(data, 'data.profileId');
    data.establishmentId = get(data, 'data.establishmentId');
    return model.update(data);
  }

  return Promise.resolve();
};
