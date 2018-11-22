const { has, isEmpty } = require('lodash');
const { getAllSteps } = require('../../flow');
const BadRequestError = require('../../errors/bad-request');

module.exports = () => {
  return model => {
    const next = getAllSteps().find(step => step.id === model.meta.next);

    if (next.reasonRequired && (!has(model.meta.payload, 'reason') || isEmpty(model.meta.payload.reason))) {
      throw new BadRequestError(`Changing status to '${model.meta.next}' requires a reason`);
    }

    return Promise.resolve();
  };
};
