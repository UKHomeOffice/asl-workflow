const Case = require('@ukhomeoffice/taskflow/lib/db/case');
const ActivityLog = require('@ukhomeoffice/taskflow/lib/db/activity-log');
const seeds = require('../data/tasks');

module.exports = knex => {
  return {
    reset: () => Promise.resolve()
      .then(() => {
        return Promise.resolve()
          .then(() => ActivityLog.query(knex).delete())
          .then(() => Case.query(knex).delete());
      }),
    seed: () => Promise.resolve()
      .then(() => {
        return seeds(Case.query(knex));
      })
  };
};
