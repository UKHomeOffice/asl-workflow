const { get } = require('lodash');
const Messager = require('../../messager');

module.exports = settings => {
  const { Project } = settings.models;
  const messager = Messager(settings);

  return model => {
    const type = get(model, 'data.model');
    const action = get(model, 'data.action');
    const id = get(model, 'data.id');

    if (type === 'project' && action === 'grant') {
      return Promise.resolve()
        .then(() => Project.query().findById(id))
        .then(project => project.status === 'inactive' ? 'delete' : 'delete-amendments')
        .then(action => messager({ ...model.data, action }))
        .then(changelogModel => model.patch({ id: changelogModel.modelId }));
    }

    return Promise.resolve();
  };
};
