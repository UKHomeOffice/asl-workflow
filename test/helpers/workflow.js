const Workflow = require('../../lib/api');
const WithUser = require('./with-user');
const taskflowDb = require('./taskflow-db');
const aslDb = require('./asl-db');
const config = require('../../config');
const fixtures = require('../data');
const Database = require('@ukhomeoffice/taskflow/lib/db');

const settings = {
  ...config,
  db: {
    host: process.env.ASL_DATABASE_HOST || 'localhost',
    database: process.env.ASL_DATABASE_NAME || 'asl-test',
    user: process.env.ASL_DATABASE_USERNAME || 'postgres'
  },
  taskflowDB: {
    host: process.env.DATABASE_HOST || 'localhost',
    database: process.env.DATABASE_NAME || 'taskflow-test',
    user: process.env.DATABASE_USERNAME || 'postgres'
  }
};

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
          auth: false,
          log: { level: 'error' }
        }, options));

        return WithUser(workflow, {});
      });
  },

  destroy: () => {
    return knex.destroy();
  },

  resetDBs: () => {
    return Promise.resolve()
      .then(() => tfdb.reset())
      .then(() => aslDb(settings.db).init(fixtures.default));
  },

  seedTaskList: () => {
    return Promise.resolve()
      .then(() => tfdb.seed());
  }
};
