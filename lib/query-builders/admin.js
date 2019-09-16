const flow = require('../flow/status');
const allStatuses = Object.values(flow).map(s => s.id);

const {
  autoResolved,
  returnedToApplicant,
  resolved,
  rejected,
  withdrawnByApplicant,
  recalledByApplicant,
  discardedByApplicant
} = flow;

const buildEstablishmentQuery = profile => {
  return builder => {
    profile.establishments
      .filter(e => e.role === 'admin')
      .forEach(establishment => {
        builder.orWhereJsonSupersetOf('data', { establishmentId: establishment.id });
      });
  };
};

module.exports = {
  outstanding: (queryBuilder, profile) => {
    queryBuilder
      .where(buildEstablishmentQuery(profile))
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
      returnedToApplicant.id,
      recalledByApplicant.id,
      discardedByApplicant.id
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
