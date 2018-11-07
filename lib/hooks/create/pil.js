const { get } = require('lodash');
const { autoResolved, withLicensing, withNtco } = require('../../flow/status');

module.exports = settings => {
  const { PIL } = settings.models;

  return model => {
    const action = get(model, 'data.action');
    const id = get(model, 'data.id');

    switch (action) {
      case 'create':
        // new in-progress PIL (user hasn't submitted to NTCO yet), does not need review
        return model.setStatus(autoResolved);

      case 'revoke':
        // PIL revoked by licensing, does not need review
        return model.setStatus(autoResolved);

      case 'grant':
        // PIL submitted to NTCO, needs review
        return model.setStatus(withNtco);

      case 'update':
        return Promise.resolve()
          .then(() => PIL.query().findById(id))
          .then(pil => {
            if (pil.status === 'active') {
              return model.setStatus(withLicensing);
            }
            return model.setStatus(autoResolved);
          });
    }
  };
};
