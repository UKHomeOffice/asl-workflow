const { get } = require('lodash');
const flow = require('./index');
const {
  updated,
  recalledByApplicant,
  discardedByApplicant,
  discardedByAsru,
  resubmitted,
  awaitingEndorsement,
  withNtco,
  recovered,
  rejected
} = require('./status');
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

const userIsApplicant = (task, profile) => {
  const subjectId = typeof task.data.subject === 'string' ? task.data.subject : get(task, 'data.subject.id');
  return profile.id === subjectId;
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
  if ((task.data.model !== 'pil' && task.data.model !== 'trainingPil') || ![awaitingEndorsement.id, withNtco.id].includes(task.status)) {
    return false;
  }

  const subjectId = typeof task.data.subject === 'string' ? task.data.subject : get(task, 'data.subject.id');

  return profile.id === subjectId;
};

const isPilTransferWithReceivingAdmin = (task, profile) => {
  return task.data.model === 'pil' && task.data.action === 'transfer' && !userCreatedThisTask(task, profile);
};

module.exports = async (task, profile) => {
  if (flow.autoForwards(task.status)) {
    return Promise.resolve(flow.getNextSteps(task));
  }

  let nextSteps = [];

  const outstandingTasksForUser = await queryBuilder({ profile, progress: 'outstanding' }).andWhere('cases.id', task.id);
  let userCanActionTask = outstandingTasksForUser.results.length > 0;

  if (isPilEndorsementForOwnPil(task, profile)) {
    userCanActionTask = false; // don't allow NTCOs to endorse their own PIL
  }

  if (userCanActionTask) {
    if (task.data.model === 'role' || isPilTransferWithReceivingAdmin(task, profile)) {
      nextSteps = flow.getNextSteps(task).filter(step => step.id !== updated.id); // prevent edit and resubmit
    } else {
      nextSteps = flow.getNextSteps(task);
    }
  } else if (taskIsOpen(task)) {
    if (userIsApplicant(task, profile) || userCreatedThisTask(task, profile) || userIsEstablishmentAdmin(task, profile)) {
      nextSteps = [recalledByApplicant, discardedByApplicant]; // allow the user to recall / discard their own tasks
    }
  }

  if (taskIsOpen(task) && userIsAsruAdmin(profile)) {
    nextSteps.push(discardedByAsru); // asru admins can discard any task at any point
  }

  if (task.status === rejected.id && userIsAsruAdmin(profile)) {
    nextSteps.push(recovered);
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
};
