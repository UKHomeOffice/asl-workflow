const { get } = require('lodash');
const Messager = require('../../messager');

module.exports = settings => {
  const messager = Messager(settings);
  return model => {
    const type = get(model, 'data.model');
    const action = get(model, 'data.action');
    const changedBy = get(model, 'meta.user.profile.id');

    if (type === 'project' && action === 'grant') {
      return messager({ ...model.data, action: 'fork', meta: { changedBy } });
    }
    return Promise.resolve();
  };
};
