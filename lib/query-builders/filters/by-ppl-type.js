const filterByIsAmendment = require('./by-is-amendment');
const filterByAction = require('./by-action');

module.exports = pplType => query => {
  switch (pplType) {
    case 'applications':
      return query.andWhere(filterByIsAmendment(false));

    case 'amendments':
      return query.andWhere(filterByIsAmendment(true));

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
  }
};
