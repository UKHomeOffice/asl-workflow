const { get } = require('lodash');
const Messager = require('../../messager');

module.exports = settings => {
  const messager = Messager(settings);
  return model => {
    const type = get(model, 'data.model');
    const action = get(model, 'data.action');

    if (type === 'project' && action === 'grant') {
      return messager({ ...model.data, action: 'delete-amendments' })
        .then(changelogModel => model.patch({ id: changelogModel.modelId }));
    }

    return Promise.resolve();
  };
};
