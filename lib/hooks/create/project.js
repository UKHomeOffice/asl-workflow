const { get } = require('lodash');
const { autoResolved, withInspectorate } = require('../../flow/status');

module.exports = settings => {
  const { Project } = settings.models;
  return model => {
    const action = get(model, 'data.action');
    const id = get(model, 'data.id');

    switch (action) {
      case 'create':
      case 'delete':
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
        return model.setStatus(withInspectorate.id);
    }
  };
};
