const { get } = require('lodash');
const pil = require('./pil');
const profile = require('./profile');
const project = require('./project');
const establishment = require('./establishment');
const role = require('./role');
const rop = require('./rop');
const place = require('./place');
const trainingPil = require('./training-pil');
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

      case 'establishment':
        return establishment(settings)(model);

      case 'role':
        return role(settings)(model);

      case 'place':
        return place(settings)(model);

      case 'trainingPil':
        return trainingPil(settings)(model);

      case 'rop':
        return rop(settings)(model);

      case 'enforcementCase':
      case 'certificate':
      case 'invitation':
      case 'permission':
      case 'projectVersion':
      case 'asruEstablishment':
      case 'feeWaiver':
      case 'projectProfile':
      case 'trainingCourse':
      case 'procedure':
        // insta-resolve changes that don't need reviewing
        return model.setStatus(autoResolved.id);

      default:
        // everything else goes to inspectorate
        return model.setStatus(withInspectorate.id);
    }
  };
};
