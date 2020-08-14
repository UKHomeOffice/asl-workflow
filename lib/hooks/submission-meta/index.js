const { get } = require('lodash');

module.exports = settings => {
  const { Certificate, PIL, Project } = settings.models;

  return model => {
    const type = get(model, 'data.model');
    const action = get(model, 'data.action');

    const modelMapping = {
      pil: PIL,
      project: Project
    };
    const Model = modelMapping[type];

    if (!Model) {
      return Promise.resolve();
    }

    if (action === 'create') {
      return Promise.resolve();
    }

    const id = get(model, 'data.id');

    return Promise.resolve()
      .then(() => Model.query().findById(id))
      .then(result => {
        const profileId = type === 'project' ? result.licenceHolderId : result.profileId;
        return Certificate.query().where({ profileId });
      })
      .then(certificates => model.patch({ certificates }));
  };
};
