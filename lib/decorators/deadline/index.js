const { get } = require('lodash');
const { Task } = require('@ukhomeoffice/taskflow');
const { withASRU } = require('../../flow');

const completeAndCorrect = require('./complete-and-correct');
const getDeadline = require('./get-deadline');

const hasActiveDeadline = task => {
  const model = get(task, 'data.model');
  const action = get(task, 'data.action');
  const status = get(task, 'status');
  const isAmendment = get(task, 'data.modelData.status') !== 'inactive';
  const meta = get(task, 'data.meta');

  if (model !== 'project' || action !== 'grant' || !withASRU().includes(status) || isAmendment) {
    return false;
  }

  return completeAndCorrect(meta);
};

module.exports = settings => {
  return task => {
    if (!hasActiveDeadline(task)) {
      delete task.data.deadline;
      return Promise.resolve(task);
    }

    return Promise.resolve()
      .then(() => {
        if (!task.activityLog) {
          return Task.find(task.id).then(model => model.toJSON());
        }
        return task;
      })
      .then(model => {
        const deadline = getDeadline(model);

        return {
          ...task,
          data: {
            ...task.data,
            deadline
          }
        };
      });
  };
};
