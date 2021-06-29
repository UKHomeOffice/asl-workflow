const { get } = require('lodash');
const { resolved, withInspectorate } = require('../../flow/status');

module.exports = settings => {
  return model => {
    const changedBy = get(model, 'data.changedBy');
    const { Role, Profile } = settings.models;

    const getRole = () => {
      const action = get(model, 'data.action');
      const id = get(model, 'data.id');
      if (action === 'delete') {
        return Role.query().findById(id).then(role => role.type);
      }
      return Promise.resolve(get(model, 'data.data.type'));
    };

    return getRole()
      .then(role => {
        if (role === 'holc') {
          return model.setStatus(resolved.id);
        }
        return Profile.query().findById(changedBy)
          .then(profile => {
            if (profile.asruUser && profile.asruInspector) {
              return model.setStatus(resolved.id);
            }
            return model.setStatus(withInspectorate.id);
          });
      });
  };
};
