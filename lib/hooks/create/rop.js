const { get } = require('lodash');
const { resolved, autoResolved } = require('../../flow/status');

module.exports = settings => {
  return model => {
    const action = get(model, 'data.action');
    const modelData = get(model, 'data.modelData');
    const meta = get(model, 'data.meta');

    if (action === 'submit') {
      return Promise.resolve()
        .then(() => {
          if (modelData.submittedDate) {
            return model.patch({ meta: {
              ...meta,
              resubmission: true
            } });
          }
        })
        .then(() => model.setStatus(resolved.id));
    }
    if (action === 'unsubmit') {
      return model.setStatus(autoResolved.id);
    }
    return Promise.resolve();
  };
};
