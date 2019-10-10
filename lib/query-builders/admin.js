const filterToEstablishments = require('./filter-to-establishments');
const flow = require('../flow/status');
const allStatuses = Object.values(flow).map(s => s.id);

const {
  withAdmin,
  autoResolved,
  returnedToApplicant,
  resolved,
  rejected,
  withdrawnByApplicant,
  recalledByApplicant,
  discardedByApplicant
} = flow;

const buildEstablishmentQuery = profile => {
  const establishments = profile.establishments.filter(e => e.role === 'admin').map(e => e.id);
  return filterToEstablishments(establishments);
};

module.exports = {
  outstanding: (queryBuilder, profile) => {
    queryBuilder
      .where(buildEstablishmentQuery(profile))
      .whereIn('status', [
        returnedToApplicant.id,
        recalledByApplicant.id,
        withAdmin.id
      ]);
  },

  inProgress: (queryBuilder, profile) => {
    const nopes = [
      autoResolved.id,
      resolved.id,
      rejected.id,
      withdrawnByApplicant.id,
      returnedToApplicant.id,
      recalledByApplicant.id,
      discardedByApplicant.id,
      withAdmin.id
    ];
    queryBuilder
      .where(buildEstablishmentQuery(profile))
      .whereIn('status', allStatuses.filter(s => !nopes.includes(s)));
  },

  completed: (queryBuilder, profile) => {
    queryBuilder
      .where(buildEstablishmentQuery(profile))
      .whereIn('status', [
        resolved.id,
        rejected.id,
        withdrawnByApplicant.id,
        discardedByApplicant.id
      ]);
  }
};
