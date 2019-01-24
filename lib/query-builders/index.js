const Case = require('@ukhomeoffice/taskflow/lib/models/case');

const userHasNamedRole = (role, profile) => profile.roles.some(r => r.type === role);
const userHasPermission = (role, profile) => profile.establishments.some(e => e.role === role);

const applicant = require('./applicant');
const ntco = require('./ntco');
const admin = require('./admin');

const licensing = require('./licensing-officer');
const inspector = require('./inspector');
const asru = require('./asru');

module.exports = ({ profile, sort, limit, offset, progress = 'outstanding' }) => {

  const userIsNtco = userHasNamedRole('ntco', profile);
  const userIsAdmin = userHasPermission('admin', profile);

  const addQueryClause = (q, type) => {
    if (typeof type[progress] !== 'function') {
      return q;
    }
    return q.orWhere(builder => type[progress](builder, profile));
  };

  let query = addQueryClause(Case.query(), applicant);

  if (profile.asruUser) {
    if (profile.asruLicensing) {
      query = addQueryClause(query, licensing);
    }
    if (profile.asruInspector) {
      query = addQueryClause(query, inspector);
    }
    if (!profile.asruLicensing && !profile.asruInspector) {
      query = addQueryClause(query, asru);
    }
  } else {
    if (userIsNtco) {
      query = addQueryClause(query, ntco);
    }
    if (userIsAdmin) {
      query = addQueryClause(query, admin);
    }
  }

  query = Case.orderBy({ query, sort });
  query = Case.paginate({ query, limit, offset });

  return query;

};
