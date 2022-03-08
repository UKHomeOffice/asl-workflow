const { get } = require('lodash');

module.exports = task => {
  let status = task.status;
  if (get(task, 'data.model') !== 'rop' || task.status !== 'resolved') {
    return task;
  }
  if (get(task, 'data.action') === 'submit') {
    status = 'resubmitted';
  }
  if (get(task, 'data.action') === 'unsubmit') {
    status = 'reopened';
  }
  return {
    ...task,
    status
  };
};
