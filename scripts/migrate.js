const Taskflow = require('@ukhomeoffice/taskflow');
const dbConfig = require('../knexfile');

const taskflowDB = process.env.NODE_ENV === 'test' ? dbConfig.test.connection : dbConfig.development.connection;

Taskflow({ db: taskflowDB }).migrate();
