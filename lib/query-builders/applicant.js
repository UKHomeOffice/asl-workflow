const {
  autoResolved,
  returnedToApplicant,
  resolved,
  rejected,
  withdrawnByApplicant
} = require('../flow/status');

module.exports = {
  outstanding: (queryBuilder, profile) => {
    queryBuilder.whereJsonSupersetOf('data', { subject: profile.id })
      .andWhere('status', returnedToApplicant.id);
  },

  inProgress: (queryBuilder, profile) => {
    queryBuilder.whereJsonSupersetOf('data', { subject: profile.id })
      .whereNotIn('status', [autoResolved.id, resolved.id, rejected.id, withdrawnByApplicant.id, returnedToApplicant.id]);
  },

  completed: (queryBuilder, profile) => {
    queryBuilder.whereJsonSupersetOf('data', { subject: profile.id })
      .whereIn('status', [resolved.id, rejected.id, withdrawnByApplicant.id]);
  }
};
