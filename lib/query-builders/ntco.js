const { filterToEstablishments, isTrainingPilAtOtherEstablishment } = require('./filter-to-establishments');
const flow = require('../flow/status');
const allStatuses = Object.values(flow).map(s => s.id);

const {
  withNtco,
  awaitingEndorsement,
  autoResolved,
  resolved,
  rejected,
  refused,
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

const buildEstablishmentQueryWithTrainingPil = profile => builder => {
  return builder
    .where(buildEstablishmentQuery(profile))
    .orWhere(isUserNtcoAtTrainingPilEstablishent(profile));
};

const isUserNtcoAtTrainingPilEstablishent = profile => builder => {
  const establishments = getEstablishmentsWhereUserIsRole('ntco', profile);
  return builder.where(isTrainingPilAtOtherEstablishment(establishments));
};

const buildModelQuery = builder => {
  return builder
    .whereJsonSupersetOf('data', { model: 'pil' })
    .orWhereJsonSupersetOf('data', { model: 'trainingPil' });
};

module.exports = {
  outstanding: (queryBuilder, profile) => {
    queryBuilder
      .where(buildEstablishmentQuery(profile))
      .where(buildModelQuery)
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
      refused.id,
      withdrawnByApplicant.id,
      discardedByApplicant.id,
      recalledByApplicant.id,
      awaitingEndorsement.id,
      discardedByAsru.id
    ];
    queryBuilder
      .where(buildEstablishmentQueryWithTrainingPil(profile))
      .where(buildModelQuery)
      .where(builder => {
        builder
          .whereIn('status', allStatuses.filter(s => !nopes.includes(s)))
          .orWhere(b => {
            b.whereJsonSupersetOf('data', { subject: profile.id })
              .whereIn('status', [
                withNtco.id,
                awaitingEndorsement.id
              ]);
          })
          .orWhere(builder => {
            builder
              .where(isUserNtcoAtTrainingPilEstablishent(profile))
              .whereIn('status', [
                withNtco.id,
                awaitingEndorsement.id
              ]);
          });
      });
  },

  completed: (queryBuilder, profile) => {
    queryBuilder
      .where(buildEstablishmentQueryWithTrainingPil(profile))
      .where(buildModelQuery)
      .whereIn('status', [
        resolved.id,
        rejected.id,
        refused.id,
        withdrawnByApplicant.id,
        discardedByApplicant.id,
        discardedByAsru.id
      ]);
  }
};
