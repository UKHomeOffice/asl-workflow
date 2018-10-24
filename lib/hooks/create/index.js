const { get } = require('lodash');

module.exports = () => {
  return model => {
    const type = get(model, 'data.model');
    const action = get(model, 'data.action');

    // insta-resolve changes that don't need reviewing
    if (type === 'profile' || type === 'trainingModule' || type === 'invitation') {
      return model.setStatus('resolved');
    }

    if (type === 'pil') {
      if (action === 'create') {
        // new in-progress PIL, user hasn't submitted to NTCO yet so insta-resolve
        return model.setStatus('resolved');
      }
      if (action === 'grant') {
        // PIL submitted to NTCO, needs review
        return model.setStatus('ntco-endorsement');
      }
    }

    // everything else goes to licensing
    return model.setStatus('licensing');
  };
};
