const Taskflow = require('@ukhomeoffice/asl-taskflow');
const config = require('../config');

const migrate = () => {
  return Promise.resolve()
    .then(() => Taskflow({ db: config.taskflowDB }).migrate())
    .catch(err => {
      console.log(err);
      process.exit(1);
    });
};

migrate();
