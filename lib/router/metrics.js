const { Router } = require('express');
const moment = require('moment');
const Case = require('@ukhomeoffice/taskflow/lib/models/case');
const { get } = require('lodash');
const { withASRU } = require('../flow');
const completeAndCorrect = require('../decorators/deadline/complete-and-correct');
const getDeadline = require('../decorators/deadline/get-deadline');

module.exports = (taskflow, settings) => {
  const router = Router({ mergeParams: true });

  Case.db(taskflow.db);

  const { Establishment, PIL, Project } = settings.models;

  const getTasks = since => {
    return Promise.resolve()
      .then(() => {
        return Case.query()
          .eager('[activityLog]')
          .modifyEager('[activityLog]', builder => {
            builder.select('eventName').where('eventName', 'ilike', 'status:%:returned-to-applicant');
          })
          .where('updated_at', '>', since)
          .where({ status: 'resolved' });
      })
      // exclude ASRU TEST
      .then(cases => {
        return cases.filter(c => c.data.establishmentId !== 1502162);
      })
      .then(cases => {
        return cases.map(c => {
          let type = `${c.data.model}-${c.data.action}`;
          let schemaVersion;
          if (['pil', 'project'].includes(c.data.model) && c.data.action === 'grant') {
            const isAmendment = get(c, 'data.modelData.status') === 'active';
            type = `${c.data.model}-${isAmendment ? 'amendment' : 'application'}`;
          }
          if (c.data.model === 'project') {
            schemaVersion = get(c, 'data.modelData.schemaVersion');
          }
          const iterations = c.activityLog.length + 1;
          return { type, iterations, schemaVersion };
        });
      });
  };

  const getLicenceCounts = () => {
    const models = [Establishment, Project, PIL];
    const queries = models.map(model => {
      return model.query().count('*').where({ status: 'active' })
        .then(result => result[0].count);
    });
    return Promise.all(queries)
      .then(([ establishments, projects, pils ]) => ({ establishments, projects, pils }));
  };

  const getProjectsOutsideSLA = since => {
    return Promise.resolve()
      .then(() => {
        return Case.query()
          .eager('[activityLog]')
          .modifyEager('[activityLog]', builder => {
            builder
              .select('eventName', 'createdAt')
              .where('eventName', 'ilike', 'status:%:with-inspectorate');
          })
          // only load PPL applications
          .whereJsonSupersetOf('data', { model: 'project', action: 'grant', modelData: { status: 'inactive' } })
          // find things that might have a deadline in the relevant time period
          .where('updated_at', '>', moment(since).subtract(12, 'weeks').format('YYYY-MM-DD'))
          // only tasks currently with ASRU or closed by ASRU can have passed a deadline
          .whereIn('status', [ ...withASRU(), 'resolved', 'rejected' ]);
      })
      .then(tasks => {
        return tasks.filter(task => {
          if (!completeAndCorrect(task)) {
            return false;
          }
          const deadline = getDeadline(task);
          if (withASRU().includes(task.status)) {
            // if task is open then check if the deadline has passed
            return deadline.isBefore(moment()) && deadline.isAfter(since);
          }
          // otherwise check if the deadline had passed when it was closed
          return deadline.isBefore(task.updatedAt) && deadline.isAfter(since);
        });
      })
      .then(tasks => tasks.length);
  };

  router.use((req, res, next) => {
    req.since = req.query.since || moment().subtract(2, 'weeks').format('YYYY-MM-DD');
    next();
  });

  router.get('/', (req, res, next) => {
    return Promise.all([getTasks(req.since), getLicenceCounts(), getProjectsOutsideSLA(req.since)])
      .then(([tasks, counts, projectsOutsideSLA]) => {
        return res.json({ tasks, counts, projectsOutsideSLA });
      })
      .catch(next);
  });

  return router;
};
