const filterToEstablishments = require('./filter-to-establishments');
const flow = require('../flow/status');
const allStatuses = Object.values(flow).map(s => s.id);

const {
  withNtco,
  awaitingEndorsement,
  autoResolved,
  resolved,
  rejected,
  withdrawnByApplicant,
  recalledByApplicant,
  discardedByApplicant,
  discardedByAsru
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
      .whereJsonSupersetOf('data', { model: 'pil' })
      .whereJsonNotSupersetOf('data', { subject: profile.id })
      .whereIn('status', [
        withNtco.id,
        awaitingEndorsement.id
      ]);
  },

  inProgress: (queryBuilder, profile) => {
    const nopes = [
      withNtco.id,
      autoResolved.id,
      resolved.id,
      rejected.id,
      withdrawnByApplicant.id,
      discardedByApplicant.id,
      recalledByApplicant.id,
      awaitingEndorsement.id,
      discardedByAsru.id
    ];
    queryBuilder
      .where(buildEstablishmentQuery(profile))
      .whereJsonSupersetOf('data', { model: 'pil' })
      .where(builder => {
        builder.whereIn('status', allStatuses.filter(s => !nopes.includes(s)))
          .orWhere(b => {
            b.whereJsonSupersetOf('data', { subject: profile.id })
              .whereIn('status', [
                withNtco.id,
                awaitingEndorsement.id
              ]);
          });
      });
  },

  completed: (queryBuilder, profile) => {
    queryBuilder
      .where(buildEstablishmentQuery(profile))
      .whereJsonSupersetOf('data', { model: 'pil' })
      .whereIn('status', [
        resolved.id,
        rejected.id,
        withdrawnByApplicant.id,
        discardedByApplicant.id,
        discardedByAsru.id
      ]);
  }
};
