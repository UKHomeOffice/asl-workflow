const { get } = require('lodash');
const flow = require('../flow');
const { recalledByApplicant, discardedByApplicant } = require('../flow/status');
const queryBuilder = require('../query-builders');
const { updated } = require('./status');

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
  return establishment && establishment.role === 'admin';
};

module.exports = (c, profile) => {
  if (flow.autoForwards(c.status)) {
    return Promise.resolve(flow.getNextSteps(c));
  }

  // if the task is outstanding for the current user then they can action it
  return queryBuilder({ profile, progress: 'outstanding' })
    .andWhere('cases.id', c.id)
    .then(cases => cases.results.length > 0)
    .then(canActionTask => {
      if (canActionTask) {
        if (c.data.model === 'pil' && c.data.action === 'transfer' && !userCreatedThisTask(c, profile)) {
          return flow.getNextSteps(c).filter(step => step.id !== updated.id); // prevent edit and resubmit by receiving admin
        }
        return flow.getNextSteps(c);
      }

      // if the task was created by the current user, or if current user is
      // an admin, then they can recall or discard it
      const canAction = userIsAdmin(c, profile) || userCreatedThisTask(c, profile);
      if (canAction && flow.getNextSteps(c).length > 0) {
        return [recalledByApplicant, discardedByApplicant];
      }

      // user has no actions available
      return [];
    });
};
