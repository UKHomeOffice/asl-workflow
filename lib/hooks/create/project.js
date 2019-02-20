const { get } = require('lodash');
const { autoResolved, withInspectorate } = require('../../flow/status');

module.exports = settings => {
  return model => {
    const action = get(model, 'data.action');

    switch (action) {
      case 'create':
        // new draft Project, does not need review
        return model.setStatus(autoResolved.id);
      case 'delete':
        // allow project to be deleted
        return model.setStatus(autoResolved.id);
      case 'grant':
        return model.setStatus(withInspectorate.id);
    }
  };
};
