const BadRequestError = require('../../errors/bad-request');
const getNextStepsForUser = require('../../flow/get-next-steps-for-user');

module.exports = () => {
  return model => {
    const nextStatus = model.meta.next;

    return Promise.resolve()
      .then(() => {
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
