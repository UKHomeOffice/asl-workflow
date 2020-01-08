const { get } = require('lodash');
const Cacheable = require('./cacheable');
const { closed, withASRU, editable } = require('../flow');

const getTaskType = task => {
  const action = get(task, 'data.action');
  const model = get(task, 'data.model');
  const modelStatus = get(task, 'data.modelData.status');

  if (action === 'transfer') {
    return 'transfer';
  }

  if (action === 'revoke') {
    return 'revocation';
  }

  if (action === 'update') {
    if (model === 'project') {
      return 'update-licence-holder';
    }
    return 'amendment';
  }

  if (modelStatus === 'active') {
    return 'amendment';
  }

  return 'application';
};

module.exports = settings => {

  const { Establishment, Profile } = settings.models;
  const cache = Cacheable();
  const closedStatuses = closed();
  const withASRUStatuses = withASRU();
  const editableStatuses = editable();

  return c => {
    const establishmentId = c.data.establishmentId || (c.data.model === 'establishment' && c.data.id);
    const promises = [
      establishmentId && cache.query(Establishment, establishmentId),
      c.data.subject && cache.query(Profile, c.data.subject),
      c.data.changedBy && cache.query(Profile, c.data.changedBy)
    ];

    const isOpen = !closedStatuses.includes(c.status);
    const withASRU = withASRUStatuses.includes(c.status);
    const editable = editableStatuses.includes(c.status);
    const type = getTaskType(c);

    return Promise.all(promises)
      .then(([establishment, subject, changedBy]) => {
        return {
          ...c,
          data: {
            ...c.data,
            establishment,
            subject,
            profile: subject,
            changedBy
          },
          isOpen,
          withASRU,
          editable,
          type
        };
      });

  };

};
