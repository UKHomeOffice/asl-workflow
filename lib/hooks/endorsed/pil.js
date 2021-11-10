const { get } = require('lodash');
const { resolved, withLicensing, withInspectorate, referredToInspector } = require('../../flow/status');
const { withASRU } = require('../../flow');

module.exports = settings => {
  return model => {
    const action = get(model, 'data.action');

    if (action === 'review') {
      return model.setStatus(resolved.id);
    }

    const withASRUStatuses = withASRU();
    const lastASRUStatus = model.activityLog.map(a => a.event.status).find(status => withASRUStatuses.includes(status));

    if ([withInspectorate.id, referredToInspector.id].includes(lastASRUStatus)) {
      return model.setStatus(withInspectorate.id);
    }
    return model.setStatus(withLicensing.id);
  };
};
