const Case = require('@ukhomeoffice/taskflow/lib/models/case');
const filterToEstablishments = require('../query-builders/filter-to-establishments');
const { open } = require('../flow');

const { Router } = require('express');
const router = Router({ mergeParams: true });

module.exports = (taskflow) => {
  Case.db(taskflow.db);

  router.get('/:profileId/:establishmentId?', (req, res, next) => {
    const { profileId, establishmentId } = req.params;
    const send = taskflow.responder(req, res);
    Promise.resolve()
      .then(() => {
        return Case.query()
          .whereJsonSupersetOf('data', { subject: profileId })
          .where(builder => {
            if (establishmentId) {
              filterToEstablishments([establishmentId])(builder);
            }
          })
          .whereIn('status', open());
      })
      .then(send)
      .catch(next);
  });

  return router;
};
