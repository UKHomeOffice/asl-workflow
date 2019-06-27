const Messager = require('../../messager');

module.exports = settings => {

  const messager = Messager(settings);

  return model => {
    if (settings.noDownstream) {
      return Promise.resolve();
    }

    return messager(model.data)
      .then(changelogModel => model.patch({ id: changelogModel.modelId }));
  };

};
