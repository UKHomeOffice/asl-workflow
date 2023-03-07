const { get } = require('lodash');

module.exports = settings => {
  return model => {
    // assigns the task to the inspector that initiated the conditions updated
    const raisedBy = get(model, 'data.changedBy');
    return model.assign(raisedBy);
  };
};
