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
      .then(async changelogModel => {
        const id = changelogModel.modelId;

        if (type === 'project' && action === 'fork') {
          const data = get(model, 'data.data');
          data.version = id;
          return model.patch({ data });
        }

        if (type === 'project' && action === 'fork-ra') {
          const data = get(model, 'data.data');
          data.raVersion = id;
          return model.patch({ data });
        }

        if (type === 'rop' && action === 'create') {
          return {
            data: {
              ropId: id
            }
          };
        }

        if (type === 'project' && action === 'grant') {
          const modelData = get(model, 'data.modelData');
          const proj = await settings.models.Project.query().findById(id).select('licenceNumber');
          const patch = {
            ...modelData,
            licenceNumber: proj.licenceNumber
          };
          await model.patch({ modelData: patch });
        }

        if (!model.data.id) {
          const result = model.patch({ id });
          return result || { id };
        }

        return model;
      });
  };

};
