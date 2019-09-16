const flow = require('../flow/status');
const allStatuses = Object.values(flow).map(s => s.id);

const {
  withNtco,
  autoResolved,
  resolved,
  rejected,
  withdrawnByApplicant,
  recalledByApplicant,
  discardedByApplicant
} = flow;

const { getEstablishmentsWhereUserIsRole } = require('../util');

const buildEstablishmentQuery = profile => {
  return builder => {
    getEstablishmentsWhereUserIsRole('ntco', profile)
      .forEach(establishmentId => {
        // not sure if you can do a WHERE IN with the json queries, so just OR each establishment
        builder.orWhereJsonSupersetOf('data', { establishmentId });
      });
  };
};

module.exports = {
  outstanding: (queryBuilder, profile) => {
    queryBuilder
      .where(buildEstablishmentQuery(profile))
      .whereJsonSupersetOf('data', { model: 'pil', action: 'grant' })
      .andWhere('status', withNtco.id);
  },

  inProgress: (queryBuilder, profile) => {
    const nopes = [
      withNtco.id,
      autoResolved.id,
      resolved.id,
      rejected.id,
      withdrawnByApplicant.id,
      discardedByApplicant.id,
      recalledByApplicant.id
    ];
    queryBuilder
      .where(buildEstablishmentQuery(profile))
      .whereJsonSupersetOf('data', { model: 'pil', action: 'grant' })
      .whereIn('status', allStatuses.filter(s => !nopes.includes(s)));
  },

  completed: (queryBuilder, profile) => {
    queryBuilder
      .where(buildEstablishmentQuery(profile))
      .whereJsonSupersetOf('data', { model: 'pil', action: 'grant' })
      .whereIn('status', [
        resolved.id,
        rejected.id,
        withdrawnByApplicant.id,
        discardedByApplicant.id
      ]);
  }
};
