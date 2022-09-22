const { get } = require('lodash');

module.exports = () => {
  return model => {
    const type = get(model, 'data.model');

    if (type === 'project') {
      return model.patch({ extended: null, deadline: null, internalDeadline: null, removedDeadline: null });
    }

    return Promise.resolve();
  };
};
