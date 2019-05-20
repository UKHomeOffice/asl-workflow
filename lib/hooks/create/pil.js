const { get } = require('lodash');
const { autoResolved, withNtco } = require('../../flow/status');

module.exports = settings => {
  return model => {
    const action = get(model, 'data.action');

    switch (action) {
      case 'create':
        // new in-progress PIL (user hasn't submitted to NTCO yet), does not need review
        return model.setStatus(autoResolved.id);

      case 'revoke':
        // PIL revoked by licensing, does not need review
        return model.setStatus(autoResolved.id);

      case 'grant':
        // PIL submitted to NTCO, needs review
        return model.setStatus(withNtco.id);
    }
  };
};
