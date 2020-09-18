const { get, isUndefined } = require('lodash');
const { Task } = require('@ukhomeoffice/taskflow');

const { filterToEstablishments, isTrainingPilAtOtherEstablishment } = require('./filter-to-establishments');
const filterByLicenceType = require('./filter-by-licence');

const userHasNamedRole = (role, profile) => (profile.roles || []).some(r => r.type === role);
const userHasPermission = (role, profile) => (profile.establishments || []).some(e => e.role === role);

const applicant = require('./applicant');
const ntco = require('./ntco');
const endorsePPL = require('./endorse-ppl');
const admin = require('./admin');

const licensing = require('./licensing-officer');
const inspector = require('./inspector');
const asru = require('./asru');

const progressStates = [
  'myTasks',
  'outstanding',
  'inProgress',
  'completed'
];

const buildQuery = (progress, profile, filters) => {
  const userIsNtco = userHasNamedRole('ntco', profile);
  const userIsAdmin = userHasPermission('admin', profile);

  const addQueryClause = (q, type) => {
    if (typeof type[progress] === 'function') {
      q.orWhere(builder => type[progress](builder, profile));
    }
  };

  let query = Task.query();

  const licenceType = get(filters, 'licence[0]');

  if (licenceType) {
    query.andWhere(filterByLicenceType(licenceType));
  }

  if (!profile.asruUser) {
    query.andWhere(builder => {
      const establishments = profile.establishments.filter(e => e.role !== 'blocked').map(e => e.id);
      // make sure we only return tasks where the user is currently associated with the establishment
      // (except for profile tasks which don't have an association)
      builder
        .whereJsonSupersetOf('data', { model: 'profile' })
        .orWhere(builder => {
          builder
            .where(filterToEstablishments(establishments))
            .orWhere(isTrainingPilAtOtherEstablishment(establishments));
        });
    });
  }

  query.where(builder => {
    addQueryClause(builder, applicant);

    if (profile.asruUser) {
      if (profile.asruLicensing) {
        addQueryClause(builder, licensing);
      }
      if (profile.asruInspector) {
        addQueryClause(builder, inspector);
      }
      if (!profile.asruLicensing && !profile.asruInspector) {
        addQueryClause(builder, asru);
      }
    } else {
      if (userIsNtco) {
        addQueryClause(builder, ntco);
      }
      if (userIsAdmin) {
        addQueryClause(builder, admin);
        addQueryClause(builder, endorsePPL);
      }
    }
  });

  return query;
};

module.exports = ({ profile, sort = { column: 'updatedAt' }, limit, offset, filters, progress = 'outstanding' }) => {

  if (!profile || !progressStates.includes(progress)) {
    return {
      results: [],
      count: 0,
      total: () => Promise.resolve(0)
    };
  }

  if (isUndefined(sort.ascending) && sort.column === 'updatedAt') {
    sort.ascending = profile.asruUser ? ['myTasks', 'outstanding'].includes(progress) : false;
  }

  let query = buildQuery(progress, profile, filters);
  query = Task.orderBy({ query, sort });
  query = Task.paginate({ query, limit, offset });

  query.total = () => {
    return buildQuery(progress, profile).count()
      .then(result => parseInt(result[0].count, 10));
  };

  return query;

};
