/* eslint-disable implicit-dependencies/no-implicit */
const knex = require('knex');
const Taskflow = require('@ukhomeoffice/taskflow');
const dbConfig = require('../knexfile');

const migrate = () => {
  return Promise.resolve()
    .then(() => Taskflow({ db: dbConfig.test.connection }).migrate())
    .then(() => {
      process.chdir('./node_modules/@asl/schema');
      return knex(dbConfig.asl.test).migrate.latest();
    })
    .catch(err => {
      console.log(err);
      process.exit(1);
    });
};

migrate();
