const { get } = require('lodash');
const { resolved, autoResolved } = require('../../flow/status');

module.exports = settings => {
  return model => {
    const action = get(model, 'data.action');

    if (action === 'submit' || action === 'unsubmit') {
      return model.setStatus(resolved.id);
    }
    return model.setStatus(autoResolved.id);
  };
};
