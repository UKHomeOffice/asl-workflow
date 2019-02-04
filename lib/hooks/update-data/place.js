const { get, set } = require('lodash');

module.exports = (settings, model) => {
  const isAsru = get(model, 'meta.user.profile.asruUser');
  const payload = get(model, 'meta.payload');

  if (isAsru && payload.restrictions) {
    const data = get(model, 'data');
    set(data, 'data.restrictions', payload.restrictions);
    return model.update(data);
  }

  return Promise.resolve();
};
