const { get } = require('lodash');
const { getAllSteps } = require('../../flow');
const { BadRequestError } = require('@asl/service/errors');

module.exports = () => {
  return model => {
    const next = getAllSteps().find(step => step.id === model.meta.next);

    if (next.commentRequired && !get(model, 'meta.payload.meta.comment')) {
      throw new BadRequestError(`Changing status to '${model.meta.next}' requires a comment`);
    }

    return Promise.resolve();
  };
};
