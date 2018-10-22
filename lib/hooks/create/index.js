const { get } = require('lodash');

const isPilCreation = (type, action) => {
  return type === 'pil' && action === 'create';
};

module.exports = () => {
  return model => {
    const type = get(model, 'data.model');
    const action = get(model, 'data.action');

    // insta-resolve changes to profiles, and PIL creation
    if (type === 'profile' || type === 'trainingModule' || type === 'invitation' || isPilCreation(type, action)) {
      return model.setStatus('resolved');
    }

    // everything else goes to licensing
    return model.setStatus('licensing');
  };
};
