const { get } = require('lodash');

module.exports = () => {
  return model => {
    const type = get(model, 'data.model');

    // insta-resolve changes to profiles
    if (type === 'profile' || type === 'trainingModule' || type === 'invitation') {
      return model.setStatus('resolved');
    }

    // insta-resolve PIL creation
    if (type === 'pil') {
      const status = get(model, 'data.modelData.status');
      const newStatus = get(model, 'data.data.status');

      // inactive PIL updates
      if (status !== 'active' && newStatus !== 'active') {
        return model.setStatus('resolved');
      }

      // deactivating PIL
      if (status === 'active' && newStatus !== 'active') {
        return model.setStatus('resolved');
      }
    }

    // everything else goes to licensing
    return model.setStatus('licensing');
  };
};
