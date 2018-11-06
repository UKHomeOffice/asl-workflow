const { get } = require('lodash');

const flows = {
  certificate: require('./always-autoresolve'),
  establishment: require('./establishment'),
  exemption: require('./always-autoresolve'),
  invitation: require('./always-autoresolve'),
  pil: require('./pil'),
  profile: require('./always-autoresolve'),
  project: require('./project'),
  default: require('./default')
};

const getAllSteps = modelName => {
  const flow = get(flows, [modelName], flows.default);
  return Object.keys(flow);
};

const getNextSteps = (modelName, currentStep) => {
  const flow = get(flows, [modelName], flows.default);
  return get(flow, currentStep, []);
};

module.exports = {
  getAllSteps,
  getNextSteps
};
