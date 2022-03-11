const { get } = require('lodash');

module.exports = (settings, model) => {
  const { Project } = settings.models;

  const projectId = get(model, 'data.data.projectId');

  return Promise.resolve()
    .then(() => Project.query().findById(projectId))
    .then(ppl => {
      const subject = ppl.licenceHolderId;
      const establishmentId = ppl.establishmentId;
      return model.patch({ subject, establishmentId });
    });
};
