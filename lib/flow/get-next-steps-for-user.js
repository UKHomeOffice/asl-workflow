const flow = require('../flow');
const { withdrawnByApplicant } = require('../flow/status');
const queryBuilder = require('../query-builders');

module.exports = (c, profile) => {
  // if the task is outstanding for the current user then they can action it
  return queryBuilder({ profile, progress: 'outstanding' })
    .andWhere('cases.id', c.id)
    .then(cases => cases.results.length > 0)
    .then(canActionTask => {
      if (canActionTask) {
        return flow.getNextSteps(c.status);
      }

      // if the task is in progress for the current user, then they can withdraw it
      return queryBuilder({ profile, progress: 'inProgress' })
        .andWhere('cases.id', c.id)
        .then(cases => cases.results.length > 0)
        .then(canWithdrawTask => {
          return canWithdrawTask ? [withdrawnByApplicant] : [];
        });
    });
};
