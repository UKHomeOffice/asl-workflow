const { get } = require('lodash');

module.exports = () => {
  return model => {
    if (!get(model, 'meta.data.establishmentId')) {
      throw new Error('establishmentId is required');
    }

    if (!get(model, 'meta.data.subject')) {
      throw new Error('subject is required');
    }
  };
};
