const {
  autoResolved,
  returnedToApplicant,
  resolved,
  rejected,
  withdrawnByApplicant
} = require('../flow/status');

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
      .andWhere('status', returnedToApplicant.id);
  },

  inProgress: (queryBuilder, profile) => {
    queryBuilder
      .where(buildEstablishmentQuery(profile))
      .whereNotIn('status', [autoResolved.id, resolved.id, rejected.id, withdrawnByApplicant.id, returnedToApplicant.id]);
  },

  completed: (queryBuilder, profile) => {
    queryBuilder
      .where(buildEstablishmentQuery(profile))
      .whereIn('status', [resolved.id, rejected.id, withdrawnByApplicant.id]);
  }
};
