const { Router } = require('express');
const moment = require('moment');
const { isUndefined } = require('lodash');
const router = Router({ mergeParams: true });
const { Task } = require('@ukhomeoffice/taskflow');
const { filterToEstablishments } = require('../query-builders/filter-to-establishments');
const {
  filterByAction,
  filterByIsAmendment,
  filterByModel,
  filterBySchemaVersion,
  filterByInitiator
} = require('../query-builders/filters');

const util = require('util');

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
    .andWhere('updatedAt', '<', moment(end).endOf('day').toISOString());

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

module.exports = (taskflow) => {

  router.get('/', (req, res, next) => {
    const start = process.hrtime();

    Promise.resolve()
      .then(() => {
        console.log(util.inspect(req.query, false, null, true));
        const { sort = { column: 'updatedAt', ascending: true }, filters, limit, offset } = req.query;

        let query = buildQuery(filters);

        query = Task.orderBy({ query, sort });
        query = Task.paginate({ query, limit, offset });

        console.log(query.toKnexQuery().toString());
        return Promise.all([query]);
      })
      .then(([ result ]) => ({ ...result }))
      .then(cases => {
        const end = process.hrtime(start);
        req.log('info', `filtered-tasks query took ${(end[0] * 1000) + Math.round(end[1] / 1e6)}ms`);
        const send = taskflow.responder(req, res);
        return send(cases.results, { count: cases.total });
      })
      .catch(next);
  });

  return router;
};
