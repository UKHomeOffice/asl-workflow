const { get } = require('lodash');
const pil = require('./pil');
const profile = require('./profile');
const project = require('./project');
const { autoResolved, withLicensing } = require('../../flow/status');

module.exports = settings => {
  return model => {
    const type = get(model, 'data.model');
    switch (type) {
      case 'pil':
        return pil(settings)(model);

      case 'profile':
        return profile(settings)(model);

      case 'project':
        return project(settings)(model);

      case 'certificate':
      case 'exemption':
      case 'invitation':
      case 'permissions':
      case 'projectVersion':
        // insta-resolve changes that don't need reviewing
        return model.setStatus(autoResolved.id);

      default:
        // everything else goes to licensing
        return model.setStatus(withLicensing.id);
    }
  };
};
