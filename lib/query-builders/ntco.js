const { withNtco } = require('../flow/status');
const { getEstablishmentsWhereUserIsRole } = require('../util');

module.exports = {
  outstanding: (queryBuilder, profile) => {
    queryBuilder.where(builder => {
      getEstablishmentsWhereUserIsRole('ntco', profile).map(establishmentId => {
        // not sure if you can do a WHERE IN with the json queries, so just OR each establishment
        builder.orWhereJsonSupersetOf('data', { establishmentId });
      });
    }).andWhere('status', withNtco.id);
  },

  inProgress: (queryBuilder, profile) => {
    // todo
  },

  completed: (queryBuilder, profile) => {
    // todo
  }
};
