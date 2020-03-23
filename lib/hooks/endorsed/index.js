const { get } = require('lodash');
const project = require('./project');
const pil = require('./pil');

const { withInspectorate } = require('../../flow/status');

module.exports = settings => {

  const projectHook = project(settings);
  const pilHook = pil(settings);

  return model => {
    const type = get(model, 'data.model');

    switch (type) {
      case 'pil':
        return pilHook(model);
      case 'project':
        return projectHook(model);
      default:
        return model.setStatus(withInspectorate.id);
    }
  };
};
