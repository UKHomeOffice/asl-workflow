const uuid = require('uuid/v4');
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
    seed: (tasks = []) => Promise.resolve()
      .then(() => {
        return Task.query(knex).insert(seeds);
      })
      .then(() => {
        if (tasks.length) {
          tasks = tasks.map(t => ({ id: uuid(), ...t }));
          return Task.query(knex).insert(tasks);
        }
      })
  };
};
