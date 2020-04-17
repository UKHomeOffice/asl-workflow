const { get } = require('lodash');
const flow = require('./index');
const { updated, recalledByApplicant, discardedByApplicant, discardedByAsru, resubmitted, awaitingEndorsement } = require('./status');
const queryBuilder = require('../query-builders');

const userCreatedThisTask = (task, profile) => {
  if (!task.data.changedBy) {
    return false;
  }

  if (typeof task.data.changedBy === 'string') {
    return task.data.changedBy === profile.id;
  }

  return task.data.changedBy.id === profile.id;
};

const userIsEstablishmentAdmin = (task, profile) => {
  const establishmentId = get(task, 'data.establishmentId');
  const establishment = profile.establishments.find(e => e.id === establishmentId);
  return establishment && establishment.role === 'admin';
};

const userIsAsruAdmin = profile => {
  return profile.asruUser && profile.asruAdmin;
};

const taskIsOpen = task => {
  return flow.open().includes(task.status);
};

const isPilEndorsementForOwnPil = (task, profile) => {
  return task.data.model === 'pil' && task.status === awaitingEndorsement.id && profile.id === task.data.subject.id;
};

module.exports = (task, profile) => {
  if (flow.autoForwards(task.status)) {
    return Promise.resolve(flow.getNextSteps(task));
  }

  let nextSteps = [];

  // if the task is outstanding for the current user then they can action it
  return queryBuilder({ profile, progress: 'outstanding' })
    .andWhere('cases.id', task.id)
    .then(cases => cases.results.length > 0)
    .then(taskWithUser => {
      if (isPilEndorsementForOwnPil(task, profile)) {
        taskWithUser = false; // don't give NTCO's the option to endorse their own PIL
      }

      if (taskWithUser) {
        if (task.data.model === 'pil' && task.data.action === 'transfer' && !userCreatedThisTask(task, profile)) {
          nextSteps = flow.getNextSteps(task).filter(step => step.id !== updated.id); // prevent edit and resubmit by receiving admin
        } else {
          nextSteps = flow.getNextSteps(task);
        }
      } else {
        // if the task was created by the current user, or if current user is an admin, then they can recall or discard it
        const canAction = userIsEstablishmentAdmin(task, profile) || userCreatedThisTask(task, profile);
        if (canAction && flow.getNextSteps(task).length > 0) {
          nextSteps = [recalledByApplicant, discardedByApplicant];
        }
      }

      if (taskIsOpen(task) && userIsAsruAdmin(profile)) {
        nextSteps.push(discardedByAsru);
      }

      if (task.data.initiatedByAsru && !profile.asruUser) {
        const nopes = [
          recalledByApplicant.id,
          discardedByApplicant.id,
          resubmitted.id,
          updated.id
        ];
        nextSteps = nextSteps.filter(step => !nopes.includes(step.id));
      }

      return nextSteps;
    });
};
