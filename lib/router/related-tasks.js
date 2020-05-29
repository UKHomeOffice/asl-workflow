const { isUndefined } = require('lodash');
const { Router } = require('express');
const router = Router({ mergeParams: true });

const { BadRequestError, UnauthorisedError } = require('@asl/service/errors');
const { open } = require('../flow');
const { autoResolved } = require('../flow/status');
const filterToEstablishments = require('../query-builders/filter-to-establishments');

const isEstablishmentAdmin = (user, establishmentId) => {
  return !!(user.establishments || []).find(e => e.id === establishmentId && e.role === 'admin');
};

module.exports = taskflow => {
  const Task = taskflow.Task;

  const relatedTasksQuery = ({ user, model, modelId, establishmentId, onlyOpen, sort = { column: 'updatedAt' }, limit, offset }) => {
    let query = Task.query();

    switch (model) {
      case 'establishment':
        // any changes to the establishment licence, including places and roles
        const id = parseInt(modelId, 10);

        if (!user.asruUser && !isEstablishmentAdmin(user, id)) {
          throw new UnauthorisedError(`you do not have permission to view related tasks for establishment ${modelId}`);
        }

        query.whereJsonSupersetOf('data', { establishmentId: id });
        query.where(builder => {
          builder.whereJsonSupersetOf('data', { model: 'establishment' });
          builder.orWhereJsonSupersetOf('data', { model: 'place' });
          builder.orWhereJsonSupersetOf('data', { model: 'role' });
        });
        break;

      case 'place':
        // specific place changes only
        if (!user.asruUser && !isEstablishmentAdmin(user, establishmentId)) {
          throw new UnauthorisedError(`you do not have permission to view related tasks for establishment ${modelId}`);
        }
        query.whereJsonSupersetOf('data', { id: modelId });
        break;

      case 'profile':
        // profile changes only
        if (!user.asruUser && user.id !== modelId) {
          throw new UnauthorisedError(`you do not have permission to view related tasks for profile ${modelId}`);
        }
        query.whereJsonSupersetOf('data', { id: modelId });
        break;

      case 'profile-touched':
        // any tasks that have involved the profile (e.g. licence holder, application submitter, profile update, role assignment)
        if (!user.asruUser && user.id !== modelId && !isEstablishmentAdmin(user, establishmentId)) {
          throw new UnauthorisedError(`you do not have permission to view related tasks for profile ${modelId}`);
        }
        // seems fine locally but possibly slow with lots of tasks - might be worth monitoring query time in the logs
        query.whereRaw('cases.data::text LIKE ?', [`%${modelId}%`]);
        break;

      case 'pil':
        query.whereJsonSupersetOf('data', { id: modelId });

        if (!user.asruUser && !isEstablishmentAdmin(user, establishmentId)) {
          query.whereJsonSupersetOf('data', { subject: user.id }); // limit to own PIL
        }
        break;

      case 'project':
        query.whereJsonSupersetOf('data', { id: modelId });

        if (!user.asruUser && !isEstablishmentAdmin(user, establishmentId)) {
          query.whereJsonSupersetOf('data', { subject: user.id }); // limit to own projects
        }
        break;

      default:
        throw new BadRequestError('model must be specified to fetch related tasks');
    }

    if (onlyOpen) {
      query.whereIn('status', open());
    } else {
      query.whereNot('status', autoResolved.id);
    }

    if (establishmentId) {
      query.andWhere(builder => {
        builder
          .whereJsonSupersetOf('data', { model: 'profile' })
          .orWhere(filterToEstablishments([establishmentId]));
      });
    }

    if (!user.asruUser) {
      query.andWhere(builder => {
        const establishments = user.establishments.filter(e => e.role !== 'blocked').map(e => e.id);
        // make sure we only return tasks where the user is currently associated with the establishment
        // (except for profile tasks which don't have an association)
        builder
          .whereJsonSupersetOf('data', { model: 'profile' })
          .orWhere(filterToEstablishments(establishments));
      });
    }

    if (sort) {
      if (isUndefined(sort.ascending) && sort.column === 'updatedAt') {
        sort.ascending = false;
      }
      query = Task.orderBy({ query, sort });
    }

    if (limit) {
      query = Task.paginate({ query, limit, offset });
    }

    return query;
  };

  router.get('/', (req, res, next) => {
    const start = process.hrtime();
    const user = req.user.profile;

    req.query.limit = req.query.limit || 5;
    req.query.offset = req.query.offset || 0;
    req.query.establishmentId = parseInt(req.query.establishmentId, 10) || undefined;
    req.query.onlyOpen = req.query.onlyOpen && req.query.onlyOpen.toLowerCase() === 'true';

    return Promise.resolve()
      .then(() => {
        const query = relatedTasksQuery({ user, ...req.query });
        const totalQuery = relatedTasksQuery({ user, ...req.query, sort: false, limit: false }).count();
        const totalCount = totalQuery.then(result => parseInt(result[0].count, 10));
        return Promise.all([query, totalCount]);
      })
      .then(([ result, totalCount ]) => ({ ...result, totalCount }))
      .then(cases => {
        const end = process.hrtime(start);
        req.log('info', `related-tasks query took ${(end[0] * 1000) + Math.round(end[1] / 1e6)}ms`);
        const send = taskflow.responder(req, res);
        return send(cases.results, { count: cases.total, total: cases.totalCount });
      })
      .catch(next);
  });

  return router;
};
