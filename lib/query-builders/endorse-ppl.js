const filterToEstablishments = require('./filter-to-establishments');

const { awaitingEndorsement } = require('../flow/status');
const { getEstablishmentsWhereUserHasPermission } = require('../util');

const buildEstablishmentQuery = profile => {
  const establishments = getEstablishmentsWhereUserHasPermission('admin', profile);
  return filterToEstablishments(establishments);
};

module.exports = {

  outstanding: (queryBuilder, profile) => {
    return queryBuilder
      .where(buildEstablishmentQuery(profile))
      .where({ status: awaitingEndorsement.id });
  }

};
