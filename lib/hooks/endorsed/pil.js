const { get } = require('lodash');
const { resolved, withLicensing } = require('../../flow/status');

module.exports = settings => {
  return model => {
    const action = get(model, 'data.action');

    if (action === 'review') {
      return model.setStatus(resolved.id);
    }

    return model.setStatus(withLicensing.id);
  };
};
