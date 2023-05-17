const { Router } = require('express');
const moment = require('moment');
const { get, isUndefined } = require('lodash');
const router = Router({ mergeParams: true });

const { BadRequestError, NotFoundError } = require('@asl/service/errors');
const { Task } = require('@ukhomeoffice/asl-taskflow');
const { filterToEstablishments } = require('../query-builders/filter-to-establishments');
const {
  filterByAction,
  filterByIsAmendment,
  filterByModel,
  filterBySchemaVersion,
  filterByInitiator
} = require('../query-builders/filters');

const buildQuery = filters => {
  const {
    status = 'resolved',
    start = '2019-07-01',
    end = new Date(),
    model,
    action,
    establishment,
    initiatedBy,
    isAmendment,
    schemaVersion
  } = filters;

  const query = Task.query()
    .where({ status })
    .andWhere('updatedAt', '>', moment(start).startOf('day').toISOString())
    .andWhere('updatedAt', '<', moment(end).endOf('day').toISOString())
    .whereRaw(`(data->>'establishmentId' != '1502162' or data->>'establishmentId' is null)`);

  if (model) {
    query.andWhere(filterByModel(model));
  }

  if (action) {
    query.andWhere(filterByAction(action));
  }

  if (initiatedBy) {
    query.andWhere(filterByInitiator(initiatedBy));
  }

  if (!isUndefined(isAmendment)) {
    query.andWhere(filterByIsAmendment(isAmendment));
  }

  if (establishment) {
    query.andWhere(filterToEstablishments([parseInt(establishment, 10)]));
  }

  if (!isUndefined(schemaVersion)) {
    query.andWhere(filterBySchemaVersion(schemaVersion));
  }

  return query;
};

const checkPermissions = (user, query) => {
  if (!user.profile.asruUser) {
    const establishment = get(query, 'filters.establishment');
    if (!establishment) {
      throw new BadRequestError('establishment must be provided for non-ASRU users');
    }
    if (!user.profile.establishments.some(est => est.id === establishment)) {
      throw new NotFoundError();
    }
  }
};

module.exports = (taskflow) => {

  router.get('/', (req, res, next) => {
    const start = process.hrtime();

    Promise.resolve()
      .then(() => checkPermissions(req.user, req.query))
      .then(() => {
        const { sort = { column: 'updatedAt', ascending: true }, filters = {}, limit, offset } = req.query;

        let query = buildQuery(filters);
        query = Task.orderBy({ query, sort });
        query = Task.paginate({ query, limit, offset });

        req.log('debug', { filters });
        req.log('debug', { sql: query.toKnexQuery().toString() });

        const totalQuery = buildQuery(filters).count();
        const totalCount = totalQuery.then(result => parseInt(result[0].count, 10));

        return Promise.all([query, totalCount]);
      })
      .then(([ data, totalCount ]) => {
        const end = process.hrtime(start);
        req.log('info', `filtered-tasks query took ${(end[0] * 1000) + Math.round(end[1] / 1e6)}ms`);
        const send = taskflow.responder(req, res);
        return send(data.results, { count: data.total, total: totalCount });
      })
      .catch(next);
  });

  return router;
};
