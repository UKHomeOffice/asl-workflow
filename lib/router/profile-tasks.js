const Case = require('@ukhomeoffice/taskflow/lib/models/case');
const { open } = require('../flow');

const { Router } = require('express');
const router = Router({ mergeParams: true });

module.exports = (taskflow) => {
  Case.db(taskflow.db);

  router.get('/:profileId/:establishmentId?', (req, res, next) => {
    const { profileId, establishmentId } = req.params;
    console.log({establishmentId});
    console.log({profileId});
    const send = taskflow.responder(req, res);
    Promise.resolve()
      .then(() => {
        return Case.query()
          .whereJsonSupersetOf('data', { subject: profileId })
          .where(builder => {
            if (establishmentId) {
              builder.whereJsonSupersetOf('data', { establishmentId });
            }
          })
          .whereIn('status', open());
      })
      .then(send)
      .catch(next);
  });

  return router;
};
