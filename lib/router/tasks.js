const Case = require('@ukhomeoffice/taskflow/lib/models/case');
const { Router } = require('express');
const router = Router({ mergeParams: true });

const roleQueryBuilders = {
  applicant: require('../query-builders/applicant'),
  ntco: require('../query-builders/ntco')
};

module.exports = (settings, taskflow) => {
  const { Profile } = settings.models;
  Case.db(taskflow.db);

  router.get('/', (req, res, next) => {
    Promise.resolve()
      // todo: can we apply the eager fetch when req.user.profile is auto-set to avoid this?
      .then(() => Profile.query().findById(req.user.profile.id).eager('[establishments, roles]'))
      .then(profile => {
        let query = Case.query();

        const userRoles = profile.roles.map(r => r.type);

        switch (req.query.progress) {
          case 'outstanding':
            query.orWhere(builder => roleQueryBuilders.applicant.outstanding(builder, profile));

            userRoles.map(role => {
              query.orWhere(builder => roleQueryBuilders[role].outstanding(builder, profile));
            });
            break;

          case 'in-progress':
            query.orWhere(builder => roleQueryBuilders.applicant.inProgress(builder, profile));

            userRoles.map(role => {
              query.orWhere(builder => roleQueryBuilders[role].inProgress(builder, profile));
            });
            break;

          case 'completed':
            query.orWhere(builder => roleQueryBuilders.applicant.completed(builder, profile));

            userRoles.map(role => {
              query.orWhere(builder => roleQueryBuilders[role].completed(builder, profile));
            });
            break;
        }

        query = Case.orderBy({ query, sort: req.query.sort });
        query = Case.paginate({ query, ...req.query });

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
