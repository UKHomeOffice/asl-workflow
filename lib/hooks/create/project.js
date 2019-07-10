const { get } = require('lodash');
const { autoResolved, withInspectorate } = require('../../flow/status');

const Messager = require('../../messager');

module.exports = settings => {
  const { Project } = settings.models;
  const messager = Messager(settings);

  return model => {
    const action = get(model, 'data.action');
    const id = get(model, 'data.id');

    switch (action) {
      case 'create':
      case 'delete':
      case 'delete-amendments':
      case 'fork':
        return model.setStatus(autoResolved.id);
      case 'update':
        return Project.query().findById(id)
          .then(project => {
            if (project.status === 'inactive') {
              return model.setStatus(autoResolved.id);
            } else {
              return model.setStatus(withInspectorate.id);
            }
          });
      case 'grant':
        return messager({ ...model.data, action: 'submit-draft' })
          .then(() => model.setStatus(withInspectorate.id));
    }
  };
};
