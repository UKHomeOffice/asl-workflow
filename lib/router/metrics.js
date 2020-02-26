const { Router } = require('express');
const moment = require('moment');
const Case = require('@ukhomeoffice/taskflow/lib/models/case');
const { get } = require('lodash');

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

  router.use((req, res, next) => {
    req.since = req.query.since || moment().subtract(2, 'weeks').format('YYYY-MM-DD');
    next();
  });

  router.get('/', (req, res, next) => {
    return Promise.all([getTasks(req.since), getLicenceCounts()])
      .then(([tasks, counts]) => {
        return res.json({ tasks, counts });
      })
      .catch(next);
  });

  return router;
};
