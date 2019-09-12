const { Router } = require('express');
const Case = require('@ukhomeoffice/taskflow/lib/models/case');
const { closed } = require('../flow');

module.exports = taskflow => {
  const router = Router({ mergeParams: true });

  Case.db(taskflow.db);

  router.param('modelId', (req, res, next, modelId) => {
    req.modelId = /^\d+$/.test(modelId) ? parseInt(modelId, 10) : modelId;
    next();
  });

  router.get('/:modelId', (req, res, next) => {
    const start = process.hrtime();
    Promise.resolve()
      .then(() => {
        return Case.query()
          .whereJsonSupersetOf('data', { id: req.modelId })
          .whereNotIn('status', closed());
      })
      .then(cases => {
        const end = process.hrtime(start);
        req.log('info', `model-tasks query took ${(end[0] * 1000) + Math.round(end[1] / 1e6)}ms`);
        const send = taskflow.responder(req, res);
        return send(cases, { count: cases.length });
      })
      .catch(next);
  });

  return router;
};
