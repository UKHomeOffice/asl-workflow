const Case = require('@ukhomeoffice/taskflow/lib/models/case');

const { Router } = require('express');
const router = Router({ mergeParams: true });
const queryBuilder = require('../query-builders');

module.exports = (taskflow) => {
  Case.db(taskflow.db);

  router.get('/', (req, res, next) => {
    Promise.resolve()
      .then(() => {
        const profile = req.user.profile;
        return queryBuilder({ profile, ...req.query });
      })
      .then(cases => {
        const send = taskflow.responder(req, res);
        return send(cases.results, { count: cases.total });
      })
      .catch(next);
  });

  return router;
};
