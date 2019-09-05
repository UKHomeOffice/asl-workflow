const activityLog = require('./tables/activity-log');
const cases = require('./tables/cases');

exports.seed = knex => {
  return Promise.resolve()
    .then(() => activityLog.delete(knex))
    .then(() => cases.delete(knex))
    .then(() => cases.populate(knex))
    .then(() => activityLog.populate(knex));
};
