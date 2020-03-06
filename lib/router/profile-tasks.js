const filterToEstablishments = require('../query-builders/filter-to-establishments');
const { open } = require('../flow');

const { Router } = require('express');
const router = Router({ mergeParams: true });

module.exports = (taskflow) => {
  const Task = taskflow.Task;

  router.get('/:profileId', (req, res, next) => {
    const { profileId } = req.params;
    const { establishmentId, all, sort, limit, offset } = req.query;
    const send = taskflow.responder(req, res);
    let query = Task.query()
      .where(builder => {
        builder
          .whereJsonSupersetOf('data', { subject: profileId })
          .orWhereJsonSupersetOf('data', { changedBy: profileId });
      })
      .where(builder => {
        if (establishmentId) {
          filterToEstablishments([parseInt(establishmentId, 10)])(builder);
        }
      })
      .where(builder => {
        if (all !== 'true') {
          builder.whereIn('status', open());
        } else {
          builder.whereNot('status', 'autoresolved');
        }
      });

    query = Task.orderBy({ query, sort });
    query = Task.paginate({ query, limit, offset });

    Promise.resolve()
      .then(() => query)
      .then((results) => {
        send(results.results, { count: results.total });
      })
      .catch(next);
  });

  return router;
};
