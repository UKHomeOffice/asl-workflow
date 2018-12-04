const Case = require('@ukhomeoffice/taskflow/lib/db/case');
const ActivityLog = require('@ukhomeoffice/taskflow/lib/db/activity-log');
const Database = require('@ukhomeoffice/taskflow/lib/db');

module.exports = taskflowDBConfig => {
  return Promise.resolve()
    .then(() => {
      const db = Database.connect(taskflowDBConfig);
      return Promise.resolve()
        .then(() => ActivityLog.query(db).delete())
        .then(() => Case.query(db).delete());
    });
};
