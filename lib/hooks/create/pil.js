const { get } = require('lodash');
const { BadRequestError } = require('@asl/service/errors');
const { autoResolved, awaitingEndorsement, withLicensing, resolved } = require('../../flow/status');
const { canEndorse } = require('../../util');

module.exports = settings => {
  const { PIL } = settings.models;
  return model => {
    const action = get(model, 'data.action');
    const profile = get(model, 'meta.user.profile', {});
    const pilId = get(model, 'data.id');

    switch (action) {
      case 'update-conditions':
        if (!profile.asruUser) {
          throw new BadRequestError('Only ASRU users can update licence conditions');
        }
        if (profile.asruUser && profile.asruLicensing) {
          return model.setStatus(resolved.id);
        }
        return model.setStatus(withLicensing.id);

      case 'create':
        // new in-progress PIL (user hasn't submitted to NTCO yet), does not need review
        return model.setStatus(autoResolved.id);

      case 'delete':
        return Promise.resolve()
          .then(() => PIL.query().findById(pilId))
          .then(pil => {
            if (pil.status !== 'pending') {
              throw new BadRequestError('Only draft PILs can be deleted');
            }
          })
          .then(() => model.setStatus(autoResolved.id));

      case 'suspend':
      case 'reinstate':
        if (!profile.asruUser || !profile.asruInspector) {
          throw new BadRequestError('Only inspectors can suspend / reinstate PILs');
        }
        // PIL suspensions / reinstatements are instantly resolved
        return model.setStatus(resolved.id);

      case 'revoke':
        if (profile.asruUser && profile.asruLicensing) {
          // PIL revoked by licensing, does not need review
          return model.setStatus(resolved.id);
        }
        // PIL revoked by establishment user - needs licensing review.
        return model.setStatus(withLicensing.id);

      case 'grant':
        if (profile.asruUser && profile.asruLicensing) {
          return model.setStatus(resolved.id);
        }
        if (profile.asruUser) {
          return model.setStatus(withLicensing.id);
        }
        // PIL submitted to NTCO, needs review
        return model.setStatus(awaitingEndorsement.id);

      case 'review':
        if (profile.asruUser || canEndorse(model)) {
          return model.setStatus(resolved.id);
        }
        return model.setStatus(awaitingEndorsement.id);

      case 'transfer':
        if (profile.asruUser) {
          return model.setStatus(awaitingEndorsement.id);
        }
        return Promise.resolve()
          .then(() => PIL.query().select('profileId').findById(pilId))
          .then(pil => {
            if (pil.profileId !== profile.id) {
              throw new BadRequestError('Only the PIL\'s owner can transfer a PIL');
            }
            // PIL submitted to NTCO, needs review
            return model.setStatus(awaitingEndorsement.id);
          });
    }
  };
};
