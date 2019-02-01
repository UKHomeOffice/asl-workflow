const { Router } = require('express');
const Case = require('@ukhomeoffice/taskflow/lib/models/case');
const { closed } = require('../flow');

module.exports = taskflow => {
  const router = Router({ mergeParams: true });

  Case.db(taskflow.db);

  router.param('modelId', (req, res, next, modelId) => {
    req.modelId = modelId;
    next();
  });

  router.get('/:modelId', (req, res, next) => {
    Promise.resolve()
      .then(() => {
        return Case.query()
          .whereJsonSupersetOf('data', { id: req.modelId })
          .whereNotIn('status', closed());
      })
      .then(cases => {
        const send = taskflow.responder(req, res);
        return send(cases, { count: cases.length });
      })
      .catch(next);
  });

  return router;
};
