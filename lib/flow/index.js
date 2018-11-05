const { get } = require('lodash');

const flows = {
  pil: require('./pil')
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
