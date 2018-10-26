const { get } = require('lodash');

module.exports = (settings, model) => {
  const data = get(model, 'data');
  data.subject = data.id; // profile user
  return model.update(data);
};
