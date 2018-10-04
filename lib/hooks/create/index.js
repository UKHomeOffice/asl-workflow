const { get } = require('lodash');

module.exports = () => {
  return model => {
    const type = get(model, 'data.model');

    // insta-resolve changes to profiles
    if (type === 'profile' || type === 'trainingModule') {
      return model.setStatus('resolved');
    }

    // everything else goes to licensing
    return model.setStatus('licensing');
  };
};
