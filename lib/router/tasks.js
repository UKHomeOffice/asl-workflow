const Case = require('@ukhomeoffice/taskflow/lib/models/case');
const { Router } = require('express');
const router = Router({ mergeParams: true });
const { applicant, ntco } = require('../query-builders');

const userHasRole = (role, profile) => profile.roles.some(r => r.type === role);

module.exports = (taskflow) => {
  Case.db(taskflow.db);

  router.get('/', (req, res, next) => {
    Promise.resolve()
      .then(() => {
        const profile = req.user.profile;
        const userIsNtco = userHasRole('ntco', profile);
        let query = Case.query();

        req.query.progress = req.query.progress || 'outstanding';

        switch (req.query.progress) {
          case 'outstanding':
            query.orWhere(builder => applicant.outstanding(builder, profile));

            if (userIsNtco) {
              query.orWhere(builder => ntco.outstanding(builder, profile));
            }
            break;

          case 'in-progress':
            query.orWhere(builder => applicant.inProgress(builder, profile));

            if (userIsNtco) {
              query.orWhere(builder => ntco.inProgress(builder, profile));
            }
            break;

          case 'completed':
            query.orWhere(builder => applicant.completed(builder, profile));

            if (userIsNtco) {
              query.orWhere(builder => ntco.completed(builder, profile));
            }
            break;
        }

        query = Case.orderBy({ query, sort: req.query.sort });
        query = Case.paginate({ query, ...req.query });

        console.log(query.toString());

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
