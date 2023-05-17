const { Router } = require('express');
const { get, omit, isEmpty } = require('lodash');
const { ref } = require('objection');
const router = Router({ mergeParams: true });
const moment = require('moment-business-time');
const { bankHolidays } = require('@ukhomeoffice/asl-constants');
const { UnauthorisedError } = require('@asl/service/errors');

// configure bank holidays
moment.updateLocale('en', { holidays: bankHolidays });

module.exports = taskflow => {
  const Task = taskflow.Task;

  const deadlinePassedQuery = ({ sort = { column: 'updatedAt' }, limit, offset }) => {
    let query = Task.query()
      .select(
        'cases.*',
        ref('data:deadlinePassedDate').castText().as('deadlinePassedDate'),
        ref('data:modelData.title').castText().as('projectTitle')
      )
      .where(ref('data:deadlinePassed').castBool(), true)
      .withGraphFetched('activityLog(orderByCreatedAt)')
      .modifiers({
        orderByCreatedAt(builder) {
          builder.orderBy('activityLog.createdAt', 'ASC');
        }
      });

    if (sort) {
      query = Task.orderBy({ query, sort });
    }

    if (limit) {
      query = Task.paginate({ query, limit, offset });
    }

    return query;
  };

  const checkPermissions = user => {
    if (!user.profile.asruUser || !user.profile.asruSupport) {
      throw new UnauthorisedError(`you do not have permission to view deadline passed tasks`);
    }
  };

  const getReasoning = task => {
    return task.activityLog.reduce((state, activity) => {
      const deadlinePassedReason = get(activity, 'event.data.meta.deadline-passed-reason');

      // we only care about the first deadline passed reason
      if (!state.reason.comment && deadlinePassedReason) {
        state.reason = {
          comment: deadlinePassedReason,
          updatedAt: activity.updatedAt,
          actionedBy: get(activity, 'event.meta.user.profile')
        };
      }

      const deadline = get(activity, 'event.data.deadline');

      if (deadline && deadline.exemption) {
        // we need to log the reason whenever the exempt status changes
        if (state.exemption.isExempt !== deadline.exemption.isExempt) {
          state.exemption.isExempt = deadline.exemption.isExempt;
          state.exemption.reasons.push({
            isExempt: deadline.exemption.isExempt,
            comment: deadline.exemption.reason,
            updatedAt: activity.updatedAt,
            actionedBy: get(activity, 'event.meta.user.profile')
          });
        }
      }
      return state;
    }, { reason: {}, exemption: { isExempt: false, reasons: [] } });
  };

  const decorate = cases => {
    cases.results = cases.results.map(task => {
      const reasoning = getReasoning(task);
      return {
        ...omit(task, 'activityLog'),
        reason: !isEmpty(reasoning.reason) ? reasoning.reason : null,
        isExempt: reasoning.exemption.isExempt,
        exemption: reasoning.exemption
      };
    });
    return cases;
  };

  router.get('/', (req, res, next) => {
    const start = process.hrtime();
    const user = req.user;

    req.query.limit = req.query.limit || 100;
    req.query.offset = req.query.offset || 0;

    return Promise.resolve()
      .then(() => checkPermissions(user))
      .then(() => {
        const query = deadlinePassedQuery({ ...req.query });
        const totalQuery = deadlinePassedQuery({ ...req.query, sort: false, limit: false }).groupBy('cases.id').count();
        const totalCount = totalQuery.then(result => result.length ? parseInt(result[0].count, 10) : 0);
        return Promise.all([query, totalCount]);
      })
      .then(([ result, totalCount ]) => ({ ...result, totalCount }))
      .then(cases => decorate(cases))
      .then(cases => {
        const end = process.hrtime(start);
        req.log('info', `deadline-passed query took ${(end[0] * 1000) + Math.round(end[1] / 1e6)}ms`);
        const send = taskflow.responder(req, res);
        return send(cases.results, { count: cases.total, total: cases.totalCount });
      })
      .catch(next);
  });

  return router;
};
