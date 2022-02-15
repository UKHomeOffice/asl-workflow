const { filterByModel, filterByIsAmendment, filterByAction } = require('./index');

module.exports = pelType => query => {
  switch (pelType) {
    case 'places':
      return query.andWhere(filterByModel('place'));

    case 'roles':
      return query.andWhere(filterByModel('role'));

    case 'pelh':
      return query
        .andWhere(filterByModel('role'))
        .whereJsonSupersetOf('data', { data: { type: 'pelh' } });

    case 'applications':
      return query
        .andWhere(filterByModel('establishment'))
        .andWhere(filterByAction('grant'))
        .andWhere(filterByIsAmendment(false));

    case 'amendments':
      return query
        .andWhere(filterByModel('establishment'))
        .andWhere(builder => {
          return builder
            .where(filterByAction('update'))
            .orWhere(filterByAction('update-conditions'));
        });

    default:
      throw new Error(`Unrecognised pelType: ${pelType}`);
  }
};
