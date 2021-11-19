const filterByIsAmendment = require('./by-is-amendment');
const filterByAction = require('./by-action');
const { withASRU } = require('../../flow');

module.exports = pplType => query => {
  switch (pplType) {
    case 'applications':
      return query
        .andWhere(filterByAction('grant'))
        .andWhere(filterByIsAmendment(false));

    case 'amendments':
      return query
        .andWhere(filterByIsAmendment(true))
        .andWhere(builder => {
          builder.where(filterByAction('grant'))
            .orWhere(filterByAction('revoke'))
            .orWhere(filterByAction('transfer'))
            .orWhere(filterByAction('change-licence-holder'));
        });

    case 'revocations':
      return query.andWhere(filterByAction('revoke'));

    case 'transfers':
      return query.andWhere(filterByAction('transfer'));

    case 'continuations':
      return query
        .andWhere(filterByIsAmendment(false))
        .whereRaw("data \\? 'continuation'");

    case 'hasDeadline':
      return query
        .whereIn('status', withASRU())
        .where(filterByIsAmendment(false))
        .where(filterByAction('grant'))
        .whereRaw("data \\? 'deadline'");

    case 'ra':
      return query.andWhere(filterByAction('grant-ra'));

    case 'changeLicenceHolder':
      return query.andWhere(filterByAction('change-licence-holder'));

    default:
      throw new Error(`Unrecognised pplType: ${pplType}`);
  }
};
