const { get, pick } = require('lodash');

// metadata applied at the resolution of a task
module.exports = settings => {
  const { Role } = settings.models;

  return model => {
    const type = get(model, 'data.model');
    const action = get(model, 'data.action');

    if (type === 'role' && action === 'delete') {
      const id = get(model, 'data.id');
      const establishmentId = get(model, 'data.modelData.establishmentId');
      const type = get(model, 'data.modelData.type');
      const meta = get(model, 'data.meta', {});

      return Promise.resolve()
        .then(() => Role.query().where({ establishmentId, type }).whereNot({ id }).withGraphFetched('profile'))
        .then(roles => {
          meta.remainingRoles = roles
            .sort((a, b) => a.profile.lastName <= b.profile.lastName ? -1 : 1)
            .map(r => ({
              ...pick(r, ['id', 'type']),
              profile: pick(r.profile, ['id', 'firstName', 'lastName'])
            }));

          return model.patch({ meta });
        });
    }

    return Promise.resolve();
  };
};
