const BadRequestError = require('../../errors/bad-request');
const getNextStepsForUser = require('../../flow/get-next-steps-for-user');

module.exports = () => {
  return model => {
    return Promise.resolve()
      .then(() => getNextStepsForUser(model.meta.previous, model.meta.user.profile))
      .then(validNextSteps => {
        if (!validNextSteps.includes(model.meta.next)) {
          throw new BadRequestError('Invalid status change');
        }
      });
  };
};
