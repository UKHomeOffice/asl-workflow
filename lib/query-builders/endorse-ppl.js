const filterToEstablishments = require('./filter-to-establishments');

const { awaitingEndorsement } = require('../flow/status');
const { getEstablishmentsWhereUserCanEndorsePPL } = require('../util');

const buildEstablishmentQuery = profile => {
  const establishments = getEstablishmentsWhereUserCanEndorsePPL(profile);
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
