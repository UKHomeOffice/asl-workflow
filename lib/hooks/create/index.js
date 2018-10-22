const { get } = require('lodash');

module.exports = () => {
  return model => {
    const type = get(model, 'data.model');
    const action = get(model, 'data.action');

    // insta-resolve changes to profiles
    if (type === 'profile' || type === 'trainingModule' || type === 'invitation') {
      return model.setStatus('resolved');
    }

    // insta-resolve PIL creation
    if (type === 'pil' && action === 'create') {
      return model.setStatus('resolved');
    }

    // everything else goes to licensing
    return model.setStatus('licensing');
  };
};
