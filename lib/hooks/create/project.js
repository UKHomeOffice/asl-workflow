const { get } = require('lodash');
const { autoResolved, withInspectorate } = require('../../flow/status');

const Resolver = require('../resolve');

module.exports = settings => {
  const { Project } = settings.models;
  const resolver = Resolver(settings);

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
        return resolver({ data: { ...model.data, action: 'submit-draft' } })
          .then(() => model.setStatus(withInspectorate.id));
    }
  };
};
