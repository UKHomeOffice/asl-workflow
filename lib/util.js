const { get, omit } = require('lodash');
const { diff } = require('deep-diff');

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
  return profile.establishments.filter(e => e.role === 'admin').map(e => e.id);
}

function onlyRolesChanged(task) {
  function normalize(path, key, lhs, rhs) {
    // ignore array order
    if (key === 'holding' || key === 'suitability') {
      Array.isArray(lhs) && lhs.sort();
      Array.isArray(rhs) && rhs.sort();
      return [lhs, rhs];
    }

    // handle different falsy values (null, empty string, undefined)
    if (!lhs && !rhs) {
      return [undefined, undefined];
    }

    return false;
  }

  const model = get(task, 'data.model');

  if (model !== 'place') {
    return false;
  }

  const currentModel = get(task, 'data.modelData');
  const data = get(task, 'data.data');

  const oldValues = omit(currentModel, ['id', 'deleted', 'createdAt', 'updatedAt', 'nacwoId', 'migratedId', 'roles']);
  const newValues = omit(data, ['roles']);
  const changes = diff(oldValues, newValues, { normalize });

  return !changes;
}

module.exports = {
  canEndorse,
  onlyRolesChanged,
  getEstablishmentsWhereUserIsRole,
  getEstablishmentsWhereUserCanEndorsePPL
};
