const { get } = require('lodash');
const moment = require('moment');
const { Task } = require('@ukhomeoffice/asl-taskflow');
const { withASRU } = require('../../flow');

const completeAndCorrect = require('./complete-and-correct');
const getDeadline = require('./get-deadline');

const statutoryDeadlineRemoved = task => {
  return !!get(task, 'data.removedDeadline');
};

const statutoryDeadlineActivated = task => {
  const isAmendment = get(task, 'data.modelData.status') !== 'inactive';
  const meta = get(task, 'data.meta');
  return !isAmendment && completeAndCorrect(meta) && !statutoryDeadlineRemoved(task);
};

const getActiveDeadline = task => {
  const now = new Date();
  const statutoryDeadline = get(task, 'data.deadline');
  const isExtended = get(statutoryDeadline, 'isExtended', false);
  const statutoryDate = get(statutoryDeadline, isExtended ? 'extended' : 'standard');
  const internalDeadline = get(task, 'data.internalDeadline');
  const internalDate = get(internalDeadline, isExtended ? 'extended' : 'standard');
  const internalPassed = internalDate && moment(internalDate).isBefore(now);
  const earliestDate = [internalDate, statutoryDate].filter(Boolean).sort().shift();

  return (!internalPassed || !statutoryDate) && earliestDate
    ? earliestDate
    : statutoryDate;
};

module.exports = () => {
  return task => {
    const model = get(task, 'data.model');
    const action = get(task, 'data.action');
    const status = get(task, 'status');

    if (model !== 'project' || action !== 'grant' || !withASRU().includes(status)) {
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
        if (statutoryDeadlineActivated(task)) {
          task.data.deadline = getDeadline(model);
        } else {
          delete task.data.deadline;
        }

        if (!task.activeDeadline) {
          task.activeDeadline = getActiveDeadline(task);
        }

        return task;
      });
  };
};
