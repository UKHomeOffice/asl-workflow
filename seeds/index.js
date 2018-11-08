const cases = require('./tables/cases');

exports.seed = knex => {
  return Promise.resolve()
    .then(() => cases.delete(knex))
    .then(() => cases.populate(knex));
};
