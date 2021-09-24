const config = require('../../config');
module.exports = {
  ...config,
  db: {
    host: process.env.ASL_DATABASE_HOST || 'localhost',
    database: process.env.ASL_DATABASE_NAME || 'asl-test',
    user: process.env.ASL_DATABASE_USERNAME || 'postgres',
    password: process.env.ASL_DATABASE_PASSWORD || 'test-password'
  },
  taskflowDB: {
    host: process.env.DATABASE_HOST || 'localhost',
    database: process.env.DATABASE_NAME || 'taskflow-test',
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'test-password'
  }
};
