const filterByIsAmendment = require('./by-is-amendment');
const filterByAction = require('./by-action');

module.exports = pplType => query => {
  switch (pplType) {
    case 'applications':
      return query
        .andWhere(filterByAction('grant'))
        .andWhere(filterByIsAmendment(false));

    case 'amendments':
      return query
        .andWhere(filterByAction('grant'))
        .andWhere(filterByIsAmendment(true));

    case 'revocations':
      return query.andWhere(filterByAction('revoke'));

    case 'transfers':
      return query.andWhere(filterByAction('transfer'));

    case 'continuations':
      return query.andWhere(builder => {
        builder.whereRaw("data \\? 'continuation'");
      });

    case 'hasDeadline':
      return query.andWhere(builder => {
        builder.whereRaw("data \\? 'deadline'");
      });

    case 'ra':
      return query.andWhere(filterByAction('grant-ra'));

    default:
      throw new Error(`Unrecognised pplType: ${pplType}`);
  }
};
