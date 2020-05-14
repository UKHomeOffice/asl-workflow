const { get, omit } = require('lodash');
const { diff } = require('deep-diff');
const { autoResolved, withInspectorate, withLicensing } = require('../../flow/status');

const normalize = (path, key, lhs, rhs) => {
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
};

const onlyRolesChanged = model => {
  const currentModel = get(model, 'data.modelData');
  const data = get(model, 'data.data');

  const oldValues = omit(currentModel, ['id', 'deleted', 'createdAt', 'updatedAt', 'nacwoId', 'migratedId']);
  const newValues = omit(data, ['roles']);
  const changes = diff(oldValues, newValues, { normalize });

  return !changes;
};

module.exports = settings => {
  return model => {
    const changedBy = get(model, 'data.changedBy');
    const action = get(model, 'data.action');

    const { Profile } = settings.models;

    return Promise.resolve()
      .then(() => Profile.query().findById(changedBy))
      .then(profile => {
        if (profile.asruUser && profile.asruLicensing) {
          return model.setStatus(autoResolved.id);
        }

        if (action === 'update' && onlyRolesChanged(model)) {
          return model.setStatus(autoResolved.id);
        }

        if (profile.asruUser) {
          return model.setStatus(withLicensing.id);
        }
        return model.setStatus(withInspectorate.id);
      });
  };
};
