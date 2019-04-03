const { get } = require('lodash');
const pil = require('./pil');
const profile = require('./profile');
const project = require('./project');
const { autoResolved, withInspectorate } = require('../../flow/status');

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
      case 'asruEstablishment':
        // insta-resolve changes that don't need reviewing
        return model.setStatus(autoResolved.id);

      default:
        // everything else goes to inspectorate
        return model.setStatus(withInspectorate.id);
    }
  };
};
