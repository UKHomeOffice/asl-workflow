const flow = require('../flow');
const { withdrawnByApplicant } = require('../flow/status');
const queryBuilder = require('../query-builders');

const userCreatedThisTask = (c, profile) => c.data.changedBy === profile.id;

module.exports = (c, profile) => {
  if (flow.autoForwards(c.status)) {
    return flow.getNextSteps(c.status);
  }

  // if the task is outstanding for the current user then they can action it
  return queryBuilder({ profile, progress: 'outstanding' })
    .andWhere('cases.id', c.id)
    .then(cases => cases.results.length > 0)
    .then(canActionTask => {
      if (canActionTask) {
        return flow.getNextSteps(c.status);
      }

      // if the task was created by the current user then they can withdraw it
      if (userCreatedThisTask(c, profile) && flow.getNextSteps(c.status).length > 0) {
        return [withdrawnByApplicant];
      }

      // user has no actions available
      return [];
    });
};
