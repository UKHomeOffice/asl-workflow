const { get } = require('lodash');

function canEndorse(task) {
  const type = get(task, 'data.model');
  const profile = get(task, 'meta.user.profile');
  const establishmentId = get(task, 'data.establishmentId');

  switch (type) {
    case 'pil':
      return !!profile.roles.find(role => role.establishmentId === establishmentId && role.type === 'ntco');
    case 'project':
      return profile.establishments.find(e => e.id === establishmentId).role === 'admin';
    default:
      return false;
  }
}

function getEstablishmentsWhereUserIsRole(role, profile) {
  return profile.roles.filter(r => r.type === role).map(r => r.establishmentId);
}

function getEstablishmentsWhereUserCanEndorsePPL(profile) {
  return profile.establishments.map(e => (e.role === 'admin') ? e.id : null);
}

module.exports = {
  canEndorse,
  getEstablishmentsWhereUserIsRole,
  getEstablishmentsWhereUserCanEndorsePPL
};
