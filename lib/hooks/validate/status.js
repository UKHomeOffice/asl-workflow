const flow = require('../../flow');
const BadRequestError = require('../../errors/bad-request');

module.exports = () => {
  return model => {
    const validNextSteps = flow.getNextSteps(model.meta.previous).map(step => step.id);

    if (!validNextSteps.includes(model.meta.next)) {
      throw new BadRequestError('Invalid status change');
    }

    return Promise.resolve();
  };
};
