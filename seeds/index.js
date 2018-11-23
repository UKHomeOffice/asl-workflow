const cases = require('./tables/cases');

exports.seed = knex => {
  return Promise.resolve()
    .then(() => knex('activity_log').del())
    .then(() => cases.delete(knex))
    .then(() => cases.populate(knex));
};
