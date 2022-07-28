const { Router } = require('express');
const router = Router({ mergeParams: true });
const queryBuilder = require('../query-builders');

module.exports = (taskflow, settings) => {

  router.get('/', (req, res, next) => {
    const start = process.hrtime();

    Promise.resolve()
      .then(() => {
        const profile = req.user.profile;
        const query = queryBuilder({ profile, ...req.query });
        return Promise.all([query, query.total()]);
      })
      .then(([ result, totalCount ]) => ({ ...result, totalCount }))
      .then(cases => {
        const end = process.hrtime(start);
        req.log('info', `task-list query took ${(end[0] * 1000) + Math.round(end[1] / 1e6)}ms`);
        const send = taskflow.responder(req, res);
        return send(cases.results, { count: cases.total, total: cases.totalCount });
      })
      .catch(next);
  });

  return router;
};
