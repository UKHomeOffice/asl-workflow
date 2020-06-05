const { Router } = require('express');
const { open } = require('../flow');

module.exports = taskflow => {
  const router = Router({ mergeParams: true });

  const Task = taskflow.Task;

  router.param('modelId', (req, res, next, modelId) => {
    req.modelId = /^\d+$/.test(modelId) ? parseInt(modelId, 10) : modelId;
    next();
  });

  router.get('/:modelId', (req, res, next) => {
    const start = process.hrtime();
    Promise.resolve()
      .then(() => {
        return Task.query().where(builder => {
          builder.whereJsonSupersetOf('data', { id: req.modelId });
          builder.orWhereJsonSupersetOf('data', { id: req.modelId.toString() });
        })
          .whereIn('status', open());
      })
      .then(cases => {
        const end = process.hrtime(start);
        req.log('info', `open-tasks query took ${(end[0] * 1000) + Math.round(end[1] / 1e6)}ms`);
        const send = taskflow.responder(req, res);
        return send(cases, { count: cases.length });
      })
      .catch(next);
  });

  return router;
};
