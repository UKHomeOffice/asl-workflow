const { get } = require('lodash');
const { autoResolved, withInspectorate } = require('../../flow/status');

module.exports = settings => {
  return model => {
    const action = get(model, 'data.action');

    switch (action) {
      case 'create':
      case 'delete':
      case 'fork':
        return model.setStatus(autoResolved.id);
      case 'grant':
      case 'update':
        return model.setStatus(withInspectorate.id);
    }
  };
};
