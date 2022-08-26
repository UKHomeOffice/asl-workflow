const { get, every } = require('lodash');
const { BadRequestError } = require('@asl/service/errors');
const { autoResolved, withInspectorate, resolved } = require('../../flow/status');

module.exports = settings => {
  const { Profile, Establishment } = settings.models;

  return model => {
    const changedBy = get(model, 'data.changedBy');
    const action = get(model, 'data.action');
    const data = get(model, 'data.data');

    switch (action) {
      case 'create':
        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {
            if (!profile.asruUser) {
              throw new BadRequestError('Only ASRU users can create establishments');
            }
            return model.setStatus(autoResolved.id);
          });

      case 'update-conditions':
        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {
            if (!profile.asruUser) {
              throw new BadRequestError('Only ASRU users can update licence conditions');
            }
            return profile;
          })
          .then(profile => {
            if (profile.asruUser && profile.asruInspector) {
              return model.setStatus(resolved.id);
            } else {
              return model.setStatus(withInspectorate.id);
            }
          });

      case 'update':
        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {
            if (profile.asruUser) {
              const onlyUnlicensed = every(Object.keys(data), key => Establishment.unlicensed.includes(key));
              if (onlyUnlicensed) {
                return model.setStatus(autoResolved.id);
              }
              if (profile.asruInspector) {
                return model.setStatus(resolved.id);
              }
            }
            return model.setStatus(withInspectorate.id);
          });

      case 'update-billing':
        return model.setStatus(autoResolved.id);

      case 'grant':
        return model.setStatus(withInspectorate.id);

      case 'suspend':
      case 'reinstate':
        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {
            if (!profile.asruUser || !profile.asruInspector) {
              throw new BadRequestError('Only inspectors can suspend / reinstate licences');
            }
            // licence suspensions / reinstatements are instantly resolved
            return model.setStatus(resolved.id);
          });

      case 'revoke':
        return Promise.resolve()
          .then(() => Profile.query().findById(changedBy))
          .then(profile => {
            if (profile.asruUser && profile.asruInspector) {
              return model.setStatus(resolved.id);
            }
            throw new BadRequestError('Only ASRU inspectors can revoke establishments');
          });

      default:
        return model.setStatus(withInspectorate.id);
    }
  };
};
