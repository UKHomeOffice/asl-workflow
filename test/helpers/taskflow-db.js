const Task = require('@ukhomeoffice/taskflow/lib/db/task');
const ActivityLog = require('@ukhomeoffice/taskflow/lib/db/activity-log');
const seeds = require('../data/tasks');

module.exports = knex => {
  return {
    reset: () => Promise.resolve()
      .then(() => {
        return Promise.resolve()
          .then(() => ActivityLog.query(knex).delete())
          .then(() => Task.query(knex).delete());
      }),
    seed: () => Promise.resolve()
      .then(() => {
        return seeds(Task.query(knex));
      })
  };
};
