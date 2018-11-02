const flows = {
  pil: require('./pil')
};

const getAllSteps = modelName => {
  return Object.keys(flows[modelName]);
};

const getNextSteps = (modelName, currentStep) => {
  return flows[modelName][currentStep];
};

module.exports = {
  getAllSteps,
  getNextSteps
};
