const { get } = require('lodash');

const getTaskType = task => {
  const action = get(task, 'data.action');
  const modelStatus = get(task, 'data.modelData.status', 'inactive');

  if (action === 'grant-ra') {
    return 'ra';
  }

  if (action === 'transfer') {
    return 'transfer';
  }

  if (action === 'review') {
    return 'review';
  }

  if (action === 'revoke') {
    return 'revocation';
  }

  if (action === 'suspend') {
    return 'suspension';
  }

  if (action === 'reinstate') {
    return 'reinstatement';
  }

  if (action === 'grant' && modelStatus !== 'active') {
    return 'application';
  }

  return 'amendment';
};

module.exports = c => (
  {
    ...c,
    type: getTaskType(c)
  }
);
