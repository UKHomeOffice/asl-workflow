const { get } = require('lodash');
const { status } = require('../../flow/status');

module.exports = settings => {
  const { PIL } = settings.models;

  return model => {
    const action = get(model, 'data.action');
    const id = get(model, 'data.id');

    switch (action) {
      case 'create':
        // new in-progress PIL (user hasn't submitted to NTCO yet), does not need review
        return model.setStatus(status.autoResolved);

      case 'revoke':
        // PIL revoked by licensing, does not need review
        return model.setStatus(status.autoResolved);

      case 'grant':
        // PIL submitted to NTCO, needs review
        return model.setStatus('ntco');

      case 'update':
        return Promise.resolve()
          .then(() => PIL.query().findById(id))
          .then(pil => {
            if (pil.status === 'active') {
              return model.setStatus('licensing');
            }
            return model.setStatus(status.autoResolved);
          });
    }
  };
};
