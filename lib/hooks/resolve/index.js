const { get } = require('lodash');
const Messager = require('../../messager');

module.exports = settings => {
  const messager = Messager(settings);

  return model => {
    if (settings.noDownstream) {
      return Promise.resolve();
    }

    const type = get(model, 'data.model');
    const action = get(model, 'data.action');

    return messager(model.data)
      .then(changelogModel => {
        const id = changelogModel.modelId;

        if (type === 'project' && action === 'fork') {
          const data = get(model, 'data.data');
          data.version = id;
          return model.patch({ data });
        }

        if (!model.data.id) {
          const result = model.patch({ id });
          return result || { id };
        }

        return model;
      });
  };

};
