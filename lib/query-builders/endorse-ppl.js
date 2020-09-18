const { filterToEstablishments } = require('./filter-to-establishments');

const { awaitingEndorsement } = require('../flow/status');
const { getEstablishmentsWhereUserIsAdmin } = require('../util');

const buildEstablishmentQuery = profile => {
  const establishments = getEstablishmentsWhereUserIsAdmin(profile);
  return filterToEstablishments(establishments);
};

module.exports = {

  outstanding: (queryBuilder, profile) => {
    return queryBuilder
      .where(buildEstablishmentQuery(profile))
      .where({ status: awaitingEndorsement.id })
      .whereJsonSupersetOf('data', { model: 'project' });
  }

};
