const {
  withNtco,
  autoResolved,
  resolved,
  rejected,
  withdrawnByApplicant,
  recalledByApplicant,
  discardedByApplicant
} = require('../flow/status');
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
    queryBuilder
      .where(buildEstablishmentQuery(profile))
      .whereJsonSupersetOf('data', { model: 'pil', action: 'grant' })
      .whereNotIn('status', [
        withNtco.id,
        autoResolved.id,
        resolved.id,
        rejected.id,
        withdrawnByApplicant.id,
        discardedByApplicant.id,
        recalledByApplicant.id
      ]);
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
