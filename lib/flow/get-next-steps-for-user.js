const { get } = require('lodash');
const flow = require('../flow');
const { recalledByApplicant, discardedByApplicant } = require('../flow/status');
const queryBuilder = require('../query-builders');

const userCreatedThisTask = (c, profile) => {
  if (!c.data.changedBy) {
    return false;
  }

  if (typeof c.data.changedBy === 'string') {
    return c.data.changedBy === profile.id;
  }

  return c.data.changedBy.id === profile.id;
};

const userIsAdmin = (c, profile) => {
  const establishmentId = get(c, 'data.establishmentId');
  const establishment = profile.establishments.find(e => e.id === establishmentId);
  console.log(establishment);
  return establishment && establishment.role === 'admin';
};

module.exports = (c, profile) => {
  if (flow.autoForwards(c.status)) {
    return Promise.resolve(flow.getNextSteps(c.status));
  }

  // if the task is outstanding for the current user then they can action it
  return queryBuilder({ profile, progress: 'outstanding' })
    .andWhere('cases.id', c.id)
    .then(cases => cases.results.length > 0)
    .then(canActionTask => {
      if (canActionTask) {
        return flow.getNextSteps(c.status);
      }

      // if the task was created by the current user, or if current user is
      // an admin, then they can recall or discard it
      const canAction = userIsAdmin(c, profile) || userCreatedThisTask(c, profile);
      if (canAction && flow.getNextSteps(c.status).length > 0) {
        return [recalledByApplicant, discardedByApplicant];
      }

      // user has no actions available
      return [];
    });
};
