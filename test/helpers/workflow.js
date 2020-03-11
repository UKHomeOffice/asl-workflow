const Workflow = require('../../lib/api');
const WithUser = require('./with-user');
const taskflowDb = require('./taskflow-db');
const aslDb = require('./asl-db');
const fixtures = require('../data');
const Database = require('@ukhomeoffice/taskflow/lib/db');
const settings = require('./database-settings');

let knex = {};
let tfdb = {};

module.exports = {
  create: (options = {}) => {
    knex = Database.connect(settings.taskflowDB);
    tfdb = taskflowDb(knex);

    return Promise.resolve()
      .then(() => {
        const workflow = Workflow(Object.assign({
          ...settings,
          noDownstream: true,
          auth: false,
          log: { level: 'silent' }
        }, options));

        return WithUser(workflow, {});
      });
  },

  destroy: () => {
    return knex.destroy();
  },

  resetDBs: ({ keepalive = false } = {}) => {
    return Promise.resolve()
      .then(() => tfdb.reset())
      .then(() => aslDb(settings.db).init(fixtures.default, keepalive));
  },

  seedTaskList: () => {
    return Promise.resolve()
      .then(() => tfdb.seed());
  }
};
