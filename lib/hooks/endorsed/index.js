const { get } = require('lodash');
const project = require('./project');

const {
  withLicensing,
  withInspectorate
} = require('../../flow/status');

module.exports = settings => {

  return model => {
    const type = get(model, 'data.model');

    switch (type) {
      case 'pil':
        return model.setStatus(withLicensing.id);
      case 'project':
        return project(settings)(model);
      default:
        return model.setStatus(withInspectorate.id);
    }
  };
};
