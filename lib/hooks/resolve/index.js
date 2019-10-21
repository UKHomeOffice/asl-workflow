const Messager = require('../../messager');

module.exports = settings => {

  const messager = Messager(settings);

  return model => {
    if (settings.noDownstream) {
      return Promise.resolve();
    }
    return messager(model.data)
      .then(changelogModel => {
        const id = changelogModel.modelId;
        const result = model.patch({ id });
        return result || { id };
      });
  };

};
