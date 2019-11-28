const { BadRequestError, UnauthorisedError } = require('@asl/service/errors');
const getNextStepsForUser = require('../../flow/get-next-steps-for-user');
const statuses = require('../../flow/status');

module.exports = () => {
  return model => {
    const nextStatus = model.meta.next;

    return Promise.resolve()
      .then(() => {
        return Promise.resolve()
          .then(() => getNextStepsForUser(model, model.meta.user.profile))
          .then(steps => steps.map(step => step.id))
          .then(validNextSteps => {
            if (!validNextSteps.includes(nextStatus)) {
              throw new BadRequestError(`Invalid status change: ${model.status}:${nextStatus}`);
            }
          })
          .then(() => {
            const status = Object.values(statuses).find(s => s.id === nextStatus);
            if (status && typeof status.validate === 'function') {
              const allowed = status.validate(model);
              if (!allowed) {
                throw new UnauthorisedError();
              }
            }
          });
      });

  };
};
