const Case = require('@ukhomeoffice/taskflow/lib/models/case');
const { Router } = require('express');
const router = Router({ mergeParams: true });
const queryBuilders = require('../query-builders');

module.exports = (taskflow) => {
  Case.db(taskflow.db);

  router.get('/', (req, res, next) => {
    Promise.resolve()
      .then(() => {
        const profile = req.user.profile;
        const userRoles = profile.roles.map(r => r.type);
        let query = Case.query();

        req.query.progress = req.query.progress || 'outstanding';

        switch (req.query.progress) {
          case 'outstanding':
            query.orWhere(builder => queryBuilders.applicant.outstanding(builder, profile));

            userRoles.map(role => {
              query.orWhere(builder => queryBuilders[role].outstanding(builder, profile));
            });
            break;

          case 'in-progress':
            query.orWhere(builder => queryBuilders.applicant.inProgress(builder, profile));

            userRoles.map(role => {
              query.orWhere(builder => queryBuilders[role].inProgress(builder, profile));
            });
            break;

          case 'completed':
            query.orWhere(builder => queryBuilders.applicant.completed(builder, profile));

            userRoles.map(role => {
              query.orWhere(builder => queryBuilders[role].completed(builder, profile));
            });
            break;
        }

        query = Case.orderBy({ query, sort: req.query.sort });
        query = Case.paginate({ query, ...req.query });

        // console.log(query.toString());

        return query;
      })
      .then(cases => {
        const send = taskflow.responder(req, res);
        return send(cases.results, { count: cases.total });
      })
      .catch(next);
  });

  return router;
};
