const { isUndefined } = require('lodash');
const { Router } = require('express');
const router = Router({ mergeParams: true });

const { BadRequestError, UnauthorisedError } = require('@asl/service/errors');
const { open, closed } = require('../flow');
const { autoResolved, discardedByApplicant } = require('../flow/status');
const { filterToEstablishments, isTrainingPilAtOtherEstablishment } = require('../query-builders/filter-to-establishments');
const selectActiveDeadline = require('../query-builders/select-active-deadline');

module.exports = taskflow => {
  const Task = taskflow.Task;

  const relatedTasksQuery = ({ user, model, modelId, action, establishmentId, onlyOpen, onlyClosed, sort = { column: 'updatedAt' }, limit, offset }) => {
    let query = Task.query();

    switch (model) {
      case 'establishment':
        // any changes to the establishment licence, including places and roles
        const id = parseInt(modelId, 10);

        query.whereJsonSupersetOf('data', { establishmentId: id });
        query.where(builder => {
          builder.whereJsonSupersetOf('data', { model: 'establishment' });
          builder.orWhereJsonSupersetOf('data', { model: 'place' });
          builder.orWhereJsonSupersetOf('data', { model: 'role' });
        });
        break;

      case 'profile-touched':
        // all tasks that have involved the profile
        // e.g. licence holder, application submitter, application endorsement, profile updates, role assignment
        query.where(builder => {
          builder
            .whereJsonSupersetOf('data', { subject: modelId })
            .orWhereJsonSupersetOf('data', { changedBy: modelId })
            .orWhereJsonSupersetOf('data', { id: modelId })
            .orWhereExists(
              Task.relatedQuery('activityLog').where('changedBy', modelId).where('eventName', '!=', 'assign')
            )
            .orWhere('assignedTo', modelId);
        });
        break;

      case 'profile-owned':
        // any tasks involving licences owned by the profile, profile updates or role assignment
        query.where(builder => {
          builder
            .whereJsonSupersetOf('data', { subject: modelId })
            .orWhereJsonSupersetOf('data', { id: modelId });
        });
        break;

      case 'project':
        query
          .where(builder => {
            builder
              .whereJsonSupersetOf('data', { id: modelId })
              .orWhere(builder => {
                builder
                  .whereJsonSupersetOf('data', { model: 'rop' })
                  .whereJsonSupersetOf('data:data', { projectId: modelId });
              });
          });

        break;

      case 'place':
      case 'profile':
      case 'pil':
        // changes to a specific model
        query.whereJsonSupersetOf('data', { id: modelId });
        break;

      case 'trainingCourse':
        query
          .whereJsonSupersetOf('data:data', { trainingCourseId: modelId })
          .whereJsonSupersetOf('data', { action })
          .whereNot('status', discardedByApplicant.id);
        break;

      default:
        throw new BadRequestError('model must be specified to fetch related tasks');
    }

    if (onlyOpen) {
      query.whereIn('status', open());
    } else if (onlyClosed) {
      query.where(builder => {
        builder
          .whereIn('status', closed())
          .andWhereNot('status', autoResolved.id);
      });
    } else {
      query.whereNot('status', autoResolved.id);
    }

    if (establishmentId) {
      query.andWhere(builder => {
        builder
          .whereJsonSupersetOf('data', { model: 'profile' })
          .orWhere(filterToEstablishments([establishmentId]))
          .orWhere(isTrainingPilAtOtherEstablishment([establishmentId]));
      });
    }

    if (!user.profile.asruUser) {
      query.andWhere(builder => {
        const establishments = user.profile.establishments.filter(e => e.role !== 'blocked').map(e => e.id);
        // make sure we only return tasks where the user is currently associated with the establishment
        // (except for profile tasks which don't have an association)
        builder
          .whereJsonSupersetOf('data', { model: 'profile' })
          .orWhere(filterToEstablishments(establishments))
          .orWhere(isTrainingPilAtOtherEstablishment(establishments));
      });
    }

    if (sort) {
      query = selectActiveDeadline(query);
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

  const checkPermissions = (user, query) => {
    let { model, modelId } = query;
    model = ['profile-touched', 'profile-owned'].includes(model) ? 'profile' : model;

    const params = {
      id: modelId,
      establishment: model === 'establishment' ? modelId : query.establishmentId
    };

    return user.can(`${model}.relatedTasks`, params)
      .then(allowed => {
        if (!allowed) {
          throw new UnauthorisedError(`you do not have permission to view related tasks for ${model}: ${modelId}`);
        }
      });
  };

  router.get('/', (req, res, next) => {
    const start = process.hrtime();
    const user = req.user;

    req.query.limit = req.query.limit || 5;
    req.query.offset = req.query.offset || 0;
    req.query.establishmentId = parseInt(req.query.establishmentId, 10) || undefined;
    req.query.onlyOpen = req.query.onlyOpen && req.query.onlyOpen.toLowerCase() === 'true';

    return Promise.resolve()
      .then(() => checkPermissions(user, req.query))
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
