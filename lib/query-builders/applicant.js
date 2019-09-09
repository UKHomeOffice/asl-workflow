const {
  autoResolved,
  returnedToApplicant,
  recalledByApplicant,
  resolved,
  rejected,
  withdrawnByApplicant,
  discardedByApplicant
} = require('../flow/status');

const isApplicant = profile => builder => {
  builder
    .whereJsonSupersetOf('data', { changedBy: profile.id })
    .orWhereJsonSupersetOf('data', { subject: profile.id })
    .orWhereJsonSupersetOf('data:modelData', { licenceHolderId: profile.id });
};

module.exports = {

  myTasks: (queryBuilder, profile) => {
    queryBuilder
      .where(isApplicant(profile))
      .whereIn('status', [
        returnedToApplicant.id,
        recalledByApplicant.id
      ]);
  },

  outstanding: (queryBuilder, profile) => {
    queryBuilder
      .where(isApplicant(profile))
      .whereIn('status', [
        returnedToApplicant.id,
        recalledByApplicant.id
      ]);
  },

  inProgress: (queryBuilder, profile) => {
    queryBuilder
      .where(isApplicant(profile))
      .whereNotIn('status', [
        autoResolved.id,
        resolved.id,
        rejected.id,
        withdrawnByApplicant.id,
        discardedByApplicant.id,
        returnedToApplicant.id,
        recalledByApplicant.id
      ]);
  },

  completed: (queryBuilder, profile) => {
    queryBuilder
      .where(isApplicant(profile))
      .whereIn('status', [
        resolved.id,
        rejected.id,
        withdrawnByApplicant.id,
        discardedByApplicant.id
      ]);
  }
};
