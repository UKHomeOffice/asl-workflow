const { Router } = require('express');
const moment = require('moment');
const Case = require('@ukhomeoffice/taskflow/lib/models/case');

const tasks = require('./tasks');
const licenceCounts = require('./licence-counts');
const projectSLA = require('./project-sla');

module.exports = (taskflow, settings) => {
  const router = Router({ mergeParams: true });

  Case.db(taskflow.db);

  const getTasks = tasks(Case, settings);
  const getLicenceCounts = licenceCounts(Case, settings);
  const getProjectsOutsideSLA = projectSLA(Case, settings);

  router.use((req, res, next) => {
    req.since = req.query.since || moment().subtract(2, 'weeks').format('YYYY-MM-DD');
    next();
  });

  router.get('/', (req, res, next) => {
    const calls = [
      getTasks(req.since),
      getLicenceCounts(),
      getProjectsOutsideSLA(req.since)
    ];
    return Promise.all(calls)
      .then(([tasks, counts, projectsOutsideSLA]) => {
        return res.json({ tasks, counts, projectsOutsideSLA });
      })
      .catch(next);
  });

  return router;
};
