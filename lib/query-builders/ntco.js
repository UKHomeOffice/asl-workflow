const filterToEstablishments = require('./filter-to-establishments');
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
  const establishments = getEstablishmentsWhereUserIsRole('ntco', profile);
  return filterToEstablishments(establishments);
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
