const BadRequestError = require('../../errors/bad-request');
const getNextStepsForUser = require('../../flow/get-next-steps-for-user');
const { withNtco, withLicensing } = require('../../flow/status');

module.exports = () => {
  return model => {
    const currentStatus = model.status;
    const nextStatus = model.meta.next;

    return Promise.resolve()
      .then(() => {
        // resubmitting an application triggers an auto-status change, don't need to validate against the user
        if (currentStatus === 'resubmitted' && [withNtco.id, withLicensing.id].includes(nextStatus)) {
          return;
        }

        return Promise.resolve()
          .then(() => getNextStepsForUser(model, model.meta.user.profile).map(step => step.id))
          .then(validNextSteps => {
            if (!validNextSteps.includes(nextStatus)) {
              throw new BadRequestError('Invalid status change');
            }
          });
      });

  };
};
