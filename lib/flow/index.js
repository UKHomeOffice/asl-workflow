const { get } = require('lodash');

const flows = {
  certificate: require('./always-autoresolve'),
  establishment: require('./establishment'),
  exemption: require('./always-autoresolve'),
  invitation: require('./always-autoresolve'),
  pil: require('./pil'),
  profile: require('./always-autoresolve'),
  project: require('./project')
};

const getAllSteps = modelName => {
  return Object.keys(get(flows, [modelName], {}));
};

const getNextSteps = (modelName, currentStep) => {
  return get(flows, [modelName, currentStep], []);
};

module.exports = {
  getAllSteps,
  getNextSteps
};
