const { get } = require('lodash');
const Messager = require('../../messager');

module.exports = settings => {
  const messager = Messager(settings);
  return model => {
    const type = get(model, 'data.model');
    if (type === 'project') {
      return messager({ ...model.data, action: 'withdraw' })
        .then(changelogModel => model.patch({ id: changelogModel.modelId }));
    }
    return Promise.resolve();
  };
};
