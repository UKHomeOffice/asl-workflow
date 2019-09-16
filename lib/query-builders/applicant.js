const flow = require('../flow/status');
const allStatuses = Object.values(flow).map(s => s.id);

const {
  autoResolved,
  returnedToApplicant,
  recalledByApplicant,
  resolved,
  rejected,
  withdrawnByApplicant,
  discardedByApplicant
} = flow;

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
    const nopes = [
      autoResolved.id,
      resolved.id,
      rejected.id,
      withdrawnByApplicant.id,
      discardedByApplicant.id,
      returnedToApplicant.id,
      recalledByApplicant.id
    ];
    queryBuilder
      .where(isApplicant(profile))
      .whereIn('status', allStatuses.filter(s => !nopes.includes(s)));
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
