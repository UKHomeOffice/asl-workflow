const { get } = require('lodash');

module.exports = (settings, model) => {
  const { Project } = settings.models;
  const id = get(model, 'data.id');
  const action = get(model, 'data.action');

  if (action === 'create') {
    const subject = get(model, 'data.licenceHolderId');
    const establishmentId = get(model, 'data.establishmentId');
    return model.patch({ subject, establishmentId });
  }

  return Project.query().findById(id)
    .then(project => {
      return model.patch({ subject: project.licenceHolderId, establishmentId: project.establishmentId });
    });
};
