const { get } = require('lodash');

module.exports = (settings, model) => {
  const subject = get(model, 'data.id');
  return model.patch({ subject });
};
