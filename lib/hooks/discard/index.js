const { get } = require('lodash');
const Messager = require('../../messager');

module.exports = settings => {
  const messager = Messager(settings);
  return model => {
    const type = get(model, 'data.model');
    const action = get(model, 'data.action');

    if (type === 'trainingPil' && action === 'grant') {
      return messager({ ...model.data, action: 'delete' });
    }

    if (type === 'project') {
      if (['grant', 'transfer'].includes(action)) {
        return messager({ ...model.data, action: 'delete-amendments' });
      }
    }

    return Promise.resolve();
  };
};
