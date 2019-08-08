const { get } = require('lodash');
const { autoResolved, withInspectorate } = require('../../flow/status');

module.exports = settings => {
  return model => {

    const { Role } = settings.models;

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
          return model.setStatus(autoResolved.id);
        }
        return model.setStatus(withInspectorate.id);
      });

  };
};
