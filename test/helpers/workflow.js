const Workflow = require('../../lib/api');
const WithUser = require('./with-user');
const resetTaskflowDb = require('./taskflow-db');
const aslDb = require('./asl-db');
const config = require('../../config');
const fixtures = require('../data');

const settings = {
  ...config,
  db: {
    host: process.env.ASL_DATABASE_HOST || 'localhost',
    database: process.env.ASL_DATABASE_NAME || 'workflow-asl-test',
    user: process.env.ASL_DATABASE_USERNAME || 'postgres'
  },
  taskflowDB: {
    host: process.env.DATABASE_HOST || 'localhost',
    database: process.env.DATABASE_NAME || 'taskflow-test',
    user: process.env.DATABASE_USERNAME || 'postgres'
  }
};

module.exports = {
  create: (options = {}) => {
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
    // todo
  },

  resetDBs: () => {
    return Promise.resolve()
      .then(() => resetTaskflowDb(settings.taskflowDB))
      .then(() => aslDb(settings.db).init(fixtures.default));
  }
};
