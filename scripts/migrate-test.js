/* eslint-disable implicit-dependencies/no-implicit */
const knex = require('knex');
const Taskflow = require('@ukhomeoffice/asl-taskflow');
const dbConfig = require('../knexfile');

const migrate = () => {
  return Promise.resolve()
    .then(() => {
      console.log('migrate taskflow test db');
      return Taskflow({ db: dbConfig.test.connection }).migrate();
    })
    .then(() => {
      console.log('migrate asl test db');
      process.chdir('./node_modules/@asl/schema');
      return knex(dbConfig.asl.test).migrate.latest();
    });
};

migrate()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  });
