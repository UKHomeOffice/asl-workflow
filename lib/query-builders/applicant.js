const {
  autoResolved,
  returnedToApplicant,
  resolved,
  rejected,
  withdrawnByApplicant
} = require('../flow/status');

const isApplicant = profile => builder => builder
  .whereJsonSupersetOf('data', { changedBy: profile.id })
  .orWhereJsonSupersetOf('data', { subject: profile.id });

module.exports = {

  myTasks: (queryBuilder, profile) => {
    queryBuilder
      .where(isApplicant(profile))
      .andWhere('status', returnedToApplicant.id);
  },

  outstanding: (queryBuilder, profile) => {
    queryBuilder
      .where(isApplicant(profile))
      .andWhere('status', returnedToApplicant.id);
  },

  inProgress: (queryBuilder, profile) => {
    queryBuilder
      .where(isApplicant(profile))
      .whereNotIn('status', [autoResolved.id, resolved.id, rejected.id, withdrawnByApplicant.id, returnedToApplicant.id]);
  },

  completed: (queryBuilder, profile) => {
    queryBuilder
      .where(isApplicant(profile))
      .whereIn('status', [resolved.id, rejected.id, withdrawnByApplicant.id]);
  }
};
