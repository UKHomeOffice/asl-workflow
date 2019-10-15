const filterToEstablishments = require('./filter-to-establishments');

const flow = require('../flow/status');
const allStatuses = Object.values(flow).map(s => s.id);

const {
  withNtco,
  autoResolved,
  resolved,
  rejected,
  withdrawnByApplicant,
  discardedByApplicant,
  recalledByApplicant,
  awaitingEndorsement
} = require('../flow/status');
const { getEstablishmentsWhereUserHasPermission } = require('../util');

const buildEstablishmentQuery = profile => {
  const establishments = getEstablishmentsWhereUserHasPermission('admin', profile);
  return filterToEstablishments(establishments);
};

module.exports = {

  outstanding: (queryBuilder, profile) => {
    return queryBuilder
      .where(buildEstablishmentQuery(profile))
      .where({ status: awaitingEndorsement.id })
      .whereJsonSupersetOf('data', { model: 'project' });
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
      awaitingEndorsement.id
    ];
    queryBuilder
      .where(buildEstablishmentQuery(profile))
      .whereJsonSupersetOf('data', { model: 'project' })
      .whereIn('status', allStatuses.filter(s => !nopes.includes(s)));
  }

};
