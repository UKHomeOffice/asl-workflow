const { get, pick } = require('lodash');

module.exports = settings => {
  const { Certificate, PIL, Role } = settings.models;

  return model => {
    const type = get(model, 'data.model');
    const action = get(model, 'data.action');

    if (type === 'establishment' && action === 'update') {
      const establishmentId = get(model, 'data.modelData.id');
      const meta = get(model, 'data.meta', {});

      return Promise.resolve()
        .then(() => Role.query().where({ establishmentId }).whereIn('type', ['pelh', 'nprc']).withGraphFetched('profile'))
        .then(roles => {
          const rolesByType = roles.reduce((acc, role) => {
            return { ...acc, [role.type]: pick(role.profile, ['id', 'firstName', 'lastName']) };
          }, {});

          return model.patch({ meta: { ...meta, ...rolesByType } });
        });
    }

    if (type !== 'pil') {
      return Promise.resolve();
    }

    if (action === 'create') {
      return Promise.resolve();
    }

    const id = get(model, 'data.id');

    return Promise.resolve()
      .then(() => PIL.query().findById(id).select('profileId'))
      .then(pil => {
        const profileId = pil.profileId;
        return Certificate.query().where({ profileId });
      })
      .then(certificates => model.patch({ certificates }));
  };
};
