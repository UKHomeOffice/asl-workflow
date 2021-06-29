const { get } = require('lodash');
const { onlyRolesChanged } = require('../../util');
const { resolved, withInspectorate } = require('../../flow/status');

module.exports = settings => {
  return model => {
    const changedBy = get(model, 'data.changedBy');
    const action = get(model, 'data.action');

    const { Profile } = settings.models;

    return Promise.resolve()
      .then(() => Profile.query().findById(changedBy))
      .then(profile => {
        if (profile.asruUser && profile.asruInspector) {
          return model.setStatus(resolved.id);
        }

        if (action === 'update' && onlyRolesChanged(model)) {
          return model.setStatus(resolved.id);
        }

        return model.setStatus(withInspectorate.id);
      });
  };
};
