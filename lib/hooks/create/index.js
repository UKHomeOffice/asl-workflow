const { get } = require('lodash');
const pil = require('./pil');

module.exports = settings => {
  return model => {
    const type = get(model, 'data.model');
    switch (type) {
      case 'pil':
        return pil(settings)(model);

      case 'profile':
      case 'certificate':
      case 'exemption':
      case 'invitation':
        // insta-resolve changes that don't need reviewing
        return model.setStatus('autoresolved');

      default:
        // everything else goes to licensing
        return model.setStatus('licensing');
    }
  };
};
