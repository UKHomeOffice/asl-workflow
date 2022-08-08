const { filterToEstablishments, isTrainingPilAtOtherEstablishment } = require('./filter-to-establishments');
const { getEstablishmentsWhereUserIsAdmin } = require('../util');
const flow = require('../flow/status');
const allStatuses = Object.values(flow).map(s => s.id);

const {
  autoResolved,
  returnedToApplicant,
  resolved,
  rejected,
  refused,
  withdrawnByApplicant,
  recalledByApplicant,
  discardedByApplicant,
  discardedByAsru
} = flow;

const buildEstablishmentQuery = profile => {
  const establishments = profile.establishments.filter(e => e.role === 'admin').map(e => e.id);
  return filterToEstablishments(establishments);
};

const buildEstablishmentQueryWithTrainingPil = profile => builder => {
  const establishments = getEstablishmentsWhereUserIsAdmin(profile);
  builder
    .where(buildEstablishmentQuery(profile))
    .orWhere(b => {
      b.where(isTrainingPilAtOtherEstablishment(establishments))
        .whereJsonSupersetOf('data', { model: 'trainingPil' });
    });
};

module.exports = {
  outstanding: (queryBuilder, profile) => {
    queryBuilder
      .where(buildEstablishmentQuery(profile))
      .whereJsonNotSupersetOf('data', { initiatedByAsru: true })
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
      refused.id,
      withdrawnByApplicant.id,
      returnedToApplicant.id,
      recalledByApplicant.id,
      discardedByApplicant.id,
      discardedByAsru.id
    ];
    queryBuilder
      .where(buildEstablishmentQueryWithTrainingPil(profile))
      .whereIn('status', allStatuses.filter(s => !nopes.includes(s)));
  },

  completed: (queryBuilder, profile) => {
    queryBuilder
      .where(buildEstablishmentQueryWithTrainingPil(profile))
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
